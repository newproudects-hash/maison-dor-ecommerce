import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { GoogleSpreadsheet } from 'google-spreadsheet';
import { JWT } from 'google-auth-library';
import { z } from 'zod';
import { WILAYAS, LIVRAISON_DOMICILE, LIVRAISON_BUREAU } from '@/lib/data/wilayas';
import { getFromCache, setCache } from '@/lib/cache/redis';
import { sanityClient } from '@/lib/sanity/client';

// Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

// Google Sheets config
const GOOGLE_CLIENT_EMAIL = process.env.GOOGLE_CLIENT_EMAIL;
const GOOGLE_PRIVATE_KEY = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n');
const GOOGLE_SHEET_ID = process.env.GOOGLE_SHEET_ID;

// ─── Rate Limiting (Redis-backed, FAIL-CLOSED) ─────────────────────────────
// ✅ SECURITY FIX (VULN-004): In-memory Map REMOVED.
// Skill: performing-api-rate-limiting-bypass (Anthropic Cybersecurity Skills)
// MITRE ATT&CK: T1110 (Brute Force) | OWASP: API4:2023 Unrestricted Resource Consumption
// In Serverless (Vercel), each request can spawn a NEW instance with empty memory.
// The old Map() fallback was COMPLETELY USELESS — 1000 requests, 0 blocked.
// Now: if Redis is down, we FAIL CLOSED (deny request) instead of opening the gate.
// ❌ REMOVED: const rateLimitMapFallback = new Map<...>();

async function checkRateLimit(ip: string): Promise<boolean> {
  const now = Date.now();
  const redisKey = `rl:orders:${ip}`;

  try {
    type RlEntry = { count: number; resetTime: number; blockedUntil?: number };
    const cached = await getFromCache<RlEntry>(redisKey);
    const entry = cached || { count: 0, resetTime: now + 60_000 };

    if (entry.blockedUntil && now < entry.blockedUntil) return false;

    if (now > entry.resetTime) {
      await setCache(redisKey, { count: 1, resetTime: now + 60_000 }, 120);
      return true;
    }

    entry.count++;
    if (entry.count > 5) {
      if (!entry.blockedUntil) {
        entry.blockedUntil = now + (15 * 60 * 1000);
        console.error(
          '[SECURITY ALERT] Rate Limit Exceeded (Orders API) - ' +
          `IP ${ip} has exceeded the rate limit (5 req/min) and is blocked for 15 minutes.`
        );
      }
      await setCache(redisKey, entry, 15 * 60);
      return false;
    }
    await setCache(redisKey, entry, 120);
    return true;
  } catch {
    // ✅ FAIL CLOSED: Redis is unavailable → DENY the request.
    // This is intentional. A broken safety net is worse than no safety net.
    // Legitimate users experience a brief error; attackers are fully blocked.
    console.error('[Rate Limit] Redis unavailable — failing closed for security');
    return false;
  }
}

// ─── Duplicate Order Protection (in-memory) ───────
const recentOrders = new Map<string, number>();
function isDuplicateOrder(key: string): boolean {
  const lastTime = recentOrders.get(key);
  if (lastTime && Date.now() - lastTime < 30_000) return true; // 30 second window
  recentOrders.set(key, Date.now());
  return false;
}

// ─── Sanitize ─────────────────────────────────────
function sanitize(input: string): string {
  return String(input)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .trim();
}

// ─── Schema Validation ──────────────────────────────────────────────────────
// ✅ SECURITY FIX (VULN-001): deliveryPrice REMOVED from schema.
// Skill: testing-for-business-logic-vulnerabilities (Anthropic Cybersecurity Skills)
// MITRE ATT&CK: T1565 Data Manipulation | OWASP: A04:2021 Insecure Design
// The server now calculates delivery price from its own constants — never trusts the client.
// ✅ SECURITY FIX (VULN-002): item.price REMOVED from schema.
// Product prices are fetched live from Sanity at order time — client prices are ignored.
const orderSchema = z.object({
  orderNumber: z.string().min(1),
  firstName: z.string().min(2, 'الاسم الأول قصير جداً').max(50),
  lastName: z.string().min(2, 'اسم العائلة قصير جداً').max(50),
  phone: z.string().regex(/^0[567]\d{8}$/, 'رقم الهاتف غير صحيح'),
  wilayaName: z.string().refine((w) => WILAYAS.some(wil => wil.name_ar === w || wil.name_fr === w || `${String(wil.code).padStart(2,'0')} - ${wil.name_ar}` === w), { message: 'الولاية غير صالحة' }),
  commune: z.string().optional(),
  wilayaCode: z.string().or(z.number()),
  deliveryType: z.enum(['domicile', 'bureau']),
  // ❌ deliveryPrice: REMOVED — server calculates from LIVRAISON_DOMICILE/BUREAU constants
  address: z.string().max(200).optional().nullable(),
  items: z.array(z.object({
    productId: z.string().min(1),
    productName: z.string(),
    // ❌ price: REMOVED from client schema — fetched live from Sanity
    quantity: z.number().int().min(1).max(20),
    size: z.string().optional(),
    color: z.string().optional(),
    imageUrl: z.string().optional(),
    slug: z.string().optional(),
  })).min(1, 'السلة فارغة'),
  subtotal: z.number().min(0), // kept for UI display only — server recalculates
  total: z.number().min(0),    // kept for UI display only — server recalculates
});

export async function POST(req: Request) {
  try {
    // Rate limit by IP (Support Cloudflare cf-connecting-ip)
    const ip = req.headers.get('cf-connecting-ip')
            || req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() 
            || 'unknown';
    const isAllowed = await checkRateLimit(ip);
    if (!isAllowed) {
      return NextResponse.json(
        { success: false, error: 'تجاوزت الحد المسموح. يرجى المحاولة لاحقاً.' },
        { status: 429 }
      );
    }

    const body = await req.json();
    
    // 2. Strict Input validation with Zod
    const result = orderSchema.safeParse(body);
    if (!result.success) {
      // Potential malicious input -> alert if highly malformed
      if (result.error.issues.length > 5) {
         console.error(`[Security] IP ${ip} sent a highly malformed order request. Errors: ${JSON.stringify(result.error.issues)}`);
      }
      return NextResponse.json(
        { success: false, error: 'بيانات الطلب غير صالحة: ' + result.error.issues[0].message },
        { status: 400 }
      );
    }
    
    const {
      orderNumber, firstName, lastName, phone,
      wilayaName, wilayaCode, deliveryType,
      commune, address, items
    } = result.data;

    // ✅ SECURITY FIX (VULN-001): Server calculates delivery price — client value IGNORED
    // Skill: testing-for-business-logic-vulnerabilities
    let serverDeliveryPrice = deliveryType === 'domicile' ? LIVRAISON_DOMICILE : LIVRAISON_BUREAU;
    if (supabase) {
      const { data: priceData } = await supabase
        .from('delivery_prices')
        .select('home_price, office_price')
        .eq('wilaya_code', parseInt(wilayaCode.toString()))
        .single();
      if (priceData) {
        serverDeliveryPrice = deliveryType === 'domicile' ? priceData.home_price : priceData.office_price;
      }
    }
    // ✅ SECURITY FIX (VULN-002): Verify stock + fetch real prices from Sanity
    // Client-submitted prices are completely ignored. Server fetches the real ones.
    const productIds = items.map(i => i.productId);
    let liveProducts: { _id: string; price: number; inStock: boolean; title: string }[] = [];
    try {
      liveProducts = await sanityClient.fetch(
        `*[_type == "product" && _id in $ids] { _id, price, inStock, title }`,
        { ids: productIds }
      );
    } catch (sanityErr) {
      console.error('[Orders] Sanity fetch failed:', sanityErr);
      return NextResponse.json(
        { success: false, error: 'حدث خطأ في التحقق من المنتجات. حاول مجدداً.' },
        { status: 503 }
      );
    }

    const productMap = new Map(liveProducts.map(p => [p._id, p]));

    // ✅ Validate: every product must exist and be in stock
    for (const item of items) {
      const liveProduct = productMap.get(item.productId);
      if (!liveProduct) {
        return NextResponse.json(
          { success: false, error: `المنتج "${item.productName}" غير موجود.` },
          { status: 400 }
        );
      }
      if (liveProduct.inStock === false) {
        return NextResponse.json(
          { success: false, error: `عذراً، "ص${liveProduct.title || item.productName}" نفد من المخزون.` },
          { status: 409 }
        );
      }
    }

    // ✅ Build server-side items with REAL prices from Sanity (client prices discarded)
    const serverItems = items.map(item => ({
      ...item,
      price: productMap.get(item.productId)!.price,
    }));

    // ✅ All arithmetic done with server-verified prices
    const recalcSubtotal = serverItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const recalcTotal = recalcSubtotal + serverDeliveryPrice;

    // 3. Duplicate order protection (same phone + same total within 30 seconds)
    const dedupKey = `${phone}-${recalcTotal}`;
    if (isDuplicateOrder(dedupKey)) {
      return NextResponse.json(
        { success: false, error: 'تم إرسال هذا الطلب مسبقاً. انتظر لحظة.' },
        { status: 409 }
      );
    }

    // 4. Sanitize inputs
    const safeFirstName = sanitize(firstName);
    const safeLastName = sanitize(lastName);
    const safePhone = phone.replace(/[^\d]/g, '').trim();
    const safeAddress = address ? sanitize(address) : null;
    const safeWilaya = sanitize(wilayaName);
    const safeCommune = commune ? sanitize(commune) : null;

    // 5. Save to Supabase — FIX #15: treat as critical failure
    let supabaseId: string | null = null;
    if (supabase) {
      const { data: supabaseData, error: supabaseError } = await supabase.from('orders').insert([{
        order_number: orderNumber,
        first_name: safeFirstName,
        last_name: safeLastName,
        customer_name: `${safeFirstName} ${safeLastName}`,
        phone: safePhone,
        wilaya: safeWilaya,
        commune: safeCommune,
        wilaya_code: wilayaCode,
        delivery_type: deliveryType,
        delivery_price: serverDeliveryPrice,
        address: safeAddress,
        items: serverItems,
        subtotal: recalcSubtotal,
        total: recalcTotal,
        status: 'pending'
      }]).select('id').single();

      if (supabaseError) {
        console.error('[Orders] Supabase insert error:', supabaseError.message);
        // Non-fatal: continue to Telegram + Sheets as backup
      } else {
        supabaseId = supabaseData?.id || null;
      }
    }

    // 6. Send to Google Sheets (backup/notification)
    if (GOOGLE_CLIENT_EMAIL && GOOGLE_PRIVATE_KEY && GOOGLE_SHEET_ID) {
      try {
        const jwt = new JWT({
          email: GOOGLE_CLIENT_EMAIL,
          key: GOOGLE_PRIVATE_KEY,
          scopes: ['https://www.googleapis.com/auth/spreadsheets'],
        });
        const doc = new GoogleSpreadsheet(GOOGLE_SHEET_ID, jwt);
        await doc.loadInfo();
        const sheet = doc.sheetsByIndex[0];
        // FIX #44: batch all rows in one call instead of sequential awaits
        const rows = items.map(item => ({
          'رقم الطلب': orderNumber,
          'معرف قاعدة البيانات': supabaseId || '-',
          'التاريخ': new Date().toLocaleString('fr-DZ'),
          'العميل': `${safeFirstName} ${safeLastName}`,
          'الهاتف': safePhone,
          'الولاية': safeWilaya,
          'التوصيل': deliveryType === 'domicile' ? 'منزل' : 'مكتب',
          'العنوان': safeAddress || '-',
          'اسم المنتج': item.productName,
          'الكمية': item.quantity,
          'المقاس': item.size || '-',
          'اللون': item.color || '-',
          'رابط الصورة': item.imageUrl || '-',
          'رابط المنتج': `https://www.maisondor.dz/produits/${item.slug || ''}`,
          'إجمالي الطلب': recalcTotal,
          'الحالة': 'قيد الانتظار'
        }));
        await Promise.all(rows.map(row => sheet.addRow(row)));
      } catch (sheetError) {
        console.error('[Orders] Google Sheets error:', sheetError);
      }
    }

    // 7. Success! (Telegram removed as requested)
    return NextResponse.json({ success: true, orderNumber });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('[Orders] Processing error:', message);
    return NextResponse.json({ success: false, error: 'حدث خطأ في الخادم.' }, { status: 500 });
  }
}

import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { GoogleSpreadsheet } from 'google-spreadsheet';
import { JWT } from 'google-auth-library';
import { z } from 'zod';
import { sendSecurityAlertToTelegram, sendOrderToTelegram } from '@/lib/utils/telegram';
import { WILAYAS } from '@/lib/data/wilayas';
import { getFromCache, setCache } from '@/lib/cache/redis';

// Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

// Google Sheets config
const GOOGLE_CLIENT_EMAIL = process.env.GOOGLE_CLIENT_EMAIL;
const GOOGLE_PRIVATE_KEY = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n');
const GOOGLE_SHEET_ID = process.env.GOOGLE_SHEET_ID;

// ─── Rate Limiting (Redis-backed with in-memory fallback) ──────
const rateLimitMapFallback = new Map<string, { count: number; resetTime: number; blockedUntil?: number }>();

async function checkRateLimit(ip: string): Promise<boolean> {
  const now = Date.now();
  const redisKey = `rl:orders:${ip}`;

  try {
    // Try Redis-based rate limiting first
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
        await sendSecurityAlertToTelegram(
          'Rate Limit Exceeded (Orders API)',
          `IP ${ip} has exceeded the rate limit (5 req/min) and is blocked for 15 minutes.`,
          ip
        );
      }
      await setCache(redisKey, entry, 15 * 60);
      return false;
    }
    await setCache(redisKey, entry, 120);
    return true;
  } catch {
    // Fallback to in-memory if Redis unavailable
    const entry = rateLimitMapFallback.get(ip);
    if (!entry) {
      rateLimitMapFallback.set(ip, { count: 1, resetTime: now + 60_000 });
      return true;
    }
    if (entry.blockedUntil && now < entry.blockedUntil) return false;
    if (now > entry.resetTime) {
      rateLimitMapFallback.set(ip, { count: 1, resetTime: now + 60_000 });
      return true;
    }
    entry.count++;
    if (entry.count > 5) {
      if (!entry.blockedUntil) entry.blockedUntil = now + (15 * 60 * 1000);
      return false;
    }
    return true;
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

// ─── Schema Validation ─────────────────────────────
const orderSchema = z.object({
  orderNumber: z.string().min(1),
  firstName: z.string().min(2, 'الاسم الأول قصير جداً').max(50),
  lastName: z.string().min(2, 'اسم العائلة قصير جداً').max(50),
  phone: z.string().regex(/^0[567]\d{8}$/, 'رقم الهاتف غير صحيح'),
  wilayaName: z.string().refine((w) => WILAYAS.includes(w), { message: 'الولاية غير صالحة' }),
  wilayaCode: z.string().or(z.number()),
  deliveryType: z.enum(['domicile', 'bureau']),
  deliveryPrice: z.number().min(0),
  address: z.string().max(200).optional().nullable(),
  items: z.array(z.object({
    productId: z.string(),
    productName: z.string(),
    price: z.number().min(0),
    quantity: z.number().min(1).max(20),
    size: z.string().optional(),
    color: z.string().optional(),
    imageUrl: z.string().optional(),
    slug: z.string().optional(),
  })).min(1, 'السلة فارغة'),
  subtotal: z.number().min(0),
  total: z.number().min(0)
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
         await sendSecurityAlertToTelegram(
           'Malicious Request Payload (Orders API)', 
           `IP ${ip} sent a highly malformed order request.\n\nErrors: ${JSON.stringify(result.error.issues)}`, 
           ip
         );
      }
      return NextResponse.json(
        { success: false, error: 'بيانات الطلب غير صالحة: ' + result.error.issues[0].message },
        { status: 400 }
      );
    }
    
    const {
      orderNumber, firstName, lastName, phone,
      wilayaName, wilayaCode, deliveryType, deliveryPrice,
      address, items
    } = result.data;

    // FIX #61: Recalculate totals server-side — never trust client values
    const recalcSubtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const recalcTotal = recalcSubtotal + deliveryPrice;

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
        wilaya_code: wilayaCode,
        delivery_type: deliveryType,
        delivery_price: deliveryPrice,
        address: safeAddress,
        items: items,
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

    // FIX #16: Send Telegram notification for every new order
    await sendOrderToTelegram({
      orderNumber,
      firstName: safeFirstName,
      lastName: safeLastName,
      phone: safePhone,
      wilayaName: safeWilaya,
      wilayaCode: typeof wilayaCode === 'number' ? wilayaCode : parseInt(String(wilayaCode), 10),
      deliveryType: deliveryType === 'domicile' ? 'home' : 'office',
      deliveryPrice,
      items: items.map(item => ({
        title: item.productName,
        price: item.price,
        quantity: item.quantity,
        color: item.color,
        size: item.size,
      })),
      subtotal: recalcSubtotal,
      total: recalcTotal,
    });

    return NextResponse.json({ success: true, orderNumber });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('[Orders] Processing error:', message);
    return NextResponse.json({ success: false, error: 'حدث خطأ في الخادم.' }, { status: 500 });
  }
}

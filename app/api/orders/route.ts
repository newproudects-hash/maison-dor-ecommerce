import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { GoogleSpreadsheet } from 'google-spreadsheet';
import { JWT } from 'google-auth-library';

// Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

// Google Sheets config
const GOOGLE_CLIENT_EMAIL = process.env.GOOGLE_CLIENT_EMAIL;
const GOOGLE_PRIVATE_KEY = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n');
const GOOGLE_SHEET_ID = process.env.GOOGLE_SHEET_ID;

// ─── Rate Limiting (in-memory, per IP) ────────────
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  if (!entry || now > entry.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + 60_000 });
    return true;
  }
  if (entry.count >= 5) return false;
  entry.count++;
  return true;
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

// ─── Validate Algerian Phone ───────────────────────
function isValidPhone(phone: string): boolean {
  const cleaned = phone.replace(/\s/g, '');
  return /^0[567]\d{8}$/.test(cleaned);
}

export async function POST(req: Request) {
  try {
    // 1. Rate limiting
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { success: false, error: 'تجاوزت الحد المسموح. حاول مرة أخرى بعد دقيقة.' },
        { status: 429 }
      );
    }

    const body = await req.json();
    const {
      orderNumber, firstName, lastName, phone,
      wilayaName, wilayaCode, deliveryType, deliveryPrice,
      address, items, subtotal, total
    } = body;

    // 2. Input validation
    if (!firstName || !lastName || !phone || !wilayaName || !items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { success: false, error: 'بيانات الطلب غير مكتملة.' },
        { status: 400 }
      );
    }

    if (!isValidPhone(phone)) {
      return NextResponse.json(
        { success: false, error: 'رقم الهاتف غير صحيح. يجب أن يبدأ بـ 05 أو 06 أو 07.' },
        { status: 400 }
      );
    }

    if (typeof total !== 'number' || total <= 0) {
      return NextResponse.json(
        { success: false, error: 'المبلغ الإجمالي غير صحيح.' },
        { status: 400 }
      );
    }

    // 3. Duplicate order protection (same phone + same total within 30 seconds)
    const dedupKey = `${phone}-${total}`;
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

    // 5. Save to Supabase
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
        subtotal: subtotal,
        total: total,
        status: 'pending'
      }]).select('id').single();

      if (supabaseError) {
        console.error('[Orders] Supabase insert error:', supabaseError.message);
        // Don't fail silently — log it but continue to Google Sheets as backup
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

        for (const item of items) {
          await sheet.addRow({
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
            'إجمالي الطلب': total,
            'الحالة': 'قيد الانتظار'
          });
        }
      } catch (sheetError) {
        console.error('[Orders] Google Sheets error:', sheetError);
        // Non-fatal: order is already saved in Supabase
      }
    }

    return NextResponse.json({ success: true, orderNumber });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('[Orders] Processing error:', message);
    return NextResponse.json({ success: false, error: 'حدث خطأ في الخادم.' }, { status: 500 });
  }
}

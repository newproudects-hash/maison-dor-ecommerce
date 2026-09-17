import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// ✅ SECURITY FIX (VULN-003): Anti-IDOR — requires both orderId + phone
// Uses service role key to bypass RLS (needed for order lookup after purchase)
// Falls back to anon key if service role key not available
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const orderNumber = searchParams.get('orderId');
    const phone = searchParams.get('phone');

    // ✅ Both parameters required — no partial lookups allowed
    if (!orderNumber || !phone) {
      return NextResponse.json(
        { success: false, error: 'رقم الطلب ورقم الهاتف مطلوبان' },
        { status: 400 }
      );
    }

    // ✅ Sanitize and validate phone format (Algerian mobile numbers only)
    const cleanPhone = phone.replace(/[^\d]/g, '').trim();
    if (!/^0[567]\d{8}$/.test(cleanPhone)) {
      return NextResponse.json(
        { success: false, error: 'الطلب غير موجود' },
        { status: 404 }
      );
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    // ✅ Use service role key to bypass RLS — needed to read orders table.
    // Falls back to anon key (will fail if RLS blocks SELECT for anon).
    const supabaseKey =
      process.env.SUPABASE_SERVICE_ROLE_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      console.error('[track] Supabase credentials missing — check Vercel env vars: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
      return NextResponse.json({ success: false, error: 'إعداد قاعدة البيانات مفقود' }, { status: 500 });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // ✅ CRITICAL: Must match BOTH order_number AND phone — prevents IDOR enumeration
    const { data: order, error } = await supabase
      .from('orders')
      .select('status, created_at, total, items')
      .eq('order_number', orderNumber)
      .eq('phone', cleanPhone)
      .single();

    if (error || !order) {
      console.error('[track] Order not found or DB error:', error?.message, '| order_number:', orderNumber);
      return NextResponse.json(
        { success: false, error: 'الطلب غير موجود' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, order });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'خطأ في الخادم';
    console.error('[track] Unexpected error:', msg);
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}


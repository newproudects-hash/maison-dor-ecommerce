import { NextResponse } from 'next/server';
import { getAnonSupabase } from '@/lib/supabase/server';

// ✅ SECURITY FIX (VULN-003): Anti-IDOR — requires both orderId + phone
// Skill: exploiting-idor-vulnerabilities (Anthropic Cybersecurity Skills)
// MITRE ATT&CK: T1020 (Automated Exfiltration), T1083 (File Discovery)
// OWASP: A01:2021 Broken Access Control
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
      // ✅ Anti-Enumeration: always return 404, never 401/403 (don't confirm existence)
      return NextResponse.json(
        { success: false, error: 'الطلب غير موجود' },
        { status: 404 }
      );
    }

    const supabase = getAnonSupabase();

    // ✅ CRITICAL: Must match BOTH order_number AND phone — prevents IDOR enumeration
    const { data: order, error } = await supabase
      .from('orders')
      .select('status, created_at, total') // ✅ customer_name removed — no PII exposure
      .eq('order_number', orderNumber)
      .eq('phone', cleanPhone)            // ✅ This single line closes the IDOR vulnerability
      .single();

    if (error || !order) {
      // ✅ Same response whether order not found OR phone mismatch (Anti-Enumeration)
      return NextResponse.json(
        { success: false, error: 'الطلب غير موجود' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, order });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'خطأ في الخادم';
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}

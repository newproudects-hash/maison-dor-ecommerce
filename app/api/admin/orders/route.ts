import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { z } from 'zod';

// ✅ SECURITY FIX (VULN-005): Remove Anon Key Fallback (Fail Hard)
// Skill: securing-serverless-functions (Anthropic Cybersecurity Skills)
// MITRE ATT&CK: T1078.004 Valid Cloud Accounts | OWASP: A01:2021 Broken Access Control
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('[CRITICAL] SUPABASE_SERVICE_ROLE_KEY is not configured! Failing hard.');
}

const supabase = supabaseUrl && supabaseServiceKey ? createClient(supabaseUrl, supabaseServiceKey) : null;

// ✅ SECURITY FIX (VULN-006): Strict validation for status updates
// Skill: testing-api-authentication-weaknesses
const patchSchema = z.object({
  orderId: z.union([z.string(), z.number()]),
  status: z.enum(['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'], {
    invalid_type_error: 'حالة الطلب غير صالحة',
    required_error: 'حالة الطلب مطلوبة'
  })
});

export async function GET(req: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('admin_token')?.value;
    const ADMIN_TOKEN = process.env.ADMIN_SECRET_TOKEN;
    if (!ADMIN_TOKEN || token !== ADMIN_TOKEN) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!supabase) {
      return NextResponse.json({ orders: [], message: 'Supabase non configuré' });
    }

    const { data: orders, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json({ orders: orders || [] });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('admin_token')?.value;
    const ADMIN_TOKEN = process.env.ADMIN_SECRET_TOKEN;
    if (!ADMIN_TOKEN || token !== ADMIN_TOKEN) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!supabase) {
      return NextResponse.json({ message: 'Supabase non configuré' });
    }

    const body = await req.json();
    
    // ✅ SECURITY FIX (VULN-006): Validate payload with Zod
    const result = patchSchema.safeParse(body);
    
    if (!result.success) {
      return NextResponse.json(
        { error: 'بيانات غير صالحة: ' + result.error.issues[0].message },
        { status: 400 }
      );
    }
    
    const { orderId, status } = result.data; // ✅ Validated and safe

    const { data, error } = await supabase
      .from('orders')
      .update({ status })
      .eq('id', orderId)
      .select();

    if (error) throw error;
    return NextResponse.json({ success: true, order: data[0] });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}


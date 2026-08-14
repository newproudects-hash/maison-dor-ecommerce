import { NextResponse } from 'next/server';
import { getServerSupabase } from '@/lib/supabase/server';
import { cookies } from 'next/headers';

export async function PATCH(req: Request) {
  try {
    // Basic Auth Check
    const cookieStore = await cookies();
    const token = cookieStore.get('admin_token')?.value;
    const adminToken = process.env.ADMIN_SECRET_TOKEN;
    if (!adminToken || token !== adminToken) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const { wilaya_code, home_price, office_price } = await req.json();

    const supabase = getServerSupabase();
    
    // Using service role key for update if needed, but since we are using supabase-js client with Anon key in RLS it might fail if RLS blocks updates.
    // Wait, let's use the service role key to bypass RLS for admin operations.
    const { createClient } = await import('@supabase/supabase-js');
    const adminSupabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { error } = await adminSupabase
      .from('delivery_prices')
      .update({ home_price, office_price })
      .eq('wilaya_code', wilaya_code);

    if (error) {
      console.error('[Admin Delivery API] Error updating price:', error);
      return NextResponse.json({ success: false, message: 'Database error' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[Admin Delivery API] Server error:', error);
    return NextResponse.json({ success: false, message: 'Server error' }, { status: 500 });
  }
}

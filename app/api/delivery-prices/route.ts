import { NextResponse } from 'next/server';
import { getServerSupabase } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic'; // Always fetch fresh prices from Supabase
export const revalidate = 0;

export async function GET() {
  try {
    const supabase = getServerSupabase();
    const { data, error } = await supabase
      .from('delivery_prices')
      .select('wilaya_code, wilaya_name, wilaya_ar, home_price, office_price')
      .eq('is_active', true)
      .order('wilaya_code');

    if (error) {
      console.error('[Delivery API] Supabase error:', error);
      return NextResponse.json({ error: 'Failed to fetch delivery prices' }, { status: 500 });
    }

    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=3600',
      },
    });
  } catch (error) {
    console.error('[Delivery API] Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

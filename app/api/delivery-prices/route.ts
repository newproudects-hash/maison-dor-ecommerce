import { NextResponse } from 'next/server';
import { getServerSupabase } from '@/lib/supabase/server';
import { DEFAULT_DELIVERY_PRICES } from '@/lib/data/wilayas';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  const headers = {
    'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
    'Pragma': 'no-cache',
    'Expires': '0',
  };

  try {
    const supabase = getServerSupabase();
    const { data, error } = await supabase
      .from('delivery_prices')
      .select('wilaya_code, wilaya_name, wilaya_ar, home_price, office_price, is_active')
      .order('wilaya_code');

    if (error || !data || data.length === 0) {
      if (error) {
        console.warn('[Delivery API] Supabase unavailable or empty, serving default NOEST rates:', error.message);
      }
      return NextResponse.json(DEFAULT_DELIVERY_PRICES, { headers });
    }

    // Merge custom Supabase prices with default NOEST prices
    const priceMap = new Map<number, any>();
    // Pre-populate with defaults
    DEFAULT_DELIVERY_PRICES.forEach(item => {
      priceMap.set(item.wilaya_code, { ...item });
    });

    // Override with database prices
    data.forEach((row: any) => {
      if (row.wilaya_code) {
        const existing = priceMap.get(row.wilaya_code) || {};
        priceMap.set(row.wilaya_code, {
          ...existing,
          ...row,
          home_price: Number(row.home_price),
          office_price: Number(row.office_price),
          is_active: row.is_active ?? true,
        });
      }
    });

    const merged = Array.from(priceMap.values()).sort((a, b) => a.wilaya_code - b.wilaya_code);
    return NextResponse.json(merged, { headers });

  } catch (error: any) {
    console.warn('[Delivery API] Supabase connection error, falling back to default rates:', error?.message);
    return NextResponse.json(DEFAULT_DELIVERY_PRICES, { headers });
  }
}

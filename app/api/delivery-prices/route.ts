import { NextResponse } from 'next/server';
import { getServerSupabase, getAnonSupabase } from '@/lib/supabase/server';
import { DEFAULT_DELIVERY_PRICES } from '@/lib/data/wilayas';
import { getFromCache, setCache } from '@/lib/cache/redis';
import { handleSavePrices } from '@/lib/services/deliveryPrices';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const headers = {
  'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
  'Pragma': 'no-cache',
  'Expires': '0',
};

export async function GET() {
  // 1. Try Upstash Redis cache first (instant distributed storage)
  try {
    const cached = await getFromCache<any[]>('settings:delivery_prices');
    if (Array.isArray(cached) && cached.length > 0) {
      const sanitizedCached = cached.map(item => ({
        ...item,
        wilaya_code: Number(item.wilaya_code),
        home_price: Number(item.home_price),
        office_price: Number(item.office_price),
        is_active: item.is_active !== undefined ? Boolean(item.is_active) : true,
      }));
      return NextResponse.json(sanitizedCached, { headers });
    }
  } catch (err) {
    console.warn('[Delivery API] Redis check skipped:', err);
  }

  // 2. Try Supabase
  try {
    let supabase = null;
    try {
      supabase = getServerSupabase();
    } catch {
      try {
        supabase = getAnonSupabase();
      } catch {}
    }

    if (supabase) {
      const { data, error } = await supabase
        .from('delivery_prices')
        .select('wilaya_code, wilaya_name, wilaya_ar, home_price, office_price, is_active')
        .order('wilaya_code');

      if (!error && Array.isArray(data) && data.length > 0) {
        // Merge Supabase data with NOEST defaults
        const priceMap = new Map<number, any>();
        DEFAULT_DELIVERY_PRICES.forEach(item => {
          priceMap.set(item.wilaya_code, { ...item });
        });

        data.forEach((row: any) => {
          const code = Number(row.wilaya_code);
          if (code) {
            const existing = priceMap.get(code) || {};
            priceMap.set(code, {
              ...existing,
              ...row,
              wilaya_code: code,
              home_price: Number(row.home_price),
              office_price: Number(row.office_price),
              is_active: row.is_active ?? true,
            });
          }
        });

        const merged = Array.from(priceMap.values()).sort((a, b) => a.wilaya_code - b.wilaya_code);
        // Cache in Redis for fast edge delivery
        await setCache('settings:delivery_prices', merged, 31536000).catch(() => {});
        return NextResponse.json(merged, { headers });
      }
    }
  } catch (error: any) {
    console.warn('[Delivery API] Supabase fetch warning, serving NOEST defaults:', error?.message);
  }

  // 3. Guaranteed Fallback: return official NOEST Express rates
  return NextResponse.json(DEFAULT_DELIVERY_PRICES, { headers });
}

export async function POST(req: Request) {
  return handleSavePrices(req);
}

export async function PATCH(req: Request) {
  return handleSavePrices(req);
}

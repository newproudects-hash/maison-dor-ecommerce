import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { WILAYAS, DEFAULT_DELIVERY_PRICES } from '@/lib/data/wilayas';
import { getFromCache, setCache } from '@/lib/cache/redis';
import { revalidatePath } from 'next/cache';

const headers = {
  'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
  'Pragma': 'no-cache',
  'Expires': '0',
};

export async function handleSavePrices(req: Request) {
  try {
    const body = await req.json();
    
    // Normalize payload
    let rawItems: any[] = [];
    if (Array.isArray(body)) {
      rawItems = body;
    } else if (Array.isArray(body.prices)) {
      rawItems = body.prices;
    } else if (body.wilaya_code !== undefined) {
      rawItems = [body];
    } else {
      return NextResponse.json({ success: false, message: 'بيانات غير صالحة' }, { status: 400, headers });
    }

    if (rawItems.length === 0) {
      return NextResponse.json({ success: false, message: 'لا توجد بيانات للحفظ' }, { status: 400, headers });
    }

    // Sanitize items
    const sanitizedItems = rawItems.map(item => {
      const code = Number(item.wilaya_code);
      const defaultInfo = DEFAULT_DELIVERY_PRICES.find(p => p.wilaya_code === code);
      const wilayaMeta = WILAYAS.find(w => w.code === code);
      return {
        wilaya_code: code,
        wilaya_name: item.wilaya_name || defaultInfo?.wilaya_name || wilayaMeta?.name_fr || `Wilaya ${code}`,
        wilaya_ar: item.wilaya_ar || defaultInfo?.wilaya_ar || wilayaMeta?.name_ar || '',
        home_price: Math.max(0, Math.round(Number(item.home_price) || 0)),
        office_price: Math.max(0, Math.round(Number(item.office_price) || 0)),
        is_active: item.is_active !== undefined ? Boolean(item.is_active) : true,
      };
    });

    // 1. Persist to Redis (edge cache)
    try {
      const existingCache = await getFromCache<any[]>('settings:delivery_prices');
      const base = Array.isArray(existingCache) && existingCache.length > 0 ? existingCache : DEFAULT_DELIVERY_PRICES;
      const priceMap = new Map<number, any>();
      base.forEach(p => priceMap.set(Number(p.wilaya_code), { ...p }));
      sanitizedItems.forEach(p => {
        const prev = priceMap.get(p.wilaya_code) || {};
        priceMap.set(p.wilaya_code, { ...prev, ...p });
      });
      const allUpdated = Array.from(priceMap.values()).sort((a, b) => a.wilaya_code - b.wilaya_code);
      await setCache('settings:delivery_prices', allUpdated, 31536000);
    } catch (redisErr) {
      console.warn('[Delivery API] Redis persist warning:', redisErr);
    }

    // 2. Persist to Supabase if available
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

    if (supabaseUrl && serviceRoleKey) {
      try {
        const adminSupabase = createClient(supabaseUrl, serviceRoleKey);
        const { error: upsertError } = await adminSupabase
          .from('delivery_prices')
          .upsert(sanitizedItems, { onConflict: 'wilaya_code' });

        if (upsertError) {
          console.warn('[Delivery API] Direct upsert failed, running row-by-row fallback:', upsertError.message);
          for (const item of sanitizedItems) {
            const { data: rows } = await adminSupabase
              .from('delivery_prices')
              .select('id, wilaya_code')
              .eq('wilaya_code', item.wilaya_code);

            if (rows && rows.length > 0) {
              await adminSupabase
                .from('delivery_prices')
                .update({ home_price: item.home_price, office_price: item.office_price, is_active: item.is_active })
                .eq('wilaya_code', item.wilaya_code);
            } else {
              await adminSupabase
                .from('delivery_prices')
                .insert([item]);
            }
          }
        }
      } catch (sbErr: any) {
        console.warn('[Delivery API] Supabase write notice:', sbErr?.message);
      }
    }

    // 3. Revalidate caches
    try {
      revalidatePath('/api/delivery-prices');
      revalidatePath('/commander');
      const adminPath = process.env.ADMIN_PATH || 'admin';
      revalidatePath(`/${adminPath}/dashboard/shipping`);
      revalidatePath(`/${adminPath}/dashboard/delivery`);
    } catch (revalErr) {
      console.warn('[Delivery API] Revalidation notice:', revalErr);
    }

    return NextResponse.json({ 
      success: true, 
      count: sanitizedItems.length,
      message: `تم حفظ أسعار ${sanitizedItems.length} ولاية بنجاح`
    }, { headers });

  } catch (error: any) {
    console.error('[Delivery API] Server error:', error);
    return NextResponse.json({ success: false, message: error?.message || 'Server error' }, { status: 500, headers });
  }
}

import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createClient } from '@supabase/supabase-js';
import { revalidatePath } from 'next/cache';
import { WILAYAS } from '@/lib/data/wilayas';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function PATCH(req: Request) {
  return handleUpdate(req);
}

export async function POST(req: Request) {
  return handleUpdate(req);
}

async function handleUpdate(req: Request) {
  try {
    // 1. Basic Auth Check
    const cookieStore = await cookies();
    const token = cookieStore.get('admin_token')?.value;
    const adminToken = process.env.ADMIN_SECRET_TOKEN;
    if (!adminToken || token !== adminToken) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    
    // Normalize payload: supports single object { wilaya_code, ... } or batch { prices: [...] } or array [...]
    let rawItems: any[] = [];
    if (Array.isArray(body)) {
      rawItems = body;
    } else if (Array.isArray(body.prices)) {
      rawItems = body.prices;
    } else if (body.wilaya_code !== undefined) {
      rawItems = [body];
    } else {
      return NextResponse.json({ success: false, message: 'Invalid payload' }, { status: 400 });
    }

    if (rawItems.length === 0) {
      return NextResponse.json({ success: false, message: 'No items provided' }, { status: 400 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json({ success: false, message: 'Supabase service credentials missing' }, { status: 500 });
    }

    const adminSupabase = createClient(supabaseUrl, serviceRoleKey);

    // Prepare upsert items with names and numeric sanitization
    const upsertItems = rawItems.map(item => {
      const code = Number(item.wilaya_code);
      const wilayaInfo = WILAYAS.find(w => w.code === code);
      return {
        wilaya_code: code,
        wilaya_name: item.wilaya_name || wilayaInfo?.name_fr || `Wilaya ${code}`,
        wilaya_ar: item.wilaya_ar || wilayaInfo?.name_ar || '',
        home_price: Math.max(0, Math.round(Number(item.home_price) || 0)),
        office_price: Math.max(0, Math.round(Number(item.office_price) || 0)),
        is_active: item.is_active !== undefined ? Boolean(item.is_active) : true,
      };
    });

    // UPSERT directly into delivery_prices table on wilaya_code conflict
    const { error } = await adminSupabase
      .from('delivery_prices')
      .upsert(upsertItems, { onConflict: 'wilaya_code' });

    if (error) {
      console.error('[Admin Delivery API] Upsert Error:', error);
      return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }

    // Invalidate Next.js cache so checkout and dashboard reflect new prices instantly
    try {
      revalidatePath('/api/delivery-prices');
      revalidatePath('/commander');
      const adminPath = process.env.ADMIN_PATH || 'admin';
      revalidatePath(`/${adminPath}/dashboard/shipping`);
      revalidatePath(`/${adminPath}/dashboard/delivery`);
    } catch (e) {
      console.warn('[Admin Delivery API] Revalidate warning:', e);
    }

    return NextResponse.json({ 
      success: true, 
      count: upsertItems.length,
      message: `${upsertItems.length} wilaya(s) updated successfully`
    });

  } catch (error: any) {
    console.error('[Admin Delivery API] Server error:', error);
    return NextResponse.json({ success: false, message: error?.message || 'Server error' }, { status: 500 });
  }
}

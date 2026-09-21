import { NextResponse } from 'next/server';
import { getServerSupabase } from '@/lib/supabase/server';
import { cookies } from 'next/headers';

// ─── GET: قراءة إعدادات البيكسل الحالية ─────────────────────────────────────
export async function GET() {
  try {
    const supabase = getServerSupabase();

    const { data, error } = await supabase
      .from('app_settings')
      .select('value')
      .eq('key', 'meta_pixel_id')
      .single();

    if (error && error.code !== 'PGRST116') {
      // PGRST116 = row not found (OK, just means not set yet)
      console.error('[pixel-settings GET]', error);
      return NextResponse.json({ error: 'DB error' }, { status: 500 });
    }

    const pixelId = data?.value || process.env.NEXT_PUBLIC_META_PIXEL_ID || '';
    return NextResponse.json({ pixelId });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

// ─── POST: حفظ إعدادات البيكسل ───────────────────────────────────────────────
export async function POST(req: Request) {
  try {
    // التحقق من صلاحية الأدمن
    const cookieStore = await cookies();
    const adminToken = cookieStore.get('admin_token')?.value;
    const validToken = process.env.ADMIN_SECRET_TOKEN;

    if (!adminToken || !validToken || adminToken !== validToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { pixelId } = body;

    if (typeof pixelId !== 'string') {
      return NextResponse.json({ error: 'pixelId must be a string' }, { status: 400 });
    }

    const supabase = getServerSupabase();

    // upsert: إذا موجود يحدّثه، إذا ما موجود يضيفه
    const { error } = await supabase
      .from('app_settings')
      .upsert(
        { key: 'meta_pixel_id', value: pixelId.trim() },
        { onConflict: 'key' }
      );

    if (error) {
      console.error('[pixel-settings POST]', error);
      return NextResponse.json({ error: 'Failed to save pixel ID' }, { status: 500 });
    }

    return NextResponse.json({ success: true, pixelId: pixelId.trim() });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

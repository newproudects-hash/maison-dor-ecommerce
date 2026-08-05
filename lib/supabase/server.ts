import { createClient as createServerClient } from '@supabase/supabase-js';

export function getServerSupabase() {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!  // أقوى صلاحيات للـ API routes
  );
}

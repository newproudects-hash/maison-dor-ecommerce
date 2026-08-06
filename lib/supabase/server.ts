import { createClient as createServerClient } from '@supabase/supabase-js';

export function getServerSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    // Return a mock-safe client that won't crash build
    return createServerClient(
      'https://placeholder.supabase.co',
      'placeholder-key-for-build'
    );
  }

  return createServerClient(url, key);
}

export function getAnonSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    return createServerClient(
      'https://placeholder.supabase.co',
      'placeholder-key-for-build'
    );
  }

  return createServerClient(url, key);
}

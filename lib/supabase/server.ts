import { createClient as createServerClient } from '@supabase/supabase-js';

export function getServerSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  // ✅ SECURITY FIX (VULN-010): Removed ANON_KEY fallback to prevent silent privilege escalation
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error('Supabase URL or SUPABASE_SERVICE_ROLE_KEY is missing. Server operations failed securely.');
  }

  return createServerClient(url, key);
}

export function getAnonSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    throw new Error('Supabase Anon URL or Key is missing. Check your environment variables.');
  }

  return createServerClient(url, key);
}

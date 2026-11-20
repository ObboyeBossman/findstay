import { createClient, type SupabaseClient } from '@supabase/supabase-js';

export const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL ?? '';
export const SUPABASE_PUBLISHABLE_KEY =
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ?? '';
export const TURNSTILE_SITE_KEY =
  import.meta.env.VITE_TURNSTILE_SITE_KEY ?? '';

export const isSupabaseConfigured =
  Boolean(SUPABASE_URL) && Boolean(SUPABASE_PUBLISHABLE_KEY);

/**
 * Browser Supabase client — used strictly for authentication (`TA-01`, `P-09`).
 * Never holds service-role keys; all business data goes through `/api/v1/...`.
 */
export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
      },
    })
  : null;

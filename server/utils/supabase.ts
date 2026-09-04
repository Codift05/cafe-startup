// ============================================================
// Supabase Server Utility
// ============================================================

import { createClient, type SupabaseClient } from '@supabase/supabase-js'

let _adminClient: SupabaseClient | null = null

/**
 * Get Supabase admin client (service role — server-side only).
 * This bypasses RLS and should only be used in server API routes.
 */
export function useSupabaseAdmin(): SupabaseClient {
  if (_adminClient) return _adminClient

  const config = useRuntimeConfig()

  if (!config.public.supabaseUrl || !config.supabaseServiceKey) {
    throw new Error('Supabase credentials not configured. Check SUPABASE_URL and SUPABASE_SERVICE_KEY in .env')
  }

  _adminClient = createClient(
    config.public.supabaseUrl,
    config.supabaseServiceKey,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  )

  return _adminClient
}

/**
 * Get Supabase anon client (for auth-based queries with RLS).
 */
export function useSupabaseAnon(): SupabaseClient {
  const config = useRuntimeConfig()

  return createClient(
    config.public.supabaseUrl,
    config.public.supabaseAnonKey,
  )
}

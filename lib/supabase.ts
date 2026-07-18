import { createClient, SupabaseClient } from "@supabase/supabase-js";

/** Thin Supabase client factory. Returns null until SUPABASE_URL and
 * SUPABASE_PUBLISHABLE_KEY are set (see .env.example), so callers can check
 * for that and fall back gracefully instead of crashing when the project
 * isn't connected yet.
 *
 * Uses the publishable key (safe to expose, subject to Row Level Security)
 * rather than the secret key — the `leads` table has RLS enabled with an
 * INSERT-only policy for the `anon` role, so this key can create leads but
 * cannot read, update, or delete them. See the SQL in the project README.
 */
let cachedClient: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient | null {
  if (cachedClient) return cachedClient;

  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) return null;

  cachedClient = createClient(url, key);
  return cachedClient;
}

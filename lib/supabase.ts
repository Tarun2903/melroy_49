/** Thin Supabase client factory. Returns null until SUPABASE_URL and
 * SUPABASE_SERVICE_ROLE_KEY are set (see .env.example), so callers can check
 * for that and fall back gracefully instead of crashing when the project
 * isn't connected yet.
 *
 * Once you're ready to connect Supabase:
 *   1. npm install @supabase/supabase-js
 *   2. Uncomment the implementation below.
 *   3. Fill in .env.local with your project's URL + service role key.
 */
export function getSupabaseClient(): null {
  // TODO: replace with a real client once @supabase/supabase-js is installed:
  //
  // import { createClient } from "@supabase/supabase-js";
  //
  // const url = process.env.SUPABASE_URL;
  // const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  // if (!url || !key) return null;
  // return createClient(url, key);

  return null;
}

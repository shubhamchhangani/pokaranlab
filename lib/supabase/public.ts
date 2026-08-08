import { createClient as createSupabaseClient } from "@supabase/supabase-js";

/**
 * Anon-key client with no cookie/session handling — safe to call from anywhere, including
 * `generateStaticParams` and other build-time contexts where `next/headers` isn't available.
 * Only for tables that are public-read under RLS regardless of who's asking (tests,
 * test_categories, packages, media, site_settings). Anything that needs the caller's session
 * (admin auth, patient-scoped bookings/reports) must keep using lib/supabase/server.ts.
 */
export function createClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

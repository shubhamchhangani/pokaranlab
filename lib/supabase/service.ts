import { createClient as createSupabaseClient } from "@supabase/supabase-js";

/**
 * Service-role client — bypasses RLS entirely. Only for narrow, already-verified operations
 * where no RLS policy could grant the access needed (e.g. generating a signed URL for a
 * `reports` bucket object after `verify_report_access()` has confirmed a phone+sample-number
 * match). Never use this for general queries, and never let a value derived from it reach the
 * client without first being scoped to exactly what was verified. See
 * docs/database-schema.md.
 */
export function createServiceClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );
}

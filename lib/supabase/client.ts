import { createBrowserClient } from "@supabase/ssr";

/**
 * Browser client for Client Components. Untyped for now — postgrest-js's newer generic
 * shape (Relationships, __InternalSupabase) only lines up cleanly with real
 * `supabase gen types typescript` output. See lib/types/database.ts and supabase/README.md.
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

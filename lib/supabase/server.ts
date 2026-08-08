import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

/**
 * Server Component / Server Action / Route Handler client — reads the caller's session from
 * cookies. Untyped for now — see lib/supabase/client.ts for why.
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Called from a Server Component render — a middleware refresh handles this instead.
          }
        },
      },
    }
  );
}

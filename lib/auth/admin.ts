import { createClient } from "@/lib/supabase/server";

export const hasSupabase = Boolean(
  process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export type AdminSession = {
  userId: string;
  email: string | null;
  staffRole: string;
};

/** Returns null when unauthenticated, not staff, or Supabase isn't configured yet. */
export async function getAdminSession(): Promise<AdminSession | null> {
  if (!hasSupabase) return null;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: staff } = await supabase
    .from("staff")
    .select("staff_role")
    .eq("profile_id", user.id)
    .maybeSingle();

  if (!staff) return null;

  return { userId: user.id, email: user.email ?? null, staffRole: staff.staff_role };
}

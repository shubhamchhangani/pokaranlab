import { createClient } from "@/lib/supabase/server";

export type TestCategory = { id: string; name_en: string; name_hi: string };

/** Admin-only — the catalog screens that call this only render once Supabase is configured. */
export async function getTestCategories(): Promise<TestCategory[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("test_categories")
    .select("id, name_en, name_hi")
    .order("name_en");

  return data ?? [];
}

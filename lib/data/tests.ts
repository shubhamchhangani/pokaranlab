import { createClient } from "@/lib/supabase/server";
import { mockTests, type MockTest } from "@/lib/data/mock-content";

const hasSupabase = Boolean(
  process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export type TestListItem = MockTest;

/** Returns mock data until NEXT_PUBLIC_SUPABASE_URL / _ANON_KEY are set — see .env.example. */
export async function getTests(): Promise<TestListItem[]> {
  if (!hasSupabase) return mockTests;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("tests")
    .select("*")
    .order("name_en");

  if (error || !data) return mockTests;

  return data.map((t) => ({
    slug: t.slug,
    name_en: t.name_en,
    name_hi: t.name_hi,
    category_en: "",
    sample_type: t.sample_type,
    price: t.price,
    turnaround_time: t.turnaround_time,
    home_collection_available: t.home_collection_available,
    description_en: "",
    description_hi: "",
  }));
}

export async function getTestBySlug(slug: string): Promise<TestListItem | null> {
  const tests = await getTests();
  return tests.find((t) => t.slug === slug) ?? null;
}

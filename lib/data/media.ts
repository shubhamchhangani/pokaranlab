import { createClient } from "@/lib/supabase/public";

export type LandingMediaItem = {
  id: string;
  url: string;
  caption_en: string | null;
  caption_hi: string | null;
};

const hasSupabase = Boolean(
  process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

/** Landing-page hero carousel images (`media` where `entity_type = 'landing'`), owner-managed
 * from /admin/site-content. Empty (not mocked) when Supabase isn't configured — the hero falls
 * back to text-only, see components/sections/Hero.tsx. */
export async function getLandingMedia(): Promise<LandingMediaItem[]> {
  if (!hasSupabase) return [];

  const supabase = createClient();
  const { data, error } = await supabase
    .from("media")
    .select("id, url, caption_en, caption_hi")
    .eq("entity_type", "landing")
    .order("sort_order");

  if (error || !data) return [];
  return data;
}

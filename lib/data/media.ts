import { createClient } from "@/lib/supabase/public";

export type MediaItem = {
  id: string;
  url: string;
  caption_en: string | null;
  caption_hi: string | null;
};

export type LandingMediaItem = MediaItem;

const hasSupabase = Boolean(
  process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

/** Landing-page hero carousel images (`media` where `entity_type = 'landing'`), owner-managed
 * from /admin/site-content. Empty (not mocked) when Supabase isn't configured — the hero falls
 * back to text-only, see components/sections/Hero.tsx. */
export async function getLandingMedia(): Promise<MediaItem[]> {
  return getEntityMedia("landing", null);
}

/** Gallery photos for a specific test/package (`media` where `entity_type` + `entity_id`
 * match), owner-managed from the test/package edit screens. Separate from
 * `tests.primary_image_url`/`packages.primary_image_url` — see docs/decisions-log.md. */
export async function getEntityMedia(
  entityType: "test" | "package" | "landing",
  entityId: string | null
): Promise<MediaItem[]> {
  if (!hasSupabase) return [];

  const supabase = createClient();
  let query = supabase
    .from("media")
    .select("id, url, caption_en, caption_hi")
    .eq("entity_type", entityType)
    .order("sort_order");

  query = entityId ? query.eq("entity_id", entityId) : query.is("entity_id", null);

  const { data, error } = await query;
  if (error || !data) return [];
  return data;
}

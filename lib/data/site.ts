import { createClient } from "@/lib/supabase/server";
import { mockSiteInfo } from "@/lib/data/mock-content";

const hasSupabase = Boolean(
  process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export type SiteInfo = {
  name_en: string;
  name_hi: string;
  shortName: string;
  address_en: string;
  address_hi: string;
  phone: string;
  whatsapp: string;
  email: string;
  hours_en: string;
  hours_hi: string;
  mapsEmbedUrl: string;
  mapsDirectionsUrl: string;
};

/**
 * Reads the single `site_settings` row — owner-editable from /admin/settings. Falls back to
 * mock data only when Supabase isn't configured yet (see lib/data/mock-content.ts).
 */
export async function getSiteInfo(): Promise<SiteInfo> {
  if (!hasSupabase) return mockSiteInfo;

  const supabase = await createClient();
  const { data, error } = await supabase.from("site_settings").select("*").single();

  if (error || !data) return mockSiteInfo;

  return {
    name_en: data.name_en,
    name_hi: data.name_hi,
    shortName: data.short_name,
    address_en: data.address_en,
    address_hi: data.address_hi,
    phone: data.phone,
    whatsapp: data.whatsapp,
    email: data.email,
    hours_en: data.hours_en,
    hours_hi: data.hours_hi,
    mapsEmbedUrl: data.maps_embed_url,
    mapsDirectionsUrl: data.maps_directions_url,
  };
}

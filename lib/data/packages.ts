import { createClient } from "@/lib/supabase/public";
import { mockPackages } from "@/lib/data/mock-content";
import { getEntityMedia, type MediaItem } from "@/lib/data/media";

const hasSupabase = Boolean(
  process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export type PackageListItem = {
  slug: string;
  name_en: string;
  name_hi: string;
  price: number;
  description_en: string;
  description_hi: string;
  primary_image_url: string | null;
};

export type PackageDetail = PackageListItem & {
  includedTests: { slug: string; name_en: string; name_hi: string }[];
  gallery: MediaItem[];
};

const normalizedMockPackages: PackageListItem[] = mockPackages.map((p) => ({
  ...p,
  primary_image_url: p.primary_image_url ?? null,
}));

/** Returns mock data until NEXT_PUBLIC_SUPABASE_URL / _ANON_KEY are set — see .env.example. */
export async function getPackages(): Promise<PackageListItem[]> {
  if (!hasSupabase) return normalizedMockPackages;

  const supabase = createClient();
  const { data, error } = await supabase.from("packages").select("*").order("name_en");

  if (error || !data) return normalizedMockPackages;

  return data.map((p) => ({
    slug: p.slug,
    name_en: p.name_en,
    name_hi: p.name_hi,
    price: p.price,
    description_en: p.description_en ?? "",
    description_hi: p.description_hi ?? "",
    primary_image_url: p.primary_image_url ?? null,
  }));
}

export async function getPackageBySlug(slug: string): Promise<PackageDetail | null> {
  if (!hasSupabase) {
    const pkg = mockPackages.find((p) => p.slug === slug);
    if (!pkg) return null;
    return {
      ...pkg,
      primary_image_url: pkg.primary_image_url ?? null,
      includedTests: [],
      gallery: [],
    };
  }

  const supabase = createClient();
  const { data, error } = await supabase
    .from("packages")
    .select("*, package_tests(tests(slug, name_en, name_hi))")
    .eq("slug", slug)
    .maybeSingle();

  if (error || !data) return null;

  type IncludedTestRow = { tests: { slug: string; name_en: string; name_hi: string } | null };

  const gallery = await getEntityMedia("package", data.id);

  return {
    slug: data.slug,
    name_en: data.name_en,
    name_hi: data.name_hi,
    price: data.price,
    description_en: data.description_en ?? "",
    description_hi: data.description_hi ?? "",
    primary_image_url: data.primary_image_url ?? null,
    includedTests: ((data.package_tests ?? []) as IncludedTestRow[])
      .map((pt) => pt.tests)
      .filter((t): t is { slug: string; name_en: string; name_hi: string } => t !== null),
    gallery,
  };
}

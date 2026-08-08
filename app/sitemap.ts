import type { MetadataRoute } from "next";
import { routing } from "@/i18n/routing";
import { getTests } from "@/lib/data/tests";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://pokaranlab.com";

const staticPaths = ["", "/tests", "/packages", "/book-a-test", "/download-report", "/find-us", "/about"];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const tests = await getTests();

  const entries: MetadataRoute.Sitemap = [];

  for (const locale of routing.locales) {
    for (const path of staticPaths) {
      entries.push({ url: `${BASE_URL}/${locale}${path}` });
    }
    for (const test of tests) {
      entries.push({ url: `${BASE_URL}/${locale}/tests/${test.slug}` });
    }
  }

  return entries;
}

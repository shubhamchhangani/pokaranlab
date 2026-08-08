import type { MetadataRoute } from "next";
import { routing } from "@/i18n/routing";
import { getTests } from "@/lib/data/tests";
import { getPackages } from "@/lib/data/packages";
import { healthConcerns } from "@/lib/data/health-concerns";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://pokaranlab.com";

const staticPaths = [
  "",
  "/tests",
  "/packages",
  "/book-a-test",
  "/download-report",
  "/find-us",
  "/about",
  "/health",
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [tests, packages] = await Promise.all([getTests(), getPackages()]);

  const entries: MetadataRoute.Sitemap = [];

  for (const locale of routing.locales) {
    for (const path of staticPaths) {
      entries.push({ url: `${BASE_URL}/${locale}${path}` });
    }
    for (const test of tests) {
      entries.push({ url: `${BASE_URL}/${locale}/tests/${test.slug}` });
    }
    for (const pkg of packages) {
      entries.push({ url: `${BASE_URL}/${locale}/packages/${pkg.slug}` });
    }
    for (const concern of healthConcerns) {
      entries.push({ url: `${BASE_URL}/${locale}/health/${concern.slug}` });
    }
  }

  return entries;
}

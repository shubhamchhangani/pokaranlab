import { notFound } from "next/navigation";
import { getLocale, getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { buttonClasses } from "@/components/ui/Button";
import { getPackageBySlug, getPackages } from "@/lib/data/packages";
import { getSiteInfo } from "@/lib/data/site";

export async function generateStaticParams() {
  const packages = await getPackages();
  return packages.map((pkg) => ({ slug: pkg.slug }));
}

export async function generateMetadata(props: PageProps<"/[locale]/packages/[slug]">) {
  const { slug, locale } = await props.params;
  const [pkg, siteInfo] = await Promise.all([getPackageBySlug(slug), getSiteInfo()]);
  if (!pkg) return {};

  const name = locale === "hi" ? pkg.name_hi : pkg.name_en;
  const description = locale === "hi" ? pkg.description_hi : pkg.description_en;

  return {
    title: `${name} — ${siteInfo.shortName}, Pokaran`,
    description: description || `${name} at ${siteInfo.shortName} in Pokaran, Jaisalmer.`,
  };
}

export default async function PackageDetailPage(
  props: PageProps<"/[locale]/packages/[slug]">
) {
  const { slug, locale } = await props.params;
  setRequestLocale(locale);

  const [t, currentLocale, pkg, siteInfo] = await Promise.all([
    getTranslations("tests"),
    getLocale(),
    getPackageBySlug(slug),
    getSiteInfo(),
  ]);

  if (!pkg) notFound();

  const name = currentLocale === "hi" ? pkg.name_hi : pkg.name_en;
  const description = currentLocale === "hi" ? pkg.description_hi : pkg.description_en;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "MedicalTest",
    name: pkg.name_en,
    description: pkg.description_en,
    provider: {
      "@type": "MedicalOrganization",
      name: siteInfo.name_en,
      address: siteInfo.address_en,
      telephone: siteInfo.phone,
    },
  };

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-12 sm:px-6">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <h1 className="font-display text-3xl font-semibold text-brand-indigo">{name}</h1>
      <p className="mt-4 text-brand-ink/80">{description}</p>

      <div className="mt-6 rounded-2xl border border-brand-ink/10 bg-white p-6">
        <p className="text-xs text-brand-ink/50">{t("price")}</p>
        <p className="font-semibold text-brand-indigo">₹{pkg.price}</p>

        {pkg.includedTests.length > 0 && (
          <div className="mt-4">
            <p className="text-xs text-brand-ink/50">Includes</p>
            <ul className="mt-1 list-inside list-disc text-sm text-brand-ink">
              {pkg.includedTests.map((test) => (
                <li key={test.slug}>
                  {currentLocale === "hi" ? test.name_hi : test.name_en}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <Link
        href={`/book-a-test?test=${pkg.slug}`}
        className={buttonClasses("primary", "mt-8 w-full sm:w-auto")}
      >
        {t("bookThisTest")}
      </Link>
    </div>
  );
}

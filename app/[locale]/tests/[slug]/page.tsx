import { notFound } from "next/navigation";
import { getLocale, getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { buttonClasses } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { getTestBySlug, getTests } from "@/lib/data/tests";
import { getSiteInfo } from "@/lib/data/site";

export async function generateStaticParams() {
  const tests = await getTests();
  return tests.map((test) => ({ slug: test.slug }));
}

export async function generateMetadata(props: PageProps<"/[locale]/tests/[slug]">) {
  const { slug, locale } = await props.params;
  const [test, siteInfo] = await Promise.all([getTestBySlug(slug), getSiteInfo()]);
  if (!test) return {};

  const name = locale === "hi" ? test.name_hi : test.name_en;
  const description = locale === "hi" ? test.description_hi : test.description_en;

  return {
    title: `${name} — ${siteInfo.shortName}, Pokaran`,
    description: description || `${name} at ${siteInfo.shortName} in Pokaran, Jaisalmer.`,
  };
}

export default async function TestDetailPage(props: PageProps<"/[locale]/tests/[slug]">) {
  const { slug, locale } = await props.params;
  setRequestLocale(locale);

  const [t, currentLocale, test, siteInfo] = await Promise.all([
    getTranslations("tests"),
    getLocale(),
    getTestBySlug(slug),
    getSiteInfo(),
  ]);

  if (!test) notFound();

  const name = currentLocale === "hi" ? test.name_hi : test.name_en;
  const description = currentLocale === "hi" ? test.description_hi : test.description_en;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "MedicalTest",
    name: test.name_en,
    description: test.description_en,
    usedToDiagnose: test.category_en,
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

      <span className="text-xs font-medium uppercase tracking-wide text-brand-teal">
        {test.category_en}
      </span>
      <h1 className="font-display mt-1 text-3xl font-semibold text-brand-indigo">{name}</h1>
      <p className="mt-4 text-brand-ink/80">{description}</p>

      <div className="mt-6 grid grid-cols-2 gap-4 rounded-2xl border border-brand-ink/10 bg-white p-6 sm:grid-cols-4">
        <div>
          <p className="text-xs text-brand-ink/50">{t("price")}</p>
          <p className="font-semibold text-brand-indigo">₹{test.price}</p>
        </div>
        <div>
          <p className="text-xs text-brand-ink/50">{t("sampleType")}</p>
          <p className="font-semibold text-brand-indigo">{test.sample_type}</p>
        </div>
        <div>
          <p className="text-xs text-brand-ink/50">{t("turnaround")}</p>
          <p className="font-semibold text-brand-indigo">{test.turnaround_time}</p>
        </div>
        {test.home_collection_available && (
          <div className="flex items-end">
            <Badge>{t("homeCollectionAvailable")}</Badge>
          </div>
        )}
      </div>

      <Link
        href={`/book-a-test?item=test:${test.slug}`}
        className={buttonClasses("primary", "mt-8 w-full sm:w-auto")}
      >
        {t("bookThisTest")}
      </Link>
    </div>
  );
}

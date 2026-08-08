import { notFound } from "next/navigation";
import { getLocale, getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { buttonClasses } from "@/components/ui/Button";
import { getHealthConcernBySlug, healthConcerns } from "@/lib/data/health-concerns";
import { getTests } from "@/lib/data/tests";
import { getPackages } from "@/lib/data/packages";
import { getSiteInfo } from "@/lib/data/site";

export async function generateStaticParams() {
  return healthConcerns.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata(props: PageProps<"/[locale]/health/[slug]">) {
  const { slug, locale } = await props.params;
  const concern = getHealthConcernBySlug(slug);
  if (!concern) return {};

  const siteInfo = await getSiteInfo();
  const title = locale === "hi" ? concern.title_hi : concern.title_en;
  const intro = locale === "hi" ? concern.intro_hi : concern.intro_en;

  return {
    title: `${title} — ${siteInfo.shortName}, Pokaran`,
    description: intro,
  };
}

export default async function HealthConcernPage(
  props: PageProps<"/[locale]/health/[slug]">
) {
  const { slug, locale } = await props.params;
  setRequestLocale(locale);

  const concern = getHealthConcernBySlug(slug);
  if (!concern) notFound();

  const [t, currentLocale, tests, packages, siteInfo] = await Promise.all([
    getTranslations("health"),
    getLocale(),
    getTests(),
    getPackages(),
    getSiteInfo(),
  ]);

  const recommendedTests = tests.filter((test) =>
    concern.recommendedTestSlugs?.includes(test.slug)
  );
  const recommendedPackages = packages.filter((pkg) =>
    concern.recommendedPackageSlugs?.includes(pkg.slug)
  );

  const title = currentLocale === "hi" ? concern.title_hi : concern.title_en;
  const intro = currentLocale === "hi" ? concern.intro_hi : concern.intro_en;
  const symptoms = currentLocale === "hi" ? concern.symptoms_hi : concern.symptoms_en;
  const whenToTest = currentLocale === "hi" ? concern.whenToTest_hi : concern.whenToTest_en;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "MedicalWebPage",
    name: concern.title_en,
    description: concern.intro_en,
    about: { "@type": "MedicalCondition", name: concern.title_en },
    author: { "@type": "MedicalOrganization", name: siteInfo.name_en },
    publisher: { "@type": "MedicalOrganization", name: siteInfo.name_en },
  };

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-12 sm:px-6">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <h1 className="font-display text-3xl font-semibold text-brand-indigo">{title}</h1>
      <p className="mt-4 text-brand-ink/80">{intro}</p>

      <div className="mt-8 rounded-2xl border border-brand-ink/10 bg-white p-6">
        <h2 className="font-semibold text-brand-indigo">{t("symptomsTitle")}</h2>
        <ul className="mt-2 list-inside list-disc text-sm text-brand-ink/80">
          {symptoms.map((symptom) => (
            <li key={symptom}>{symptom}</li>
          ))}
        </ul>
      </div>

      <div className="mt-6 rounded-2xl border border-brand-ink/10 bg-white p-6">
        <h2 className="font-semibold text-brand-indigo">{t("whenToTestTitle")}</h2>
        <p className="mt-2 text-sm text-brand-ink/80">{whenToTest}</p>
      </div>

      {(recommendedTests.length > 0 || recommendedPackages.length > 0) && (
        <div className="mt-6">
          <h2 className="font-semibold text-brand-indigo">{t("recommendedTitle")}</h2>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            {recommendedTests.map((test) => (
              <div
                key={test.slug}
                className="flex items-center justify-between rounded-lg border border-brand-ink/10 bg-white p-4"
              >
                <span className="text-sm font-medium text-brand-ink">
                  {currentLocale === "hi" ? test.name_hi : test.name_en}
                </span>
                <Link href={`/tests/${test.slug}`} className={buttonClasses("outline")}>
                  {t("bookThis")}
                </Link>
              </div>
            ))}
            {recommendedPackages.map((pkg) => (
              <div
                key={pkg.slug}
                className="flex items-center justify-between rounded-lg border border-brand-ink/10 bg-white p-4"
              >
                <span className="text-sm font-medium text-brand-ink">
                  {currentLocale === "hi" ? pkg.name_hi : pkg.name_en}
                </span>
                <Link href={`/packages/${pkg.slug}`} className={buttonClasses("outline")}>
                  {t("bookThis")}
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}

      <p className="mt-8 text-xs italic text-brand-ink/50">{t("disclaimer")}</p>
    </div>
  );
}

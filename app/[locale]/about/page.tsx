import { getLocale, getTranslations, setRequestLocale } from "next-intl/server";
import { getSiteInfo } from "@/lib/data/site";

export default async function AboutPage(props: PageProps<"/[locale]/about">) {
  const { locale } = await props.params;
  setRequestLocale(locale);

  const [t, currentLocale, siteInfo] = await Promise.all([
    getTranslations("about"),
    getLocale(),
    getSiteInfo(),
  ]);

  const name = currentLocale === "hi" ? siteInfo.name_hi : siteInfo.name_en;
  const address = currentLocale === "hi" ? siteInfo.address_hi : siteInfo.address_en;
  const hours = currentLocale === "hi" ? siteInfo.hours_hi : siteInfo.hours_en;

  const facts = [
    { label: t("factsLocation"), value: address },
    { label: t("factsHours"), value: hours },
    { label: t("factsServices"), value: t("factsServicesValue") },
    { label: t("factsCollection"), value: t("factsCollectionValue") },
    { label: t("factsReports"), value: t("factsReportsValue") },
  ];

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-12 sm:px-6">
      <h1 className="font-display text-3xl font-semibold text-brand-indigo">
        {t("pageTitle")}
      </h1>

      <p className="mt-4 text-brand-ink/80">{t("intro", { name })}</p>

      <dl className="mt-8 divide-y divide-brand-ink/10 rounded-2xl border border-brand-ink/10 bg-white">
        {facts.map((fact) => (
          <div key={fact.label} className="grid gap-1 p-4 sm:grid-cols-3 sm:gap-4">
            <dt className="text-sm font-medium text-brand-ink/60">{fact.label}</dt>
            <dd className="text-sm text-brand-ink sm:col-span-2">{fact.value}</dd>
          </div>
        ))}
      </dl>

      <p className="mt-6 text-xs text-brand-ink/50">{t("disclaimer")}</p>
    </div>
  );
}

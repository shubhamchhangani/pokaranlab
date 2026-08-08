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
  const hours = currentLocale === "hi" ? siteInfo.hours_hi : siteInfo.hours_en;

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-12 sm:px-6">
      <h1 className="font-display text-3xl font-semibold text-brand-indigo">
        {t("pageTitle")}
      </h1>

      <div className="mt-6 flex flex-col gap-4 text-brand-ink/80">
        <p>
          {name} serves patients in and around Pokaran, Jaisalmer district, with blood
          investigations, digital X-ray, and ECG.
        </p>
        <p>
          {/* TODO: replace with real founding year / experience once provided */}
          Years running, equipment on hand, and staff qualifications go here — written
          as clean, extractable facts (see docs/system-design.md §11.6) rather than
          marketing copy, since this content is meant to be read by both people and
          AI search assistants.
        </p>
        <p>{hours}</p>
      </div>
    </div>
  );
}

import { getLocale, getTranslations } from "next-intl/server";
import { buttonClasses } from "@/components/ui/Button";
import { getSiteInfo } from "@/lib/data/site";

export async function LocationMap() {
  const [t, locale, siteInfo] = await Promise.all([
    getTranslations("home"),
    getLocale(),
    getSiteInfo(),
  ]);

  return (
    <section className="px-4 py-16 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <h2 className="font-display text-center text-2xl font-semibold text-brand-indigo sm:text-3xl">
          {t("locationTitle")}
        </h2>

        <div className="mt-8 grid gap-6 overflow-hidden rounded-2xl border border-brand-ink/10 md:grid-cols-2">
          <iframe
            src={siteInfo.mapsEmbedUrl}
            className="h-72 w-full border-0 md:h-full"
            loading="lazy"
            title={siteInfo.shortName + " location"}
          />
          <div className="flex flex-col justify-center gap-3 p-6">
            <p className="text-brand-ink">
              {locale === "hi" ? siteInfo.address_hi : siteInfo.address_en}
            </p>
            <p className="text-brand-ink/70">{siteInfo.phone}</p>
            <p className="text-brand-ink/70">
              {locale === "hi" ? siteInfo.hours_hi : siteInfo.hours_en}
            </p>
            <a
              href={siteInfo.mapsDirectionsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={buttonClasses("primary", "mt-2 w-fit")}
            >
              {t("getDirections")}
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

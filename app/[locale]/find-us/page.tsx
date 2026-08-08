import { getLocale, getTranslations, setRequestLocale } from "next-intl/server";
import { getSiteInfo } from "@/lib/data/site";
import { buttonClasses } from "@/components/ui/Button";

export async function generateMetadata(props: PageProps<"/[locale]/find-us">) {
  const { locale } = await props.params;
  const siteInfo = await getSiteInfo();
  const address = locale === "hi" ? siteInfo.address_hi : siteInfo.address_en;
  const hours = locale === "hi" ? siteInfo.hours_hi : siteInfo.hours_en;

  return {
    title: `Find Us — ${siteInfo.shortName}, Pokaran`,
    description: `${address}. ${hours}.`,
  };
}

export default async function FindUsPage(props: PageProps<"/[locale]/find-us">) {
  const { locale } = await props.params;
  setRequestLocale(locale);

  const [t, currentLocale, siteInfo] = await Promise.all([
    getTranslations("findUs"),
    getLocale(),
    getSiteInfo(),
  ]);

  const address = currentLocale === "hi" ? siteInfo.address_hi : siteInfo.address_en;
  const hours = currentLocale === "hi" ? siteInfo.hours_hi : siteInfo.hours_en;

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-12 sm:px-6">
      {/* MedicalOrganization/LocalBusiness JSON-LD is rendered site-wide in
          app/[locale]/layout.tsx — see components/seo/OrganizationJsonLd.tsx */}
      <h1 className="font-display text-3xl font-semibold text-brand-indigo">
        {t("pageTitle")}
      </h1>

      <div className="mt-8 grid gap-6 overflow-hidden rounded-2xl border border-brand-ink/10 md:grid-cols-2">
        <iframe
          src={siteInfo.mapsEmbedUrl}
          className="h-72 w-full border-0 md:h-full"
          loading="lazy"
          title={siteInfo.shortName + " location"}
        />
        <div className="flex flex-col justify-center gap-3 p-6">
          <div>
            <p className="text-xs text-brand-ink/50">{t("addressLabel")}</p>
            <p className="text-brand-ink">{address}</p>
          </div>
          <div>
            <p className="text-xs text-brand-ink/50">{t("phoneLabel")}</p>
            <p className="text-brand-ink">{siteInfo.phone}</p>
          </div>
          <div>
            <p className="text-xs text-brand-ink/50">{t("hoursLabel")}</p>
            <p className="text-brand-ink">{hours}</p>
          </div>
          <a
            href={siteInfo.mapsDirectionsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={buttonClasses("primary", "mt-2 w-fit")}
          >
            Get Directions
          </a>
        </div>
      </div>
    </div>
  );
}

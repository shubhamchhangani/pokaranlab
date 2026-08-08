import { getTranslations, setRequestLocale } from "next-intl/server";
import { siteInfo } from "@/lib/data/mock-content";
import { buttonClasses } from "@/components/ui/Button";

export async function generateMetadata() {
  return {
    title: `Find Us — ${siteInfo.shortName}, Pokaran`,
    description: `${siteInfo.address}. ${siteInfo.hours}.`,
  };
}

export default async function FindUsPage(props: PageProps<"/[locale]/find-us">) {
  const { locale } = await props.params;
  setRequestLocale(locale);
  const t = await getTranslations("findUs");

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "MedicalOrganization",
    name: siteInfo.name,
    address: siteInfo.address,
    telephone: siteInfo.phone,
    openingHours: siteInfo.hours,
  };

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-12 sm:px-6">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <h1 className="font-display text-3xl font-semibold text-brand-indigo">
        {t("pageTitle")}
      </h1>

      <div className="mt-8 grid gap-6 overflow-hidden rounded-2xl border border-brand-ink/10 md:grid-cols-2">
        <iframe
          src={siteInfo.mapsEmbedSrc}
          className="h-72 w-full border-0 md:h-full"
          loading="lazy"
          title="Pokaran Lab location"
        />
        <div className="flex flex-col justify-center gap-3 p-6">
          <div>
            <p className="text-xs text-brand-ink/50">{t("addressLabel")}</p>
            <p className="text-brand-ink">{siteInfo.address}</p>
          </div>
          <div>
            <p className="text-xs text-brand-ink/50">{t("phoneLabel")}</p>
            <p className="text-brand-ink">{siteInfo.phone}</p>
          </div>
          <div>
            <p className="text-xs text-brand-ink/50">{t("hoursLabel")}</p>
            <p className="text-brand-ink">{siteInfo.hours}</p>
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

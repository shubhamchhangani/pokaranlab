import { getSiteInfo } from "@/lib/data/site";

/**
 * `MedicalOrganization` + `LocalBusiness` structured data, per system-design.md §6 ("on every
 * page") and §11.4. Rendered once in app/[locale]/layout.tsx rather than per-page — every public
 * route gets it without needing to remember to add it. Test/package detail pages additionally
 * render their own `MedicalTest` JSON-LD with a `provider` back-reference to this same
 * organization (see tests/[slug]/page.tsx).
 */
export async function OrganizationJsonLd() {
  const siteInfo = await getSiteInfo();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": ["MedicalOrganization", "MedicalClinic", "LocalBusiness"],
    name: siteInfo.name_en,
    alternateName: siteInfo.name_hi,
    address: {
      "@type": "PostalAddress",
      streetAddress: siteInfo.address_en,
      addressLocality: "Pokaran",
      addressRegion: "Rajasthan",
      addressCountry: "IN",
    },
    telephone: siteInfo.phone,
    email: siteInfo.email,
    ...(siteInfo.geoLat != null && siteInfo.geoLng != null
      ? {
          geo: {
            "@type": "GeoCoordinates",
            latitude: siteInfo.geoLat,
            longitude: siteInfo.geoLng,
          },
        }
      : {}),
    url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://pokaranlab.com",
    openingHours: siteInfo.hours_en,
    medicalSpecialty: ["Pathology", "Radiography", "Cardiology"],
    availableService: [
      { "@type": "MedicalTest", name: "Blood investigation" },
      { "@type": "MedicalTest", name: "Digital X-Ray" },
      { "@type": "MedicalTest", name: "ECG" },
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

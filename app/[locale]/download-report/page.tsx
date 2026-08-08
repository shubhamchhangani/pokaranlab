import { getTranslations, setRequestLocale } from "next-intl/server";
import { ReportLookupForm } from "@/components/reports/ReportLookupForm";

export default async function DownloadReportPage(
  props: PageProps<"/[locale]/download-report">
) {
  const { locale } = await props.params;
  setRequestLocale(locale);
  const t = await getTranslations("downloadReport");

  return (
    <div className="mx-auto w-full max-w-md px-4 py-12 sm:px-6">
      <h1 className="font-display text-3xl font-semibold text-brand-indigo">
        {t("pageTitle")}
      </h1>
      <div className="mt-8">
        <ReportLookupForm />
      </div>
    </div>
  );
}

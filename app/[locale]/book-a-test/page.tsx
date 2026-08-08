import { getTranslations, setRequestLocale } from "next-intl/server";
import { getTests } from "@/lib/data/tests";
import { getPackages } from "@/lib/data/packages";
import { BookingForm } from "@/components/booking/BookingForm";

export default async function BookATestPage(
  props: PageProps<"/[locale]/book-a-test">
) {
  const [{ locale }, searchParams] = await Promise.all([
    props.params,
    props.searchParams,
  ]);
  setRequestLocale(locale);

  const [t, tests, packages] = await Promise.all([
    getTranslations("booking"),
    getTests(),
    getPackages(),
  ]);
  const preselectedItem =
    typeof searchParams.item === "string" ? searchParams.item : undefined;

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-12 sm:px-6">
      <h1 className="font-display text-3xl font-semibold text-brand-indigo">
        {t("pageTitle")}
      </h1>
      <div className="mt-8">
        <BookingForm
          tests={tests}
          packages={packages}
          locale={locale}
          preselectedItem={preselectedItem}
        />
      </div>
    </div>
  );
}

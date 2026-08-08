import { getLocale, getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { buttonClasses } from "@/components/ui/Button";
import { getTests } from "@/lib/data/tests";

export default async function TestsPage(props: PageProps<"/[locale]/tests">) {
  const { locale } = await props.params;
  setRequestLocale(locale);

  const [t, currentLocale, tests] = await Promise.all([
    getTranslations("tests"),
    getLocale(),
    getTests(),
  ]);

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6">
      <h1 className="font-display text-3xl font-semibold text-brand-indigo">
        {t("pageTitle")}
      </h1>

      <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {tests.map((test) => (
          <Card key={test.slug} className="flex flex-col">
            <span className="text-xs font-medium uppercase tracking-wide text-brand-teal">
              {test.category_en}
            </span>
            <h2 className="mt-1 font-semibold text-brand-indigo">
              {currentLocale === "hi" ? test.name_hi : test.name_en}
            </h2>
            <p className="mt-2 text-sm text-brand-ink/70">
              {t("sampleType")}: {test.sample_type}
            </p>
            <p className="text-sm text-brand-ink/70">
              {t("turnaround")}: {test.turnaround_time}
            </p>
            {test.home_collection_available && (
              <Badge className="mt-3 w-fit">{t("homeCollectionAvailable")}</Badge>
            )}
            <div className="mt-4 flex items-center justify-between">
              <span className="font-semibold text-brand-indigo">₹{test.price}</span>
              <Link href={`/tests/${test.slug}`} className={buttonClasses("outline")}>
                {t("bookThisTest")}
              </Link>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

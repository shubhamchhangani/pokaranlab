import { getLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { buttonClasses } from "@/components/ui/Button";
import { getTests } from "@/lib/data/tests";

export async function PopularTests() {
  const [t, locale, tests] = await Promise.all([
    getTranslations("home"),
    getLocale(),
    getTests(),
  ]);

  const popular = tests.slice(0, 4);

  return (
    <section className="bg-white px-4 py-16 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-2xl font-semibold text-brand-indigo sm:text-3xl">
            {t("popularTestsTitle")}
          </h2>
          <Link href="/tests" className="text-sm font-medium text-brand-teal hover:underline">
            {t("popularTestsViewAll")} →
          </Link>
        </div>

        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {popular.map((test) => (
            <Card key={test.slug} className="flex flex-col">
              <h3 className="font-semibold text-brand-indigo">
                {locale === "hi" ? test.name_hi : test.name_en}
              </h3>
              <p className="mt-1 text-sm text-brand-ink/60">{test.sample_type}</p>
              {test.home_collection_available && (
                <Badge className="mt-3 w-fit">Home collection</Badge>
              )}
              <p className="mt-4 font-semibold text-brand-indigo">₹{test.price}</p>
              <Link
                href={`/tests/${test.slug}`}
                className={buttonClasses("outline", "mt-4 w-full")}
              >
                {t("ctaBook")}
              </Link>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

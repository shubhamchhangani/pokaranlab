import { getLocale, getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Card } from "@/components/ui/Card";
import { buttonClasses } from "@/components/ui/Button";
import { getTests } from "@/lib/data/tests";

export default async function PackagesPage(props: PageProps<"/[locale]/packages">) {
  const { locale } = await props.params;
  setRequestLocale(locale);

  const [t, currentLocale, tests] = await Promise.all([
    getTranslations("tests"),
    getLocale(),
    getTests(),
  ]);

  const packages = tests.filter((test) => test.category_en === "Package");

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6">
      <h1 className="font-display text-3xl font-semibold text-brand-indigo">
        Health Packages
      </h1>

      <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {packages.map((pkg) => (
          <Card key={pkg.slug} className="flex flex-col">
            <h2 className="font-semibold text-brand-indigo">
              {currentLocale === "hi" ? pkg.name_hi : pkg.name_en}
            </h2>
            <p className="mt-2 text-sm text-brand-ink/70">{pkg.description_en}</p>
            <div className="mt-4 flex items-center justify-between">
              <span className="font-semibold text-brand-indigo">₹{pkg.price}</span>
              <Link href={`/tests/${pkg.slug}`} className={buttonClasses("outline")}>
                {t("bookThisTest")}
              </Link>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

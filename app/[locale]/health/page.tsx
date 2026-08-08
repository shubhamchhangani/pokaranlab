import { getLocale, getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Card } from "@/components/ui/Card";
import { healthConcerns } from "@/lib/data/health-concerns";

export default async function HealthConcernsPage(props: PageProps<"/[locale]/health">) {
  const { locale } = await props.params;
  setRequestLocale(locale);

  const [t, currentLocale] = await Promise.all([getTranslations("health"), getLocale()]);

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-12 sm:px-6">
      <h1 className="font-display text-3xl font-semibold text-brand-indigo">{t("listTitle")}</h1>
      <p className="mt-3 max-w-2xl text-brand-ink/70">{t("listIntro")}</p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {healthConcerns.map((concern) => (
          <Link key={concern.slug} href={`/health/${concern.slug}`}>
            <Card className="h-full transition-shadow hover:shadow-md">
              <h2 className="font-semibold text-brand-indigo">
                {currentLocale === "hi" ? concern.title_hi : concern.title_en}
              </h2>
              <p className="mt-2 line-clamp-3 text-sm text-brand-ink/70">
                {currentLocale === "hi" ? concern.intro_hi : concern.intro_en}
              </p>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}

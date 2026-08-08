import { getTranslations } from "next-intl/server";
import { Card } from "@/components/ui/Card";

const serviceKeys = ["bloodTests", "xray", "ecg", "homeCollection"] as const;

export async function ServicesGrid() {
  const t = await getTranslations("home");

  return (
    <section className="px-4 py-16 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <h2 className="font-display text-center text-2xl font-semibold text-brand-indigo sm:text-3xl">
          {t("servicesTitle")}
        </h2>
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {serviceKeys.map((key) => (
            <Card key={key} className="text-center">
              <h3 className="font-semibold text-brand-indigo">
                {t(`services.${key}.title`)}
              </h3>
              <p className="mt-2 text-sm text-brand-ink/70">
                {t(`services.${key}.description`)}
              </p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

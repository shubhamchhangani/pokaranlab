import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { buttonClasses } from "@/components/ui/Button";
import { WhatsAppLink } from "@/components/layout/WhatsAppLink";

export async function Hero() {
  const t = await getTranslations("home");

  return (
    <section className="bg-gradient-to-b from-brand-sandstone/15 to-brand-paper px-4 py-20 sm:px-6">
      <div className="mx-auto flex max-w-4xl flex-col items-center text-center">
        <h1 className="font-display max-w-2xl text-4xl font-semibold leading-tight text-brand-indigo sm:text-5xl">
          {t("heroTitle")}
        </h1>
        <p className="mt-5 max-w-xl text-lg text-brand-ink/80">{t("heroSubtitle")}</p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <Link href="/book-a-test" className={buttonClasses("primary")}>
            {t("ctaBook")}
          </Link>
          <WhatsAppLink message="Hi, I'd like to know more about tests at Pokaran Lab.">
            {t("ctaWhatsapp")}
          </WhatsAppLink>
        </div>
      </div>
    </section>
  );
}

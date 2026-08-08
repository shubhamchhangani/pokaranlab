import { getLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { LanguageToggle } from "@/components/layout/LanguageToggle";
import { WhatsAppLink } from "@/components/layout/WhatsAppLink";
import { getSiteInfo } from "@/lib/data/site";

export async function Header() {
  const [t, locale, siteInfo] = await Promise.all([
    getTranslations(),
    getLocale(),
    getSiteInfo(),
  ]);

  const navItems = [
    { href: "/tests", label: t("nav.tests") },
    { href: "/book-a-test", label: t("nav.bookATest") },
    { href: "/download-report", label: t("nav.downloadReport") },
    { href: "/find-us", label: t("nav.findUs") },
    { href: "/about", label: t("nav.about") },
  ] as const;

  return (
    <header className="sticky top-0 z-50 border-b border-brand-ink/10 bg-brand-paper/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <Link href="/" className="font-display text-xl font-semibold text-brand-indigo">
          {locale === "hi" ? siteInfo.name_hi : siteInfo.name_en}
        </Link>

        <nav className="hidden items-center gap-6 text-sm font-medium text-brand-ink lg:flex">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href} className="hover:text-brand-teal">
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <LanguageToggle />
          <WhatsAppLink
            message="Hi, I'd like to book a test at Pokaran Lab."
            className="hidden rounded-full bg-[#25D366] px-4 py-2 text-xs font-medium text-white hover:bg-[#25D366]/90 sm:inline-flex"
          >
            {t("nav.bookOnWhatsapp")}
          </WhatsAppLink>
        </div>
      </div>

      <nav className="flex items-center gap-4 overflow-x-auto border-t border-brand-ink/10 px-4 py-2 text-sm font-medium text-brand-ink lg:hidden">
        {navItems.map((item) => (
          <Link key={item.href} href={item.href} className="whitespace-nowrap hover:text-brand-teal">
            {item.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}

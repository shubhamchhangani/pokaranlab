import { getLocale, getTranslations } from "next-intl/server";
import NextLink from "next/link";
import { Link } from "@/i18n/navigation";
import { getSiteInfo } from "@/lib/data/site";

export async function Footer() {
  const [t, locale, siteInfo] = await Promise.all([
    getTranslations(),
    getLocale(),
    getSiteInfo(),
  ]);

  return (
    <footer className="mt-auto border-t border-brand-ink/10 bg-brand-indigo text-brand-paper">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:px-6 md:grid-cols-3">
        <div>
          <p className="font-display text-lg font-semibold">
            {locale === "hi" ? siteInfo.name_hi : siteInfo.name_en}
          </p>
          <p className="mt-2 text-sm text-brand-paper/80">{t("footer.tagline")}</p>
        </div>

        <div className="text-sm text-brand-paper/80">
          <p>{locale === "hi" ? siteInfo.address_hi : siteInfo.address_en}</p>
          <p className="mt-2">{siteInfo.phone}</p>
          <p className="mt-2">{siteInfo.email}</p>
        </div>

        <nav className="flex flex-col gap-2 text-sm text-brand-paper/80">
          <Link href="/tests" className="hover:text-brand-sandstone">
            {t("nav.tests")}
          </Link>
          <Link href="/book-a-test" className="hover:text-brand-sandstone">
            {t("nav.bookATest")}
          </Link>
          <Link href="/find-us" className="hover:text-brand-sandstone">
            {t("nav.findUs")}
          </Link>
          <Link href="/health" className="hover:text-brand-sandstone">
            {t("health.listTitle")}
          </Link>
        </nav>
      </div>

      <div className="flex flex-col items-center justify-center gap-1 border-t border-brand-paper/10 px-4 py-4 text-center text-xs text-brand-paper/60 sm:flex-row sm:justify-between sm:px-6">
        <p>
          © {new Date().getFullYear()} {siteInfo.shortName} — {t("footer.rightsReserved")}
        </p>
        <NextLink href="/admin/login" className="text-brand-paper/30 hover:text-brand-paper/60">
          Staff Login
        </NextLink>
      </div>
    </footer>
  );
}

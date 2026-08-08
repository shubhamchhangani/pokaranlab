import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { siteInfo } from "@/lib/data/mock-content";

export async function Footer() {
  const t = await getTranslations();

  return (
    <footer className="mt-auto border-t border-brand-ink/10 bg-brand-indigo text-brand-paper">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:px-6 md:grid-cols-3">
        <div>
          <p className="font-display text-lg font-semibold">{t("brand.fullName")}</p>
          <p className="mt-2 text-sm text-brand-paper/80">{t("footer.tagline")}</p>
        </div>

        <div className="text-sm text-brand-paper/80">
          <p>{siteInfo.address}</p>
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
        </nav>
      </div>

      <div className="border-t border-brand-paper/10 px-4 py-4 text-center text-xs text-brand-paper/60 sm:px-6">
        © {new Date().getFullYear()} {t("brand.name")} — {t("footer.rightsReserved")}
      </div>
    </footer>
  );
}

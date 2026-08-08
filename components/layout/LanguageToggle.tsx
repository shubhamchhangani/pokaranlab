"use client";

import { useParams } from "next/navigation";
import { usePathname, useRouter } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";

export function LanguageToggle() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams();
  const activeLocale = params.locale as string;

  return (
    <div className="flex items-center gap-1 rounded-full border border-brand-ink/15 p-1 text-xs font-medium">
      {routing.locales.map((locale) => (
        <button
          key={locale}
          onClick={() => router.replace(pathname, { locale })}
          className={`rounded-full px-2.5 py-1 transition-colors ${
            locale === activeLocale
              ? "bg-brand-indigo text-brand-paper"
              : "text-brand-ink hover:bg-brand-ink/5"
          }`}
        >
          {locale === "en" ? "EN" : "हि"}
        </button>
      ))}
    </div>
  );
}

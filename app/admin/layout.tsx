import type { Metadata } from "next";
import { Hind } from "next/font/google";
import { getAdminSession, hasSupabase } from "@/lib/auth/admin";
import { adminLogout } from "@/lib/actions/auth";
import "../globals.css";

const hind = Hind({ variable: "--font-hind", subsets: ["latin"], weight: ["400", "500", "600"] });

export const metadata: Metadata = { title: "Admin — Pokaran Lab", robots: { index: false } };

const navItems = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/bookings", label: "Bookings" },
  { href: "/admin/catalog", label: "Catalog" },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  // /admin/login renders its own minimal chrome — let it through before the auth gate.
  // (Next.js route groups would avoid this check, but a single shared layout keeps the
  // admin shell in one place while the app is this small.)

  if (!hasSupabase) {
    return (
      <html lang="en" className={`${hind.variable} h-full antialiased`}>
        <body className="flex min-h-full items-center justify-center bg-brand-indigo p-6 font-sans text-brand-paper">
          <div className="max-w-md rounded-2xl border border-brand-paper/20 p-8 text-center">
            <h1 className="font-semibold text-xl">Supabase not configured</h1>
            <p className="mt-3 text-sm text-brand-paper/80">
              Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local
              (see .env.example) to enable admin login.
            </p>
          </div>
        </body>
      </html>
    );
  }

  const session = await getAdminSession();

  return (
    <html lang="en" className={`${hind.variable} h-full antialiased`}>
      <body className="flex min-h-full font-sans">
        {session ? (
          <>
            <aside className="hidden w-56 flex-col gap-1 border-r border-brand-ink/10 bg-white p-4 sm:flex">
              <p className="mb-4 px-2 font-display text-lg font-semibold text-brand-indigo">
                Pokaran Lab
              </p>
              {navItems.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  className="rounded-lg px-3 py-2 text-sm font-medium text-brand-ink hover:bg-brand-ink/5"
                >
                  {item.label}
                </a>
              ))}
              <form action={adminLogout} className="mt-auto pt-4">
                <button className="w-full rounded-lg px-3 py-2 text-left text-sm font-medium text-red-600 hover:bg-red-50">
                  Log out
                </button>
              </form>
            </aside>
            <main className="flex-1 bg-brand-paper p-6">{children}</main>
          </>
        ) : (
          children
        )}
      </body>
    </html>
  );
}

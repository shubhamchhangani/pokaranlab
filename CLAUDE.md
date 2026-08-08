@AGENTS.md

# Pokaran Lab

Web app for Pokaran Diagnostic & Dr X Ray Center (a real single-branch diagnostic lab in
Pokaran, Jaisalmer, Rajasthan) — public site (bilingual EN/HI test catalog, booking, report
download) + a small staff admin panel. Next.js 16 (App Router) + Supabase + Tailwind v4.

**Before doing anything else, read in this order:**
1. `docs/completed.md` — what's actually built, as of the last session
2. `docs/todo.md` — the backlog, organized by phase
3. `docs/decisions-log.md` — where the build diverges from the original plan, and why

Then, only as needed for the task at hand:
- `docs/system-design.md` — the original plan (stack reasoning, full roadmap, GEO/SEO strategy).
  Kept verbatim as a reference; don't edit it to match reality, log divergence in
  `decisions-log.md` instead.
- `docs/database-schema.md` — schema reasoning + RLS policy shape (source of truth for the SQL
  itself is `supabase/schema.sql`)
- `docs/frontend-design.md` — routing map, i18n conventions, design tokens, component layout
- `docs/admin-design.md` — admin screen status

Reading these first is the point — it's cheaper than re-deriving project state from the diff or
from scratch every session.

## Non-obvious things

- **This is Next.js 16, not 14** (the version system-design.md was written against). `params` /
  `searchParams` are `Promise`s everywhere; use the ambient `PageProps<'/route'>` /
  `LayoutProps<'/route'>` helper types, not hand-written prop shapes. See
  `docs/frontend-design.md` and `node_modules/next/dist/docs/` (bundled per-install, treat as
  more current than training data for anything Next.js-specific).
- **No live Supabase project yet.** `lib/data/tests.ts`, `lib/data/site.ts`, and admin pages fall
  back to `lib/data/mock-content.ts` when `NEXT_PUBLIC_SUPABASE_URL` isn't set, so the site works
  before Phase 0 setup happens. Don't "fix" this by hardcoding around it — the fallback is
  intentional until real data is seeded (see `docs/todo.md`).
- **Anything specific to this lab (not generic app UI) is a DB row with an admin form, never a
  hardcoded constant** — including "placeholder" values. This was gotten wrong once already
  (contact info/hours lived in a `.ts` file with no way for the owner to edit it — fixed by
  adding `site_settings`, see `docs/decisions-log.md`). If you're tempted to hardcode a phone
  number, address, price, or piece of copy that isn't literally the same for every deployment of
  this codebase, it belongs in Postgres with an `/admin` screen, not in a file.
- **`/admin` and `/[locale]` are separate root layouts**, each with its own `<html>`/`<body>` —
  this keeps admin routes un-prefixed by locale. See `docs/decisions-log.md`.
- **Tailwind v4** — design tokens are in `app/globals.css` under `@theme inline`, there is no
  `tailwind.config.js`.
- Always import `Link`/`useRouter`/`usePathname` from `@/i18n/navigation`, never `next/link` or
  `next/navigation`, inside `app/[locale]/**` — otherwise links lose the locale prefix.
- Server Actions (`lib/actions/*`) validate with `zod` and treat all input as untrusted per
  `node_modules/next/dist/docs/01-app/02-guides/server-actions.md` — every action is a public
  POST endpoint, not just a function called from a trusted form.

## Commands

```
npm run dev      # dev server
npm run build    # production build (also type-checks)
npm run lint
```

Copy `.env.example` to `.env.local` and fill in Supabase credentials to move off mock data (see
`supabase/README.md`).

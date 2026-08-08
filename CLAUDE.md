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
- **A live Supabase project exists** (since 2026-08-08) and the site is deployed at
  https://pokaranlab.vercel.app, auto-deploying from GitHub `main`. `.env.local` has the real
  credentials (gitignored). `lib/data/tests.ts`, `lib/data/site.ts`, and admin pages still fall
  back to `lib/data/mock-content.ts` when `NEXT_PUBLIC_SUPABASE_URL` isn't set (e.g. a fresh
  clone without `.env.local`) — keep that fallback, don't remove it just because a live project
  now exists elsewhere.
- **Any new RLS policy that checks a second RLS-protected table needs a `security definer`
  helper function, never an inline subquery.** An inline subquery inherits the *caller's* RLS
  visibility into that second table, which silently breaks for non-staff callers (a guest can't
  see their own booking under `bookings`' RLS, so a subquery checking "does this booking belong
  to a guest" from within `booking_items`'s policy always evaluated false). Copy the
  `can_access_booking()` pattern in `supabase/schema.sql` for future cross-table checks — see
  `docs/database-schema.md` for the full writeup. Test any RLS change as the actual
  `anon`/`authenticated` role (`SET ROLE anon` in `psql`, or a real anon-key client) — testing
  via the `postgres` superuser connection bypasses RLS entirely and will not catch this.
- **When changing `supabase/schema.sql`, also apply the diff to the live DB** — it's not
  automatically synced. `supabase/README.md` has the `psql` command; apply just the new/changed
  statements directly (don't re-run the whole file against a non-empty DB, most `create table`
  statements aren't idempotent).
- **`SUPABASE_SERVICE_ROLE_KEY` exists** (server-only, no `NEXT_PUBLIC_` prefix, set in
  `.env.local` and Vercel) — used by exactly one thing, `lib/supabase/service.ts`, to generate
  signed download URLs for the private `reports` bucket after `verify_report_access()` has
  already verified the caller's phone+sample_no match. Never import it anywhere a Client
  Component could pull it in, and never use it as a shortcut around RLS for anything else — if a
  new feature seems to need it, that's usually a sign a `security definer` RPC (narrowly scoped,
  like `verify_report_access()`) is the better fit. See `docs/database-schema.md`.
- **Server Action file-upload fields need to be pulled off `formData` before
  `Object.fromEntries()`/`zod`** — a `File` value in that object either gets silently stripped
  (zod's default behavior for unrecognized keys) or breaks a schema that doesn't expect it.
  `lib/actions/catalog.ts`, `lib/actions/packages.ts`, `lib/actions/media.ts` all show the
  pattern. Actual upload logic lives in `lib/actions/upload-image.ts` — a plain helper module,
  not itself `"use server"`, since a `"use server"` file may only export async functions.
- **Multi-statement DB writes that need to be atomic go through a SQL RPC, not multiple
  PostgREST calls** — see `create_guest_booking()` in `supabase/schema.sql` (bookings +
  booking_items in one transaction) for the pattern. Default to `security invoker` (the
  default — don't add `security definer` unless the caller genuinely can't see something they're
  allowed to act on, e.g. the report-lookup case above).
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

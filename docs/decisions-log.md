# Decisions log

Where the actual build diverges from [system-design.md](./system-design.md), or where a
judgment call was made that isn't obvious from reading the code. Newest first. Keep entries
short — one or two lines of "what" and "why".

- **2026-08-08 — `lib/data/tests.ts` and `lib/data/site.ts` use a cookie-free Supabase client.**
  First Vercel deploy failed: `generateStaticParams` in `tests/[slug]/page.tsx` called `getTests()`,
  which used the cookie-based `lib/supabase/server.ts` client — but `generateStaticParams` runs
  at build time, outside any request, so `next/headers`'s `cookies()` throws. This never
  surfaced locally because every earlier `npm run build` ran with Supabase env vars unset (mock
  fallback, no Supabase client ever constructed). Fixed by adding `lib/supabase/public.ts`, a
  plain anon-key client with no cookie handling, and switching `tests`/`site_settings` reads to
  it — safe because both are public-read under RLS regardless of session. Keep using
  `lib/supabase/server.ts` (cookie-based) for anything that's actually session-scoped: admin
  auth, patient-scoped bookings/reports, and all the `lib/actions/*` writes.
- **2026-08-08 — `origin` remote already existed and was already in sync before this session ran
  any `git push`.** `git remote -v` showed `github.com/shubhamchhangani/pokaranlab` already
  configured, and `git ls-remote origin` matched the local `HEAD` exactly, for commits this
  session made but never explicitly pushed. Apparent explanation: some background sync in this
  environment (not `gh`, which isn't installed) mirrors the local repo to GitHub automatically.
  Not verified further — flagging so a future session doesn't assume it needs to create the
  GitHub repo from scratch, and doesn't assume the reverse either (that all future commits
  auto-push) without checking `git status` for real.
- **2026-08-08 — Applied schema via `psql` (through `libpq`), not the SQL Editor.** The Supabase
  CLI's `db query --file` errors on multi-statement files ("cannot insert multiple commands into
  a prepared statement" — it runs through the extended query protocol, which disallows that).
  `brew install libpq` gets a working `psql` without a full local Postgres server; that's what
  actually ran `schema.sql` and `storage.sql`. Documented in `supabase/README.md`.
- **2026-08-08 — Storage buckets are SQL (`supabase/storage.sql`), not a dashboard click.**
  Buckets and their RLS policies are created by inserting into `storage.buckets` / `storage.
  objects` policies directly, same as any other schema change — reproducible and reviewable,
  instead of a one-off manual step someone has to remember to redo on a new project.
- **2026-08-08 — Added `site_settings` after the first pass hardcoded it.** The first scaffolding
  pass put contact info/hours/map links in `lib/data/mock-content.ts` as a plain constant, with
  no DB table and no admin screen behind it — which contradicted the explicit design intent
  (system-design.md §7, admin screen 5 "Site content": owner edits this without touching code).
  Fixed by adding a `site_settings` singleton table (see
  [database-schema.md](./database-schema.md)), `lib/data/site.ts`, and `/admin/settings`.
  General rule going forward: if a value is specific to *this* lab (not generic app UI text), it
  needs a DB row + admin form, not a constant — even a "placeholder" one. Also added
  `tests.description_en/description_hi` columns, which the frontend was already reading
  (test detail page, SEO metadata, JSON-LD) but the original schema never defined — same root
  cause, caught while fixing the above.
- **2026-08-08 — Next.js 16.3, not 14.** `create-next-app@latest` installed 16.3 (App Router,
  React 19). All conventions in this codebase follow 16, not 14 — notably `params`/`searchParams`
  are always `Promise`s, and `PageProps<'/route'>` / `LayoutProps<'/route'>` global helper types
  are used instead of hand-written prop types. See `node_modules/next/dist/docs/` for the
  bundled docs (regenerated per-install; don't assume prior Next.js knowledge is current).
- **2026-08-08 — Tailwind v4, no `tailwind.config.js`.** Design tokens (palette, fonts) live in
  `app/globals.css` under `@theme inline`, not a JS config file. See
  [frontend-design.md](./frontend-design.md).
- **2026-08-08 — Mock content fallback instead of requiring Supabase up front.** No Supabase
  project exists yet. `lib/data/tests.ts` and friends check for
  `NEXT_PUBLIC_SUPABASE_URL`/`_ANON_KEY` and fall back to `lib/data/mock-content.ts` so the site
  is fully clickable before Phase 0's Supabase setup happens. Swap-over is automatic once the
  env vars are set — no code change needed. Delete `mock-content.ts` once real content exists.
- **2026-08-08 — `/admin` is a second root layout, not a route group.** Per Next.js's
  "multiple root layouts" pattern: `app/[locale]/layout.tsx` and `app/admin/layout.tsx` are
  siblings, each with its own `<html>`/`<body>`. This is what keeps `/admin/*` out of the
  locale prefix per system-design.md §6.
- **2026-08-08 — Admin auth gate lives in each page, not only the layout.** `app/admin/layout.tsx`
  renders the sidebar only when a session exists; each protected page (`/admin`,
  `/admin/bookings`, `/admin/catalog`) calls `getAdminSession()` itself and redirects to
  `/admin/login` if absent. This was necessary because `/admin/login` shares the same layout
  and can't redirect to itself.
- **2026-08-08 — Packages don't have their own detail route yet.** `docs/system-design.md` §6
  specifies `/[locale]/packages/[slug]`, but only a list page exists
  (`app/[locale]/packages/page.tsx`) linking back into `/tests/[slug]`. Tracked in
  [todo.md](./todo.md) under Phase 1 remainder.
- **2026-08-08 — Report entry form and Site content admin screens not built yet.** Only
  Dashboard, Bookings, and Catalog (read-only list) exist under `/admin`, matching "basic admin"
  from Phase 1 scope. Report entry (system-design.md §7, screen 3) is Phase 2 work — see
  [todo.md](./todo.md).

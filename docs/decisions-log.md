# Decisions log

Where the actual build diverges from [system-design.md](./system-design.md), or where a
judgment call was made that isn't obvious from reading the code. Newest first. Keep entries
short — one or two lines of "what" and "why".

- **2026-08-08 — Catalog images are `tests.primary_image_url`/`packages.primary_image_url`
  (one column, uploaded straight to Storage), not the `media` table.** system-design.md §5.1
  already justifies `media` for multi-photo/landing-page use and `primary_image_url` for the
  fast single-thumbnail path — this just wired up the second one first, since it's what the
  catalog grids actually needed today. `lib/actions/upload-image.ts` is a plain (non-`"use
  server"`) helper imported by both `lib/actions/catalog.ts` and `lib/actions/packages.ts`,
  rather than duplicating the upload logic — a `"use server"` file may only export async
  functions (Next.js enforces this), so shared helpers used *by* actions live in their own
  un-annotated module.
- **2026-08-08 — Booking form items are encoded as `"test:<slug>"` / `"package:<slug>"`
  strings, not two separate arrays.** Once packages needed to be bookable too, the booking form
  had to select from two different tables in one list. A single `items` field with a type
  prefix (parsed server-side in `createBooking`) was simpler than parallel `testSlugs`/
  `packageSlugs` arrays plus separate checkbox `name`s — one field to validate, one field to
  read with `formData.getAll`, and the preselect query param (`?item=test:<slug>` or
  `?item=package:<slug>`) follows the same shape. See `components/booking/BookingForm.tsx` and
  `lib/actions/bookings.ts`.
- **2026-08-08 — Guest inserts need a `security definer` helper, not an inline RLS subquery.**
  Wiring up real `booking_items` inserts for guest bookings surfaced two layered RLS bugs, both
  only visible when testing as the actual `anon` role (`psql` runs as the `postgres` superuser,
  which bypasses RLS entirely — testing against the live DB with a plain Supabase JS client using
  the anon key, same as the app, was what actually caught these):
  1. `.insert(row).select()` on `bookings` failed RLS for a guest booking, even though the INSERT
     itself was allowed. Cause: returning the inserted row requires the table's SELECT policy to
     also pass, and there's intentionally no policy letting guests read `bookings` back (that
     would leak every guest's name/phone/address to anyone with the anon key). Fixed by
     generating the booking's `id` with `crypto.randomUUID()` client-side and inserting without
     `.select()`, so nothing needs to read the row back.
  2. The `booking_items` insert policy checked booking ownership via `exists (select 1 from
     bookings where id = booking_items.booking_id and ...)` — but that subquery reads
     `bookings`, which has its own RLS, so the same guest hits the same invisibility problem one
     level down: a plain subquery cannot see the row it's checking against, so the EXISTS is
     always false for guests. Fixed with `can_access_booking()`, a `security definer` function
     (same mechanism as the existing `is_staff()`) that runs with the function owner's
     privileges and so isn't subject to the caller's RLS on `bookings`.
  General rule for any future RLS policy that references a second table: if that table also has
  RLS enabled, an inline subquery against it inherits the *caller's* visibility into that table,
  not "can this row objectively be reached from here." Wrap the check in a `security definer`
  function instead. Test as the actual `anon`/`authenticated` role (a real anon-key client, or
  `SET ROLE anon` in `psql`), never as the `postgres` superuser, which silently bypasses RLS and
  would have let this ship.
- **2026-08-08 — `packages` got its own mock fallback and data layer, split out of the `tests`
  mock hack.** The original scaffold's `mockTests` included a "Fever Panel" entry with
  `category_en: "Package"` as a placeholder, since there was no real `packages` UI yet. Now that
  `lib/data/packages.ts` and the package detail route exist, that entry moved to
  `mockPackages`/`MockPackage` in `lib/data/mock-content.ts`, matching the real `packages` +
  `package_tests` schema instead of pretending to be a test.
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

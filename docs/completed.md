# Completed

Reverse-chronological log of what's actually built, so a new session doesn't have to re-read
every file to know the current state. When you finish something from [todo.md](./todo.md), move
its line here with the date.

## 2026-08-08 — Live Supabase project provisioned

A real Supabase project now exists and is wired up (project ref `tdfbcfuubjeoyutvcpuu`):

- `supabase/schema.sql` and the new `supabase/storage.sql` (buckets + storage RLS, didn't exist
  before this) both applied via `psql` — see `supabase/README.md` for the exact commands.
- Added and applied an `on_auth_user_created` trigger (`public.handle_new_user()`) that was
  missing from the original schema — without it, `staff.profile_id` could never be satisfied for
  a freshly signed-up Auth user, since nothing populated `public.profiles`. Caught while creating
  the first owner account, same "schema doesn't actually support what the app needs" class of gap
  as the `site_settings`/`tests.description_*` fixes earlier the same day.
- `.env.local` created with the real project URL + anon key (gitignored, not committed).
- First owner account created and linked: `astrodaksh33@gmail.com`, `staff_role = 'owner'`.
  `/admin/login` now authenticates against this for real.
- **The live `tests` table is empty** — no real catalog data seeded yet. The public `/tests` page
  correctly shows its empty state (mock fallback no longer applies once Supabase env vars are
  set, per `lib/data/tests.ts`). Seeding real test/package data is the next open item in
  [todo.md](./todo.md) Phase 1.

## 2026-08-08 — Site settings table + test catalog CRUD

Fixed a gap from the same day's initial scaffold: contact info/hours/map links were hardcoded in
`lib/data/mock-content.ts` with no way for the owner to change them, contradicting
system-design.md §7. Added:

- `site_settings` singleton table (`supabase/schema.sql`) + `lib/data/site.ts` (`getSiteInfo`,
  DB-first with mock fallback) + `/admin/settings` screen (`lib/actions/settings.ts`). Header,
  Footer, LocationMap, find-us, about, and the test detail page's JSON-LD all read from this now
  instead of a static import.
- `tests.description_en`/`description_hi` columns — these were already read by the frontend
  (test detail page, SEO `generateMetadata`, `MedicalTest` JSON-LD) but never existed in the
  original schema; same class of bug, caught while fixing the above.
- Full create/edit/delete for `tests` in `/admin/catalog` (`lib/actions/catalog.ts`,
  `components/admin/TestForm.tsx`), including a raw-JSON `custom_fields` editor. `packages` and
  `test_categories` still don't have admin CRUD — see `docs/todo.md`.
- Removed the now-redundant `brand.name`/`brand.fullName` keys from `messages/*.json` — brand
  name is business content (`site_settings`), not app UI chrome, so it doesn't belong in the
  message catalog. See `docs/decisions-log.md` for the "DB row + admin form, not a constant"
  rule this establishes going forward.

## 2026-08-08 — Phase 0 (partial) + Phase 1 skeleton

Repo scaffolded from scratch (`create-next-app`, Next.js 16.3 / React 19 / Tailwind v4).

**Stack wired up:**
- Next.js App Router with `[locale]` routing (`en`/`hi`) via `next-intl` — middleware, routing
  config, message catalogs (`messages/en.json`, `messages/hi.json`) with native Hindi content.
- Supabase client helpers (`lib/supabase/client.ts`, `lib/supabase/server.ts`) using `@supabase/ssr`.
- Full initial schema + RLS policies (`supabase/schema.sql`) — not yet applied to a real project
  (no Supabase project exists yet, see `docs/todo.md` Phase 0).
- Design tokens (sandstone/indigo/teal/paper/ink palette, Hind + Fraunces fonts) in
  `app/globals.css`.
- Mock content fallback (`lib/data/mock-content.ts`) so the site is fully browsable before
  Supabase is live.

**Public pages:** landing (`/[locale]`), test catalog list + detail, package list, booking flow
(multi-section form + Server Action, no SMS/payment yet), report download lookup (stub — see
`docs/todo.md` Phase 2 security gap), find-us (with map embed + JSON-LD), about (placeholder
copy). `sitemap.ts` / `robots.ts` generated from the locale × test list.

**Admin:** login, auth-gated layout with sidebar, dashboard (live booking/report counts),
bookings list (read-only), catalog list (read-only). Report entry, site content, and staff
management screens are not built — see `docs/admin-design.md`.

**Docs set up:** `docs/system-design.md` (original plan, verbatim), `docs/decisions-log.md`
(where the build diverges from the plan and why), `docs/database-schema.md`,
`docs/frontend-design.md`, `docs/admin-design.md`, this file, and `docs/todo.md`.

**Known gaps carried into `docs/todo.md`:** booking Server Action doesn't yet insert
`booking_items`; report lookup isn't phone-verified; no SMS integration; no seeded real data;
package detail route missing; no CI.

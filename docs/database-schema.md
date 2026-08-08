# Database schema

Source of truth: [`supabase/schema.sql`](../supabase/schema.sql). This file explains the *why*
behind it — read the SQL for the actual columns/types. Full ERD lives in
[system-design.md §5](./system-design.md#5-database-design).

TypeScript types for the schema live in [`lib/types/database.ts`](../lib/types/database.ts),
hand-written to match. Once a real Supabase project exists, regenerate them (see
[`supabase/README.md`](../supabase/README.md)) and delete the hand-written version.

## Table groups

- **Site settings** — `site_settings`, a singleton row (see below) for the owner-editable
  contact/hours/map content that used to be hardcoded — name, address, phone, WhatsApp number,
  email, hours, Maps embed/directions URLs, all in EN + HI where the content is textual.
- **Identity** — `profiles` (extends `auth.users`), `staff` (role join table: `owner` |
  `technician` | `receptionist`), `doctors` (referring doctors, free-standing — not linked to
  `auth.users`).
- **Catalog** — `test_categories`, `tests`, `packages`, `package_tests` (join table),
  `media` (polymorphic: `entity_type` + `entity_id`, see below).
- **Bookings** — `bookings`, `booking_items` (a booking item points at either a `test_id` or a
  `package_id`, enforced by a check constraint, never both null).
- **Reports** — `reports`, `report_results` (one row per test result line).

## Why `site_settings` is a singleton table, not a `.ts` file

Every piece of business content that used to live in `lib/data/mock-content.ts` as a hardcoded
export — phone number, address, hours, map links — is content the owner needs to change without
a developer, per system-design.md §7 ("Site content" admin screen). A static TS file can't be
edited from `/admin/settings`; a DB row can. `site_settings.id` is a `boolean primary key
default true check (id)`, which makes a second row physically impossible to insert (it would
violate the primary key) — that's what "singleton table" means here, not a convention someone
has to remember to follow. `schema.sql` seeds the one row with the same placeholder values the
old mock file had; the difference is those placeholders are now editable from the admin panel
the moment Supabase is live, not baked into a deploy. See
[decisions-log.md](./decisions-log.md).

## Why `media` is polymorphic instead of a foreign key per table

`entity_type` (`'test' | 'package' | 'landing'`) + `entity_id` lets one table hold test photos,
package photos, and landing-page carousel/gallery images (`entity_id is null` for landing
content that isn't tied to a specific product). The alternative — a `test_media` table and a
separate `package_media` table — would duplicate the same columns twice for no benefit at this
scale. Tradeoff: no DB-level foreign key from `media.entity_id` to `tests.id`/`packages.id`
(Postgres can't FK across a discriminator), so referential integrity here is app-level, not
DB-level. Acceptable given `media` rows are only ever written from the admin catalog screen.

## Why `custom_fields jsonb` instead of more columns

`tests` and `packages` have a `custom_fields` JSON column for attributes like `fasting_required`
or `home_collection_charge` — see system-design.md §5.1 for the reasoning. Read/write this from
the admin catalog form as plain key-value pairs; don't add typed columns for one-off attributes.

## Row Level Security — the policy shape, not just "it's on"

Every table has RLS enabled. The pattern used throughout:

- **Public read** on `tests`, `packages`, `test_categories`, `package_tests`, `media`, `doctors`
  — the catalog and landing page must render without a session.
- **Staff full access** on everything, gated through an `is_staff(uid)` SQL function that checks
  membership in the `staff` table. This is a `security definer` function so RLS policies can call
  it without themselves needing read access to `staff`.
- **Patient scoped access** on `bookings`, `booking_items`, `reports`, `report_results` — a
  patient can only read rows tied to their own `profiles.id` via `patient_profile_id` (bookings)
  or the join through `bookings` (everything downstream of it). Guest bookings (no account) have
  `patient_profile_id = null` and are **not** patient-readable after creation — only staff, or a
  guest going through `verify_report_access()` (below), can retrieve them.

### The public report lookup: `verify_report_access()` + a service-role client for the download

`lib/actions/reports.ts`'s `lookupReport` is the one place in the app where a completely
unauthenticated visitor needs data out of `reports` — and it's a two-step problem, not one:

1. **Is this phone+sample_no combination real, and is the report finished?** `reports` has RLS
   that gives guests no read access at all (same reasoning as `bookings` above). A guest can't
   run this check as a plain `select`. `verify_report_access(p_phone, p_sample_no)` is a
   `security definer` SQL function — the only door into `reports` a guest has — that returns
   exactly three columns (`pdf_path`, `patient_name`, `reporting_date`), and only for an exact
   match where `status = 'final'`. It cannot be used to enumerate reports or read anything else.
   `reports.patient_phone` exists specifically so this works — it's **not** joined through
   `bookings.guest_phone`, because a report for a walk-in patient entered directly by staff has
   no booking at all, and the lookup needs to work for those too.
2. **Given a verified `pdf_path`, get a URL that's actually downloadable.** The `reports` bucket
   has no public-read storage policy (private, on purpose), and there's no RLS policy that could
   grant a guest signed-URL rights without also granting broader access. This is the one
   legitimate use of the service-role client (`lib/supabase/service.ts`) in the app: it bypasses
   RLS entirely, so it must only ever be called with a path that step 1 already verified belongs
   to this phone/sample pair — never a caller-supplied path. `SUPABASE_SERVICE_ROLE_KEY` is a
   server-only secret (no `NEXT_PUBLIC_` prefix) set in `.env.local` and Vercel; it must never be
   imported into anything a Client Component could pull in.

Verified end-to-end against the live DB (not just read from the policy): correct phone+sample
returns the right path; wrong phone, wrong sample, and `draft` status all correctly return
nothing; a guest can't read `reports` directly or self-generate a signed URL; the service-role
client can, and the resulting URL actually downloads the file.

### Gotcha: an RLS policy that references another RLS-protected table needs `security definer`

`booking_items`'s guest-insert policy needs to check "does this `booking_id` belong to a guest
booking?" — which means reading `bookings`. A plain subquery (`exists (select 1 from bookings
where id = ...)`) *inherits the caller's RLS visibility into `bookings`*, not "is this row
reachable in principle." A guest can't SELECT `bookings` (see above — no policy grants it, on
purpose), so that inline subquery always evaluated to false and silently blocked every guest
booking. Fixed with `can_access_booking(uuid)`, a `security definer` function — same trick as
`is_staff()` — that runs with the function owner's privileges and so isn't subject to the
caller's RLS on `bookings`. See [decisions-log.md](./decisions-log.md) for the full story,
including the sibling bug this masked (`.insert().select()` needs the SELECT policy too, not
just INSERT — fixed by generating the id client-side and not calling `.select()`).

**Anywhere a new policy needs to check something in a second table that also has RLS, wrap the
check in a `security definer` function.** And test it as the actual `anon`/`authenticated` role
(a real anon-key client, or `psql` with `SET ROLE anon`) — `psql` as the default `postgres`
connection is the table owner and bypasses RLS entirely, so it will not catch this class of bug.

## Atomicity: `create_guest_booking()`

`lib/actions/bookings.ts` inserts a booking and its line items through a single RPC call,
`create_guest_booking(...)`, instead of two separate PostgREST calls. The function is plain
plpgsql with **no** `security definer` — deliberately, since the goal here is only atomicity
(one transaction from the client's perspective, so a failure partway through rolls back
everything), not a privilege change. It runs as the calling role, so the existing "guest create
booking"/"guest create booking_items" RLS policies apply exactly as if the two inserts had been
issued directly. Verified the rollback actually happens (a deliberately-bad `test_id` fails the
whole call, and the `bookings` row it would have created doesn't exist afterward), not just that
the SQL looks right.

## Guests can create (but not edit or delete) a `doctors` row

`doctors` has a `for insert with check (true)` policy open to everyone, alongside the existing
staff-only policy for update/delete. This is a narrow, deliberate exception to "guests can't
write catalog-ish tables" — see [decisions-log.md](./decisions-log.md) for the reasoning
(low-sensitivity data, real UX gap otherwise). `lib/actions/bookings.ts` uses it to create a
doctor when a guest's typed name doesn't match an existing one (`ilike`), rather than silently
dropping the referral.

## What's implemented vs. schema-only

Everything in `schema.sql` exists as a table today, but the app only reads/writes a subset:

| Table | App usage today |
|---|---|
| `site_settings` | Full — public read (Header/Footer/LocationMap/find-us/about), staff update via `/admin/settings` |
| `tests`, `test_categories` | `tests`: full CRUD via `/admin/catalog`, including `primary_image_url` and `normal_range_template` (see [normal-range.ts](../lib/types/normal-range.ts)). `test_categories`: add/delete via `/admin/categories` (no rename; `default_image_url` column is unused). Both public read (falls back to mock data — see [decisions-log.md](./decisions-log.md)) |
| `bookings`, `booking_items` | Insert via `create_guest_booking()` RPC (atomic — see above), read (admin bookings list with status filter, dashboard counts, "Create Report" link), update (`status` only, via `/admin/bookings`) |
| `packages`, `package_tests` | Full CRUD via `/admin/packages`, including `primary_image_url` upload and a checklist UI for `package_tests` (delete-all-then-insert-selected on save). Public read + detail page + bookable |
| `media` | `entity_type='landing'` rows power the homepage hero carousel, managed from `/admin/site-content`. `entity_type='test'`/`'package'` rows are **not** used — `tests.primary_image_url`/`packages.primary_image_url` (single image each) cover that case instead, uploaded directly via `lib/actions/upload-image.ts` without touching this table |
| `doctors` | Public read; guests can insert (new doctor) but not edit/delete (staff-only) — see above |
| `reports`, `report_results` | Full via `/admin/reports` (create/edit/delete, PDF generation on save). Public: `verify_report_access()` RPC only, no direct table access — see above |
| `staff`, `profiles` | Used by admin auth (`lib/auth/admin.ts`); no admin UI to manage staff accounts yet (system-design.md §7 screen 6) |

`supabase/seed.sql` (new) has starter catalog content — 5 tests + 1 package — matching what
`lib/data/mock-content.ts` used to fake. Run it once after `schema.sql`/`storage.sql` on a fresh
project; it's `on conflict do nothing` throughout so re-running it is harmless.

This table is the fast way to answer "is X wired up" without re-reading every file — keep it
current as admin screens get built (see [todo.md](./todo.md) Phase 1 remainder / Phase 2).

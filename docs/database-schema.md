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
  `patient_profile_id = null` and are **not** patient-readable after creation — only staff and,
  eventually, the phone+sample-number lookup flow (via a `security definer` RPC, not yet built —
  see [todo.md](./todo.md)) can retrieve them.

The `download-report` and `book-a-test` public flows currently go through the **anon key**, so
until the lookup RPC exists, `lib/actions/reports.ts` queries `reports` directly and depends on
`sample_no` being effectively unguessable (it isn't, yet — it's staff-entered free text). Treat
this as a known gap, not a design decision: don't ship the phone+sample lookup to production
without either (a) an RPC that checks the booking's `guest_phone` server-side, or (b) OTP
verification before the query runs, as system-design.md §4.3 specifies.

## What's implemented vs. schema-only

Everything in `schema.sql` exists as a table today, but the app only reads/writes a subset:

| Table | App usage today |
|---|---|
| `site_settings` | Full — public read (Header/Footer/LocationMap/find-us/about), staff update via `/admin/settings` |
| `tests`, `test_categories` | `tests`: full CRUD via `/admin/catalog` (create/edit/delete), public read (falls back to mock data — see [decisions-log.md](./decisions-log.md)). `test_categories`: read-only (category picker in the test form) — no admin screen to create/edit categories yet |
| `bookings` | Insert (booking form), read (admin bookings list, dashboard counts) |
| `packages`, `package_tests` | Schema only — no admin CRUD or public write path yet |
| `media`, `doctors` | Schema only — no UI reads/writes them yet |
| `reports`, `report_results`, `staff`, `profiles` | Schema + partial (staff/profiles used by admin auth; reports has a read-only lookup stub) |

This table is the fast way to answer "is X wired up" without re-reading every file — keep it
current as admin screens get built (see [todo.md](./todo.md) Phase 1 remainder / Phase 2).

# Admin app

Screens and access model are specified in [system-design.md §7](./system-design.md#7-admin-app-design).
This file tracks what actually exists.

## Auth

`lib/auth/admin.ts` — `getAdminSession()` returns `null` (not a throw) when: Supabase isn't
configured, there's no logged-in user, or the logged-in user has no row in `staff`. Every
protected admin page calls this itself and `redirect("/admin/login")` on `null` — see
[decisions-log.md](./decisions-log.md) for why the check isn't only in the layout.

`lib/actions/auth.ts` — `adminLogin` (email+password via Supabase Auth, redirects to `/admin` on
success), `adminLogout`.

There is currently **no distinction between `owner` and `technician`/`receptionist`** roles in
the UI — `staff.staff_role` is stored and returned by `getAdminSession()` but nothing branches on
it yet (e.g. pricing-edit restriction for non-owner staff, per system-design.md §7). Tracked
below.

## Screens

| # | Screen | Status |
|---|---|---|
| 1 | Dashboard | Built — `app/admin/page.tsx`. Two live counts (today's bookings, pending reports) via Supabase `count`. No revenue view. |
| 2 | Bookings | Built — `app/admin/bookings/page.tsx`. Read-only list, no filter/status-update UI yet. |
| 3 | Report entry | **Not built.** Highest-value screen per system-design.md §7 — do this before anything else in Phase 2. |
| 4 | Catalog management | **Partial.** `tests` have full create/edit/delete (`app/admin/catalog/{new,[id]}/page.tsx`, `lib/actions/catalog.ts`), including a raw-JSON `custom_fields` editor. **`packages` and `test_categories` have no admin CRUD yet** — categories can only be picked (not created) from the test form; do these next, same pattern as `tests`. No image upload yet (`media` table is schema-only). |
| 5 | Site content | **Partial, contact info only.** `app/admin/settings/page.tsx` + `lib/actions/settings.ts` edit the `site_settings` singleton row (name, address, phone, WhatsApp, email, hours, map links — see [database-schema.md](./database-schema.md)). Hero carousel / gallery photos / video links from system-design.md §6.1 (the `media` table, `entity_type='landing'`) are **not built** — the landing page hero is still static copy, not carousel images. |
| 6 | Staff management | **Not built.** |

## Notes for whoever builds the remaining screens

- Follow the "mobile-first, minimal taps" principle from system-design.md §7 — staff use this
  between patients on a phone, not at a desk.
- Follow the pattern `lib/actions/catalog.ts` + `app/admin/catalog/{new,[id]}` set for `tests`
  when adding `packages`/`test_categories` CRUD — same shape: a `zod`-validated Server Action
  that checks `getAdminSession()` first, a shared form component under `components/admin/`, and
  `revalidatePath` on both the admin list and `/` after writes.
- **Don't hardcode business content in `.ts` files again.** `lib/data/mock-content.ts` exists
  *only* as the pre-Supabase fallback (see [decisions-log.md](./decisions-log.md)) — anything the
  owner should be able to change is a DB row with an admin form, not a constant. This was gotten
  wrong once already (`site_settings` didn't exist in the first pass); don't repeat it for the
  remaining screens (media/hero content, staff roles, etc.).
- `updateSiteSettings` and `upsertTest`/`deleteTest` call `revalidatePath` after writing, but the
  locale pages that read this data are statically generated (`generateStaticParams` in
  `app/[locale]/layout.tsx` and `tests/[slug]/page.tsx`) — verify a settings/catalog change
  actually shows up on the public site without a full redeploy once a real Supabase project
  exists; if `revalidatePath` alone doesn't do it, these routes may need `export const
  revalidate = <seconds>` or on-demand tag-based revalidation instead.
- Reuse `components/ui/*` (Button, Card, FormField) rather than one-off admin styling — that's
  the whole point of the shared design system (system-design.md §6).
- The report entry form's auto-flagging behavior ("system flags High/Low automatically against
  the stored `normal_range_template`") depends on `tests.normal_range_template` (jsonb) actually
  being populated per test — that's currently empty for all rows. Decide the template shape
  before building the form, not after.
- Report PDF generation (`@react-pdf/renderer`, already installed) has no implementation yet —
  no `lib/pdf/` directory exists. Match the letterhead layout in system-design.md §8 exactly;
  it's meant to look familiar to referring doctors and patients, not redesigned.

# Admin app

Screens and access model are specified in [system-design.md §7](./system-design.md#7-admin-app-design).
This file tracks what actually exists.

## Auth

`lib/auth/admin.ts` — `getAdminSession()` returns `null` (not a throw) when: Supabase isn't
configured, there's no logged-in user, or the logged-in user has no row in `staff`. Every
protected admin page calls this itself and `redirect("/admin/login")` on `null` — see
[decisions-log.md](./decisions-log.md) for why the check isn't only in the layout.

`lib/actions/auth.ts` — `adminLogin` (email+password via Supabase Auth, redirects to `/admin` on
success), `adminLogout`. Verified end-to-end against the live owner account, not just reviewed —
see `docs/completed.md`.

There is currently **no distinction between `owner` and `technician`/`receptionist`** roles in
the UI — `staff.staff_role` is stored and returned by `getAdminSession()` but nothing branches on
it yet (e.g. pricing-edit restriction for non-owner staff, per system-design.md §7). Tracked
below.

## Screens

| # | Screen | Status |
|---|---|---|
| 1 | Dashboard | Built — `app/admin/page.tsx`. Two live counts (today's bookings, pending reports) via Supabase `count`. No revenue view. |
| 2 | Bookings | Built — `app/admin/bookings/page.tsx`. Status filter, per-row status update, "Create Report" link per booking. No date filter yet. |
| 3 | Report entry | **Built.** `app/admin/reports/{new,[id]}`, `lib/actions/reports-admin.ts`, `components/admin/ReportForm.tsx`. Sample no./patient details/optional booking link, dynamic results table (catalog auto-fill + auto High/Low flag, or free-form custom rows), draft/final status, PDF generated and stored on every save with results. No staff-role restriction (any staff can finalize a report). |
| 4 | Catalog management | **Mostly built.** `tests` and `packages` both have full create/edit/delete + raw-JSON `custom_fields` editors + single primary-image upload + (`tests` only) a `normal_range_template` editor. `test_categories` has add/delete but no rename. **Still missing:** multi-photo galleries/reordering — the `media` table is only used for the landing hero (see below), not per-test/package. |
| 5 | Site content | **Two screens, split by content type.** `/admin/settings` edits the `site_settings` singleton (contact/hours/map links). `/admin/site-content` (new) manages the homepage hero carousel (`media`, `entity_type='landing'`) — upload, caption EN/HI, sort order, delete. **Still missing:** gallery photos, video links (system-design.md §6.1 mentions both; only the hero carousel exists). |
| 6 | Staff management | **Not built.** |

## Notes for whoever builds the remaining screens

- Follow the "mobile-first, minimal taps" principle from system-design.md §7 — staff use this
  between patients on a phone, not at a desk.
- The `tests` CRUD pattern (`lib/actions/catalog.ts` + `app/admin/catalog/{new,[id]}`) has now
  been reused three times — `packages`, `test_categories`, and the landing media list. Same
  shape each time: a `zod`-validated Server Action that checks `getAdminSession()` first, a form
  component under `components/admin/`, `revalidatePath` on both the admin list and `/` after
  writes. Follow it again for staff management. For a many-to-many join (`package_tests`), the
  simplest correct approach at this catalog size is delete-all-then-insert-selected on every
  save, not diffing — see `upsertPackage`.
- **Don't hardcode business content in `.ts` files again.** `lib/data/mock-content.ts` exists
  *only* as the pre-Supabase fallback (see [decisions-log.md](./decisions-log.md)) — anything the
  owner should be able to change is a DB row with an admin form, not a constant.
- If a new Server Action needs a policy that checks something in a *second* RLS-protected table
  (not just `is_staff`), don't write an inline subquery — it silently inherits the caller's RLS
  visibility into that table and will misbehave for non-staff/non-owner callers. Wrap it in a
  `security definer` SQL function instead, same as `is_staff()`/`can_access_booking()`/
  `verify_report_access()` in `schema.sql`. This has now bitten both the guest booking flow and
  (pre-emptively fixed before shipping) the report lookup flow — see
  [database-schema.md](./database-schema.md).
- `updateSiteSettings`, `upsertTest`/`deleteTest`, `upsertPackage`/`deletePackage`, and
  `upsertReport` all call `revalidatePath` after writing, but the locale pages that read this
  data are statically generated (`generateStaticParams` in `app/[locale]/layout.tsx`,
  `tests/[slug]/page.tsx`, `packages/[slug]/page.tsx`) — **still not specifically confirmed**
  that a settings/catalog edit shows up on the public site without a full redeploy. If
  `revalidatePath` alone doesn't do it, these routes may need `export const revalidate =
  <seconds>` or on-demand tag-based revalidation instead. See [todo.md](./todo.md).
- Reuse `components/ui/*` (Button, Card, FormField) rather than one-off admin styling — that's
  the whole point of the shared design system (system-design.md §6).
- File uploads (primary image, landing media) go through `lib/actions/upload-image.ts`, a plain
  (non-`"use server"`) helper — a `"use server"` file may only export async functions, so shared
  logic used *by* multiple actions has to live outside them. Extract the `File` off `formData`
  *before* passing the rest to `zod`/`Object.fromEntries` — a `File` value in that object will
  either get silently stripped (zod's default "strip unknown keys" behavior) or, worse, choke a
  schema that doesn't expect it. `lib/actions/catalog.ts` and `lib/actions/reports-admin.ts` show
  the pattern (build a filtered `FormData` / destructure and drop the file key before parsing).
- Report entry's PDF regenerates on **every** save that has results, draft or final — that's
  intentional (lets staff preview before finalizing), but means every edit re-renders and
  re-uploads a PDF even for small changes. Fine at this volume; revisit if report edits become
  frequent enough for that to matter.

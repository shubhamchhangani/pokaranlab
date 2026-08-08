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
| 4 | Catalog management | **Partial.** `app/admin/catalog/page.tsx` is read-only (lists `tests`). No add/edit form, no image upload, no `custom_fields` editor. |
| 5 | Site content | **Not built.** |
| 6 | Staff management | **Not built.** |

## Notes for whoever builds the remaining screens

- Follow the "mobile-first, minimal taps" principle from system-design.md §7 — staff use this
  between patients on a phone, not at a desk.
- Reuse `components/ui/*` (Button, Card, FormField) rather than one-off admin styling — that's
  the whole point of the shared design system (system-design.md §6).
- The report entry form's auto-flagging behavior ("system flags High/Low automatically against
  the stored `normal_range_template`") depends on `tests.normal_range_template` (jsonb) actually
  being populated per test — that's currently empty for all rows. Decide the template shape
  before building the form, not after.
- Report PDF generation (`@react-pdf/renderer`, already installed) has no implementation yet —
  no `lib/pdf/` directory exists. Match the letterhead layout in system-design.md §8 exactly;
  it's meant to look familiar to referring doctors and patients, not redesigned.

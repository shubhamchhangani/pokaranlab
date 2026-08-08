# TODO

Backlog, organized by the phases in [system-design.md §12](./system-design.md#12-phased-build-roadmap).
Check off / move to [completed.md](./completed.md) as work lands — keep this list short and
current rather than exhaustive; it's meant to be read at the start of a session, not archived.

## Phase 0 — Setup (in progress)

- [x] Create the Supabase project, run `supabase/schema.sql` + `supabase/storage.sql` — live as
      of 2026-08-08, see `supabase/README.md`
- [x] Set `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` in `.env.local`
- [x] Create the two Storage buckets (`public-media`, `reports`) — via `supabase/storage.sql`
- [x] First owner staff account + `staff` row — `astrodaksh33@gmail.com`, `staff_role = 'owner'`
- [x] GitHub repo (`shubhamchhangani/pokaranlab`) — was already connected as `origin` before this
      session touched it (some background sync, not something this session set up — see
      `docs/decisions-log.md`)
- [x] Vercel project linked and deployed — **live at https://pokaranlab.vercel.app**
      (`shubham-chhanganis-projects/pokaranlab`), `NEXT_PUBLIC_SUPABASE_URL`/
      `NEXT_PUBLIC_SUPABASE_ANON_KEY` set for Production/Preview/Development
- [x] Vercel's GitHub App connected (done manually from the Vercel dashboard, after the CLI's
      auto-connect during `vercel link` failed) — pushes to `main` now auto-deploy to
      Production, confirmed working
- [ ] Register `pokaranlab.com` and add it as the Vercel project's domain (currently only the
      `*.vercel.app` URL exists)
- [ ] Claim the Google Business Profile
- [ ] Get the lab's real phone/WhatsApp number, hours, and exact address, then set them from
      `/admin/settings` (not by editing code — see `docs/database-schema.md` `site_settings`).
      Currently still the placeholder values from the `schema.sql` seed.
- [ ] Regenerate `lib/types/database.ts` from the live schema (`supabase/README.md` step 5) —
      still the hand-written reference

## Phase 1 — Core MVP (in progress)

- [x] Seed real test/package data into Supabase — `supabase/seed.sql`, 5 tests + 1 package
      (Fever Panel, linked to CBC via `package_tests`) live as of 2026-08-08. Still placeholder
      content, not the lab's real price list — replace via `/admin/catalog` whenever that's
      available. `lib/data/mock-content.ts` fallback kept intentionally (see
      `docs/decisions-log.md`), not deleted.
- [x] Package detail route (`/[locale]/packages/[slug]`) — `lib/data/packages.ts` +
      `app/[locale]/packages/[slug]/page.tsx`, mirrors the `tests/[slug]` pattern including
      `generateStaticParams`/JSON-LD, plus shows included tests via `package_tests`
- [x] Admin catalog: add/edit/delete for `tests` (`app/admin/catalog/{new,[id]}`,
      `lib/actions/catalog.ts`), including a raw-JSON `custom_fields` editor
- [x] Admin catalog: CRUD for `packages` (`app/admin/packages/{new,[id]}`,
      `lib/actions/packages.ts`, `components/admin/PackageForm.tsx`) including a
      `package_tests` linking checklist (replace-all-on-save). `test_categories`: add/delete
      (`app/admin/categories`, `lib/actions/categories.ts`) — no edit/rename yet, only
      create-and-delete, since categories rarely change.
- [x] Admin catalog: primary image upload for `tests`/`packages` (`lib/actions/upload-image.ts`,
      to the `public-media` bucket), rendered on catalog grids/detail pages via
      `components/ui/CardImage.tsx`. **Only a single "primary" image** — the full `media` table
      (multiple photos per test, reorder, landing-page gallery/hero) is still schema-only, no UI.
- [x] Admin site settings screen (`/admin/settings`) editing the `site_settings` singleton row
- [x] Landing page hero carousel from system-design.md §6.1 — `/admin/site-content` manages
      `media` rows (`entity_type='landing'`), `components/sections/HeroCarousel.tsx` renders
      them (auto-advancing, captioned, falls back to text-only hero when empty). **Gallery
      photos and video links are still unbuilt** — only the hero carousel exists. Category-level
      default images (`test_categories.default_image_url`, system-design.md §5.1) are also still
      unbuilt; a test with no `primary_image_url` renders with no image, no fallback chain.
- [ ] Verify `revalidatePath` actually busts the cache for statically-generated locale pages
      after a settings/catalog edit — not yet specifically confirmed even though real Supabase
      is live; see the caveat in `docs/admin-design.md`
- [x] Admin bookings: status update via `components/admin/BookingStatusSelect.tsx` +
      `lib/actions/admin-bookings.ts`, plus a status filter on `/admin/bookings`
- [x] Wire booking Server Action to resolve selected items (tests *and* packages, unified as
      `test:<slug>`/`package:<slug>`) to real rows and insert `booking_items` with a real
      computed `total_amount` (was hardcoded to 0, and packages couldn't be booked at all before
      this — the "Book This Test" link on a package page was a dead end).
- [x] Atomic booking creation — `create_guest_booking()` SQL RPC (`supabase/schema.sql`) inserts
      `bookings` + `booking_items` in one transaction, replacing the old two-call version that
      could leave a booking with no line items if the second call failed. Verified the rollback
      actually happens on failure, not just that it looks atomic in the SQL.
- [x] Referring-doctor free text now persists — guests can create a new `doctors` row (RLS:
      insert open to everyone, edit/delete still staff-only; see `docs/decisions-log.md` for why
      that tradeoff was made) rather than only matching existing ones.

## Phase 2 — Reports

- [x] Report entry admin screens (`/admin/reports/{new,[id]}`, `lib/actions/reports-admin.ts`,
      `components/admin/ReportForm.tsx`) — sample no., patient details, optional link to a
      booking (prefills patient info, "Create Report" button on `/admin/bookings`), dynamic
      results table (add from catalog with auto-filled normal range + auto High/Low flag, or a
      free-form custom row), draft/final status.
- [x] `tests.normal_range_template` shape decided: `{type:"numeric",low,high,unit} |
      {type:"text",display} | null` (`lib/types/normal-range.ts`) — editable from the test form,
      read by report entry for auto-fill/flagging.
- [x] PDF generation matching the letterhead (system-design.md §8) —
      `lib/pdf/{ReportDocument,generateReportPdf}.tsx`, uploaded to the private `reports` bucket
      on every save that has results (draft or final, so staff can preview before finalizing).
      **Simplification from the spec:** one flat results table, not grouped by test-section
      header (e.g. "Haemogram complete") — fine for now, revisit if reports commonly mix very
      different test categories.
- [x] Secure phone+sample-number lookup — `verify_report_access()`, a `security definer` RPC
      (`supabase/schema.sql`) that only returns data for an exact phone+sample_no match on a
      `status = 'final'` report. Added `reports.patient_phone` (denormalized, not joined through
      `bookings`) so this works for walk-in patients entered directly by staff, not just reports
      linked to an online booking.
- [x] Signed, time-limited URLs for report PDF downloads — `lib/supabase/service.ts` (new
      service-role client, `SUPABASE_SERVICE_ROLE_KEY` secret) generates a 5-minute signed URL
      for exactly the path `verify_report_access()` verified, never an arbitrary caller-supplied
      path. Verified: correct phone+sample works, wrong phone/sample/draft-status all correctly
      return nothing, anon can't read `reports` directly or self-sign a URL.
- [ ] Report entry has no OTP/second-factor beyond phone+sample_no matching an exact string —
      that's the security model system-design.md §4.3 specified ("phone number + sample number,
      or OTP-verified phone"); OTP was not implemented, phone+sample_no was judged sufficient
      for MVP. Revisit if sample numbers turn out to be guessable/sequential in practice.
- [ ] No SMS notification when a report goes `final` (system-design.md §9) — patients have no
      way to know a report is ready except checking the lookup page themselves. Same gap as
      booking-confirmed SMS, both blocked on the SMS gateway integration below.

## Phase 3 — SEO buildout

- [ ] Per-test/condition landing pages beyond the current catalog-driven ones — dedicated content
      for high-search-volume health concerns (fever panel, thyroid, etc.), EN + HI
- [ ] `MedicalOrganization` + `LocalBusiness` JSON-LD on *every* page, not just find-us
      (system-design.md §6 says "every page" — currently only find-us and test detail have JSON-LD)
- [ ] Submit sitemap to Google Search Console once the real domain is live

## Phase 4 — GEO / local authority

- [ ] Reviews request flow (SMS with review link after visit)
- [ ] Citations: Justdial, Practo, IndiaMART — manual registration, NAP must exactly match the
      site (system-design.md §11)

## Phase 5 — Growth (deferred, scaffold-only for now)

- [ ] UPI payments
- [ ] WhatsApp Business API (Meta) — MVP only has `wa.me` click-to-chat links
- [ ] Staff role permissions (owner vs. technician/receptionist — `staff.staff_role` is stored
      but nothing branches on it yet, see `docs/admin-design.md`)
- [ ] Analytics dashboard (beyond Google Analytics/Search Console)

## Housekeeping (no phase)

- [ ] SMS gateway integration (Msg91/Fast2SMS) — booking confirmation and report-ready SMS are
      both unimplemented; `SMS_API_KEY` exists in `.env.example` but nothing reads it yet
- [ ] Run `npm run lint` and `npm run build` in CI (no CI configured yet)

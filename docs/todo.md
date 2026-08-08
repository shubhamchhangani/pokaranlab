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
- [ ] Admin catalog: same CRUD for `packages` and `test_categories` (currently only `tests` has
      it — categories can be picked but not created; follow the `tests` pattern, see
      `docs/admin-design.md`). `packages` now has real public read/detail pages (see above) but
      still no admin write path — editing the Fever Panel means SQL, not the admin panel yet.
- [ ] Admin catalog: image upload to `public-media` (currently no UI touches the `media` table)
- [x] Admin site settings screen (`/admin/settings`) editing the `site_settings` singleton row
- [ ] Landing page hero carousel / gallery photos / video links from system-design.md §6.1 —
      schema (`media` table) exists, no admin UI or public rendering yet
- [ ] Verify `revalidatePath` actually busts the cache for statically-generated locale pages
      after a settings/catalog edit — not yet specifically confirmed even though real Supabase
      is live; see the caveat in `docs/admin-design.md`
- [x] Admin bookings: status update via `components/admin/BookingStatusSelect.tsx` +
      `lib/actions/admin-bookings.ts`, plus a status filter on `/admin/bookings`
- [x] Wire booking Server Action to resolve `testSlugs` → test IDs and insert `booking_items`,
      with a real computed `total_amount` (was hardcoded to 0). **Packages can't be booked yet**
      — `BookingForm` only offers individual tests, not packages, so the "Book This Test" button
      on a package detail page links to `/book-a-test?test=<package-slug>`, which won't
      preselect anything since it only matches test slugs. Extending the form to accept
      packages is the natural next step here.
- [ ] Make booking creation atomic — `createBooking` currently inserts `bookings` then
      `booking_items` as two separate calls; if the second fails, the booking is saved without
      its line items (logged as a known gap in the code, not silently wrong, but not ideal).
      PostgREST doesn't support multi-statement transactions from the client, so this needs a
      `security definer` RPC function that does both inserts in one call.
- [ ] Wire the "Ref. By doctor" field to actually persist — currently a guest booking can only
      *link* an existing `doctors` row by exact-ish name match (`ilike`); unmatched free text is
      silently dropped, since `doctors` is staff-write-only under RLS and a guest can't create
      one. Consider either loosening `doctors` INSERT to guests (a real RLS decision, not just
      "add a policy") or adding a free-text fallback column on `bookings`.

## Phase 2 — Reports

- [ ] Report entry admin screen (`docs/admin-design.md` #3 — the highest-value remaining screen)
- [ ] Decide `tests.normal_range_template` shape before building the form (see
      `docs/admin-design.md` notes)
- [ ] PDF generation matching the letterhead layout (system-design.md §8) — `@react-pdf/renderer`
      is installed, no `lib/pdf/` implementation yet
- [ ] Secure the phone+sample-number lookup — currently `lib/actions/reports.ts` queries `reports`
      by `sample_no` alone with the anon key, no phone verification. Needs either a
      `security definer` RPC that checks `guest_phone` server-side, or OTP, before this ships
      (see `docs/database-schema.md` RLS section — this is a known gap, not a design choice)
- [ ] Signed, time-limited URLs for report PDF downloads (system-design.md §8)

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

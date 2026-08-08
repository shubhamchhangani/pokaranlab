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
- [ ] Register `pokaranlab.com`
- [ ] Create the real GitHub repo, push this scaffold, connect Vercel
- [ ] Claim the Google Business Profile
- [ ] Get the lab's real phone/WhatsApp number, hours, and exact address, then set them from
      `/admin/settings` (not by editing code — see `docs/database-schema.md` `site_settings`).
      Currently still the placeholder values from the `schema.sql` seed.
- [ ] Regenerate `lib/types/database.ts` from the live schema (`supabase/README.md` step 5) —
      still the hand-written reference

## Phase 1 — Core MVP (in progress)

- [ ] Seed real test/package data into Supabase (currently only mock data exists) — once seeded,
      delete `lib/data/mock-content.ts` and the fallback branches in `lib/data/tests.ts` and
      `lib/data/site.ts`
- [ ] Package detail route (`/[locale]/packages/[slug]`) — currently only a list page exists,
      see `docs/decisions-log.md`
- [x] Admin catalog: add/edit/delete for `tests` (`app/admin/catalog/{new,[id]}`,
      `lib/actions/catalog.ts`), including a raw-JSON `custom_fields` editor
- [ ] Admin catalog: same CRUD for `packages` and `test_categories` (currently only `tests` has
      it — categories can be picked but not created; follow the `tests` pattern, see
      `docs/admin-design.md`)
- [ ] Admin catalog: image upload to `public-media` (currently no UI touches the `media` table)
- [x] Admin site settings screen (`/admin/settings`) editing the `site_settings` singleton row
- [ ] Landing page hero carousel / gallery photos / video links from system-design.md §6.1 —
      schema (`media` table) exists, no admin UI or public rendering yet
- [ ] Verify `revalidatePath` actually busts the cache for statically-generated locale pages
      after a settings/catalog edit once real Supabase is live — see the caveat in
      `docs/admin-design.md`
- [ ] Admin bookings: status update (confirmed → sample collected → processing → report ready),
      date/status filters
- [ ] Wire booking Server Action to actually resolve `testSlugs` → test/package IDs and insert
      `booking_items` (currently only inserts the `bookings` row with `total_amount: 0` — see
      the TODO comment in `lib/actions/bookings.ts`)

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

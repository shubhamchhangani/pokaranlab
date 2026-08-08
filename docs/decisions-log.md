# Decisions log

Where the actual build diverges from [system-design.md](./system-design.md), or where a
judgment call was made that isn't obvious from reading the code. Newest first. Keep entries
short — one or two lines of "what" and "why".

- **2026-08-09 — `revalidatePath` was verified with a temporary, throwaway debug route, not
  guesswork.** The open question ("does the public site actually update after an admin edit,
  and how fast") couldn't be answered by code review alone, and driving a real browser through
  the admin UI wasn't available. Added a one-off `app/api/debug-revalidate/route.ts` that
  updated a live field via the service-role client and called `revalidatePath("/", "layout")`,
  hit it with `curl` against production, confirmed the public page updated within ~2 seconds,
  reverted the test data, deleted the route, and redeployed. Verifying against the *actual
  deployed environment* mattered here — Vercel's CDN/Full Route Cache behavior isn't fully
  reproducible in local dev.
- **2026-08-09 — `www.pokaranlab.vercel.app` doesn't resolve; the real URL has no "www."** —
  found while setting up Google Search Console (the user had created a verification property for
  the www-prefixed host). Vercel's `*.vercel.app` wildcard TLS cert accepts any subdomain at the
  network level, so it looks reachable, but no project is actually bound to that exact hostname
  — the connection completes and then returns nothing. Custom domains support both apex and
  `www.`; `.vercel.app` project subdomains don't get an automatic `www.` variant. Worth
  remembering for the eventual `pokaranlab.com` migration too — don't assume `www.` "just works"
  without explicitly configuring it.
- **2026-08-09 — `NEXT_PUBLIC_SITE_URL` was never actually set in Vercel.** `robots.txt`/
  `sitemap.xml` (`app/robots.ts`, `app/sitemap.ts`) both fall back to the hardcoded
  `https://pokaranlab.com` when the env var is absent — which is exactly what was happening in
  production, so the sitemap reference in `robots.txt` pointed at a domain that doesn't exist
  yet. Found while setting up Search Console (a real crawler would have hit the same dead end).
  Fixed by setting `NEXT_PUBLIC_SITE_URL=https://pokaranlab.vercel.app` in Vercel; needs updating
  again once `pokaranlab.com` is registered and live — see `docs/geo-seo.md`.
- **2026-08-09 — Per-test/package photo galleries (`media` table) and the single
  `primary_image_url` are two deliberately separate mechanisms, not one merged into the other.**
  `primary_image_url` is the fast path for catalog grid thumbnails (no join needed — see
  system-design.md §5.1's original reasoning); `media` is for "however many extra photos this
  specific item has." Merging them (e.g., always taking the first gallery photo as primary)
  would couple two things admins might reasonably want to change independently — e.g., swap
  which photo is the "main" one without touching the gallery order. `lib/actions/media.ts` was
  generalized from its original landing-only form to serve both the hero carousel and these
  galleries through one `upsertMedia`/`deleteMedia` pair, keyed by `entity_type`.

- **2026-08-08 — Health-concern pages (`lib/data/health-concerns.ts`) are code-maintained, not a
  DB table with an admin form.** This looks like it contradicts the "everything admin-editable"
  rule established earlier the same day (see the `site_settings` entry below) — the distinction:
  that rule is about *business data* (contact info, prices, catalog items) that changes
  routinely and has no correctness risk if edited casually. Health-concern content is
  medical-adjacent editorial writing (symptoms, when-to-test guidance) where a wrong or
  overclaiming sentence is a real problem, not just a typo — it warrants review before
  publishing, which a free-text admin field doesn't provide. Revisit as a proper CMS only if the
  lab wants to publish many more of these themselves; for now, adding one means a developer
  writes and reviews it, same as any other page copy.
- **2026-08-08 — Constructed the Google review link from the Maps CID instead of waiting for a
  claimed Google Business Profile.** `https://search.google.com/local/writereview?placeid=<CID>`
  (CID = the `0x...:0x...` hex pair from the place URL) returns HTTP 200, which is *some*
  evidence it's a valid endpoint, but not proof the JS-driven review dialog actually opens —
  `curl`/WebFetch can't execute the JS to confirm. Shipped anyway (via `site_settings.
  google_review_url`, admin-editable) because having a probably-working link now is better than
  no review flow at all, but flagged clearly in `docs/geo-seo.md` and `docs/todo.md` to click-
  verify before relying on it, with the guaranteed-working fallback (Google Business Profile's
  own "Get more reviews" short link) noted for once the listing is claimed.
- **2026-08-08 — `reports.patient_phone` is its own column, not joined through
  `bookings.guest_phone`.** The public report lookup (`verify_report_access()`) needs a phone
  number to check on *every* report, but many reports won't have a `booking_id` at all — a
  walk-in patient staff enters directly has no online booking to join through. Denormalizing the
  phone onto `reports` itself (filled from the linked booking when there is one, typed manually
  otherwise) makes the lookup work uniformly instead of silently failing for walk-ins.
- **2026-08-08 — Guests can INSERT into `doctors` (not just SELECT).** system-design.md §7 wants
  "Ref. By (doctor — autocomplete from doctors table, **or free text**)" for the booking flow.
  Free text with no way to persist it was a real gap — the field was collected and then
  discarded. `doctors` holds only name/phone/clinic — low sensitivity — so opening INSERT to
  everyone (edit/delete stays staff-only) was judged an acceptable tradeoff against the UX gap.
  Junk entries are a staff cleanup problem, not a security one.
- **2026-08-08 — `create_guest_booking()` is a plain `security invoker` function, not `security
  definer`.** Unlike `can_access_booking()`/`verify_report_access()`, this one doesn't need
  elevated privileges — the goal is only atomicity (one transaction instead of two client calls
  that could partially fail), so it deliberately runs as the calling role and leans on the
  existing "guest create booking"/"guest create booking_items" RLS policies exactly as before.
  Don't reach for `security definer` reflexively; use it only when the caller genuinely can't see
  something they're allowed to act on (the `can_access_booking`/`verify_report_access` case).
- **2026-08-08 — `normal_range_template` is a small tagged union
  (`{type:"numeric",low,high,unit} | {type:"text",display} | null`), not free-form JSON.**
  Needed a shape report entry could actually auto-fill and flag against — a raw JSON textarea
  (the `custom_fields` pattern) would've pushed that parsing into report entry with no
  guarantees about what's in it. `lib/types/normal-range.ts` is the single source of truth for
  the shape, shared by the test form (writes it) and report entry (reads it for auto-fill +
  `flagResult()`).
- **2026-08-08 — The report PDF is one flat results table, not grouped by test-section header**
  (system-design.md §8 shows "Haemogram complete" as an example section header). Simplification
  for the first version — revisit if reports commonly mix categories enough that flat listing
  gets confusing. `report_results.test_name` is free text with no link back to `test_categories`,
  so grouping would need that connection re-established first.
- **2026-08-08 — `HeroCarousel` is a ~50-line hand-rolled client component, not a carousel
  library.** Auto-advance via `setInterval` + opacity transitions covers the actual requirement
  (a few captioned images cycling on the homepage) without a new dependency; revisit only if the
  carousel needs to do something this doesn't (swipe gestures, more than a handful of slides).
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

# SEO / GEO status

Tracks Phase 3 (SEO buildout) and Phase 4 (GEO/local authority) from
[system-design.md §11](./system-design.md#11-geoseo-execution-plan--the-rank-1-in-pokaran-part).
Most of Phase 4 is manual, off-site work that needs the owner's phone number for OTP
verification — it can't be done from this codebase. This file is the reference for what to do
and with what data, so it doesn't need re-researching each time.

## The canonical NAP block

Paste this **exactly** everywhere the business is listed — Google Business Profile, Justdial,
Practo, IndiaMART, Facebook, anywhere else. Inconsistent NAP (Name/Address/Phone) across
listings actively hurts local ranking (system-design.md §11.2) — this is the single highest
priority Phase 4 item.

```
Name:    Pokaran Diagnostic & Dr X Ray Center
Address: Near CHC / Govt. Hospital, Jodh Nagar, Pokaran, Dist. Jaisalmer, Rajasthan 345021
Phone:   +91 80055 18798
```

Source of truth in the app: `site_settings` (`/admin/settings`). If you change the phone/address
there, update it everywhere else too — the two aren't linked.

## Existing citations found (2026-08-08 web research)

- **Google Maps**: a listing already exists —
  https://www.google.com/maps/place/Pokaran+DAIGNOSTIC+center/@26.9225286,71.9196006 — but the
  name has a typo (**"DAIGNOSTIC"**) and it doesn't appear to be claimed. Coordinates from this
  listing (`26.9225286, 71.9196006`) are already in `site_settings` — they're accurate (an exact
  building pin, not a town-center approximation).
- **Justdial**: a listing titled *"Pokaran Diagnostic Centre Near Govt Hospital Pokaran"* exists
  — https://www.justdial.com/Jaisalmer/Pokaran-Diagnostic-Centre-Near-Gorvent-Hospital-Pokaran/9999P2992-2992-170611145240-A9C7_BZDET
  — note this also doesn't exactly match the canonical name above, and doesn't match the Google
  Maps listing's name either. **Two existing citations, two different name variants, neither
  matching the canonical one** — fixing this (claim both, correct the name to match exactly) is
  more valuable than adding new citations, since inconsistency between *existing* listings is
  actively worse than one of them not existing yet.
- Both `justdial.com` and `indiaonline.in` block automated fetching (JS-rendered pages, return
  empty/403), so their phone numbers/hours couldn't be extracted programmatically — claim the
  listings directly to see and correct what's on them.

## Claiming checklist (all manual — needs the owner's phone for OTP)

1. **Google Business Profile** (do this first — system-design.md §11 calls it out as the
   foundational step). Claim the existing Maps listing above, correct the name to the canonical
   one, set category (Diagnostic Center / Medical Lab), hours, and add real photos of the lab.
2. **Justdial** — claim the existing listing (link above), correct the name to match exactly.
3. **Practo**, **IndiaMART** (health category) — not found in the research pass above; register
   fresh listings with the canonical NAP block.
4. **Facebook** page, if the lab wants one — same NAP block again.

## Reviews

`/admin/bookings` has a **"Request Review"** link (visible once a booking's status is
`report_ready`, if `site_settings.google_review_url` is set) — opens a WhatsApp chat to the
*patient's* number with a pre-filled message and the Google review link. This is the
system-design.md §9/§11.7 "SMS with review link" idea, built on WhatsApp instead since there's no
SMS gateway wired up yet (see [todo.md](./todo.md)) — WhatsApp is already the app's pattern for
free-tier messaging (`components/layout/WhatsAppLink.tsx`).

The review link currently in `site_settings.google_review_url` was constructed from the Google
Maps CID in the place link
(`https://search.google.com/local/writereview?placeid=0x39472d7455f08b0b:0x4a6a22bd40b9f9e`) —
it returns HTTP 200, but **hasn't been confirmed to actually open a working review box** (that
needs a real browser with JS, which isn't available here). Click it once from a phone before
relying on it for real patients; if it's broken, Google Business Profile's own "Get more
reviews" tool (available once the listing is claimed) generates a guaranteed-working short link
(`g.page/r/.../review`) — swap that in via `/admin/settings`.

## SEO (Phase 3) — what's built

- `MedicalOrganization`/`LocalBusiness` JSON-LD renders on **every** public page now
  (`components/seo/OrganizationJsonLd.tsx`, included once in `app/[locale]/layout.tsx`) — this
  was previously only on find-us and test/package detail pages, per system-design.md §6's "every
  page" requirement. Includes `geo` coordinates now that they're confirmed accurate.
- Health-concern landing pages (`/[locale]/health/[slug]`, `lib/data/health-concerns.ts`) — Fever,
  Thyroid Problems, Anemia & Weakness, Heart Health, each linked to a real bookable test/package.
  EN + HI. General factual content with a "not a diagnosis" disclaimer, not medical advice — see
  [decisions-log.md](./decisions-log.md) for why this is code-maintained rather than
  admin-editable.
- About page rewritten as a clean facts list (location/hours/services/collection/reports) instead
  of placeholder marketing copy — matches system-design.md §11.6's "written so an AI system
  reading it can extract clean facts."
- Sitemap includes health-concern pages now, alongside tests/packages.

**Not done:** submitting the sitemap to Google Search Console (needs the real domain live and
the owner's Google account — see [todo.md](./todo.md) Phase 0/3).

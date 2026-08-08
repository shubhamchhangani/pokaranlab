-- Pokaran Lab — initial schema
-- Run against a fresh Supabase project via the SQL editor, or `supabase db push`.
-- Mirrors docs/database-schema.md and Section 5 of docs/system-design.md — keep both in sync.

create extension if not exists "pgcrypto";

-- ─────────────────────────────────────────────────────────────────
-- Profiles (extends auth.users) & staff
-- ─────────────────────────────────────────────────────────────────

create table profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text,
  phone text,
  email text,
  role text not null default 'patient' check (role in ('patient', 'staff', 'admin')),
  created_at timestamptz not null default now()
);

create table staff (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references profiles (id) on delete cascade,
  staff_role text not null check (staff_role in ('owner', 'technician', 'receptionist')),
  unique (profile_id)
);

create table doctors (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone text,
  clinic_name text
);

-- Every Supabase Auth signup (staff via /admin, or a patient verifying by phone/OTP later)
-- needs a matching `profiles` row — `staff.profile_id` and RLS's `patient_profile_id` checks
-- both depend on it existing. Without this trigger, a freshly created auth.users row has no
-- profiles row and can't be turned into staff.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, phone)
  values (new.id, new.email, new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'phone');
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ─────────────────────────────────────────────────────────────────
-- Site settings — owner-editable contact/hours/map content (system-design.md §7,
-- admin screen 5 "Site content"). Singleton row: `id` is a boolean primary key defaulting to
-- `true`, so a second row can never be inserted (violates the PK). Update the one row, never
-- insert another.
-- ─────────────────────────────────────────────────────────────────

create table site_settings (
  id boolean primary key default true check (id),
  name_en text not null,
  name_hi text not null,
  short_name text not null,
  address_en text not null,
  address_hi text not null,
  phone text not null,
  whatsapp text not null,
  email text not null,
  hours_en text not null,
  hours_hi text not null,
  maps_embed_url text not null,
  maps_directions_url text not null,
  -- Town-center approximation by default (see supabase/README.md) — refine to the exact
  -- building pin once the Google Business Profile is set up (system-design.md §11). Used for
  -- LocalBusiness JSON-LD `geo`, which system-design.md §6 calls for on every page.
  geo_lat numeric(9, 6),
  geo_lng numeric(9, 6),
  -- Google review deep link (system-design.md §11.7 — review requests are one of the strongest
  -- local-ranking signals). Used by the "Request Review" WhatsApp link in /admin/bookings.
  google_review_url text,
  updated_at timestamptz not null default now()
);

-- Seed the one row so the public site has real content to read immediately after this script
-- runs — the owner edits these values from /admin/settings, not by editing code or this file.
-- phone/whatsapp/geo_lat/geo_lng are the real, confirmed values (phone + Google Maps pin,
-- 2026-08-08 — see docs/decisions-log.md). hours/email are still placeholders pending
-- confirmation.
insert into site_settings (
  name_en, name_hi, short_name, address_en, address_hi, phone, whatsapp, email,
  hours_en, hours_hi, maps_embed_url, maps_directions_url, geo_lat, geo_lng, google_review_url
) values (
  'Pokaran Diagnostic & Dr X Ray Center',
  'पोकरण डायग्नोस्टिक एंड डॉ एक्स-रे सेंटर',
  'Pokaran Lab',
  'Near CHC / Govt. Hospital, Jodh Nagar, Pokaran, Dist. Jaisalmer, Rajasthan',
  'सीएचसी / सरकारी अस्पताल के पास, जोध नगर, पोकरण, जिला जैसलमेर, राजस्थान',
  '+91-8005518798',
  '918005518798',
  'info@pokaranlab.com',
  'Mon–Sat: 7:00 AM – 8:00 PM, Sun: 8:00 AM – 1:00 PM',
  'सोम–शनि: सुबह 7:00 – रात 8:00, रवि: सुबह 8:00 – दोपहर 1:00',
  'https://www.google.com/maps?q=26.9225286,71.9196006&z=17&output=embed',
  'https://www.google.com/maps/dir/?api=1&destination=26.9225286,71.9196006',
  26.9225286, 71.9196006,
  -- Built from the Google Maps CID (0x...:0x...) in the place link you shared — NOT verified by
  -- actually clicking it (search.google.com's review flow needs a real browser). Test this
  -- before relying on it; if it doesn't open a review box, get the real short link from Google
  -- Business Profile → "Get more reviews" once the listing is claimed. See docs/todo.md.
  'https://search.google.com/local/writereview?placeid=0x39472d7455f08b0b:0x4a6a22bd40b9f9e'
);

-- ─────────────────────────────────────────────────────────────────
-- Catalog: categories, tests, packages, media
-- ─────────────────────────────────────────────────────────────────

create table test_categories (
  id uuid primary key default gen_random_uuid(),
  name_en text not null,
  name_hi text not null,
  default_image_url text
);

create table tests (
  id uuid primary key default gen_random_uuid(),
  category_id uuid references test_categories (id) on delete set null,
  name_en text not null,
  name_hi text not null,
  description_en text not null default '',
  description_hi text not null default '',
  sample_type text not null,
  price numeric(10, 2) not null default 0,
  turnaround_time text not null default 'Same day',
  home_collection_available boolean not null default true,
  normal_range_template jsonb,
  primary_image_url text,
  custom_fields jsonb not null default '{}'::jsonb,
  slug text not null unique,
  created_at timestamptz not null default now()
);

create index tests_category_id_idx on tests (category_id);

create table packages (
  id uuid primary key default gen_random_uuid(),
  name_en text not null,
  name_hi text not null,
  price numeric(10, 2) not null default 0,
  description_en text,
  description_hi text,
  primary_image_url text,
  custom_fields jsonb not null default '{}'::jsonb,
  slug text not null unique,
  created_at timestamptz not null default now()
);

create table package_tests (
  package_id uuid not null references packages (id) on delete cascade,
  test_id uuid not null references tests (id) on delete cascade,
  primary key (package_id, test_id)
);

-- entity_type: 'test' | 'package' | 'landing'; entity_id is null for landing-page media.
create table media (
  id uuid primary key default gen_random_uuid(),
  entity_type text not null check (entity_type in ('test', 'package', 'landing')),
  entity_id uuid,
  media_type text not null default 'image' check (media_type in ('image', 'video')),
  url text not null,
  caption_en text,
  caption_hi text,
  sort_order int not null default 0,
  is_primary boolean not null default false
);

create index media_entity_idx on media (entity_type, entity_id);

-- ─────────────────────────────────────────────────────────────────
-- Bookings
-- ─────────────────────────────────────────────────────────────────

create table bookings (
  id uuid primary key default gen_random_uuid(),
  patient_profile_id uuid references profiles (id) on delete set null,
  guest_name text not null,
  guest_phone text not null,
  guest_age text,
  guest_sex text,
  collection_type text not null check (collection_type in ('walk_in', 'home_collection')),
  address text,
  scheduled_date date,
  scheduled_slot text,
  doctor_id uuid references doctors (id) on delete set null,
  status text not null default 'pending'
    check (status in ('pending', 'confirmed', 'sample_collected', 'processing', 'report_ready', 'cancelled')),
  payment_status text not null default 'unpaid' check (payment_status in ('unpaid', 'paid')),
  total_amount numeric(10, 2) not null default 0,
  created_at timestamptz not null default now()
);

create index bookings_guest_phone_idx on bookings (guest_phone);
create index bookings_scheduled_date_idx on bookings (scheduled_date);

create table booking_items (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references bookings (id) on delete cascade,
  test_id uuid references tests (id) on delete set null,
  package_id uuid references packages (id) on delete set null,
  price_at_booking numeric(10, 2) not null,
  constraint booking_items_test_or_package check (
    (test_id is not null) or (package_id is not null)
  )
);

create index booking_items_booking_id_idx on booking_items (booking_id);

-- ─────────────────────────────────────────────────────────────────
-- Reports
-- ─────────────────────────────────────────────────────────────────

create table reports (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid references bookings (id) on delete set null,
  sample_no text not null unique,
  patient_name text not null,
  -- Denormalized from the booking (when linked) rather than only living on `bookings`, because
  -- reports for walk-in patients entered directly by staff have no booking at all — the public
  -- phone+sample-number lookup (verify_report_access(), below) needs a phone number to check on
  -- every report, not just ones that started as an online booking.
  patient_phone text,
  age text,
  sex text,
  ref_by_doctor text,
  sample_received_date date,
  reporting_date date,
  technician_name text,
  -- Storage *path* within the private `reports` bucket (e.g. "reports/<id>.pdf"), not a public
  -- URL — the bucket has no public-read policy. Patients get a short-lived signed URL generated
  -- on demand after verify_report_access() confirms phone+sample_no match; see
  -- lib/actions/reports.ts and docs/database-schema.md.
  pdf_url text,
  status text not null default 'draft' check (status in ('draft', 'final')),
  created_at timestamptz not null default now()
);

create table report_results (
  id uuid primary key default gen_random_uuid(),
  report_id uuid not null references reports (id) on delete cascade,
  test_name text not null,
  result_value text not null,
  normal_range text,
  flag text check (flag in ('low', 'normal', 'high'))
);

create index report_results_report_id_idx on report_results (report_id);

-- ─────────────────────────────────────────────────────────────────
-- Row Level Security
-- See docs/database-schema.md for the reasoning behind each policy.
-- ─────────────────────────────────────────────────────────────────

alter table profiles enable row level security;
alter table staff enable row level security;
alter table doctors enable row level security;
alter table site_settings enable row level security;
alter table test_categories enable row level security;
alter table tests enable row level security;
alter table packages enable row level security;
alter table package_tests enable row level security;
alter table media enable row level security;
alter table bookings enable row level security;
alter table booking_items enable row level security;
alter table reports enable row level security;
alter table report_results enable row level security;

-- Helper: is the current user staff/admin?
create or replace function is_staff(uid uuid)
returns boolean
language sql
security definer
stable
as $$
  select exists (select 1 from staff where profile_id = uid);
$$;

-- Helper: may the current session attach booking_items to this booking? `security definer` is
-- required here, not just style — `bookings` has its own RLS (patients only see rows matching
-- their own patient_profile_id), so a plain subquery in the booking_items policy would have the
-- same problem it's trying to solve: a guest can't see their own just-inserted booking under
-- that policy, so an inline EXISTS would always evaluate false. This function runs as its
-- owner (bypassing the caller's RLS on `bookings`, same mechanism as is_staff() above) to check
-- ownership directly instead.
create or replace function can_access_booking(target_booking_id uuid)
returns boolean
language sql
security definer
stable
as $$
  select exists (
    select 1 from bookings
    where id = target_booking_id
      and (patient_profile_id is null or patient_profile_id = auth.uid())
  );
$$;

-- Catalog & media: public read, staff write.
create policy "public read test_categories" on test_categories for select using (true);
create policy "staff write test_categories" on test_categories for all
  using (is_staff(auth.uid())) with check (is_staff(auth.uid()));

create policy "public read tests" on tests for select using (true);
create policy "staff write tests" on tests for all
  using (is_staff(auth.uid())) with check (is_staff(auth.uid()));

create policy "public read packages" on packages for select using (true);
create policy "staff write packages" on packages for all
  using (is_staff(auth.uid())) with check (is_staff(auth.uid()));

create policy "public read package_tests" on package_tests for select using (true);
create policy "staff write package_tests" on package_tests for all
  using (is_staff(auth.uid())) with check (is_staff(auth.uid()));

create policy "public read media" on media for select using (true);
create policy "staff write media" on media for all
  using (is_staff(auth.uid())) with check (is_staff(auth.uid()));

create policy "public read doctors" on doctors for select using (true);
create policy "staff write doctors" on doctors for all
  using (is_staff(auth.uid())) with check (is_staff(auth.uid()));
-- Guests booking a test can name a referring doctor not yet in the table (system-design.md §7
-- allows free text). `doctors` holds only a name/phone/clinic — low sensitivity, so letting
-- anyone create a row (never edit/delete — that's still staff-only via the policy above) is an
-- acceptable tradeoff against a real UX gap. Junk entries are a staff cleanup problem, not a
-- security one. See docs/decisions-log.md.
create policy "guest create doctor" on doctors for insert with check (true);

-- site_settings is update-only from the app (the seed insert above is the only insert this
-- table ever needs) — no insert/delete policy, so even staff can't create a second row.
create policy "public read site_settings" on site_settings for select using (true);
create policy "staff update site_settings" on site_settings for update
  using (is_staff(auth.uid())) with check (is_staff(auth.uid()));

-- Bookings: staff see/manage all; patients see only their own (matched by profile).
create policy "staff manage bookings" on bookings for all
  using (is_staff(auth.uid())) with check (is_staff(auth.uid()));
create policy "patient read own bookings" on bookings for select
  using (patient_profile_id = auth.uid());
create policy "guest create booking" on bookings for insert
  with check (patient_profile_id is null or patient_profile_id = auth.uid());

create policy "staff manage booking_items" on booking_items for all
  using (is_staff(auth.uid())) with check (is_staff(auth.uid()));
create policy "patient read own booking_items" on booking_items for select
  using (
    exists (
      select 1 from bookings
      where bookings.id = booking_items.booking_id
        and bookings.patient_profile_id = auth.uid()
    )
  );
-- Mirrors "guest create booking" above — a guest (or the booking's own patient) can attach line
-- items to a booking they just created, but only that booking (checked via the FK), never an
-- arbitrary one. Uses can_access_booking() rather than an inline EXISTS — see that function's
-- comment for why the inline version doesn't work.
create policy "guest create booking_items" on booking_items for insert
  with check (can_access_booking(booking_id));

-- Atomic booking creation. `lib/actions/bookings.ts` used to insert `bookings` then
-- `booking_items` as two separate PostgREST calls — if the second failed, the first was already
-- committed, leaving a booking with no line items. A single plpgsql function call is one
-- statement from the client's perspective, so Postgres rolls back both inserts together if
-- either fails. Deliberately `security invoker` (the default, not stated) — it runs with the
-- caller's own privileges, so the "guest create booking"/"guest create booking_items" RLS
-- policies above still apply exactly as if the two inserts were issued directly. This is an
-- atomicity fix, not a privilege escalation.
create or replace function create_guest_booking(
  p_guest_name text,
  p_guest_phone text,
  p_guest_age text,
  p_guest_sex text,
  p_collection_type text,
  p_address text,
  p_scheduled_date date,
  p_scheduled_slot text,
  p_doctor_id uuid,
  p_total_amount numeric,
  p_items jsonb -- array of {"test_id"?: uuid, "package_id"?: uuid, "price": numeric}
)
returns uuid
language plpgsql
as $$
declare
  v_booking_id uuid := gen_random_uuid();
  v_item jsonb;
begin
  insert into bookings (
    id, guest_name, guest_phone, guest_age, guest_sex, collection_type, address,
    scheduled_date, scheduled_slot, doctor_id, status, payment_status, total_amount
  ) values (
    v_booking_id, p_guest_name, p_guest_phone, p_guest_age, p_guest_sex, p_collection_type,
    p_address, p_scheduled_date, p_scheduled_slot, p_doctor_id, 'pending', 'unpaid', p_total_amount
  );

  for v_item in select * from jsonb_array_elements(p_items)
  loop
    insert into booking_items (booking_id, test_id, package_id, price_at_booking)
    values (
      v_booking_id,
      nullif(v_item->>'test_id', '')::uuid,
      nullif(v_item->>'package_id', '')::uuid,
      (v_item->>'price')::numeric
    );
  end loop;

  return v_booking_id;
end;
$$;

-- Reports: staff see/manage all; patients see only reports linked to their own bookings.
create policy "staff manage reports" on reports for all
  using (is_staff(auth.uid())) with check (is_staff(auth.uid()));
create policy "patient read own reports" on reports for select
  using (
    exists (
      select 1 from bookings
      where bookings.id = reports.booking_id
        and bookings.patient_profile_id = auth.uid()
    )
  );

-- The public download-report flow (guest, no account, no RLS-visible path to `reports`) needs a
-- way to check "does this phone + sample number match a finalized report" without granting
-- broad read access. `security definer` here is intentional and narrow: the function returns
-- only the three fields the download flow needs, only for an exact phone+sample_no match, only
-- when status = 'final'. It does NOT return the row itself or allow listing/enumeration.
create or replace function verify_report_access(p_phone text, p_sample_no text)
returns table (pdf_path text, patient_name text, reporting_date date)
language sql
security definer
stable
as $$
  select pdf_url, patient_name, reporting_date
  from reports
  where patient_phone = p_phone and sample_no = p_sample_no and status = 'final';
$$;

create policy "staff manage report_results" on report_results for all
  using (is_staff(auth.uid())) with check (is_staff(auth.uid()));
create policy "patient read own report_results" on report_results for select
  using (
    exists (
      select 1 from reports
      join bookings on bookings.id = reports.booking_id
      where reports.id = report_results.report_id
        and bookings.patient_profile_id = auth.uid()
    )
  );

-- Profiles & staff: users read their own profile; staff table is staff-only.
create policy "read own profile" on profiles for select using (id = auth.uid());
create policy "update own profile" on profiles for update using (id = auth.uid());
create policy "staff read staff" on staff for select using (is_staff(auth.uid()));

-- ─────────────────────────────────────────────────────────────────
-- Storage buckets — create via Supabase dashboard or CLI, then apply:
--   public-media : public read, staff write
--   reports      : private, signed URLs only (no public policy)
-- ─────────────────────────────────────────────────────────────────

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
  updated_at timestamptz not null default now()
);

-- Seed the one row so the public site has real content to read immediately after this script
-- runs — the owner edits these values from /admin/settings, not by editing code or this file.
insert into site_settings (
  name_en, name_hi, short_name, address_en, address_hi, phone, whatsapp, email,
  hours_en, hours_hi, maps_embed_url, maps_directions_url
) values (
  'Pokaran Diagnostic & Dr X Ray Center',
  'पोकरण डायग्नोस्टिक एंड डॉ एक्स-रे सेंटर',
  'Pokaran Lab',
  'Near CHC / Govt. Hospital, Jodh Nagar, Pokaran, Dist. Jaisalmer, Rajasthan',
  'सीएचसी / सरकारी अस्पताल के पास, जोध नगर, पोकरण, जिला जैसलमेर, राजस्थान',
  '+91-XXXXXXXXXX',
  '91XXXXXXXXXX',
  'info@pokaranlab.com',
  'Mon–Sat: 7:00 AM – 8:00 PM, Sun: 8:00 AM – 1:00 PM',
  'सोम–शनि: सुबह 7:00 – रात 8:00, रवि: सुबह 8:00 – दोपहर 1:00',
  'https://www.google.com/maps?q=Pokaran+Jaisalmer+Rajasthan&output=embed',
  'https://maps.google.com/?q=Pokaran+Jaisalmer+Rajasthan'
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
  age text,
  sex text,
  ref_by_doctor text,
  sample_received_date date,
  reporting_date date,
  technician_name text,
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

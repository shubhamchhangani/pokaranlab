# Supabase setup

**Status for this project: done** (2026-08-08) — a live project exists, this is the record of
how it was set up, so re-running it (a new environment, a second lab, disaster recovery) doesn't
require re-deriving the steps.

1. Create a project at supabase.com (free tier is enough for launch — see docs/system-design.md §10).
2. Run `schema.sql` in full — either paste it into the dashboard's SQL Editor, or from a shell
   with network access to the DB:
   ```
   psql "$DB_URL" -f supabase/schema.sql -v ON_ERROR_STOP=1
   ```
   `$DB_URL` is the connection string from **Project Settings → Database → Connection string**
   (URI, direct connection, port 5432, password included). If `psql` isn't installed, `brew
   install libpq` gets you a client without pulling in a full local Postgres server.
3. Run `storage.sql` the same way — creates the `public-media` (public) and `reports` (private)
   buckets plus their RLS policies. Both must come *after* `schema.sql`, which defines
   `public.is_staff()`.
4. Copy the project URL (**Project Settings → API → Project URL** — not the Data API/REST URL,
   which has `/rest/v1/` appended) and anon key into `.env.local` (see `.env.example` at the repo
   root).
5. Regenerate TypeScript types once the schema is live:
   ```
   npx supabase gen types typescript --project-id <id> > lib/types/database.ts
   ```
   (Not done yet for this project — `lib/types/database.ts` is still the hand-written reference,
   see the comment at the top of that file.)
6. Create the first owner account: **Authentication → Users → Add user** (check "Auto Confirm
   User"), then link it to `staff`:
   ```sql
   insert into public.staff (profile_id, staff_role)
   values ('<the new user's auth.users id>', 'owner');
   ```
   This only works because `schema.sql` installs an `on_auth_user_created` trigger that copies
   every new `auth.users` row into `public.profiles` — without it, the `insert` above would fail
   its foreign key (`staff.profile_id references profiles(id)`). If you're setting up a second
   Supabase project without this trigger for some reason, add it first.
7. Run `seed.sql` (same `psql` command as step 2) for starter catalog content — 5 tests + 1
   package. Everything in it is `on conflict do nothing`, safe to re-run. Replace with the lab's
   real price list via `/admin/catalog` once that has write support for `packages` (currently
   only `tests` does — see docs/admin-design.md).

## Testing RLS changes

Any new or edited RLS policy must be tested as the actual `anon`/`authenticated` role, not as
the `postgres` connection from `$DB_URL` above — that connection is the table owner and RLS
doesn't apply to owners at all, so it will not catch a broken policy. Two ways to test for real:

- `psql "$DB_URL"`, then `SET ROLE anon;` before running the statement.
- A plain Node script using `@supabase/supabase-js` with the anon key (not the DB connection
  string) — closer to how the app actually talks to Supabase, and the only way to catch
  `.insert().select()`-shaped bugs (see docs/decisions-log.md, 2026-08-08 entries, for a real
  example this caught).

# Supabase setup

1. Create a project at supabase.com (free tier is enough for launch — see docs/system-design.md §10).
2. Open the SQL editor and run `schema.sql` in full.
3. Create two Storage buckets: `public-media` (public) and `reports` (private).
4. Copy the project URL and anon key into `.env.local` (see `.env.example` at the repo root).
5. Regenerate TypeScript types once the schema is live:
   ```
   npx supabase gen types typescript --project-id <id> > lib/types/database.ts
   ```
6. Create the first owner account: sign up via Supabase Auth, then manually insert a row into
   `staff` (`staff_role = 'owner'`) linking to that user's `profiles.id`.

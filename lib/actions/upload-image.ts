import type { SupabaseClient } from "@supabase/supabase-js";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

/**
 * Uploads a catalog image to the `public-media` bucket and returns its public URL, or `null`
 * if `file` is empty/missing (nothing was selected) or the upload failed. Bucket-level
 * constraints (5MB limit, same mime allowlist) are enforced again by Supabase — this check
 * just avoids a round-trip for an obviously-wrong file. Not a Server Action itself; called from
 * within lib/actions/catalog.ts and lib/actions/packages.ts, which already checked
 * getAdminSession() before this runs — `public-media` writes require the caller to be staff
 * per storage RLS (see supabase/storage.sql), so an unauthenticated caller would fail there too.
 */
export async function uploadPrimaryImage(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: SupabaseClient<any>,
  file: FormDataEntryValue | null,
  folder: "tests" | "packages" | "landing"
): Promise<string | null> {
  if (!(file instanceof File) || file.size === 0) return null;
  if (!ALLOWED_TYPES.includes(file.type)) return null;

  const ext = file.name.split(".").pop() ?? "jpg";
  const path = `${folder}/${crypto.randomUUID()}.${ext}`;

  const { error } = await supabase.storage
    .from("public-media")
    .upload(path, file, { contentType: file.type });

  if (error) return null;

  const { data } = supabase.storage.from("public-media").getPublicUrl(path);
  return data.publicUrl;
}

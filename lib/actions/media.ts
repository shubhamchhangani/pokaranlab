"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { getAdminSession } from "@/lib/auth/admin";
import { createClient } from "@/lib/supabase/server";
import { uploadPrimaryImage } from "@/lib/actions/upload-image";

const mediaSchema = z.object({
  entity_type: z.enum(["test", "package", "landing"]),
  entity_id: z.string().optional().default(""),
  caption_en: z.string().optional().default(""),
  caption_hi: z.string().optional().default(""),
  sort_order: z.coerce.number().optional().default(0),
});

export type MediaFormState = {
  status: "idle" | "error";
  message?: string;
};

const folderByEntityType = {
  test: "tests",
  package: "packages",
  landing: "landing",
} as const;

/**
 * Generic gallery-photo upload — used for the landing hero carousel (`entity_id` empty) and
 * per-test/per-package photo galleries (`entity_id` set). See `components/admin/MediaGalleryForm.tsx`.
 * This is a separate mechanism from `tests.primary_image_url`/`packages.primary_image_url`
 * (single-image fast path, `lib/actions/catalog.ts`/`packages.ts`) — see docs/decisions-log.md.
 */
export async function upsertMedia(
  _prevState: MediaFormState,
  formData: FormData
): Promise<MediaFormState> {
  const session = await getAdminSession();
  if (!session) {
    return { status: "error", message: "You must be signed in as staff to do this." };
  }

  const parsed = mediaSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { status: "error", message: "Please check the highlighted fields." };
  }

  const supabase = await createClient();
  const url = await uploadPrimaryImage(
    supabase,
    formData.get("image"),
    folderByEntityType[parsed.data.entity_type]
  );
  if (!url) {
    return { status: "error", message: "Choose an image (JPEG/PNG/WebP, under 5MB)." };
  }

  const { error } = await supabase.from("media").insert({
    entity_type: parsed.data.entity_type,
    entity_id: parsed.data.entity_id || null,
    media_type: "image",
    url,
    caption_en: parsed.data.caption_en,
    caption_hi: parsed.data.caption_hi,
    sort_order: parsed.data.sort_order,
  });

  if (error) {
    return { status: "error", message: "Could not save the image." };
  }

  revalidateForEntity(parsed.data.entity_type);
  return { status: "idle" };
}

export async function deleteMedia(formData: FormData) {
  const session = await getAdminSession();
  if (!session) return;

  const id = String(formData.get("id"));
  const entityType = formData.get("entity_type");

  const supabase = await createClient();
  await supabase.from("media").delete().eq("id", id);

  if (entityType === "test" || entityType === "package" || entityType === "landing") {
    revalidateForEntity(entityType);
  } else {
    revalidatePath("/", "layout");
  }
}

function revalidateForEntity(entityType: "test" | "package" | "landing") {
  revalidatePath("/", "layout");
  if (entityType === "landing") revalidatePath("/admin/site-content");
  if (entityType === "test") revalidatePath("/admin/catalog");
  if (entityType === "package") revalidatePath("/admin/packages");
}

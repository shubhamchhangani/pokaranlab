"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { getAdminSession } from "@/lib/auth/admin";
import { createClient } from "@/lib/supabase/server";
import { uploadPrimaryImage } from "@/lib/actions/upload-image";

const landingMediaSchema = z.object({
  caption_en: z.string().optional().default(""),
  caption_hi: z.string().optional().default(""),
  sort_order: z.coerce.number().optional().default(0),
});

export type LandingMediaFormState = {
  status: "idle" | "error";
  message?: string;
};

export async function createLandingMedia(
  _prevState: LandingMediaFormState,
  formData: FormData
): Promise<LandingMediaFormState> {
  const session = await getAdminSession();
  if (!session) {
    return { status: "error", message: "You must be signed in as staff to do this." };
  }

  const parsed = landingMediaSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { status: "error", message: "Please check the highlighted fields." };
  }

  const supabase = await createClient();
  const url = await uploadPrimaryImage(supabase, formData.get("image"), "landing");
  if (!url) {
    return { status: "error", message: "Choose an image (JPEG/PNG/WebP, under 5MB)." };
  }

  const { error } = await supabase.from("media").insert({
    entity_type: "landing",
    entity_id: null,
    media_type: "image",
    url,
    caption_en: parsed.data.caption_en,
    caption_hi: parsed.data.caption_hi,
    sort_order: parsed.data.sort_order,
  });

  if (error) {
    return { status: "error", message: "Could not save the image." };
  }

  revalidatePath("/admin/site-content");
  revalidatePath("/", "layout");
  return { status: "idle" };
}

export async function deleteLandingMedia(formData: FormData) {
  const session = await getAdminSession();
  if (!session) return;

  const id = String(formData.get("id"));
  const supabase = await createClient();
  await supabase.from("media").delete().eq("id", id);

  revalidatePath("/admin/site-content");
  revalidatePath("/", "layout");
}

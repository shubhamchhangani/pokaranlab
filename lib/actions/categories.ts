"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getAdminSession } from "@/lib/auth/admin";
import { createClient } from "@/lib/supabase/server";
import { uploadPrimaryImage } from "@/lib/actions/upload-image";

const categorySchema = z.object({
  name_en: z.string().min(1, "Required"),
  name_hi: z.string().min(1, "Required"),
});

export type CategoryFormState = {
  status: "idle" | "error";
  message?: string;
};

export async function createCategory(
  _prevState: CategoryFormState,
  formData: FormData
): Promise<CategoryFormState> {
  const session = await getAdminSession();
  if (!session) {
    return { status: "error", message: "You must be signed in as staff to do this." };
  }

  const parsed = categorySchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { status: "error", message: "Enter both an English and Hindi name." };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("test_categories").insert(parsed.data);

  if (error) {
    return { status: "error", message: "Could not save the category." };
  }

  revalidatePath("/admin/categories");
  return { status: "idle" };
}

/**
 * Rename + default-image update for an existing category. `default_image_url` is the fallback
 * shown on a test's card/detail page when that test has no `primary_image_url` of its own — see
 * lib/data/tests.ts.
 */
export async function updateCategory(
  _prevState: CategoryFormState,
  formData: FormData
): Promise<CategoryFormState> {
  const session = await getAdminSession();
  if (!session) {
    return { status: "error", message: "You must be signed in as staff to do this." };
  }

  const id = String(formData.get("id"));
  const imageFile = formData.get("default_image");
  const removeImage = formData.get("remove_image") === "on";

  const fields = new FormData();
  for (const [key, value] of formData.entries()) {
    if (!["id", "default_image", "remove_image"].includes(key)) fields.append(key, value);
  }

  const parsed = categorySchema.safeParse(Object.fromEntries(fields));
  if (!parsed.success) {
    return { status: "error", message: "Enter both an English and Hindi name." };
  }

  const supabase = await createClient();
  const uploadedUrl = await uploadPrimaryImage(supabase, imageFile, "categories");

  const row = {
    ...parsed.data,
    ...(uploadedUrl
      ? { default_image_url: uploadedUrl }
      : removeImage
        ? { default_image_url: null }
        : {}),
  };

  const { error } = await supabase.from("test_categories").update(row).eq("id", id);
  if (error) {
    return { status: "error", message: "Could not save the category." };
  }

  revalidatePath("/admin/categories");
  revalidatePath("/", "layout");
  redirect("/admin/categories");
}

export async function deleteCategory(formData: FormData) {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");

  const id = String(formData.get("id"));
  const supabase = await createClient();
  await supabase.from("test_categories").delete().eq("id", id);

  revalidatePath("/admin/categories");
}

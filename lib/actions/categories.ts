"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getAdminSession } from "@/lib/auth/admin";
import { createClient } from "@/lib/supabase/server";

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

export async function deleteCategory(formData: FormData) {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");

  const id = String(formData.get("id"));
  const supabase = await createClient();
  await supabase.from("test_categories").delete().eq("id", id);

  revalidatePath("/admin/categories");
}

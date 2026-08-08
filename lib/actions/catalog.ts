"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getAdminSession } from "@/lib/auth/admin";
import { createClient } from "@/lib/supabase/server";

const testSchema = z.object({
  id: z.string().optional(),
  category_id: z.string().optional(),
  name_en: z.string().min(1, "Required"),
  name_hi: z.string().min(1, "Required"),
  description_en: z.string().optional().default(""),
  description_hi: z.string().optional().default(""),
  slug: z
    .string()
    .min(1, "Required")
    .regex(/^[a-z0-9-]+$/, "Lowercase letters, numbers, and hyphens only"),
  sample_type: z.string().min(1, "Required"),
  price: z.coerce.number().min(0, "Must be 0 or more"),
  turnaround_time: z.string().min(1, "Required"),
  home_collection_available: z
    .union([z.literal("on"), z.undefined()])
    .transform((v) => v === "on"),
  custom_fields: z
    .string()
    .optional()
    .transform((v, ctx) => {
      if (!v || !v.trim()) return {};
      try {
        return JSON.parse(v);
      } catch {
        ctx.addIssue({ code: "custom", message: "Must be valid JSON" });
        return z.NEVER;
      }
    }),
});

export type TestFormState = {
  status: "idle" | "error";
  message?: string;
  fieldErrors?: Record<string, string>;
};

export async function upsertTest(
  _prevState: TestFormState,
  formData: FormData
): Promise<TestFormState> {
  const session = await getAdminSession();
  if (!session) {
    return { status: "error", message: "You must be signed in as staff to do this." };
  }

  const parsed = testSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      fieldErrors[String(issue.path[0])] = issue.message;
    }
    return { status: "error", fieldErrors, message: "Please check the highlighted fields." };
  }

  const { id, ...values } = parsed.data;
  const row = { ...values, category_id: values.category_id || null };

  const supabase = await createClient();
  const { error } = id
    ? await supabase.from("tests").update(row).eq("id", id)
    : await supabase.from("tests").insert(row);

  if (error) {
    const message = error.code === "23505" ? "That slug is already in use." : "Could not save the test.";
    return { status: "error", message };
  }

  revalidatePath("/admin/catalog");
  revalidatePath("/", "layout");
  redirect("/admin/catalog");
}

export async function deleteTest(formData: FormData) {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");

  const id = String(formData.get("id"));
  const supabase = await createClient();
  await supabase.from("tests").delete().eq("id", id);

  revalidatePath("/admin/catalog");
  revalidatePath("/", "layout");
}

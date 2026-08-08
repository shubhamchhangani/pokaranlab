"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getAdminSession } from "@/lib/auth/admin";
import { createClient } from "@/lib/supabase/server";
import { uploadPrimaryImage } from "@/lib/actions/upload-image";

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
  // Built into `normal_range_template` jsonb below, not stored as columns themselves — see
  // docs/database-schema.md for the shape and why report entry depends on it.
  normal_range_type: z.enum(["none", "numeric", "text"]).optional().default("none"),
  normal_range_low: z.string().optional(),
  normal_range_high: z.string().optional(),
  normal_range_unit: z.string().optional(),
  normal_range_text: z.string().optional(),
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

  const imageFile = formData.get("primary_image");
  const removeImage = formData.get("remove_image") === "on";
  const fields = new FormData();
  for (const [key, value] of formData.entries()) {
    if (key !== "primary_image" && key !== "remove_image") fields.append(key, value);
  }

  const parsed = testSchema.safeParse(Object.fromEntries(fields));
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      fieldErrors[String(issue.path[0])] = issue.message;
    }
    return { status: "error", fieldErrors, message: "Please check the highlighted fields." };
  }

  const {
    id,
    normal_range_type,
    normal_range_low,
    normal_range_high,
    normal_range_unit,
    normal_range_text,
    ...values
  } = parsed.data;
  const supabase = await createClient();

  const normalRangeTemplate =
    normal_range_type === "numeric"
      ? {
          type: "numeric",
          low: Number(normal_range_low) || 0,
          high: Number(normal_range_high) || 0,
          unit: normal_range_unit || "",
        }
      : normal_range_type === "text"
        ? { type: "text", display: normal_range_text || "" }
        : null;

  const uploadedUrl = await uploadPrimaryImage(supabase, imageFile, "tests");
  const row = {
    ...values,
    category_id: values.category_id || null,
    normal_range_template: normalRangeTemplate,
    ...(uploadedUrl ? { primary_image_url: uploadedUrl } : removeImage ? { primary_image_url: null } : {}),
  };

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

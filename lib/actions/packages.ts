"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getAdminSession } from "@/lib/auth/admin";
import { createClient } from "@/lib/supabase/server";

const packageSchema = z.object({
  id: z.string().optional(),
  name_en: z.string().min(1, "Required"),
  name_hi: z.string().min(1, "Required"),
  description_en: z.string().optional().default(""),
  description_hi: z.string().optional().default(""),
  slug: z
    .string()
    .min(1, "Required")
    .regex(/^[a-z0-9-]+$/, "Lowercase letters, numbers, and hyphens only"),
  price: z.coerce.number().min(0, "Must be 0 or more"),
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
  includedTestIds: z.array(z.string()).optional().default([]),
});

export type PackageFormState = {
  status: "idle" | "error";
  message?: string;
  fieldErrors?: Record<string, string>;
};

export async function upsertPackage(
  _prevState: PackageFormState,
  formData: FormData
): Promise<PackageFormState> {
  const session = await getAdminSession();
  if (!session) {
    return { status: "error", message: "You must be signed in as staff to do this." };
  }

  const raw = {
    ...Object.fromEntries(formData),
    includedTestIds: formData.getAll("includedTestIds"),
  };

  const parsed = packageSchema.safeParse(raw);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      fieldErrors[String(issue.path[0])] = issue.message;
    }
    return { status: "error", fieldErrors, message: "Please check the highlighted fields." };
  }

  const { id, includedTestIds, ...row } = parsed.data;
  const supabase = await createClient();

  let packageId = id;

  if (packageId) {
    const { error } = await supabase.from("packages").update(row).eq("id", packageId);
    if (error) {
      const message =
        error.code === "23505" ? "That slug is already in use." : "Could not save the package.";
      return { status: "error", message };
    }
  } else {
    const { data, error } = await supabase.from("packages").insert(row).select("id").single();
    if (error || !data) {
      const message =
        error?.code === "23505" ? "That slug is already in use." : "Could not save the package.";
      return { status: "error", message };
    }
    packageId = data.id;
  }

  // Replace-all is the simplest correct approach for a small, admin-edited join table — no
  // diffing needed at this scale.
  await supabase.from("package_tests").delete().eq("package_id", packageId);
  if (includedTestIds.length > 0) {
    await supabase.from("package_tests").insert(
      includedTestIds.map((testId) => ({ package_id: packageId, test_id: testId }))
    );
  }

  revalidatePath("/admin/packages");
  revalidatePath("/", "layout");
  redirect("/admin/packages");
}

export async function deletePackage(formData: FormData) {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");

  const id = String(formData.get("id"));
  const supabase = await createClient();
  await supabase.from("packages").delete().eq("id", id);

  revalidatePath("/admin/packages");
  revalidatePath("/", "layout");
}

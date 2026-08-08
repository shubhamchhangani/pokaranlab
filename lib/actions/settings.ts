"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { getAdminSession } from "@/lib/auth/admin";
import { createClient } from "@/lib/supabase/server";

const settingsSchema = z.object({
  name_en: z.string().min(1),
  name_hi: z.string().min(1),
  short_name: z.string().min(1),
  address_en: z.string().min(1),
  address_hi: z.string().min(1),
  phone: z.string().min(1),
  whatsapp: z.string().min(1),
  email: z.string().email(),
  hours_en: z.string().min(1),
  hours_hi: z.string().min(1),
  maps_embed_url: z.string().url(),
  maps_directions_url: z.string().url(),
});

export type SettingsFormState = {
  status: "idle" | "success" | "error";
  message?: string;
  fieldErrors?: Record<string, string>;
};

export async function updateSiteSettings(
  _prevState: SettingsFormState,
  formData: FormData
): Promise<SettingsFormState> {
  const session = await getAdminSession();
  if (!session) {
    return { status: "error", message: "You must be signed in as staff to do this." };
  }

  const parsed = settingsSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      fieldErrors[String(issue.path[0])] = issue.message;
    }
    return { status: "error", fieldErrors, message: "Please check the highlighted fields." };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("site_settings")
    .update({ ...parsed.data, updated_at: new Date().toISOString() })
    .eq("id", true);

  if (error) {
    return { status: "error", message: "Could not save settings. Try again." };
  }

  // Public pages read site_settings on every request but Next.js may have cached the
  // fetch — revalidate the routes that render it.
  revalidatePath("/", "layout");
  revalidatePath("/admin/settings");

  return { status: "success" };
}

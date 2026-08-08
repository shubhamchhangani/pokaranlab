"use server";

import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const lookupSchema = z.object({
  phone: z.string().regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit phone number"),
  sampleNo: z.string().min(1, "Enter the sample number"),
});

export type ReportLookupState = {
  status: "idle" | "found" | "not_found" | "error";
  pdfUrl?: string;
  message?: string;
};

const hasSupabase = Boolean(
  process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export async function lookupReport(
  _prevState: ReportLookupState,
  formData: FormData
): Promise<ReportLookupState> {
  const parsed = lookupSchema.safeParse({
    phone: formData.get("phone"),
    sampleNo: formData.get("sampleNo"),
  });

  if (!parsed.success) {
    return { status: "error", message: parsed.error.issues[0]?.message };
  }

  if (!hasSupabase) {
    return { status: "not_found" };
  }

  const supabase = await createClient();
  // Reports store `guest_phone` on the linked booking — join once bookings/reports are seeded.
  const { data, error } = await supabase
    .from("reports")
    .select("pdf_url")
    .eq("sample_no", parsed.data.sampleNo)
    .maybeSingle();

  if (error || !data?.pdf_url) {
    return { status: "not_found" };
  }

  return { status: "found", pdfUrl: data.pdf_url };
}

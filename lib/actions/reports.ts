"use server";

import { z } from "zod";
import { createClient } from "@/lib/supabase/public";
import { createServiceClient } from "@/lib/supabase/service";

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

  // verify_report_access() is `security definer` (supabase/schema.sql) — it's the only path a
  // guest has to `reports` data at all, and only returns a row for an exact phone + sample_no
  // match on a `final` report. See docs/database-schema.md.
  const supabase = createClient();
  const { data, error } = (await supabase
    .rpc("verify_report_access", {
      p_phone: parsed.data.phone,
      p_sample_no: parsed.data.sampleNo,
    })
    .maybeSingle()) as { data: { pdf_path: string } | null; error: unknown };

  if (error || !data?.pdf_path) {
    return { status: "not_found" };
  }

  // Only the service-role client can sign a URL into the private `reports` bucket — but only
  // ever for the exact path verify_report_access() just confirmed belongs to this phone/sample
  // pair, never an arbitrary caller-supplied path. See lib/supabase/service.ts.
  const serviceClient = createServiceClient();
  const { data: signed, error: signError } = await serviceClient.storage
    .from("reports")
    .createSignedUrl(data.pdf_path, 60 * 5);

  if (signError || !signed) {
    return { status: "not_found" };
  }

  return { status: "found", pdfUrl: signed.signedUrl };
}

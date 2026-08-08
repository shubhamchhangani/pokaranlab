"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getAdminSession } from "@/lib/auth/admin";
import { createClient } from "@/lib/supabase/server";
import { getSiteInfo } from "@/lib/data/site";
import { generateReportPdf } from "@/lib/pdf/generateReportPdf";

const resultRowSchema = z.object({
  test_name: z.string().min(1),
  result_value: z.string().min(1),
  normal_range: z.string().optional().default(""),
  flag: z.enum(["low", "normal", "high"]).nullable().optional(),
});

const reportSchema = z.object({
  id: z.string().optional(),
  booking_id: z.string().optional().default(""),
  sample_no: z.string().min(1, "Required"),
  patient_name: z.string().min(1, "Required"),
  patient_phone: z.string().optional().default(""),
  age: z.string().optional().default(""),
  sex: z.string().optional().default(""),
  ref_by_doctor: z.string().optional().default(""),
  sample_received_date: z.string().optional().default(""),
  reporting_date: z.string().optional().default(""),
  technician_name: z.string().optional().default(""),
  status: z.enum(["draft", "final"]),
  results_json: z.string().transform((v, ctx) => {
    try {
      return z.array(resultRowSchema).parse(JSON.parse(v));
    } catch {
      ctx.addIssue({ code: "custom", message: "Invalid results" });
      return z.NEVER;
    }
  }),
});

export type ReportFormState = {
  status: "idle" | "error";
  message?: string;
  fieldErrors?: Record<string, string>;
};

export async function upsertReport(
  _prevState: ReportFormState,
  formData: FormData
): Promise<ReportFormState> {
  const session = await getAdminSession();
  if (!session) {
    return { status: "error", message: "You must be signed in as staff to do this." };
  }

  const parsed = reportSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      fieldErrors[String(issue.path[0])] = issue.message;
    }
    return { status: "error", fieldErrors, message: "Please check the highlighted fields." };
  }

  const { id, results_json: results, booking_id, ...values } = parsed.data;
  const supabase = await createClient();

  const row = {
    ...values,
    booking_id: booking_id || null,
    sample_received_date: values.sample_received_date || null,
    reporting_date: values.reporting_date || null,
  };

  let reportId = id;

  if (reportId) {
    const { error } = await supabase.from("reports").update(row).eq("id", reportId);
    if (error) {
      const message = error.code === "23505" ? "That sample number is already in use." : "Could not save the report.";
      return { status: "error", message };
    }
  } else {
    const { data, error } = await supabase.from("reports").insert(row).select("id").single();
    if (error || !data) {
      const message = error?.code === "23505" ? "That sample number is already in use." : "Could not save the report.";
      return { status: "error", message };
    }
    reportId = data.id;
  }

  // Replace-all, same as package_tests — simplest correct approach at this scale.
  await supabase.from("report_results").delete().eq("report_id", reportId);
  if (results.length > 0) {
    await supabase.from("report_results").insert(
      results.map((r) => ({
        report_id: reportId,
        test_name: r.test_name,
        result_value: r.result_value,
        normal_range: r.normal_range || null,
        flag: r.flag ?? null,
      }))
    );
  }

  // Regenerate the PDF whenever there are results, draft or final, so staff can preview it
  // before marking the report final (only `final` reports are ever returned by the public
  // lookup — see verify_report_access() in supabase/schema.sql).
  if (results.length > 0) {
    const siteInfo = await getSiteInfo();
    const pdfBuffer = await generateReportPdf(
      {
        sample_no: values.sample_no,
        patient_name: values.patient_name,
        age: values.age || null,
        sex: values.sex || null,
        ref_by_doctor: values.ref_by_doctor || null,
        sample_received_date: row.sample_received_date,
        reporting_date: row.reporting_date,
        technician_name: values.technician_name || null,
      },
      results.map((r) => ({
        test_name: r.test_name,
        result_value: r.result_value,
        normal_range: r.normal_range || null,
        flag: r.flag ?? null,
      })),
      { name_en: siteInfo.name_en, address_en: siteInfo.address_en, phone: siteInfo.phone }
    );

    const pdfPath = `reports/${reportId}.pdf`;
    const { error: uploadError } = await supabase.storage
      .from("reports")
      .upload(pdfPath, pdfBuffer, { contentType: "application/pdf", upsert: true });

    if (!uploadError) {
      await supabase.from("reports").update({ pdf_url: pdfPath }).eq("id", reportId);
    }
  }

  revalidatePath("/admin/reports");
  redirect("/admin/reports");
}

export async function deleteReport(formData: FormData) {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");

  const id = String(formData.get("id"));
  const supabase = await createClient();
  await supabase.storage.from("reports").remove([`reports/${id}.pdf`]);
  await supabase.from("reports").delete().eq("id", id);

  revalidatePath("/admin/reports");
}

/** Staff-side PDF preview/download — uses the staff session's own RLS access to the `reports`
 * bucket, not the service-role client (that's reserved for the public lookup flow). */
export async function getStaffReportSignedUrl(pdfPath: string): Promise<string | null> {
  const session = await getAdminSession();
  if (!session) return null;

  const supabase = await createClient();
  const { data, error } = await supabase.storage.from("reports").createSignedUrl(pdfPath, 60 * 10);
  if (error || !data) return null;
  return data.signedUrl;
}

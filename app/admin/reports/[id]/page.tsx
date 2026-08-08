import { notFound, redirect } from "next/navigation";
import { getAdminSession } from "@/lib/auth/admin";
import { createClient } from "@/lib/supabase/server";
import { deleteReport, getStaffReportSignedUrl } from "@/lib/actions/reports-admin";
import { ReportForm, type ReportFormInitialValues } from "@/components/admin/ReportForm";

export default async function EditReportPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");

  const { id } = await params;
  const supabase = await createClient();

  const [{ data: report }, { data: results }, { data: tests }] = await Promise.all([
    supabase.from("reports").select("*").eq("id", id).maybeSingle(),
    supabase.from("report_results").select("test_name, result_value, normal_range, flag").eq("report_id", id),
    supabase.from("tests").select("id, name_en, normal_range_template").order("name_en"),
  ]);

  if (!report) notFound();

  const signedUrl = report.pdf_url ? await getStaffReportSignedUrl(report.pdf_url) : null;

  const initialValues: ReportFormInitialValues = {
    id: report.id,
    sample_no: report.sample_no,
    patient_name: report.patient_name,
    patient_phone: report.patient_phone,
    age: report.age,
    sex: report.sex,
    ref_by_doctor: report.ref_by_doctor,
    sample_received_date: report.sample_received_date,
    reporting_date: report.reporting_date,
    technician_name: report.technician_name,
    status: report.status,
    booking_id: report.booking_id,
    results: results ?? [],
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-semibold text-brand-indigo">Edit Report</h1>
        <div className="flex items-center gap-4">
          {signedUrl && (
            <a
              href={signedUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-medium text-brand-teal hover:underline"
            >
              View PDF
            </a>
          )}
          <form action={deleteReport}>
            <input type="hidden" name="id" value={report.id} />
            <button className="text-sm font-medium text-red-600 hover:underline">Delete</button>
          </form>
        </div>
      </div>
      <div className="mt-6">
        <ReportForm tests={tests ?? []} initialValues={initialValues} />
      </div>
    </div>
  );
}

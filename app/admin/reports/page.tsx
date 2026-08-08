import { redirect } from "next/navigation";
import Link from "next/link";
import { getAdminSession } from "@/lib/auth/admin";
import { createClient } from "@/lib/supabase/server";
import { deleteReport } from "@/lib/actions/reports-admin";
import { buttonClasses } from "@/components/ui/Button";

export default async function AdminReportsPage() {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");

  const supabase = await createClient();
  const { data: reports } = await supabase
    .from("reports")
    .select("id, sample_no, patient_name, status, reporting_date")
    .order("created_at", { ascending: false })
    .limit(50);

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-semibold text-brand-indigo">Reports</h1>
        <Link href="/admin/reports/new" className={buttonClasses("primary")}>
          New Report
        </Link>
      </div>

      <div className="mt-6 overflow-x-auto rounded-2xl border border-brand-ink/10 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-brand-ink/10 text-brand-ink/60">
            <tr>
              <th className="px-4 py-3">Sample No.</th>
              <th className="px-4 py-3">Patient</th>
              <th className="px-4 py-3">Reporting Date</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {(reports ?? []).map((report) => (
              <tr key={report.id} className="border-b border-brand-ink/5 last:border-0">
                <td className="px-4 py-3">{report.sample_no}</td>
                <td className="px-4 py-3">{report.patient_name}</td>
                <td className="px-4 py-3">{report.reporting_date ?? "—"}</td>
                <td className="px-4 py-3">
                  <span
                    className={
                      report.status === "final"
                        ? "text-brand-teal"
                        : "text-brand-ink/50"
                    }
                  >
                    {report.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <Link
                    href={`/admin/reports/${report.id}`}
                    className="mr-4 text-brand-teal hover:underline"
                  >
                    Edit
                  </Link>
                  <form action={deleteReport} className="inline">
                    <input type="hidden" name="id" value={report.id} />
                    <button className="text-red-600 hover:underline">Delete</button>
                  </form>
                </td>
              </tr>
            ))}
            {(!reports || reports.length === 0) && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-brand-ink/50">
                  No reports yet — click &ldquo;New Report&rdquo; to create one.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

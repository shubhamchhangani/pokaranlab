import { redirect } from "next/navigation";
import Link from "next/link";
import { getAdminSession } from "@/lib/auth/admin";
import { createClient } from "@/lib/supabase/server";
import { deleteReport } from "@/lib/actions/reports-admin";
import { buttonClasses } from "@/components/ui/Button";
import { inputClasses } from "@/components/ui/FormField";

const PAGE_SIZE = 25;

export default async function AdminReportsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; q?: string }>;
}) {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");

  const { page: pageParam, q } = await searchParams;
  const page = Math.max(1, Number(pageParam) || 1);
  const offset = (page - 1) * PAGE_SIZE;

  const supabase = await createClient();
  let query = supabase
    .from("reports")
    .select("id, sample_no, patient_name, status, reporting_date")
    .order("created_at", { ascending: false })
    // Fetch one extra row so we know whether a "Next" page exists, without a separate
    // COUNT(*) query — COUNT scans the whole matching set, which gets expensive as the
    // table grows into the thousands; this way pagination cost stays O(page size).
    .range(offset, offset + PAGE_SIZE);

  if (q && q.trim()) {
    const term = q.trim();
    query = query.or(`sample_no.ilike.${term}%,patient_name.ilike.${term}%,patient_phone.ilike.${term}%`);
  }

  const { data: rows } = await query;
  const reports = (rows ?? []).slice(0, PAGE_SIZE);
  const hasNext = (rows ?? []).length > PAGE_SIZE;

  const qParam = q ? `&q=${encodeURIComponent(q)}` : "";

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-2xl font-semibold text-brand-indigo">Reports</h1>
        <Link href="/admin/reports/new" className={buttonClasses("primary")}>
          New Report
        </Link>
      </div>

      <form className="mt-4 flex gap-2" action="/admin/reports">
        <input
          type="search"
          name="q"
          defaultValue={q ?? ""}
          placeholder="Search by sample no., name, or phone"
          className={`${inputClasses} max-w-sm flex-1`}
        />
        <button className="rounded-lg bg-brand-indigo px-4 py-2 text-sm font-medium text-brand-paper">
          Search
        </button>
        {q && (
          <Link href="/admin/reports" className="rounded-lg border border-brand-ink/15 px-4 py-2 text-sm text-brand-ink">
            Clear
          </Link>
        )}
      </form>

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
            {reports.map((report) => (
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
            {reports.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-brand-ink/50">
                  {q ? "No reports match that search." : "No reports yet — click “New Report” to create one."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {(page > 1 || hasNext) && (
        <div className="mt-4 flex items-center justify-between text-sm">
          {page > 1 ? (
            <Link href={`/admin/reports?page=${page - 1}${qParam}`} className="text-brand-teal hover:underline">
              ← Previous
            </Link>
          ) : (
            <span />
          )}
          <span className="text-brand-ink/50">Page {page}</span>
          {hasNext ? (
            <Link href={`/admin/reports?page=${page + 1}${qParam}`} className="text-brand-teal hover:underline">
              Next →
            </Link>
          ) : (
            <span />
          )}
        </div>
      )}
    </div>
  );
}

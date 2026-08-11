import { redirect } from "next/navigation";
import Link from "next/link";
import { getAdminSession } from "@/lib/auth/admin";
import { createClient } from "@/lib/supabase/server";
import { getSiteInfo } from "@/lib/data/site";
import { BOOKING_STATUSES } from "@/lib/data/booking-statuses";
import { BookingStatusSelect } from "@/components/admin/BookingStatusSelect";
import { inputClasses } from "@/components/ui/FormField";

const PAGE_SIZE = 25;

export default async function AdminBookingsPage(props: PageProps<"/admin/bookings">) {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");

  const raw = await props.searchParams;
  const status = Array.isArray(raw.status) ? raw.status[0] : raw.status;
  const q = Array.isArray(raw.q) ? raw.q[0] : raw.q;
  const page = Math.max(1, Number(Array.isArray(raw.page) ? raw.page[0] : raw.page) || 1);
  const offset = (page - 1) * PAGE_SIZE;

  const supabase = await createClient();
  let query = supabase
    .from("bookings")
    .select("id, guest_name, guest_phone, collection_type, status, scheduled_date, total_amount")
    .order("scheduled_date", { ascending: false })
    // Extra row fetched to detect a next page without a separate COUNT(*) — see reports list
    // for the same pattern; avoids scanning the whole matching set on every page load.
    .range(offset, offset + PAGE_SIZE);

  if (status && BOOKING_STATUSES.includes(status as (typeof BOOKING_STATUSES)[number])) {
    query = query.eq("status", status);
  }
  if (q && q.trim()) {
    const term = q.trim();
    query = query.or(`guest_name.ilike.${term}%,guest_phone.ilike.${term}%`);
  }

  const [{ data: rows }, siteInfo] = await Promise.all([query, getSiteInfo()]);
  const bookings = (rows ?? []).slice(0, PAGE_SIZE);
  const hasNext = (rows ?? []).length > PAGE_SIZE;
  const extraParams = `${status ? `&status=${status}` : ""}${q ? `&q=${encodeURIComponent(q)}` : ""}`;

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-2xl font-semibold text-brand-indigo">Bookings</h1>
        <form className="flex flex-wrap items-center gap-2 text-sm">
          <input
            type="search"
            name="q"
            defaultValue={q ?? ""}
            placeholder="Search name or phone"
            className={`${inputClasses} px-2 py-1.5 text-xs`}
          />
          <label htmlFor="status" className="text-brand-ink/60">
            Filter:
          </label>
          <select
            id="status"
            name="status"
            defaultValue={status ?? ""}
            className="rounded-lg border border-brand-ink/15 bg-white px-2 py-1.5 text-xs"
          >
            <option value="">All statuses</option>
            {BOOKING_STATUSES.map((s) => (
              <option key={s} value={s}>
                {s.replace(/_/g, " ")}
              </option>
            ))}
          </select>
          <button className="rounded-lg bg-brand-indigo px-3 py-1.5 text-xs font-medium text-brand-paper">
            Apply
          </button>
        </form>
      </div>

      <div className="mt-6 overflow-x-auto rounded-2xl border border-brand-ink/10 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-brand-ink/10 text-brand-ink/60">
            <tr>
              <th className="px-4 py-3">Patient</th>
              <th className="px-4 py-3">Phone</th>
              <th className="px-4 py-3">Type</th>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Amount</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {bookings.map((booking) => (
              <tr key={booking.id} className="border-b border-brand-ink/5 last:border-0">
                <td className="px-4 py-3">{booking.guest_name}</td>
                <td className="px-4 py-3">{booking.guest_phone}</td>
                <td className="px-4 py-3">{booking.collection_type}</td>
                <td className="px-4 py-3">{booking.scheduled_date}</td>
                <td className="px-4 py-3">₹{booking.total_amount}</td>
                <td className="px-4 py-3">
                  <BookingStatusSelect bookingId={booking.id} status={booking.status} />
                </td>
                <td className="px-4 py-3 text-right">
                  <Link
                    href={`/admin/reports/new?booking=${booking.id}`}
                    className="mr-4 text-brand-teal hover:underline"
                  >
                    Create Report
                  </Link>
                  {booking.status === "report_ready" && siteInfo.googleReviewUrl && (
                    <a
                      href={`https://wa.me/91${booking.guest_phone}?text=${encodeURIComponent(
                        `Hi ${booking.guest_name}, your report from ${siteInfo.shortName} is ready! If you were happy with our service, a quick Google review helps a lot: ${siteInfo.googleReviewUrl}`
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#25D366] hover:underline"
                    >
                      Request Review
                    </a>
                  )}
                </td>
              </tr>
            ))}
            {bookings.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-brand-ink/50">
                  {q || status ? "No bookings match that search/filter." : "No bookings yet."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {(page > 1 || hasNext) && (
        <div className="mt-4 flex items-center justify-between text-sm">
          {page > 1 ? (
            <Link href={`/admin/bookings?page=${page - 1}${extraParams}`} className="text-brand-teal hover:underline">
              ← Previous
            </Link>
          ) : (
            <span />
          )}
          <span className="text-brand-ink/50">Page {page}</span>
          {hasNext ? (
            <Link href={`/admin/bookings?page=${page + 1}${extraParams}`} className="text-brand-teal hover:underline">
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

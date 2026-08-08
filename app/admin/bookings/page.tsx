import { redirect } from "next/navigation";
import Link from "next/link";
import { getAdminSession } from "@/lib/auth/admin";
import { createClient } from "@/lib/supabase/server";
import { BOOKING_STATUSES } from "@/lib/data/booking-statuses";
import { BookingStatusSelect } from "@/components/admin/BookingStatusSelect";

export default async function AdminBookingsPage(props: PageProps<"/admin/bookings">) {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");

  const { status } = await props.searchParams;

  const supabase = await createClient();
  let query = supabase
    .from("bookings")
    .select("id, guest_name, guest_phone, collection_type, status, scheduled_date, total_amount")
    .order("scheduled_date", { ascending: false })
    .limit(50);

  if (status && BOOKING_STATUSES.includes(status as (typeof BOOKING_STATUSES)[number])) {
    query = query.eq("status", status);
  }

  const { data: bookings } = await query;

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-semibold text-brand-indigo">Bookings</h1>
        <form className="flex items-center gap-2 text-sm">
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
            {(bookings ?? []).map((booking) => (
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
                    className="text-brand-teal hover:underline"
                  >
                    Create Report
                  </Link>
                </td>
              </tr>
            ))}
            {(!bookings || bookings.length === 0) && (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-brand-ink/50">
                  No bookings yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

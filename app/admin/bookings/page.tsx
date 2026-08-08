import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/auth/admin";
import { createClient } from "@/lib/supabase/server";

export default async function AdminBookingsPage() {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");

  const supabase = await createClient();
  const { data: bookings } = await supabase
    .from("bookings")
    .select("id, guest_name, guest_phone, collection_type, status, scheduled_date")
    .order("created_at", { ascending: false })
    .limit(50);

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-brand-indigo">Bookings</h1>

      <div className="mt-6 overflow-x-auto rounded-2xl border border-brand-ink/10 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-brand-ink/10 text-brand-ink/60">
            <tr>
              <th className="px-4 py-3">Patient</th>
              <th className="px-4 py-3">Phone</th>
              <th className="px-4 py-3">Type</th>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {(bookings ?? []).map((booking) => (
              <tr key={booking.id} className="border-b border-brand-ink/5 last:border-0">
                <td className="px-4 py-3">{booking.guest_name}</td>
                <td className="px-4 py-3">{booking.guest_phone}</td>
                <td className="px-4 py-3">{booking.collection_type}</td>
                <td className="px-4 py-3">{booking.scheduled_date}</td>
                <td className="px-4 py-3">{booking.status}</td>
              </tr>
            ))}
            {(!bookings || bookings.length === 0) && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-brand-ink/50">
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

import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/auth/admin";
import { createClient } from "@/lib/supabase/server";

export default async function AdminDashboardPage() {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");

  const supabase = await createClient();
  const today = new Date().toISOString().split("T")[0];

  const [{ count: todayBookings }, { count: pendingReports }] = await Promise.all([
    supabase
      .from("bookings")
      .select("*", { count: "exact", head: true })
      .eq("scheduled_date", today),
    supabase
      .from("bookings")
      .select("*", { count: "exact", head: true })
      .eq("status", "sample_collected"),
  ]);

  const stats = [
    { label: "Today's bookings", value: todayBookings ?? 0 },
    { label: "Pending reports", value: pendingReports ?? 0 },
  ];

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-brand-indigo">Dashboard</h1>
      <p className="mt-1 text-sm text-brand-ink/60">Signed in as {session.email}</p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {stats.map((stat) => (
          <div key={stat.label} className="rounded-2xl border border-brand-ink/10 bg-white p-6">
            <p className="text-sm text-brand-ink/60">{stat.label}</p>
            <p className="mt-1 text-3xl font-semibold text-brand-indigo">{stat.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

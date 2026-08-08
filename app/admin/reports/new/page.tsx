import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/auth/admin";
import { createClient } from "@/lib/supabase/server";
import { ReportForm, type ReportFormInitialValues } from "@/components/admin/ReportForm";

export default async function NewReportPage({
  searchParams,
}: {
  searchParams: Promise<{ booking?: string }>;
}) {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");

  const { booking: bookingId } = await searchParams;
  const supabase = await createClient();

  const [{ data: tests }, bookingResult] = await Promise.all([
    supabase.from("tests").select("id, name_en, normal_range_template").order("name_en"),
    bookingId
      ? supabase
          .from("bookings")
          .select("id, guest_name, guest_phone, guest_age, guest_sex")
          .eq("id", bookingId)
          .maybeSingle()
      : Promise.resolve({ data: null }),
  ]);

  const booking = bookingResult.data;
  const initialValues: ReportFormInitialValues | undefined = booking
    ? {
        id: "",
        sample_no: "",
        patient_name: booking.guest_name,
        patient_phone: booking.guest_phone,
        age: booking.guest_age,
        sex: booking.guest_sex,
        ref_by_doctor: "",
        sample_received_date: "",
        reporting_date: "",
        technician_name: "",
        status: "draft",
        booking_id: booking.id,
        results: [],
      }
    : undefined;

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-brand-indigo">New Report</h1>
      <div className="mt-6">
        <ReportForm tests={tests ?? []} initialValues={initialValues} />
      </div>
    </div>
  );
}

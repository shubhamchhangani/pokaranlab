"use server";

import { revalidatePath } from "next/cache";
import { getAdminSession } from "@/lib/auth/admin";
import { createClient } from "@/lib/supabase/server";
import { BOOKING_STATUSES } from "@/lib/data/booking-statuses";

export async function updateBookingStatus(bookingId: string, status: string) {
  const session = await getAdminSession();
  if (!session) return;
  if (!BOOKING_STATUSES.includes(status as (typeof BOOKING_STATUSES)[number])) return;

  const supabase = await createClient();
  await supabase.from("bookings").update({ status }).eq("id", bookingId);

  revalidatePath("/admin/bookings");
  revalidatePath("/admin");
}

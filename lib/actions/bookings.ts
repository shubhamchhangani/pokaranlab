"use server";

import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const bookingSchema = z.object({
  testSlugs: z.array(z.string()).min(1, "Select at least one test"),
  collectionType: z.enum(["walk_in", "home_collection"]),
  address: z.string().optional(),
  scheduledDate: z.string().min(1, "Pick a date"),
  scheduledSlot: z.string().min(1, "Pick a time slot"),
  guestName: z.string().min(2, "Enter your full name"),
  guestPhone: z.string().regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit phone number"),
  guestAge: z.string().optional(),
  guestSex: z.string().optional(),
  referringDoctor: z.string().optional(),
});

export type BookingFormState = {
  status: "idle" | "success" | "error";
  message?: string;
  fieldErrors?: Record<string, string>;
};

const hasSupabase = Boolean(
  process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export async function createBooking(
  _prevState: BookingFormState,
  formData: FormData
): Promise<BookingFormState> {
  const raw = {
    testSlugs: formData.getAll("testSlugs") as string[],
    collectionType: formData.get("collectionType"),
    address: formData.get("address") ?? undefined,
    scheduledDate: formData.get("scheduledDate"),
    scheduledSlot: formData.get("scheduledSlot"),
    guestName: formData.get("guestName"),
    guestPhone: formData.get("guestPhone"),
    guestAge: formData.get("guestAge") ?? undefined,
    guestSex: formData.get("guestSex") ?? undefined,
    referringDoctor: formData.get("referringDoctor") ?? undefined,
  };

  const parsed = bookingSchema.safeParse(raw);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      fieldErrors[String(issue.path[0])] = issue.message;
    }
    return { status: "error", fieldErrors, message: "Please check the highlighted fields." };
  }

  const data = parsed.data;

  // TODO(Phase 1): once Supabase project exists, look up test/package ids by slug,
  // insert into `bookings` + `booking_items`, then trigger the SMS confirmation (Section 9 of
  // docs/system-design.md). Until then this is a no-op so the flow is demoable end-to-end.
  if (hasSupabase) {
    const supabase = await createClient();
    const { error } = await supabase.from("bookings").insert({
      guest_name: data.guestName,
      guest_phone: data.guestPhone,
      guest_age: data.guestAge ?? null,
      guest_sex: data.guestSex ?? null,
      collection_type: data.collectionType,
      address: data.address ?? null,
      scheduled_date: data.scheduledDate,
      scheduled_slot: data.scheduledSlot,
      status: "pending",
      payment_status: "unpaid",
      total_amount: 0,
    });

    if (error) {
      return { status: "error", message: "Could not save your booking. Please call the lab directly." };
    }
  }

  return { status: "success" };
}

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

  if (!hasSupabase) {
    return { status: "success" };
  }

  const supabase = await createClient();

  const { data: tests, error: testsError } = await supabase
    .from("tests")
    .select("id, slug, price")
    .in("slug", data.testSlugs);

  if (testsError || !tests || tests.length === 0) {
    return { status: "error", message: "Selected tests are no longer available. Please try again." };
  }

  // Doctors are staff-managed (RLS: public read, staff write — see supabase/schema.sql), so a
  // guest booking can only link an *existing* doctor by name, never create one. Unmatched free
  // text is not persisted yet — see docs/todo.md.
  let doctorId: string | null = null;
  if (data.referringDoctor?.trim()) {
    const { data: doctor } = await supabase
      .from("doctors")
      .select("id")
      .ilike("name", data.referringDoctor.trim())
      .maybeSingle();
    doctorId = doctor?.id ?? null;
  }

  const totalAmount = tests.reduce((sum, t) => sum + Number(t.price), 0);

  // Generate the id ourselves and skip `.select()` after insert: guest bookings (no
  // patient_profile_id) intentionally have no RLS SELECT policy — anyone with the anon key
  // reading every guest's name/phone/address back would be a real privacy leak — so
  // `.insert().select()` would fail here even though the plain insert is allowed. See
  // docs/database-schema.md and docs/decisions-log.md.
  const bookingId = crypto.randomUUID();

  const { error: bookingError } = await supabase.from("bookings").insert({
    id: bookingId,
    guest_name: data.guestName,
    guest_phone: data.guestPhone,
    guest_age: data.guestAge ?? null,
    guest_sex: data.guestSex ?? null,
    collection_type: data.collectionType,
    address: data.address ?? null,
    scheduled_date: data.scheduledDate,
    scheduled_slot: data.scheduledSlot,
    doctor_id: doctorId,
    status: "pending",
    payment_status: "unpaid",
    total_amount: totalAmount,
  });

  if (bookingError) {
    return { status: "error", message: "Could not save your booking. Please call the lab directly." };
  }

  const { error: itemsError } = await supabase.from("booking_items").insert(
    tests.map((t) => ({
      booking_id: bookingId,
      test_id: t.id,
      price_at_booking: t.price,
    }))
  );

  if (itemsError) {
    // The booking itself is saved and visible to staff even if the line-item breakdown isn't —
    // not ideal, but better than losing the booking. See docs/todo.md for making this atomic
    // (an RPC function, since postgrest doesn't support multi-statement transactions).
    return { status: "success" };
  }

  // TODO(Phase 2): trigger the booking-confirmed SMS here (docs/system-design.md §9) — no SMS
  // gateway is wired up yet.

  return { status: "success" };
}

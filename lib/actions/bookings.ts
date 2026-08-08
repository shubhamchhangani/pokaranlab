"use server";

import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const bookingSchema = z.object({
  // Each item is "test:<slug>" or "package:<slug>" — see components/booking/BookingForm.tsx.
  items: z
    .array(z.string().regex(/^(test|package):.+$/))
    .min(1, "Select at least one test or package"),
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
    items: formData.getAll("items") as string[],
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

  const testSlugs = data.items.filter((i) => i.startsWith("test:")).map((i) => i.slice(5));
  const packageSlugs = data.items
    .filter((i) => i.startsWith("package:"))
    .map((i) => i.slice(8));

  const supabase = await createClient();

  const [testsResult, packagesResult] = await Promise.all([
    testSlugs.length
      ? supabase.from("tests").select("id, slug, price").in("slug", testSlugs)
      : Promise.resolve({ data: [], error: null }),
    packageSlugs.length
      ? supabase.from("packages").select("id, slug, price").in("slug", packageSlugs)
      : Promise.resolve({ data: [], error: null }),
  ]);

  const tests = testsResult.data ?? [];
  const packages = packagesResult.data ?? [];

  if (testsResult.error || packagesResult.error || tests.length + packages.length === 0) {
    return {
      status: "error",
      message: "Selected tests/packages are no longer available. Please try again.",
    };
  }

  // `doctors` allows guest inserts (RLS: "guest create doctor", public write, staff-only
  // edit/delete — see supabase/schema.sql) precisely so this can create a doctor that doesn't
  // exist yet rather than dropping the referral on the floor.
  let doctorId: string | null = null;
  if (data.referringDoctor?.trim()) {
    const name = data.referringDoctor.trim();
    const { data: existing } = await supabase
      .from("doctors")
      .select("id")
      .ilike("name", name)
      .maybeSingle();

    if (existing) {
      doctorId = existing.id;
    } else {
      const { data: created } = await supabase
        .from("doctors")
        .insert({ name })
        .select("id")
        .single();
      doctorId = created?.id ?? null;
    }
  }

  const totalAmount =
    tests.reduce((sum, t) => sum + Number(t.price), 0) +
    packages.reduce((sum, p) => sum + Number(p.price), 0);

  const items = [
    ...tests.map((t) => ({ test_id: t.id, price: t.price })),
    ...packages.map((p) => ({ package_id: p.id, price: p.price })),
  ];

  // Single RPC call so the bookings + booking_items inserts are one transaction — see
  // create_guest_booking() in supabase/schema.sql for why this replaced two separate inserts.
  const { error: rpcError } = await supabase.rpc("create_guest_booking", {
    p_guest_name: data.guestName,
    p_guest_phone: data.guestPhone,
    p_guest_age: data.guestAge ?? null,
    p_guest_sex: data.guestSex ?? null,
    p_collection_type: data.collectionType,
    p_address: data.address ?? null,
    p_scheduled_date: data.scheduledDate,
    p_scheduled_slot: data.scheduledSlot,
    p_doctor_id: doctorId,
    p_total_amount: totalAmount,
    p_items: items,
  });

  if (rpcError) {
    return { status: "error", message: "Could not save your booking. Please call the lab directly." };
  }

  // TODO(Phase 2): trigger the booking-confirmed SMS here (docs/system-design.md §9) — no SMS
  // gateway is wired up yet.

  return { status: "success" };
}

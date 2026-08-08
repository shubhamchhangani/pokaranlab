import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { createServiceClient } from "@/lib/supabase/service";

// TEMPORARY — exists only to empirically verify revalidatePath timing on production static
// pages (docs/todo.md open question). Deleted immediately after the test. Not staff-gated
// because it never touches user data; it mutates one throwaway field on a seeded test row.
export async function GET() {
  const value = `REVALIDATE-TEST-${Date.now()}`;
  const supabase = createServiceClient();

  const { error } = await supabase
    .from("tests")
    .update({ turnaround_time: value })
    .eq("slug", "cbc-test-pokaran");

  revalidatePath("/", "layout");

  return NextResponse.json({ ok: !error, value, error: error?.message ?? null });
}

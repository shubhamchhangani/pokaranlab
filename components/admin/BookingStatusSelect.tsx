"use client";

import { useTransition } from "react";
import { updateBookingStatus } from "@/lib/actions/admin-bookings";
import { BOOKING_STATUSES } from "@/lib/data/booking-statuses";

export function BookingStatusSelect({
  bookingId,
  status,
}: {
  bookingId: string;
  status: string;
}) {
  const [isPending, startTransition] = useTransition();

  return (
    <select
      defaultValue={status}
      disabled={isPending}
      onChange={(e) => {
        const next = e.target.value;
        startTransition(() => {
          updateBookingStatus(bookingId, next);
        });
      }}
      className="rounded-lg border border-brand-ink/15 bg-white px-2 py-1 text-xs disabled:opacity-50"
    >
      {BOOKING_STATUSES.map((s) => (
        <option key={s} value={s}>
          {s.replace(/_/g, " ")}
        </option>
      ))}
    </select>
  );
}

"use client";

import { useActionState, useState } from "react";
import { useTranslations } from "next-intl";
import { createBooking, type BookingFormState } from "@/lib/actions/bookings";
import { FormField, inputClasses } from "@/components/ui/FormField";
import { Button } from "@/components/ui/Button";
import type { TestListItem } from "@/lib/data/tests";
import type { PackageListItem } from "@/lib/data/packages";

const initialState: BookingFormState = { status: "idle" };

const slots = ["7:00 AM – 9:00 AM", "9:00 AM – 12:00 PM", "4:00 PM – 6:00 PM"];

export function BookingForm({
  tests,
  packages,
  locale,
  preselectedItem,
}: {
  tests: TestListItem[];
  packages: PackageListItem[];
  locale: string;
  /** "test:<slug>" or "package:<slug>" — matches the checkbox `value`s below. */
  preselectedItem?: string;
}) {
  const t = useTranslations("booking");
  const [state, formAction, pending] = useActionState(createBooking, initialState);
  const [collectionType, setCollectionType] = useState<"walk_in" | "home_collection">(
    "walk_in"
  );

  if (state.status === "success") {
    return (
      <div className="rounded-2xl border border-brand-teal/30 bg-brand-teal/5 p-8 text-center">
        <h2 className="font-display text-2xl font-semibold text-brand-teal">
          {t("successTitle")}
        </h2>
        <p className="mt-2 text-brand-ink/80">{t("successMessage")}</p>
      </div>
    );
  }

  return (
    <form action={formAction} className="flex flex-col gap-8">
      <fieldset className="flex flex-col gap-4">
        <legend className="font-display text-lg font-semibold text-brand-indigo">
          {t("step1Title")}
        </legend>

        {packages.length > 0 && (
          <div className="flex flex-col gap-2">
            <p className="text-xs font-medium uppercase tracking-wide text-brand-ink/50">
              Packages
            </p>
            <div className="grid gap-2 sm:grid-cols-2">
              {packages.map((pkg) => (
                <label
                  key={pkg.slug}
                  className="flex items-center justify-between gap-3 rounded-lg border border-brand-ink/15 bg-white px-4 py-3 text-sm"
                >
                  <span className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      name="items"
                      value={`package:${pkg.slug}`}
                      defaultChecked={`package:${pkg.slug}` === preselectedItem}
                      className="h-4 w-4 accent-brand-teal"
                    />
                    {locale === "hi" ? pkg.name_hi : pkg.name_en}
                  </span>
                  <span className="font-medium text-brand-indigo">₹{pkg.price}</span>
                </label>
              ))}
            </div>
          </div>
        )}

        <div className="flex flex-col gap-2">
          {packages.length > 0 && (
            <p className="text-xs font-medium uppercase tracking-wide text-brand-ink/50">
              Individual Tests
            </p>
          )}
          <div className="grid gap-2 sm:grid-cols-2">
            {tests.map((test) => (
              <label
                key={test.slug}
                className="flex items-center justify-between gap-3 rounded-lg border border-brand-ink/15 bg-white px-4 py-3 text-sm"
              >
                <span className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    name="items"
                    value={`test:${test.slug}`}
                    defaultChecked={`test:${test.slug}` === preselectedItem}
                    className="h-4 w-4 accent-brand-teal"
                  />
                  {locale === "hi" ? test.name_hi : test.name_en}
                </span>
                <span className="font-medium text-brand-indigo">₹{test.price}</span>
              </label>
            ))}
          </div>
        </div>

        {state.fieldErrors?.items && (
          <p className="text-sm text-red-600">{state.fieldErrors.items}</p>
        )}
      </fieldset>

      <fieldset className="flex flex-col gap-4">
        <legend className="font-display text-lg font-semibold text-brand-indigo">
          {t("step2Title")}
        </legend>

        <div className="flex gap-4">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="radio"
              name="collectionType"
              value="walk_in"
              checked={collectionType === "walk_in"}
              onChange={() => setCollectionType("walk_in")}
              className="accent-brand-teal"
            />
            {t("walkIn")}
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="radio"
              name="collectionType"
              value="home_collection"
              checked={collectionType === "home_collection"}
              onChange={() => setCollectionType("home_collection")}
              className="accent-brand-teal"
            />
            {t("homeCollection")}
          </label>
        </div>

        {collectionType === "home_collection" && (
          <FormField label={t("address")} htmlFor="address">
            <textarea id="address" name="address" rows={2} className={inputClasses} />
          </FormField>
        )}

        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label={t("preferredDate")} htmlFor="scheduledDate">
            <input
              id="scheduledDate"
              name="scheduledDate"
              type="date"
              min={new Date().toISOString().split("T")[0]}
              className={inputClasses}
            />
          </FormField>
          <FormField label={t("preferredSlot")} htmlFor="scheduledSlot">
            <select id="scheduledSlot" name="scheduledSlot" className={inputClasses}>
              {slots.map((slot) => (
                <option key={slot} value={slot}>
                  {slot}
                </option>
              ))}
            </select>
          </FormField>
        </div>
      </fieldset>

      <fieldset className="flex flex-col gap-4">
        <legend className="font-display text-lg font-semibold text-brand-indigo">
          {t("step3Title")}
        </legend>

        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label={t("fullName")} htmlFor="guestName">
            <input id="guestName" name="guestName" className={inputClasses} />
          </FormField>
          <FormField label={t("phone")} htmlFor="guestPhone">
            <input
              id="guestPhone"
              name="guestPhone"
              type="tel"
              inputMode="numeric"
              placeholder="9876543210"
              className={inputClasses}
            />
          </FormField>
          <FormField label={t("age")} htmlFor="guestAge">
            <input id="guestAge" name="guestAge" className={inputClasses} />
          </FormField>
          <FormField label={t("sex")} htmlFor="guestSex">
            <select id="guestSex" name="guestSex" className={inputClasses}>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </FormField>
          <FormField
            label={t("referringDoctor")}
            htmlFor="referringDoctor"
            className="sm:col-span-2"
          >
            <input id="referringDoctor" name="referringDoctor" className={inputClasses} />
          </FormField>
        </div>

        {Object.entries(state.fieldErrors ?? {})
          .filter(([field]) => field !== "items")
          .map(([field, error]) => (
            <p key={field} className="text-sm text-red-600">
              {error}
            </p>
          ))}
        {state.status === "error" && state.message && (
          <p className="text-sm text-red-600">{state.message}</p>
        )}
      </fieldset>

      <Button type="submit" disabled={pending} className="w-full sm:w-auto">
        {pending ? t("submitting") : t("submit")}
      </Button>
    </form>
  );
}

"use client";

import { useActionState } from "react";
import { useTranslations } from "next-intl";
import { lookupReport, type ReportLookupState } from "@/lib/actions/reports";
import { FormField, inputClasses } from "@/components/ui/FormField";
import { Button } from "@/components/ui/Button";

const initialState: ReportLookupState = { status: "idle" };

export function ReportLookupForm() {
  const t = useTranslations("downloadReport");
  const [state, formAction, pending] = useActionState(lookupReport, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <FormField label={t("phone")} htmlFor="phone">
        <input
          id="phone"
          name="phone"
          type="tel"
          inputMode="numeric"
          placeholder="9876543210"
          className={inputClasses}
        />
      </FormField>
      <FormField label={t("sampleNo")} htmlFor="sampleNo">
        <input id="sampleNo" name="sampleNo" className={inputClasses} />
      </FormField>

      <Button type="submit" disabled={pending}>
        {t("lookup")}
      </Button>

      {state.status === "found" && state.pdfUrl && (
        <a
          href={state.pdfUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm font-medium text-brand-teal hover:underline"
        >
          {t("download")} →
        </a>
      )}
      {(state.status === "not_found" || state.status === "error") && (
        <p className="text-sm text-red-600">{state.message ?? t("notFound")}</p>
      )}
    </form>
  );
}

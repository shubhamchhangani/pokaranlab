"use client";

import { useActionState, useState } from "react";
import { upsertReport, type ReportFormState } from "@/lib/actions/reports-admin";
import { FormField, inputClasses } from "@/components/ui/FormField";
import { Button } from "@/components/ui/Button";
import { normalRangeDisplay, flagResult, type NormalRangeTemplate } from "@/lib/types/normal-range";

export type TestOption = {
  id: string;
  name_en: string;
  normal_range_template: NormalRangeTemplate;
};

type ResultRow = {
  test_name: string;
  result_value: string;
  normal_range: string;
  flag: "low" | "normal" | "high" | "";
  template: NormalRangeTemplate;
};

export type ReportFormInitialValues = {
  id: string;
  sample_no: string;
  patient_name: string;
  patient_phone: string | null;
  age: string | null;
  sex: string | null;
  ref_by_doctor: string | null;
  sample_received_date: string | null;
  reporting_date: string | null;
  technician_name: string | null;
  status: "draft" | "final";
  booking_id: string | null;
  results: { test_name: string; result_value: string; normal_range: string | null; flag: string | null }[];
};

const initialState: ReportFormState = { status: "idle" };

export function ReportForm({
  tests,
  initialValues,
}: {
  tests: TestOption[];
  initialValues?: ReportFormInitialValues;
}) {
  const [state, formAction, pending] = useActionState(upsertReport, initialState);
  const [rows, setRows] = useState<ResultRow[]>(
    initialValues?.results.map((r) => ({
      test_name: r.test_name,
      result_value: r.result_value,
      normal_range: r.normal_range ?? "",
      flag: (r.flag as ResultRow["flag"]) ?? "",
      template: null,
    })) ?? []
  );
  const [pickerTestId, setPickerTestId] = useState("");

  function addFromCatalog() {
    const test = tests.find((t) => t.id === pickerTestId);
    if (!test) return;
    setRows((r) => [
      ...r,
      {
        test_name: test.name_en,
        result_value: "",
        normal_range: normalRangeDisplay(test.normal_range_template),
        flag: "",
        template: test.normal_range_template,
      },
    ]);
    setPickerTestId("");
  }

  function addBlankRow() {
    setRows((r) => [...r, { test_name: "", result_value: "", normal_range: "", flag: "", template: null }]);
  }

  function updateRow(index: number, patch: Partial<ResultRow>) {
    setRows((r) =>
      r.map((row, i) => {
        if (i !== index) return row;
        const next = { ...row, ...patch };
        if (patch.result_value !== undefined && next.template) {
          next.flag = flagResult(next.template, patch.result_value) ?? "";
        }
        return next;
      })
    );
  }

  function removeRow(index: number) {
    setRows((r) => r.filter((_, i) => i !== index));
  }

  const resultsJson = JSON.stringify(
    rows.map(({ test_name, result_value, normal_range, flag }) => ({
      test_name,
      result_value,
      normal_range,
      flag: flag || null,
    }))
  );

  return (
    <form action={formAction} className="flex max-w-3xl flex-col gap-4">
      {initialValues && <input type="hidden" name="id" value={initialValues.id} />}
      {initialValues?.booking_id && (
        <input type="hidden" name="booking_id" value={initialValues.booking_id} />
      )}
      <input type="hidden" name="results_json" value={resultsJson} />

      <div className="grid gap-4 sm:grid-cols-3">
        <FormField label="Sample No." htmlFor="sample_no">
          <input
            id="sample_no"
            name="sample_no"
            defaultValue={initialValues?.sample_no}
            className={inputClasses}
          />
          {state.fieldErrors?.sample_no && (
            <p className="text-xs text-red-600">{state.fieldErrors.sample_no}</p>
          )}
        </FormField>
        <FormField label="Sample Received Date" htmlFor="sample_received_date">
          <input
            id="sample_received_date"
            name="sample_received_date"
            type="date"
            defaultValue={initialValues?.sample_received_date ?? ""}
            className={inputClasses}
          />
        </FormField>
        <FormField label="Reporting Date" htmlFor="reporting_date">
          <input
            id="reporting_date"
            name="reporting_date"
            type="date"
            defaultValue={initialValues?.reporting_date ?? ""}
            className={inputClasses}
          />
        </FormField>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label="Patient Name" htmlFor="patient_name">
          <input
            id="patient_name"
            name="patient_name"
            defaultValue={initialValues?.patient_name}
            className={inputClasses}
          />
          {state.fieldErrors?.patient_name && (
            <p className="text-xs text-red-600">{state.fieldErrors.patient_name}</p>
          )}
        </FormField>
        <FormField
          label="Patient Phone (needed for online report lookup)"
          htmlFor="patient_phone"
        >
          <input
            id="patient_phone"
            name="patient_phone"
            defaultValue={initialValues?.patient_phone ?? ""}
            className={inputClasses}
          />
        </FormField>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <FormField label="Age" htmlFor="age">
          <input id="age" name="age" defaultValue={initialValues?.age ?? ""} className={inputClasses} />
        </FormField>
        <FormField label="Sex" htmlFor="sex">
          <select id="sex" name="sex" defaultValue={initialValues?.sex ?? ""} className={inputClasses}>
            <option value="">—</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
        </FormField>
        <FormField label="Ref. By" htmlFor="ref_by_doctor">
          <input
            id="ref_by_doctor"
            name="ref_by_doctor"
            defaultValue={initialValues?.ref_by_doctor ?? ""}
            className={inputClasses}
          />
        </FormField>
      </div>

      <FormField label="Technician Name" htmlFor="technician_name">
        <input
          id="technician_name"
          name="technician_name"
          defaultValue={initialValues?.technician_name ?? ""}
          className={inputClasses}
        />
      </FormField>

      <fieldset className="flex flex-col gap-3 rounded-2xl border border-brand-ink/10 bg-white p-4">
        <legend className="px-1 text-sm font-semibold text-brand-indigo">Test Results</legend>

        <div className="flex flex-wrap items-end gap-2">
          <FormField label="Add from catalog" htmlFor="test_picker" className="flex-1">
            <select
              id="test_picker"
              value={pickerTestId}
              onChange={(e) => setPickerTestId(e.target.value)}
              className={inputClasses}
            >
              <option value="">— Select a test —</option>
              {tests.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name_en}
                </option>
              ))}
            </select>
          </FormField>
          <Button type="button" variant="outline" onClick={addFromCatalog} disabled={!pickerTestId}>
            Add
          </Button>
          <Button type="button" variant="outline" onClick={addBlankRow}>
            + Custom row
          </Button>
        </div>

        <div className="flex flex-col gap-2">
          {rows.map((row, i) => (
            <div key={i} className="grid grid-cols-12 items-center gap-2 rounded-lg border border-brand-ink/10 p-2">
              <input
                value={row.test_name}
                onChange={(e) => updateRow(i, { test_name: e.target.value })}
                placeholder="Test name"
                className={`${inputClasses} col-span-4`}
              />
              <input
                value={row.result_value}
                onChange={(e) => updateRow(i, { result_value: e.target.value })}
                placeholder="Result"
                className={`${inputClasses} col-span-2`}
              />
              <input
                value={row.normal_range}
                onChange={(e) => updateRow(i, { normal_range: e.target.value })}
                placeholder="Normal range"
                className={`${inputClasses} col-span-3`}
              />
              <select
                value={row.flag}
                onChange={(e) => updateRow(i, { flag: e.target.value as ResultRow["flag"] })}
                className={`${inputClasses} col-span-2`}
              >
                <option value="">Normal</option>
                <option value="low">Low</option>
                <option value="high">High</option>
              </select>
              <button
                type="button"
                onClick={() => removeRow(i)}
                className="col-span-1 text-xs text-red-600 hover:underline"
              >
                Remove
              </button>
            </div>
          ))}
          {rows.length === 0 && (
            <p className="text-sm text-brand-ink/50">No results added yet.</p>
          )}
        </div>
      </fieldset>

      <FormField label="Status" htmlFor="status">
        <select id="status" name="status" defaultValue={initialValues?.status ?? "draft"} className={inputClasses}>
          <option value="draft">Draft (not visible to patients)</option>
          <option value="final">Final (visible via report lookup)</option>
        </select>
      </FormField>

      {state.status === "error" && state.message && (
        <p className="text-sm text-red-600">{state.message}</p>
      )}

      <Button type="submit" disabled={pending} className="w-fit">
        {pending ? "Saving..." : "Save Report"}
      </Button>
    </form>
  );
}

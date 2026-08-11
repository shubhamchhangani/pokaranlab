"use client";

import { useActionState, useState } from "react";
import { upsertTest, type TestFormState } from "@/lib/actions/catalog";
import { FormField, inputClasses } from "@/components/ui/FormField";
import { Button } from "@/components/ui/Button";
import type { TestCategory } from "@/lib/data/categories";
import type { NormalRangeTemplate, PanelParameter } from "@/lib/types/normal-range";
import { REPORT_PRESETS } from "@/lib/data/report-presets";

const initialState: TestFormState = { status: "idle" };

export type TestFormInitialValues = {
  id: string;
  name_en: string;
  name_hi: string;
  description_en: string;
  description_hi: string;
  slug: string;
  category_id: string | null;
  sample_type: string;
  price: number;
  turnaround_time: string;
  home_collection_available: boolean;
  custom_fields: Record<string, unknown> | null;
  primary_image_url: string | null;
  normal_range_template: NormalRangeTemplate;
};

export function TestForm({
  categories,
  initialValues,
}: {
  categories: TestCategory[];
  initialValues?: TestFormInitialValues;
}) {
  const [state, formAction, pending] = useActionState(upsertTest, initialState);
  const [rangeType, setRangeType] = useState(initialValues?.normal_range_template?.type ?? "none");
  const template = initialValues?.normal_range_template;
  const [panelParams, setPanelParams] = useState<PanelParameter[]>(
    template?.type === "panel" ? template.parameters : []
  );
  const [presetId, setPresetId] = useState("");

  function loadPreset() {
    const preset = REPORT_PRESETS.find((p) => p.id === presetId);
    if (!preset) return;
    setPanelParams(preset.parameters.map((p) => ({ ...p })));
  }

  function addPanelParam() {
    setPanelParams((rows) => [...rows, { type: "numeric", name: "", unit: "", low: 0, high: 0 }]);
  }

  function updatePanelParam(index: number, patch: Partial<PanelParameter>) {
    setPanelParams((rows) =>
      rows.map((row, i) => (i === index ? ({ ...row, ...patch } as PanelParameter) : row))
    );
  }

  function removePanelParam(index: number) {
    setPanelParams((rows) => rows.filter((_, i) => i !== index));
  }

  return (
    <form action={formAction} className="flex max-w-2xl flex-col gap-4">
      {initialValues && <input type="hidden" name="id" value={initialValues.id} />}

      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label="Name (English)" htmlFor="name_en">
          <input
            id="name_en"
            name="name_en"
            defaultValue={initialValues?.name_en}
            className={inputClasses}
          />
          {state.fieldErrors?.name_en && (
            <p className="text-xs text-red-600">{state.fieldErrors.name_en}</p>
          )}
        </FormField>
        <FormField label="Name (Hindi)" htmlFor="name_hi">
          <input
            id="name_hi"
            name="name_hi"
            defaultValue={initialValues?.name_hi}
            className={inputClasses}
          />
          {state.fieldErrors?.name_hi && (
            <p className="text-xs text-red-600">{state.fieldErrors.name_hi}</p>
          )}
        </FormField>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label="Description (English)" htmlFor="description_en">
          <textarea
            id="description_en"
            name="description_en"
            rows={3}
            defaultValue={initialValues?.description_en}
            className={inputClasses}
          />
        </FormField>
        <FormField label="Description (Hindi)" htmlFor="description_hi">
          <textarea
            id="description_hi"
            name="description_hi"
            rows={3}
            defaultValue={initialValues?.description_hi}
            className={inputClasses}
          />
        </FormField>
      </div>

      <FormField label="Slug (used in the URL, e.g. cbc-test-pokaran)" htmlFor="slug">
        <input
          id="slug"
          name="slug"
          defaultValue={initialValues?.slug}
          className={inputClasses}
        />
        {state.fieldErrors?.slug && (
          <p className="text-xs text-red-600">{state.fieldErrors.slug}</p>
        )}
      </FormField>

      <FormField label="Primary image" htmlFor="primary_image">
        {initialValues?.primary_image_url && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={initialValues.primary_image_url}
            alt=""
            className="mb-2 h-24 w-24 rounded-lg border border-brand-ink/10 bg-brand-ink/5 object-contain"
          />
        )}
        <input
          id="primary_image"
          name="primary_image"
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className={`${inputClasses} file:mr-3 file:rounded-md file:border-0 file:bg-brand-indigo file:px-3 file:py-1.5 file:text-xs file:text-brand-paper`}
        />
        {initialValues?.primary_image_url && (
          <label className="mt-1 flex items-center gap-2 text-xs text-brand-ink/60">
            <input type="checkbox" name="remove_image" className="h-3 w-3" />
            Remove current image
          </label>
        )}
      </FormField>

      <FormField label="Category" htmlFor="category_id">
        <select
          id="category_id"
          name="category_id"
          defaultValue={initialValues?.category_id ?? ""}
          className={inputClasses}
        >
          <option value="">— None —</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name_en}
            </option>
          ))}
        </select>
      </FormField>

      <div className="grid gap-4 sm:grid-cols-3">
        <FormField label="Sample type" htmlFor="sample_type">
          <input
            id="sample_type"
            name="sample_type"
            defaultValue={initialValues?.sample_type}
            className={inputClasses}
          />
          {state.fieldErrors?.sample_type && (
            <p className="text-xs text-red-600">{state.fieldErrors.sample_type}</p>
          )}
        </FormField>
        <FormField label="Price (₹)" htmlFor="price">
          <input
            id="price"
            name="price"
            type="number"
            min="0"
            step="1"
            defaultValue={initialValues?.price}
            className={inputClasses}
          />
          {state.fieldErrors?.price && (
            <p className="text-xs text-red-600">{state.fieldErrors.price}</p>
          )}
        </FormField>
        <FormField label="Report time" htmlFor="turnaround_time">
          <input
            id="turnaround_time"
            name="turnaround_time"
            placeholder="Same day"
            defaultValue={initialValues?.turnaround_time}
            className={inputClasses}
          />
          {state.fieldErrors?.turnaround_time && (
            <p className="text-xs text-red-600">{state.fieldErrors.turnaround_time}</p>
          )}
        </FormField>
      </div>

      <label className="flex items-center gap-2 text-sm text-brand-ink">
        <input
          type="checkbox"
          name="home_collection_available"
          defaultChecked={initialValues?.home_collection_available ?? true}
          className="h-4 w-4 accent-brand-teal"
        />
        Home collection available
      </label>

      <FormField label="Normal range (used to auto-fill and flag High/Low in report entry)" htmlFor="normal_range_type">
        <select
          id="normal_range_type"
          name="normal_range_type"
          value={rangeType}
          onChange={(e) => setRangeType(e.target.value as typeof rangeType)}
          className={inputClasses}
        >
          <option value="none">— None —</option>
          <option value="numeric">Numeric range (e.g. 12–16 g/dL)</option>
          <option value="text">Text (e.g. &ldquo;Negative&rdquo;, &ldquo;Non-reactive&rdquo;)</option>
          <option value="panel">Panel (multiple parameters, e.g. CBC)</option>
        </select>

        {rangeType === "panel" && (
          <div className="mt-3 flex flex-col gap-3 rounded-xl border border-brand-ink/10 bg-brand-paper p-3">
            <input type="hidden" name="panel_parameters_json" value={JSON.stringify(panelParams)} />

            <div className="flex flex-wrap items-end gap-2">
              <FormField label="Load a preset to start from" htmlFor="preset_picker" className="flex-1">
                <select
                  id="preset_picker"
                  value={presetId}
                  onChange={(e) => setPresetId(e.target.value)}
                  className={inputClasses}
                >
                  <option value="">— Select a preset —</option>
                  {REPORT_PRESETS.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.label}
                    </option>
                  ))}
                </select>
              </FormField>
              <Button type="button" variant="outline" onClick={loadPreset} disabled={!presetId}>
                Load
              </Button>
            </div>
            <p className="text-xs text-brand-ink/50">
              Presets are general adult reference ranges as a starting point — verify against this
              lab&rsquo;s equipment, then edit/add/remove rows freely before saving.
            </p>

            <div className="flex flex-col gap-2">
              {panelParams.map((param, i) => (
                <div key={i} className="grid grid-cols-12 items-center gap-2 rounded-lg border border-brand-ink/10 bg-white p-2">
                  <input
                    value={param.name}
                    onChange={(e) => updatePanelParam(i, { name: e.target.value })}
                    placeholder="Parameter name"
                    className={`${inputClasses} col-span-3`}
                  />
                  <select
                    value={param.type}
                    onChange={(e) =>
                      updatePanelParam(
                        i,
                        e.target.value === "numeric"
                          ? { type: "numeric", unit: "", low: 0, high: 0 }
                          : { type: "text", display: "" }
                      )
                    }
                    className={`${inputClasses} col-span-2`}
                  >
                    <option value="numeric">Numeric</option>
                    <option value="text">Text</option>
                  </select>
                  {param.type === "numeric" ? (
                    <>
                      <input
                        value={param.low}
                        onChange={(e) => updatePanelParam(i, { low: Number(e.target.value) })}
                        type="number"
                        step="any"
                        placeholder="Low"
                        className={`${inputClasses} col-span-2`}
                      />
                      <input
                        value={param.high}
                        onChange={(e) => updatePanelParam(i, { high: Number(e.target.value) })}
                        type="number"
                        step="any"
                        placeholder="High"
                        className={`${inputClasses} col-span-2`}
                      />
                      <input
                        value={param.unit}
                        onChange={(e) => updatePanelParam(i, { unit: e.target.value })}
                        placeholder="Unit"
                        className={`${inputClasses} col-span-2`}
                      />
                    </>
                  ) : (
                    <input
                      value={param.display}
                      onChange={(e) => updatePanelParam(i, { display: e.target.value })}
                      placeholder="Default value, e.g. Negative"
                      className={`${inputClasses} col-span-6`}
                    />
                  )}
                  <button
                    type="button"
                    onClick={() => removePanelParam(i)}
                    className="col-span-1 text-xs text-red-600 hover:underline"
                  >
                    Remove
                  </button>
                </div>
              ))}
              {panelParams.length === 0 && (
                <p className="text-sm text-brand-ink/50">No parameters yet — load a preset or add one below.</p>
              )}
            </div>
            <Button type="button" variant="outline" onClick={addPanelParam} className="w-fit">
              + Add parameter
            </Button>
          </div>
        )}

        {rangeType === "numeric" && (
          <div className="mt-2 grid grid-cols-3 gap-2">
            <input
              name="normal_range_low"
              type="number"
              step="any"
              placeholder="Low"
              defaultValue={template?.type === "numeric" ? template.low : undefined}
              className={inputClasses}
            />
            <input
              name="normal_range_high"
              type="number"
              step="any"
              placeholder="High"
              defaultValue={template?.type === "numeric" ? template.high : undefined}
              className={inputClasses}
            />
            <input
              name="normal_range_unit"
              placeholder="Unit (e.g. g/dL)"
              defaultValue={template?.type === "numeric" ? template.unit : undefined}
              className={inputClasses}
            />
          </div>
        )}
        {rangeType === "text" && (
          <input
            name="normal_range_text"
            placeholder="e.g. Negative"
            defaultValue={template?.type === "text" ? template.display : undefined}
            className={`${inputClasses} mt-2`}
          />
        )}
      </FormField>

      <FormField
        label="Custom fields (JSON — e.g. fasting requirement, home collection charge)"
        htmlFor="custom_fields"
      >
        <textarea
          id="custom_fields"
          name="custom_fields"
          rows={3}
          placeholder='{"fasting_required": "8-10 hours"}'
          defaultValue={
            initialValues?.custom_fields
              ? JSON.stringify(initialValues.custom_fields, null, 2)
              : ""
          }
          className={`${inputClasses} font-mono text-xs`}
        />
        {state.fieldErrors?.custom_fields && (
          <p className="text-xs text-red-600">{state.fieldErrors.custom_fields}</p>
        )}
      </FormField>

      {state.status === "error" && state.message && (
        <p className="text-sm text-red-600">{state.message}</p>
      )}

      <Button type="submit" disabled={pending} className="w-fit">
        {pending ? "Saving..." : "Save test"}
      </Button>
    </form>
  );
}

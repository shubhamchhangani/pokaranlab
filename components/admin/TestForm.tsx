"use client";

import { useActionState } from "react";
import { upsertTest, type TestFormState } from "@/lib/actions/catalog";
import { FormField, inputClasses } from "@/components/ui/FormField";
import { Button } from "@/components/ui/Button";
import type { TestCategory } from "@/lib/data/categories";

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
};

export function TestForm({
  categories,
  initialValues,
}: {
  categories: TestCategory[];
  initialValues?: TestFormInitialValues;
}) {
  const [state, formAction, pending] = useActionState(upsertTest, initialState);

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

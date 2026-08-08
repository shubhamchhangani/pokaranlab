"use client";

import { useActionState } from "react";
import { upsertPackage, type PackageFormState } from "@/lib/actions/packages";
import { FormField, inputClasses } from "@/components/ui/FormField";
import { Button } from "@/components/ui/Button";

const initialState: PackageFormState = { status: "idle" };

export type PackageFormInitialValues = {
  id: string;
  name_en: string;
  name_hi: string;
  description_en: string;
  description_hi: string;
  slug: string;
  price: number;
  custom_fields: Record<string, unknown> | null;
  includedTestIds: string[];
  primary_image_url: string | null;
};

export function PackageForm({
  tests,
  initialValues,
}: {
  tests: { id: string; name_en: string }[];
  initialValues?: PackageFormInitialValues;
}) {
  const [state, formAction, pending] = useActionState(upsertPackage, initialState);
  const includedSet = new Set(initialValues?.includedTestIds ?? []);

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

      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label="Slug (used in the URL, e.g. fever-panel-pokaran)" htmlFor="slug">
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
      </div>

      <FormField label="Primary image" htmlFor="primary_image">
        {initialValues?.primary_image_url && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={initialValues.primary_image_url}
            alt=""
            className="mb-2 h-24 w-24 rounded-lg border border-brand-ink/10 object-cover"
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

      <FormField label="Included tests" htmlFor="includedTestIds">
        <div className="grid max-h-56 gap-1 overflow-y-auto rounded-lg border border-brand-ink/15 bg-white p-3 sm:grid-cols-2">
          {tests.map((test) => (
            <label key={test.id} className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                name="includedTestIds"
                value={test.id}
                defaultChecked={includedSet.has(test.id)}
                className="h-4 w-4 accent-brand-teal"
              />
              {test.name_en}
            </label>
          ))}
          {tests.length === 0 && (
            <p className="text-sm text-brand-ink/50">No tests in the catalog yet.</p>
          )}
        </div>
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
        {pending ? "Saving..." : "Save package"}
      </Button>
    </form>
  );
}

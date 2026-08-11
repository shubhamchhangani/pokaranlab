"use client";

import { useActionState } from "react";
import { updateCategory, type CategoryFormState } from "@/lib/actions/categories";
import { FormField, inputClasses } from "@/components/ui/FormField";
import { Button } from "@/components/ui/Button";

const initialState: CategoryFormState = { status: "idle" };

export function CategoryEditForm({
  category,
}: {
  category: { id: string; name_en: string; name_hi: string; default_image_url: string | null };
}) {
  const [state, formAction, pending] = useActionState(updateCategory, initialState);

  return (
    <form action={formAction} className="flex max-w-xl flex-col gap-4">
      <input type="hidden" name="id" value={category.id} />

      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label="Name (English)" htmlFor="name_en">
          <input
            id="name_en"
            name="name_en"
            defaultValue={category.name_en}
            className={inputClasses}
          />
        </FormField>
        <FormField label="Name (Hindi)" htmlFor="name_hi">
          <input
            id="name_hi"
            name="name_hi"
            defaultValue={category.name_hi}
            className={inputClasses}
          />
        </FormField>
      </div>

      <FormField
        label="Default photo (shown on tests in this category with no photo of their own)"
        htmlFor="default_image"
      >
        {category.default_image_url && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={category.default_image_url}
            alt=""
            className="mb-2 h-24 w-24 rounded-lg border border-brand-ink/10 bg-brand-ink/5 object-contain"
          />
        )}
        <input
          id="default_image"
          name="default_image"
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className={`${inputClasses} file:mr-3 file:rounded-md file:border-0 file:bg-brand-indigo file:px-3 file:py-1.5 file:text-xs file:text-brand-paper`}
        />
        {category.default_image_url && (
          <label className="mt-1 flex items-center gap-2 text-xs text-brand-ink/60">
            <input type="checkbox" name="remove_image" className="h-3 w-3" />
            Remove current photo
          </label>
        )}
      </FormField>

      {state.status === "error" && <p className="text-sm text-red-600">{state.message}</p>}

      <Button type="submit" disabled={pending} className="w-fit">
        {pending ? "Saving..." : "Save Category"}
      </Button>
    </form>
  );
}

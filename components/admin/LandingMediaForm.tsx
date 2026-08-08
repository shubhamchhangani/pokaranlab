"use client";

import { useActionState, useRef, useEffect } from "react";
import { createLandingMedia, type LandingMediaFormState } from "@/lib/actions/media";
import { FormField, inputClasses } from "@/components/ui/FormField";
import { Button } from "@/components/ui/Button";

const initialState: LandingMediaFormState = { status: "idle" };

export function LandingMediaForm() {
  const [state, formAction, pending] = useActionState(createLandingMedia, initialState);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (!pending && state.status === "idle") {
      formRef.current?.reset();
    }
  }, [pending, state]);

  return (
    <form ref={formRef} action={formAction} className="flex flex-col gap-3">
      <div className="grid gap-3 sm:grid-cols-2">
        <FormField label="Image" htmlFor="image">
          <input
            id="image"
            name="image"
            type="file"
            required
            accept="image/jpeg,image/png,image/webp"
            className={`${inputClasses} file:mr-3 file:rounded-md file:border-0 file:bg-brand-indigo file:px-3 file:py-1.5 file:text-xs file:text-brand-paper`}
          />
        </FormField>
        <FormField label="Order (lower shows first)" htmlFor="sort_order">
          <input
            id="sort_order"
            name="sort_order"
            type="number"
            defaultValue={0}
            className={inputClasses}
          />
        </FormField>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <FormField label="Caption (English, optional)" htmlFor="caption_en">
          <input id="caption_en" name="caption_en" className={inputClasses} />
        </FormField>
        <FormField label="Caption (Hindi, optional)" htmlFor="caption_hi">
          <input id="caption_hi" name="caption_hi" className={inputClasses} />
        </FormField>
      </div>
      {state.status === "error" && <p className="text-sm text-red-600">{state.message}</p>}
      <Button type="submit" disabled={pending} className="w-fit">
        {pending ? "Uploading..." : "Add to Carousel"}
      </Button>
    </form>
  );
}

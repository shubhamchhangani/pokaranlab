"use client";

import { useActionState, useRef, useEffect } from "react";
import { createCategory, type CategoryFormState } from "@/lib/actions/categories";
import { FormField, inputClasses } from "@/components/ui/FormField";
import { Button } from "@/components/ui/Button";

const initialState: CategoryFormState = { status: "idle" };

export function CategoryForm() {
  const [state, formAction, pending] = useActionState(createCategory, initialState);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (!pending && state.status === "idle") {
      formRef.current?.reset();
    }
  }, [pending, state]);

  return (
    <form ref={formRef} action={formAction} className="flex flex-wrap items-end gap-3">
      <FormField label="Name (English)" htmlFor="name_en">
        <input id="name_en" name="name_en" required className={inputClasses} />
      </FormField>
      <FormField label="Name (Hindi)" htmlFor="name_hi">
        <input id="name_hi" name="name_hi" required className={inputClasses} />
      </FormField>
      <Button type="submit" disabled={pending}>
        {pending ? "Adding..." : "Add Category"}
      </Button>
      {state.status === "error" && <p className="text-sm text-red-600">{state.message}</p>}
    </form>
  );
}

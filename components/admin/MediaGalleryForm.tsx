"use client";

import { useActionState, useRef, useEffect } from "react";
import { upsertMedia, deleteMedia, type MediaFormState } from "@/lib/actions/media";
import { FormField, inputClasses } from "@/components/ui/FormField";
import { Button } from "@/components/ui/Button";

const initialState: MediaFormState = { status: "idle" };

export type GalleryMediaItem = {
  id: string;
  url: string;
  caption_en: string | null;
};

export function MediaGalleryForm({
  entityType,
  entityId,
  media,
  addButtonLabel = "Add Photo",
}: {
  entityType: "test" | "package" | "landing";
  /** Empty string for landing (no single entity_id) — never omit for test/package. */
  entityId: string;
  media: GalleryMediaItem[];
  addButtonLabel?: string;
}) {
  const [state, formAction, pending] = useActionState(upsertMedia, initialState);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (!pending && state.status === "idle") {
      formRef.current?.reset();
    }
  }, [pending, state]);

  return (
    <div className="flex flex-col gap-4">
      <form ref={formRef} action={formAction} className="flex flex-col gap-3">
        <input type="hidden" name="entity_type" value={entityType} />
        <input type="hidden" name="entity_id" value={entityId} />

        <div className="grid gap-3 sm:grid-cols-2">
          <FormField label="Image" htmlFor={`${entityType}-${entityId}-image`}>
            <input
              id={`${entityType}-${entityId}-image`}
              name="image"
              type="file"
              required
              accept="image/jpeg,image/png,image/webp"
              className={`${inputClasses} file:mr-3 file:rounded-md file:border-0 file:bg-brand-indigo file:px-3 file:py-1.5 file:text-xs file:text-brand-paper`}
            />
          </FormField>
          <FormField label="Order (lower shows first)" htmlFor={`${entityType}-${entityId}-sort`}>
            <input
              id={`${entityType}-${entityId}-sort`}
              name="sort_order"
              type="number"
              defaultValue={media.length}
              className={inputClasses}
            />
          </FormField>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <FormField label="Caption (English, optional)" htmlFor={`${entityType}-${entityId}-cap-en`}>
            <input id={`${entityType}-${entityId}-cap-en`} name="caption_en" className={inputClasses} />
          </FormField>
          <FormField label="Caption (Hindi, optional)" htmlFor={`${entityType}-${entityId}-cap-hi`}>
            <input id={`${entityType}-${entityId}-cap-hi`} name="caption_hi" className={inputClasses} />
          </FormField>
        </div>
        {state.status === "error" && <p className="text-sm text-red-600">{state.message}</p>}
        <Button type="submit" disabled={pending} className="w-fit">
          {pending ? "Uploading..." : addButtonLabel}
        </Button>
      </form>

      <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
        {media.map((item) => (
          <div key={item.id} className="overflow-hidden rounded-lg border border-brand-ink/10 bg-white">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={item.url} alt="" className="h-24 w-full object-cover" />
            <form action={deleteMedia} className="p-1.5">
              <input type="hidden" name="id" value={item.id} />
              <input type="hidden" name="entity_type" value={entityType} />
              <button className="w-full text-center text-xs text-red-600 hover:underline">
                Delete
              </button>
            </form>
          </div>
        ))}
        {media.length === 0 && (
          <p className="col-span-full text-sm text-brand-ink/50">No photos yet.</p>
        )}
      </div>
    </div>
  );
}

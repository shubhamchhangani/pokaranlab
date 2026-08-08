"use client";

import { useActionState } from "react";
import { updateSiteSettings, type SettingsFormState } from "@/lib/actions/settings";
import type { SiteInfo } from "@/lib/data/site";
import { FormField, inputClasses } from "@/components/ui/FormField";
import { Button } from "@/components/ui/Button";

const initialState: SettingsFormState = { status: "idle" };

export function SiteSettingsForm({ siteInfo }: { siteInfo: SiteInfo }) {
  const [state, formAction, pending] = useActionState(updateSiteSettings, initialState);

  return (
    <form action={formAction} className="flex max-w-2xl flex-col gap-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label="Name (English)" htmlFor="name_en">
          <input
            id="name_en"
            name="name_en"
            defaultValue={siteInfo.name_en}
            className={inputClasses}
          />
        </FormField>
        <FormField label="Name (Hindi)" htmlFor="name_hi">
          <input
            id="name_hi"
            name="name_hi"
            defaultValue={siteInfo.name_hi}
            className={inputClasses}
          />
        </FormField>
        <FormField label="Short name" htmlFor="short_name" className="sm:col-span-2">
          <input
            id="short_name"
            name="short_name"
            defaultValue={siteInfo.shortName}
            className={inputClasses}
          />
        </FormField>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label="Address (English)" htmlFor="address_en">
          <textarea
            id="address_en"
            name="address_en"
            rows={2}
            defaultValue={siteInfo.address_en}
            className={inputClasses}
          />
        </FormField>
        <FormField label="Address (Hindi)" htmlFor="address_hi">
          <textarea
            id="address_hi"
            name="address_hi"
            rows={2}
            defaultValue={siteInfo.address_hi}
            className={inputClasses}
          />
        </FormField>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <FormField label="Phone" htmlFor="phone">
          <input
            id="phone"
            name="phone"
            defaultValue={siteInfo.phone}
            className={inputClasses}
          />
        </FormField>
        <FormField label="WhatsApp number (with country code, no +)" htmlFor="whatsapp">
          <input
            id="whatsapp"
            name="whatsapp"
            defaultValue={siteInfo.whatsapp}
            className={inputClasses}
          />
        </FormField>
        <FormField label="Email" htmlFor="email">
          <input
            id="email"
            name="email"
            type="email"
            defaultValue={siteInfo.email}
            className={inputClasses}
          />
        </FormField>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label="Hours (English)" htmlFor="hours_en">
          <input
            id="hours_en"
            name="hours_en"
            defaultValue={siteInfo.hours_en}
            className={inputClasses}
          />
        </FormField>
        <FormField label="Hours (Hindi)" htmlFor="hours_hi">
          <input
            id="hours_hi"
            name="hours_hi"
            defaultValue={siteInfo.hours_hi}
            className={inputClasses}
          />
        </FormField>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label="Google Maps embed URL" htmlFor="maps_embed_url">
          <input
            id="maps_embed_url"
            name="maps_embed_url"
            defaultValue={siteInfo.mapsEmbedUrl}
            className={inputClasses}
          />
        </FormField>
        <FormField label="Google Maps directions URL" htmlFor="maps_directions_url">
          <input
            id="maps_directions_url"
            name="maps_directions_url"
            defaultValue={siteInfo.mapsDirectionsUrl}
            className={inputClasses}
          />
        </FormField>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <FormField
          label="Latitude (from the Google Maps pin — used in search-engine location data)"
          htmlFor="geo_lat"
        >
          <input
            id="geo_lat"
            name="geo_lat"
            type="number"
            step="any"
            defaultValue={siteInfo.geoLat ?? undefined}
            className={inputClasses}
          />
        </FormField>
        <FormField label="Longitude" htmlFor="geo_lng">
          <input
            id="geo_lng"
            name="geo_lng"
            type="number"
            step="any"
            defaultValue={siteInfo.geoLng ?? undefined}
            className={inputClasses}
          />
        </FormField>
      </div>

      <FormField
        label="Google review link (used by the “Request Review” button on Bookings)"
        htmlFor="google_review_url"
      >
        <input
          id="google_review_url"
          name="google_review_url"
          defaultValue={siteInfo.googleReviewUrl ?? ""}
          className={inputClasses}
        />
        {state.fieldErrors?.google_review_url && (
          <p className="text-xs text-red-600">{state.fieldErrors.google_review_url}</p>
        )}
      </FormField>

      {state.status === "error" && (
        <p className="text-sm text-red-600">{state.message}</p>
      )}
      {state.status === "success" && (
        <p className="text-sm text-brand-teal">Saved — the site now shows these details.</p>
      )}

      <Button type="submit" disabled={pending} className="w-fit">
        {pending ? "Saving..." : "Save changes"}
      </Button>
    </form>
  );
}

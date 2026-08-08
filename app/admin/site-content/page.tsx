import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/auth/admin";
import { getLandingMedia } from "@/lib/data/media";
import { MediaGalleryForm } from "@/components/admin/MediaGalleryForm";

export default async function AdminSiteContentPage() {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");

  const media = await getLandingMedia();

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-brand-indigo">Site Content</h1>
      <p className="mt-1 text-sm text-brand-ink/60">
        Photos shown in the homepage hero carousel. Contact info and hours are under Site
        Settings instead.
      </p>

      <div className="mt-6 rounded-2xl border border-brand-ink/10 bg-white p-4">
        <MediaGalleryForm
          entityType="landing"
          entityId=""
          media={media}
          addButtonLabel="Add to Carousel"
        />
      </div>
    </div>
  );
}

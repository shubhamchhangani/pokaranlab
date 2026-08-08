import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/auth/admin";
import { getLandingMedia } from "@/lib/data/media";
import { deleteLandingMedia } from "@/lib/actions/media";
import { LandingMediaForm } from "@/components/admin/LandingMediaForm";

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
        <LandingMediaForm />
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {media.map((item) => (
          <div
            key={item.id}
            className="overflow-hidden rounded-2xl border border-brand-ink/10 bg-white"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={item.url} alt="" className="h-32 w-full object-cover" />
            <div className="p-3">
              <p className="text-xs text-brand-ink/60">{item.caption_en || "No caption"}</p>
              <form action={deleteLandingMedia} className="mt-2">
                <input type="hidden" name="id" value={item.id} />
                <button className="text-xs text-red-600 hover:underline">Delete</button>
              </form>
            </div>
          </div>
        ))}
        {media.length === 0 && (
          <p className="text-sm text-brand-ink/50">
            No carousel images yet — the homepage hero shows text only until you add some.
          </p>
        )}
      </div>
    </div>
  );
}

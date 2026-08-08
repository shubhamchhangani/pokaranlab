import { notFound, redirect } from "next/navigation";
import { getAdminSession } from "@/lib/auth/admin";
import { createClient } from "@/lib/supabase/server";
import { getTestCategories } from "@/lib/data/categories";
import { getEntityMedia } from "@/lib/data/media";
import { deleteTest } from "@/lib/actions/catalog";
import { TestForm } from "@/components/admin/TestForm";
import { MediaGalleryForm } from "@/components/admin/MediaGalleryForm";

export default async function EditTestPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");

  const { id } = await params;
  const supabase = await createClient();
  const [{ data: test }, categories, gallery] = await Promise.all([
    supabase.from("tests").select("*").eq("id", id).maybeSingle(),
    getTestCategories(),
    getEntityMedia("test", id),
  ]);

  if (!test) notFound();

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-semibold text-brand-indigo">Edit Test</h1>
        <form action={deleteTest}>
          <input type="hidden" name="id" value={test.id} />
          <button className="text-sm font-medium text-red-600 hover:underline">Delete</button>
        </form>
      </div>
      <div className="mt-6">
        <TestForm categories={categories} initialValues={test} />
      </div>

      <div className="mt-10">
        <h2 className="font-display text-lg font-semibold text-brand-indigo">Photo Gallery</h2>
        <p className="mt-1 text-sm text-brand-ink/60">
          Extra photos shown on this test&rsquo;s public page, separate from the primary image
          above.
        </p>
        <div className="mt-4">
          <MediaGalleryForm entityType="test" entityId={test.id} media={gallery} />
        </div>
      </div>
    </div>
  );
}

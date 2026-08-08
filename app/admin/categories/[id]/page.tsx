import { notFound, redirect } from "next/navigation";
import { getAdminSession } from "@/lib/auth/admin";
import { createClient } from "@/lib/supabase/server";
import { deleteCategory } from "@/lib/actions/categories";
import { CategoryEditForm } from "@/components/admin/CategoryEditForm";

export default async function EditCategoryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");

  const { id } = await params;
  const supabase = await createClient();
  const { data: category } = await supabase
    .from("test_categories")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (!category) notFound();

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-semibold text-brand-indigo">Edit Category</h1>
        <form action={deleteCategory}>
          <input type="hidden" name="id" value={category.id} />
          <button className="text-sm font-medium text-red-600 hover:underline">Delete</button>
        </form>
      </div>
      <div className="mt-6">
        <CategoryEditForm category={category} />
      </div>
    </div>
  );
}

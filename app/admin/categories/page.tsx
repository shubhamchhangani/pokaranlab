import { redirect } from "next/navigation";
import Link from "next/link";
import { getAdminSession } from "@/lib/auth/admin";
import { createClient } from "@/lib/supabase/server";
import { deleteCategory } from "@/lib/actions/categories";
import { CategoryForm } from "@/components/admin/CategoryForm";

export default async function AdminCategoriesPage() {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");

  const supabase = await createClient();
  const { data: categories } = await supabase
    .from("test_categories")
    .select("id, name_en, name_hi, default_image_url")
    .order("name_en");

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-brand-indigo">Test Categories</h1>

      <div className="mt-6 rounded-2xl border border-brand-ink/10 bg-white p-4">
        <CategoryForm />
      </div>

      <div className="mt-6 overflow-x-auto rounded-2xl border border-brand-ink/10 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-brand-ink/10 text-brand-ink/60">
            <tr>
              <th className="px-4 py-3">Photo</th>
              <th className="px-4 py-3">English</th>
              <th className="px-4 py-3">Hindi</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {(categories ?? []).map((category) => (
              <tr key={category.id} className="border-b border-brand-ink/5 last:border-0">
                <td className="px-4 py-3">
                  {category.default_image_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={category.default_image_url}
                      alt=""
                      className="h-8 w-8 rounded object-cover"
                    />
                  ) : (
                    <span className="text-xs text-brand-ink/40">—</span>
                  )}
                </td>
                <td className="px-4 py-3">{category.name_en}</td>
                <td className="px-4 py-3">{category.name_hi}</td>
                <td className="px-4 py-3 text-right">
                  <Link
                    href={`/admin/categories/${category.id}`}
                    className="mr-4 text-brand-teal hover:underline"
                  >
                    Edit
                  </Link>
                  <form action={deleteCategory} className="inline">
                    <input type="hidden" name="id" value={category.id} />
                    <button className="text-red-600 hover:underline">Delete</button>
                  </form>
                </td>
              </tr>
            ))}
            {(!categories || categories.length === 0) && (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-brand-ink/50">
                  No categories yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

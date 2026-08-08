import { redirect } from "next/navigation";
import Link from "next/link";
import { getAdminSession } from "@/lib/auth/admin";
import { createClient } from "@/lib/supabase/server";
import { deleteTest } from "@/lib/actions/catalog";
import { buttonClasses } from "@/components/ui/Button";

export default async function AdminCatalogPage() {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");

  const supabase = await createClient();
  const { data: tests } = await supabase
    .from("tests")
    .select("id, name_en, price, sample_type")
    .order("name_en")
    .limit(100);

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-semibold text-brand-indigo">Catalog</h1>
        <Link href="/admin/catalog/new" className={buttonClasses("primary")}>
          Add Test
        </Link>
      </div>

      <div className="mt-6 overflow-x-auto rounded-2xl border border-brand-ink/10 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-brand-ink/10 text-brand-ink/60">
            <tr>
              <th className="px-4 py-3">Test</th>
              <th className="px-4 py-3">Sample</th>
              <th className="px-4 py-3">Price</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {(tests ?? []).map((test) => (
              <tr key={test.id} className="border-b border-brand-ink/5 last:border-0">
                <td className="px-4 py-3">{test.name_en}</td>
                <td className="px-4 py-3">{test.sample_type}</td>
                <td className="px-4 py-3">₹{test.price}</td>
                <td className="px-4 py-3 text-right">
                  <Link
                    href={`/admin/catalog/${test.id}`}
                    className="mr-4 text-brand-teal hover:underline"
                  >
                    Edit
                  </Link>
                  <form action={deleteTest} className="inline">
                    <input type="hidden" name="id" value={test.id} />
                    <button className="text-red-600 hover:underline">Delete</button>
                  </form>
                </td>
              </tr>
            ))}
            {(!tests || tests.length === 0) && (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-brand-ink/50">
                  No tests in the catalog yet — click &ldquo;Add Test&rdquo; to create one.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

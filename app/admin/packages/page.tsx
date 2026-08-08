import { redirect } from "next/navigation";
import Link from "next/link";
import { getAdminSession } from "@/lib/auth/admin";
import { createClient } from "@/lib/supabase/server";
import { deletePackage } from "@/lib/actions/packages";
import { buttonClasses } from "@/components/ui/Button";

export default async function AdminPackagesPage() {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");

  const supabase = await createClient();
  const { data: packages } = await supabase
    .from("packages")
    .select("id, name_en, price")
    .order("name_en")
    .limit(100);

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-semibold text-brand-indigo">Packages</h1>
        <Link href="/admin/packages/new" className={buttonClasses("primary")}>
          Add Package
        </Link>
      </div>

      <div className="mt-6 overflow-x-auto rounded-2xl border border-brand-ink/10 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-brand-ink/10 text-brand-ink/60">
            <tr>
              <th className="px-4 py-3">Package</th>
              <th className="px-4 py-3">Price</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {(packages ?? []).map((pkg) => (
              <tr key={pkg.id} className="border-b border-brand-ink/5 last:border-0">
                <td className="px-4 py-3">{pkg.name_en}</td>
                <td className="px-4 py-3">₹{pkg.price}</td>
                <td className="px-4 py-3 text-right">
                  <Link
                    href={`/admin/packages/${pkg.id}`}
                    className="mr-4 text-brand-teal hover:underline"
                  >
                    Edit
                  </Link>
                  <form action={deletePackage} className="inline">
                    <input type="hidden" name="id" value={pkg.id} />
                    <button className="text-red-600 hover:underline">Delete</button>
                  </form>
                </td>
              </tr>
            ))}
            {(!packages || packages.length === 0) && (
              <tr>
                <td colSpan={3} className="px-4 py-8 text-center text-brand-ink/50">
                  No packages yet — click &ldquo;Add Package&rdquo; to create one.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

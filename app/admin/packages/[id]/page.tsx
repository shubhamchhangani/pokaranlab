import { notFound, redirect } from "next/navigation";
import { getAdminSession } from "@/lib/auth/admin";
import { createClient } from "@/lib/supabase/server";
import { deletePackage } from "@/lib/actions/packages";
import { PackageForm } from "@/components/admin/PackageForm";

export default async function EditPackagePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");

  const { id } = await params;
  const supabase = await createClient();

  const [{ data: pkg }, { data: tests }, { data: links }] = await Promise.all([
    supabase.from("packages").select("*").eq("id", id).maybeSingle(),
    supabase.from("tests").select("id, name_en").order("name_en"),
    supabase.from("package_tests").select("test_id").eq("package_id", id),
  ]);

  if (!pkg) notFound();

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-semibold text-brand-indigo">Edit Package</h1>
        <form action={deletePackage}>
          <input type="hidden" name="id" value={pkg.id} />
          <button className="text-sm font-medium text-red-600 hover:underline">Delete</button>
        </form>
      </div>
      <div className="mt-6">
        <PackageForm
          tests={tests ?? []}
          initialValues={{
            ...pkg,
            includedTestIds: (links ?? []).map((l) => l.test_id),
          }}
        />
      </div>
    </div>
  );
}

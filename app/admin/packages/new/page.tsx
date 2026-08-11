import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/auth/admin";
import { createClient } from "@/lib/supabase/server";
import { PackageForm } from "@/components/admin/PackageForm";

export default async function NewPackagePage() {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");

  const supabase = await createClient();
  const { data: tests } = await supabase.from("tests").select("id, name_en").order("name_en");

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-brand-indigo">Add Package</h1>
      <p className="mt-1 text-sm text-brand-ink/60">
        Save this package first — the photo gallery option appears on its edit page afterward.
      </p>
      <div className="mt-6">
        <PackageForm tests={tests ?? []} />
      </div>
    </div>
  );
}

import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/auth/admin";
import { getTestCategories } from "@/lib/data/categories";
import { TestForm } from "@/components/admin/TestForm";

export default async function NewTestPage() {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");

  const categories = await getTestCategories();

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-brand-indigo">Add Test</h1>
      <p className="mt-1 text-sm text-brand-ink/60">
        Save this test first — the photo gallery option appears on its edit page afterward.
      </p>
      <div className="mt-6">
        <TestForm categories={categories} />
      </div>
    </div>
  );
}

import { notFound, redirect } from "next/navigation";
import { getAdminSession } from "@/lib/auth/admin";
import { createClient } from "@/lib/supabase/server";
import { getTestCategories } from "@/lib/data/categories";
import { deleteTest } from "@/lib/actions/catalog";
import { TestForm } from "@/components/admin/TestForm";

export default async function EditTestPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");

  const { id } = await params;
  const supabase = await createClient();
  const [{ data: test }, categories] = await Promise.all([
    supabase.from("tests").select("*").eq("id", id).maybeSingle(),
    getTestCategories(),
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
    </div>
  );
}

import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/auth/admin";
import { getSiteInfo } from "@/lib/data/site";
import { SiteSettingsForm } from "@/components/admin/SiteSettingsForm";

export default async function AdminSettingsPage() {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");

  const siteInfo = await getSiteInfo();

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-brand-indigo">Site Settings</h1>
      <p className="mt-1 text-sm text-brand-ink/60">
        Contact details, hours, and map links shown across the public site.
      </p>

      <div className="mt-6">
        <SiteSettingsForm siteInfo={siteInfo} />
      </div>
    </div>
  );
}

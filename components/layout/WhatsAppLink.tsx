import { getSiteInfo } from "@/lib/data/site";
import { buttonClasses } from "@/components/ui/Button";

export async function WhatsAppLink({
  message,
  className = "",
  children,
}: {
  message: string;
  className?: string;
  children: React.ReactNode;
}) {
  const siteInfo = await getSiteInfo();
  const href = `https://wa.me/${siteInfo.whatsapp}?text=${encodeURIComponent(message)}`;
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={className || buttonClasses("whatsapp")}
    >
      {children}
    </a>
  );
}

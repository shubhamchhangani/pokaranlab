import { siteInfo } from "@/lib/data/mock-content";
import { buttonClasses } from "@/components/ui/Button";

export function WhatsAppLink({
  message,
  className = "",
  children,
}: {
  message: string;
  className?: string;
  children: React.ReactNode;
}) {
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

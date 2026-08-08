import type { HTMLAttributes } from "react";

export function Badge({ className = "", ...props }: HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={`inline-flex items-center rounded-full bg-brand-teal/10 px-3 py-1 text-xs font-medium text-brand-teal ${className}`}
      {...props}
    />
  );
}

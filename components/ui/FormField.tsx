export function FormField({
  label,
  htmlFor,
  children,
  className = "",
}: {
  label: string;
  htmlFor: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      <label htmlFor={htmlFor} className="text-sm font-medium text-brand-ink">
        {label}
      </label>
      {children}
    </div>
  );
}

export const inputClasses =
  "rounded-lg border border-brand-ink/15 bg-white px-4 py-2.5 text-sm text-brand-ink outline-none focus:border-brand-teal focus:ring-1 focus:ring-brand-teal";

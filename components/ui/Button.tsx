import type { ButtonHTMLAttributes } from "react";

export type ButtonVariant = "primary" | "secondary" | "outline" | "whatsapp";

const variantClasses: Record<ButtonVariant, string> = {
  primary: "bg-brand-indigo text-brand-paper hover:bg-brand-indigo/90",
  secondary: "bg-brand-sandstone text-brand-ink hover:bg-brand-sandstone/90",
  outline: "border border-brand-indigo text-brand-indigo hover:bg-brand-indigo/5",
  whatsapp: "bg-[#25D366] text-white hover:bg-[#25D366]/90",
};

/** Class string for anything styled like a button — <button>, <Link>, or a plain <a>. */
export function buttonClasses(variant: ButtonVariant = "primary", className = "") {
  return `inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-medium transition-colors ${variantClasses[variant]} ${className}`;
}

export function Button({
  variant = "primary",
  className = "",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: ButtonVariant }) {
  return <button className={buttonClasses(variant, className)} {...props} />;
}

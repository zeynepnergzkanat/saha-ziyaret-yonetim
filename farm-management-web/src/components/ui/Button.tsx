import type { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "secondary" | "danger" | "link" | "dangerLink";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
}

const variantClasses: Record<Variant, string> = {
  primary:
    "rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-60",
  secondary:
    "rounded-md border border-slate-300 px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 disabled:opacity-50",
  danger:
    "rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-60",
  link: "text-sm text-emerald-700 hover:underline disabled:opacity-50",
  dangerLink: "text-sm text-red-600 hover:underline disabled:opacity-50",
};

export default function Button({
  variant = "primary",
  className = "",
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={`${variantClasses[variant]} ${className}`.trim()}
      {...props}
    />
  );
}
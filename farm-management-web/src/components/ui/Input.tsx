import type { InputHTMLAttributes } from "react";
import FormField from "./FormField";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  id: string;
  label: string;
  error?: string;
}

export const controlClass =
  "w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-emerald-600";

export default function Input({
  id,
  label,
  error,
  className = "",
  ...props
}: InputProps) {
  return (
    <FormField id={id} label={label} error={error}>
      <input id={id} className={`${controlClass} ${className}`.trim()} {...props} />
    </FormField>
  );
}
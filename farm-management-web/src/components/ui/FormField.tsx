import type { ReactNode } from "react";

interface FormFieldProps {
  id: string;
  label: string;
  error?: string;
  children: ReactNode;
}

export default function FormField({ id, label, error, children }: FormFieldProps) {
  return (
    <div className="mb-3">
      <label className="mb-1 block text-sm font-medium" htmlFor={id}>
        {label}
      </label>
      {children}
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}
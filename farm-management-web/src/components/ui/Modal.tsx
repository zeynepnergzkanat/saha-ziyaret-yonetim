import type { ReactNode } from "react";

interface ModalProps {
  title: string;
  children: ReactNode;
}

export default function Modal({ title, children }: ModalProps) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={title}
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/40 px-4 py-6"
    >
      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-lg">
        <h2 className="mb-4 text-lg font-semibold">{title}</h2>
        {children}
      </div>
    </div>
  );
}
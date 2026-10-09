"use client";

import { useEffect } from "react";
import type { ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useAppSelector } from "@/store/hooks";

export default function AuthGuard({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { token, hydrated } = useAppSelector((state) => state.auth);

  useEffect(() => {
    if (hydrated && !token) {
      router.replace("/login");
    }
  }, [hydrated, token, router]);

  if (!hydrated || !token) {
    return (
      <div className="flex flex-1 items-center justify-center text-slate-500">
        Yükleniyor...
      </div>
    );
  }

  return <>{children}</>;
}
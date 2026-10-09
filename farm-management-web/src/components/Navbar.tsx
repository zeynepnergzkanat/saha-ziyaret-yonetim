"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { logout } from "@/store/authSlice";

const links = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/farmers", label: "Çiftçiler" },
  { href: "/visits", label: "Ziyaretler" },
];

export default function Navbar() {
  const pathname = usePathname();
  const dispatch = useAppDispatch();
  const username = useAppSelector((state) => state.auth.username);

  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <div className="flex items-center gap-6">
          <span className="font-semibold text-emerald-700">Saha Ziyaret Sistemi</span>
          <nav className="flex gap-4">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={
                  pathname.startsWith(link.href)
                    ? "text-sm font-medium text-emerald-700"
                    : "text-sm text-slate-600 hover:text-slate-900"
                }
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-3 text-sm">
          <span className="text-slate-600">{username}</span>
          <button
            onClick={() => dispatch(logout())}
            className="rounded-md border border-slate-300 px-3 py-1 text-slate-700 hover:bg-slate-100"
          >
            Çıkış
          </button>
        </div>
      </div>
    </header>
  );
}
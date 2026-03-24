"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { LogoutButton } from "@/components/auth/logout-button";
import { SiteFooter } from "@/components/layout/site-footer";

const links = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/productos", label: "Productos" },
  { href: "/admin/materiales", label: "Materiales" },
  { href: "/admin/ventas", label: "Ventas" },
] as const;

export function AdminShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const activeHref = links
    .filter(
      (link) =>
        pathname === link.href || pathname.startsWith(`${link.href}/`)
    )
    .sort((a, b) => b.href.length - a.href.length)[0]?.href;

  return (
    <div className="min-h-screen bg-[#f5f2ee] text-[#1f1f1f]">
      <div className="flex">
        <aside className="w-64 shrink-0 border-r border-[#e7e3dc] bg-white px-4 py-6">
          <div className="mb-6">
            <p className="text-lg font-semibold">Admin Galeria Deluxe Medellin</p>
            <p className="mt-1 text-xs text-[#666]">
              RBAC, catalogo y ventas (nuevo esquema)
            </p>
          </div>

          <nav className="space-y-1">
            {links.map((link) => {
              const active = link.href === activeHref;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`block rounded-xl px-3 py-2 text-sm transition ${
                    active
                      ? "bg-[#1f1f1f] font-semibold text-white"
                      : "text-[#575757] hover:bg-[#f6f5f3]"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          <div className="mt-6">
            <LogoutButton
              label="Salir"
              className="w-full rounded-xl border border-[#e7e3dc] px-3 py-2 text-sm font-medium text-[#333]"
            />
          </div>
        </aside>

        <main className="flex-1">
          <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
            {children}
          </div>
          <SiteFooter />
        </main>
      </div>
    </div>
  );
}

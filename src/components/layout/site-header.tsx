"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { HeaderCartMenu } from "@/components/layout/header-cart-menu";

const navLinks = [
  { href: "/", label: "Inicio" },
  { href: "/productos", label: "Productos" },
  { href: "/favoritos", label: "Favoritos" },
] as const;

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function SiteHeader() {
  const pathname = usePathname();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadSession() {
      try {
        const res = await fetch("/api/auth/me", { cache: "no-store" });
        if (!res.ok) return;
        const data = (await res.json()) as { user: { id: string } | null };
        if (!cancelled) setIsLoggedIn(Boolean(data.user));
      } catch {
        if (!cancelled) setIsLoggedIn(false);
      }
    }

    void loadSession();
    return () => {
      cancelled = true;
    };
  }, []);

  const visibleLinks = isLoggedIn
    ? [...navLinks, { href: "/mi-cuenta", label: "Mi cuenta" as const }]
    : navLinks;

  return (
    <header className="mx-auto flex w-full max-w-6xl items-center justify-between gap-3 px-4 py-5 sm:px-6 lg:px-8">
      <p className="text-lg font-semibold tracking-tight sm:text-xl">
        Galeria Deluxe Medellin
      </p>
      <nav className="hidden gap-6 text-sm text-[#575757] md:flex">
        {visibleLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={
              isActive(pathname, link.href) ? "font-semibold text-[#1f1f1f]" : ""
            }
          >
            {link.label}
          </Link>
        ))}
      </nav>
      <div className="flex items-center gap-1 sm:gap-2">
        <HeaderCartMenu />
        <Link
          href="/login"
          className="hidden rounded-full bg-[#1f1f1f] px-4 py-2 text-sm text-white sm:inline-flex"
        >
          Login
        </Link>
        <button
          type="button"
          className="inline-flex rounded-full bg-[#1f1f1f] px-3 py-2 text-xs text-white sm:hidden"
          aria-label="Abrir menu"
        >
          Menu
        </button>
      </div>
    </header>
  );
}

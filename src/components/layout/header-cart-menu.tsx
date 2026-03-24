"use client";

import Image from "next/image";
import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  GUEST_CART_CHANGED_EVENT,
  GUEST_CART_KEY,
  readGuestCart,
  type GuestCartItem,
} from "@/lib/guest-cart";

function parsePrice(value: string) {
  return Number(value.replace(/[^0-9]/g, ""));
}

function formatPrice(value: number) {
  return new Intl.NumberFormat("es-CO").format(value);
}

function useMediaMd() {
  const [md, setMd] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    const update = () => setMd(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);
  return md;
}

export function HeaderCartMenu() {
  const isMd = useMediaMd();
  const [mounted, setMounted] = useState(false);
  const [items, setItems] = useState<GuestCartItem[]>([]);
  const [hoverOpen, setHoverOpen] = useState(false);
  const [clickOpen, setClickOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const leaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const refresh = useCallback(() => {
    setItems(readGuestCart());
  }, []);

  useEffect(() => {
    refresh();
    const onStorage = (e: StorageEvent) => {
      if (e.key === GUEST_CART_KEY || e.key === null) refresh();
    };
    window.addEventListener("storage", onStorage);
    window.addEventListener(GUEST_CART_CHANGED_EVENT, refresh);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener(GUEST_CART_CHANGED_EVENT, refresh);
    };
  }, [refresh]);

  useEffect(() => {
    return () => {
      if (leaveTimer.current) clearTimeout(leaveTimer.current);
    };
  }, []);

  const totalQty = useMemo(
    () => items.reduce((sum, i) => sum + i.quantity, 0),
    [items]
  );

  const subtotal = useMemo(
    () => items.reduce((acc, i) => acc + parsePrice(i.price) * i.quantity, 0),
    [items]
  );

  const panelOpen = mounted && (isMd ? hoverOpen : clickOpen);

  function cancelCloseTimer() {
    if (leaveTimer.current) {
      clearTimeout(leaveTimer.current);
      leaveTimer.current = null;
    }
  }

  function scheduleHoverClose() {
    cancelCloseTimer();
    leaveTimer.current = setTimeout(() => setHoverOpen(false), 180);
  }

  useEffect(() => {
    if (!clickOpen) return;
    function close(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setClickOpen(false);
      }
    }
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [clickOpen]);

  return (
    <div
      ref={wrapRef}
      className="relative"
      onMouseEnter={() => {
        if (!isMd) return;
        cancelCloseTimer();
        setHoverOpen(true);
      }}
      onMouseLeave={() => {
        if (!isMd) return;
        scheduleHoverClose();
      }}
    >
      <button
        type="button"
        className="relative rounded-full p-2 text-[#575757] transition-colors hover:bg-[#ece8df]/70 hover:text-[#1f1f1f]"
        aria-label={`Carrito, ${totalQty} artículos`}
        aria-expanded={panelOpen}
        aria-haspopup="true"
        onClick={() => {
          if (!mounted) return;
          if (!isMd) setClickOpen((o) => !o);
        }}
        onMouseEnter={() => {
          if (isMd) cancelCloseTimer();
        }}
      >
        <ShoppingCart className="h-5 w-5" strokeWidth={2} aria-hidden />
        {totalQty > 0 ? (
          <span className="absolute -right-0.5 -top-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-[#1f1f1f] px-1 text-[10px] font-bold leading-none text-white shadow-sm">
            {totalQty > 99 ? "99+" : totalQty}
          </span>
        ) : null}
      </button>

      {panelOpen ? (
        <div
          className="absolute right-0 top-full z-50 w-[min(calc(100vw-2rem),22rem)] -mt-1 pt-1"
          onMouseEnter={() => {
            if (isMd) cancelCloseTimer();
          }}
          onMouseLeave={() => {
            if (isMd) scheduleHoverClose();
          }}
        >
          <div className="flex max-h-[min(70vh,24rem)] flex-col overflow-hidden rounded-2xl border border-[#e7e3dc] bg-white shadow-xl ring-1 ring-black/5">
            <div className="border-b border-[#ece8df] px-4 py-3">
              <p className="text-sm font-semibold text-[#1f1f1f]">Tu carrito</p>
              <p className="text-xs text-[#666]">
                {totalQty === 0
                  ? "Sin artículos"
                  : `${totalQty} ${totalQty === 1 ? "artículo" : "artículos"}`}
              </p>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-2 py-2">
              {items.length === 0 ? (
                <p className="px-2 py-6 text-center text-sm text-[#666]">
                  Aún no hay productos. Explora el catálogo.
                </p>
              ) : (
                <ul className="space-y-2">
                  {items.map((item) => (
                    <li
                      key={item.slug}
                      className="flex gap-3 rounded-xl border border-[#ece8df] bg-[#faf9f7] p-2"
                    >
                      <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg">
                        <Image
                          src={item.image}
                          alt={item.name}
                          fill
                          className="object-cover"
                          sizes="56px"
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="line-clamp-2 text-xs font-medium text-[#1f1f1f]">
                          {item.name}
                        </p>
                        <p className="mt-0.5 text-[11px] text-[#666]">
                          {item.quantity} × {item.price}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {items.length > 0 ? (
              <div className="border-t border-[#ece8df] px-4 py-3">
                <div className="mb-3 flex items-center justify-between text-sm">
                  <span className="text-[#666]">Subtotal</span>
                  <span className="font-semibold">${formatPrice(subtotal)}</span>
                </div>
                <div className="grid gap-2">
                  <Link
                    href="/carrito"
                    onClick={() => {
                      setClickOpen(false);
                      setHoverOpen(false);
                    }}
                    className="block w-full rounded-full border border-[#e7e3dc] bg-white py-2.5 text-center text-sm font-semibold text-[#1f1f1f] hover:bg-[#f6f5f3]"
                  >
                    Ver carrito
                  </Link>
                  <Link
                    href="/checkout"
                    onClick={() => {
                      setClickOpen(false);
                      setHoverOpen(false);
                    }}
                    className="block w-full rounded-full bg-[#1f1f1f] py-2.5 text-center text-sm font-semibold text-white"
                  >
                    Finalizar compra
                  </Link>
                </div>
              </div>
            ) : (
              <div className="border-t border-[#ece8df] px-4 py-3">
                <Link
                  href="/productos"
                  onClick={() => setClickOpen(false)}
                  className="block w-full rounded-full bg-[#1f1f1f] py-2.5 text-center text-sm font-semibold text-white"
                >
                  Ver productos
                </Link>
              </div>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}

"use client";

import Image from "next/image";
import Link from "next/link";
import { startTransition, useEffect, useMemo, useState } from "react";
import {
  readGuestCart,
  writeGuestCart,
  type GuestCartItem,
} from "@/lib/guest-cart";

function parsePrice(value: string) {
  return Number(value.replace(/[^0-9]/g, ""));
}

function formatPrice(value: number) {
  return new Intl.NumberFormat("es-CO").format(value);
}

export function CartClient() {
  const [items, setItems] = useState<GuestCartItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    startTransition(() => {
      setItems(readGuestCart());
      setLoading(false);
    });
  }, []);

  const subtotal = useMemo(
    () =>
      items.reduce(
        (acc, item) => acc + parsePrice(item.price) * item.quantity,
        0
      ),
    [items]
  );
  const shipping = items.length > 0 ? 30000 : 0;
  const total = subtotal + shipping;

  function persist(next: GuestCartItem[]) {
    writeGuestCart(next);
    setItems(next);
  }

  function setLineQuantity(slug: string, quantity: number) {
    const nextQty = Math.floor(quantity);
    const current = readGuestCart();
    if (nextQty <= 0) {
      persist(current.filter((i) => i.slug !== slug));
      return;
    }
    persist(
      current.map((i) => (i.slug === slug ? { ...i, quantity: nextQty } : i))
    );
  }

  const increase = (slug: string) => {
    const item = items.find((i) => i.slug === slug);
    if (!item) return;
    setLineQuantity(slug, item.quantity + 1);
  };

  const decrease = (slug: string) => {
    const item = items.find((i) => i.slug === slug);
    if (!item) return;
    setLineQuantity(slug, item.quantity - 1);
  };

  if (loading) {
    return <div className="text-sm text-[#666]">Cargando carrito...</div>;
  }

  if (items.length === 0) {
    return (
      <section className="rounded-3xl bg-white p-8 text-center shadow-sm ring-1 ring-black/5">
        <h2 className="text-2xl font-semibold">Tu carrito esta vacio</h2>
        <p className="mt-3 text-sm text-[#666]">
          Aun no tienes productos agregados. Explora el catalogo para comenzar.
        </p>
        <Link
          href="/productos"
          className="mt-6 inline-block rounded-full bg-[#1f1f1f] px-6 py-3 text-sm font-semibold text-white"
        >
          Ver productos
        </Link>
      </section>
    );
  }

  return (
    <section className="grid gap-6 lg:grid-cols-[2fr_1fr]">
      <div className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-black/5 sm:p-6">
        <h2 className="mb-5 text-xl font-semibold">Productos en carrito</h2>
        <div className="space-y-4">
          {items.map((item) => (
            <article
              key={item.slug}
              className="flex flex-col gap-4 rounded-2xl border border-[#ece8df] p-4 sm:flex-row sm:items-center"
            >
              <div className="relative h-24 w-full overflow-hidden rounded-xl sm:w-28">
                <Image src={item.image} alt={item.name} fill className="object-cover" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-[#666]">{item.category}</p>
                <h3 className="font-semibold">{item.name}</h3>
                <p className="text-sm font-medium">{item.price}</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => decrease(item.slug)}
                  className="rounded-full border border-[#ddd] px-3 py-1 text-sm"
                >
                  -
                </button>
                <span className="min-w-6 text-center text-sm">{item.quantity}</span>
                <button
                  type="button"
                  onClick={() => increase(item.slug)}
                  className="rounded-full border border-[#ddd] px-3 py-1 text-sm"
                >
                  +
                </button>
              </div>
            </article>
          ))}
        </div>
      </div>

      <aside className="h-fit rounded-3xl bg-white p-5 shadow-sm ring-1 ring-black/5 sm:p-6">
        <h2 className="text-xl font-semibold">Resumen</h2>
        <div className="mt-5 space-y-3 text-sm">
          <div className="flex items-center justify-between">
            <span>Subtotal</span>
            <span>${formatPrice(subtotal)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span>Envio</span>
            <span>${formatPrice(shipping)}</span>
          </div>
          <div className="flex items-center justify-between border-t border-[#ece8df] pt-3 text-base font-semibold">
            <span>Total</span>
            <span>${formatPrice(total)}</span>
          </div>
        </div>
        <Link
          href="/checkout"
          className="mt-6 block w-full rounded-full bg-[#1f1f1f] px-6 py-3 text-center text-sm font-semibold text-white"
        >
          Finalizar compra
        </Link>
      </aside>
    </section>
  );
}

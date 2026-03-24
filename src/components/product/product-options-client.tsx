"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import {
  readGuestCart,
  upsertGuestCartItem,
  writeGuestCart,
  type GuestCartItem,
} from "@/lib/guest-cart";

type ProductOptionsClientProps = {
  product: Pick<GuestCartItem, "slug" | "name" | "price" | "image" | "category">;
};

export function ProductOptionsClient({ product }: ProductOptionsClientProps) {
  const [color, setColor] = useState("Beige");
  const [size, setSize] = useState("Mediano");
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);
  const [addedHint, setAddedHint] = useState(false);
  const hintTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (hintTimer.current) clearTimeout(hintTimer.current);
    };
  }, []);

  function addToCart() {
    setAdding(true);
    try {
      const current = readGuestCart();
      const existing = current.find((i) => i.slug === product.slug);
      const nextQty = (existing?.quantity ?? 0) + quantity;
      const line: GuestCartItem = {
        ...product,
        quantity: nextQty,
      };
      upsertGuestCartItem(line);
      if (hintTimer.current) clearTimeout(hintTimer.current);
      setAddedHint(true);
      hintTimer.current = setTimeout(() => {
        setAddedHint(false);
        hintTimer.current = null;
      }, 2500);
    } finally {
      setAdding(false);
    }
  }

  function removeFromCart() {
    const current = readGuestCart().filter((i) => i.slug !== product.slug);
    writeGuestCart(current);
  }

  return (
    <>
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <label className="text-sm">
          Color
          <select
            value={color}
            onChange={(event) => setColor(event.target.value)}
            className="mt-1 w-full rounded-xl border border-[#ddd] px-3 py-2"
          >
            <option>Beige</option>
            <option>Gris claro</option>
            <option>Negro</option>
          </select>
        </label>
        <label className="text-sm">
          Tamano
          <select
            value={size}
            onChange={(event) => setSize(event.target.value)}
            className="mt-1 w-full rounded-xl border border-[#ddd] px-3 py-2"
          >
            <option>Mediano</option>
            <option>Grande</option>
            <option>Extra grande</option>
          </select>
        </label>
      </div>

      <div className="mt-4 flex items-center gap-2">
        <button
          type="button"
          onClick={() => setQuantity((value) => Math.max(1, value - 1))}
          className="rounded-full border border-[#ddd] px-3 py-1 text-sm"
        >
          -
        </button>
        <span className="min-w-6 text-center text-sm">{quantity}</span>
        <button
          type="button"
          onClick={() => setQuantity((value) => value + 1)}
          className="rounded-full border border-[#ddd] px-3 py-1 text-sm"
        >
          +
        </button>
      </div>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
        <button
          type="button"
          onClick={() => addToCart()}
          disabled={adding}
          className="rounded-full bg-[#1f1f1f] px-6 py-3 text-center text-sm font-semibold text-white disabled:opacity-60"
        >
          {adding ? "Agregando..." : "Agregar al carrito"}
        </button>
        <Link
          href="/carrito"
          className="inline-flex items-center justify-center rounded-full border border-[#1f1f1f] bg-white px-6 py-3 text-center text-sm font-semibold text-[#1f1f1f] hover:bg-[#f6f5f3]"
        >
          Ir al carrito
        </Link>
        <button
          type="button"
          onClick={() => removeFromCart()}
          className="rounded-full border border-[#d7d2c8] px-6 py-3 text-sm font-semibold text-[#1f1f1f]"
        >
          Quitar del carrito (local)
        </button>
      </div>

      {addedHint ? (
        <p className="mt-3 text-sm font-medium text-green-700" role="status">
          Producto agregado al carrito. Puedes seguir comprando o ir al carrito.
        </p>
      ) : null}

      <p className="mt-3 text-xs text-[#666]">
        Carrito guardado en este navegador (localStorage). Seleccion: {color} - {size} -{" "}
        {quantity} unidad(es).
      </p>
    </>
  );
}

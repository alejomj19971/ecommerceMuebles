"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { CATEGORIA_LABELS, CATEGORIA_SLUGS } from "@/lib/utils";

type Props = {
  id: string;
  nombreInicial: string;
  precioInicial: number;
  precioFabricacion: number;
  categoriaInicial: string;
  imagenInicial: string | null;
};

export function ProductoDetalleForm({
  id,
  nombreInicial,
  precioInicial,
  precioFabricacion,
  categoriaInicial,
  imagenInicial,
}: Props) {
  const router = useRouter();
  const [nombre, setNombre] = useState(nombreInicial);
  const [precio, setPrecio] = useState(String(Math.round(precioInicial)));
  const [categoria, setCategoria] = useState(categoriaInicial);
  const [imagenUrl, setImagenUrl] = useState(imagenInicial ?? "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const precioNum = Number(precio.replace(/\D/g, "") || "0");
    if (!nombre.trim()) {
      setError("Indica el nombre del producto.");
      return;
    }
    if (!Number.isFinite(precioNum) || precioNum < 0) {
      setError("Indica un precio válido.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/productos/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({
          nombre: nombre.trim(),
          precio_venta: Math.round(precioNum),
          categoria,
          imagen_url: imagenUrl.trim() || null,
        }),
      });
      const data = (await res.json().catch(() => null)) as { error?: string };
      if (!res.ok) throw new Error(data?.error ?? "No se pudo guardar");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={(e) => void onSubmit(e)}
      className="grid gap-4 rounded-3xl bg-white p-5 shadow-sm ring-1 ring-black/5 sm:grid-cols-2"
    >
      <div className="sm:col-span-2">
        <h2 className="text-lg font-semibold">Datos del producto</h2>
        <p className="mt-1 text-sm text-[#666]">
          Aquí editas todo el producto. La receta se gestiona en el bloque inferior.
        </p>
      </div>
      <label className="text-sm">
        Nombre
        <input
          value={nombre}
          onChange={(ev) => setNombre(ev.target.value)}
          className="mt-1 w-full rounded-xl border border-[#ddd] px-3 py-2"
          required
        />
      </label>
      <label className="text-sm">
        Precio venta (COP, sin símbolos)
        <input
          value={precio}
          onChange={(ev) => setPrecio(ev.target.value)}
          className="mt-1 w-full rounded-xl border border-[#ddd] px-3 py-2"
          inputMode="numeric"
          required
        />
      </label>
      <label className="text-sm">
        Precio fabricación (calculado)
        <input
          value={new Intl.NumberFormat("es-CO").format(precioFabricacion)}
          readOnly
          className="mt-1 w-full rounded-xl border border-[#ddd] bg-[#f6f5f3] px-3 py-2 text-[#666]"
        />
      </label>
      <label className="text-sm sm:col-span-2">
        URL de imagen (opcional)
        <input
          value={imagenUrl}
          onChange={(ev) => setImagenUrl(ev.target.value)}
          type="url"
          className="mt-1 w-full rounded-xl border border-[#ddd] px-3 py-2"
          placeholder="https://images.unsplash.com/photo-..."
        />
      </label>
      <label className="text-sm sm:col-span-2">
        Categoría
        <select
          value={categoria}
          onChange={(ev) => setCategoria(ev.target.value)}
          className="mt-1 w-full rounded-xl border border-[#ddd] px-3 py-2"
        >
          {CATEGORIA_SLUGS.map((slug) => (
            <option key={slug} value={slug}>
              {CATEGORIA_LABELS[slug]}
            </option>
          ))}
        </select>
      </label>
      {error ? (
        <p className="sm:col-span-2 text-sm text-red-600">{error}</p>
      ) : null}
      <div className="sm:col-span-2">
        <button
          type="submit"
          disabled={loading}
          className="rounded-full bg-[#1f1f1f] px-6 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
        >
          {loading ? "Guardando..." : "Guardar cambios"}
        </button>
      </div>
    </form>
  );
}

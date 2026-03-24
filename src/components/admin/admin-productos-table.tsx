"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { Pencil, Search, Trash2 } from "lucide-react";
import { labelCategoria } from "@/lib/utils";
import { productImageOrPlaceholder } from "@/lib/product-image";
import { AdminConfirmModal } from "@/components/admin/admin-confirm-modal";

export type ProductoAdminRow = {
  id: string;
  nombre: string;
  categoria: string;
  imagenUrl: string | null;
  precioVenta: number;
  precioFabricacion: number;
  recetaCount: number;
};

type Props = {
  initial: ProductoAdminRow[];
};

function formatPrice(value: number) {
  return new Intl.NumberFormat("es-CO").format(value);
}

export function AdminProductosTable({ initial }: Props) {
  const router = useRouter();
  const [rowErr, setRowErr] = useState<string | null>(null);
  const [rowLoading, setRowLoading] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<ProductoAdminRow | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [busqueda, setBusqueda] = useState("");
  const [categoriaFiltro, setCategoriaFiltro] = useState("");

  const categoriasDisponibles = useMemo(() => {
    const slugs = [...new Set(initial.map((p) => p.categoria))];
    return slugs.sort((a, b) =>
      labelCategoria(a).localeCompare(labelCategoria(b), "es", {
        sensitivity: "base",
      })
    );
  }, [initial]);

  const filtrados = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    return initial.filter((p) => {
      if (categoriaFiltro && p.categoria !== categoriaFiltro) return false;
      if (!q) return true;
      if (p.nombre.toLowerCase().includes(q)) return true;
      if (p.id.includes(q)) return true;
      if (labelCategoria(p.categoria).toLowerCase().includes(q)) return true;
      return false;
    });
  }, [initial, busqueda, categoriaFiltro]);

  async function executeDeleteProducto() {
    const p = pendingDelete;
    if (!p) return;
    setRowErr(null);
    setDeleteLoading(true);
    setRowLoading(true);
    try {
      const res = await fetch(`/api/admin/productos/${p.id}`, {
        method: "DELETE",
        credentials: "same-origin",
      });
      const data = (await res.json().catch(() => null)) as { error?: string };
      if (!res.ok) throw new Error(data?.error ?? "No se pudo eliminar");
      setPendingDelete(null);
      router.refresh();
    } catch (err) {
      setRowErr(err instanceof Error ? err.message : "Error");
    } finally {
      setDeleteLoading(false);
      setRowLoading(false);
    }
  }

  return (
    <section className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-black/5">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-semibold">Listado</h2>
        <p className="text-xs text-[#666]">
          {filtrados.length === initial.length
            ? `${initial.length} producto(s)`
            : `${filtrados.length} de ${initial.length} producto(s)`}
        </p>
      </div>

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end">
        <label className="min-w-0 flex-1 text-sm sm:min-w-[220px]">
          Buscar
          <span className="relative mt-1 block">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#999]"
              aria-hidden
            />
            <input
              type="search"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Nombre, ID o categoría…"
              autoComplete="off"
              className="w-full rounded-xl border border-[#ddd] py-2 pl-9 pr-3 text-sm outline-none ring-[#1f1f1f] focus:ring-2"
            />
          </span>
        </label>
        <label className="w-full text-sm sm:w-auto sm:min-w-[200px]">
          Categoría
          <select
            value={categoriaFiltro}
            onChange={(e) => setCategoriaFiltro(e.target.value)}
            className="mt-1 w-full rounded-xl border border-[#ddd] px-3 py-2 text-sm outline-none ring-[#1f1f1f] focus:ring-2"
          >
            <option value="">Todas</option>
            {categoriasDisponibles.map((slug) => (
              <option key={slug} value={slug}>
                {labelCategoria(slug)}
              </option>
            ))}
          </select>
        </label>
      </div>

      {rowErr ? (
        <p className="mb-3 rounded-xl border border-[#ffd1d1] bg-[#fff2f2] px-3 py-2 text-sm text-[#b42318]">
          {rowErr}
        </p>
      ) : null}

      <div className="overflow-auto">
        <table className="w-full min-w-[880px] border-separate border-spacing-y-2">
          <thead>
            <tr className="text-left text-xs text-[#666]">
              <th className="font-semibold">ID</th>
              <th className="font-semibold">Producto</th>
              <th className="font-semibold">Categoría</th>
              <th className="font-semibold">Receta</th>
              <th className="font-semibold">Precio venta</th>
              <th className="font-semibold">Precio fabricación</th>
              <th className="text-right font-semibold">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filtrados.map((p) => (
              <tr key={p.id} className="align-middle">
                <td className="rounded-xl bg-[#f6f5f3] px-3 py-2 text-sm">
                  {p.id}
                </td>
                <td className="px-3 py-2">
                  <Link
                    href={`/admin/productos/${p.id}`}
                    className="group inline-flex items-center gap-3 rounded-xl px-1 py-1 transition-colors hover:bg-[#f6f5f3]"
                    title={`Ver detalle de ${p.nombre}`}
                    aria-label={`Ver detalle de ${p.nombre}`}
                  >
                    <img
                      src={productImageOrPlaceholder(p.imagenUrl)}
                      alt={p.nombre}
                      width={44}
                      height={44}
                      className="size-11 shrink-0 rounded-xl object-cover ring-1 ring-black/10"
                      loading="lazy"
                    />
                    <div className="min-w-0 font-semibold leading-snug group-hover:underline">
                      {p.nombre}
                    </div>
                  </Link>
                </td>
                <td className="px-3 py-2 text-sm text-[#666]">
                  {labelCategoria(p.categoria)}
                </td>
                <td className="px-3 py-2 text-sm text-[#666]">
                  {p.recetaCount} línea(s)
                </td>
                <td className="px-3 py-2 text-sm font-semibold">
                  ${formatPrice(p.precioVenta)}
                </td>
                <td className="px-3 py-2 text-sm text-[#666]">
                  ${formatPrice(p.precioFabricacion)}
                </td>
                <td className="px-3 py-2 text-right">
                  <div className="flex flex-wrap justify-end gap-2">
                    <Link
                      href={`/admin/productos/${p.id}`}
                      title="Editar / receta"
                      aria-label="Editar / receta"
                      className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#1f1f1f] text-white"
                    >
                      <Pencil size={14} />
                    </Link>
                    <button
                      type="button"
                      disabled={rowLoading}
                      onClick={() => setPendingDelete(p)}
                      title="Eliminar"
                      aria-label="Eliminar"
                      className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-[#ffd1d1] bg-[#fff8f8] text-[#b42318]"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {initial.length === 0 ? (
              <tr>
                <td
                  colSpan={7}
                  className="px-3 py-4 text-center text-sm text-[#666]"
                >
                  No hay productos. Usa el formulario de arriba o ejecuta el
                  seed.
                </td>
              </tr>
            ) : filtrados.length === 0 ? (
              <tr>
                <td
                  colSpan={7}
                  className="px-3 py-4 text-center text-sm text-[#666]"
                >
                  Ningún producto coincide con la búsqueda o la categoría
                  seleccionada.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>

      <AdminConfirmModal
        open={pendingDelete !== null}
        title="¿Eliminar este producto?"
        description={
          pendingDelete
            ? `Se eliminará «${pendingDelete.nombre}». Esta acción no se puede deshacer. Solo es posible si el producto no tiene ventas asociadas.`
            : ""
        }
        confirmLabel="Eliminar"
        cancelLabel="Cancelar"
        tone="danger"
        loading={deleteLoading}
        onClose={() => {
          if (!deleteLoading) setPendingDelete(null);
        }}
        onConfirm={executeDeleteProducto}
      />
    </section>
  );
}

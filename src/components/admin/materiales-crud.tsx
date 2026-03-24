"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { FilterX, Pencil, Plus, Search, Trash2 } from "lucide-react";
import { AdminConfirmModal } from "@/components/admin/admin-confirm-modal";
import {
  DEFAULT_MATERIAL_CATEGORIA,
  MATERIAL_CATEGORIA_SLUGS,
  type MaterialCategoriaSlug,
  isMaterialCategoriaSlug,
  labelMaterialCategoria,
} from "@/lib/material-categoria";

export type MaterialRow = {
  id: string;
  nombre: string;
  categoria: string;
  unidadMedida: string;
  precioUnitario: number;
};

type Props = {
  initial: MaterialRow[];
};

export function MaterialesCrud({ initial }: Props) {
  const router = useRouter();
  const [createNombre, setCreateNombre] = useState("");
  const [createCategoria, setCreateCategoria] = useState(DEFAULT_MATERIAL_CATEGORIA);
  const [createUnidad, setCreateUnidad] = useState("");
  const [createPrecio, setCreatePrecio] = useState("");
  const [createErr, setCreateErr] = useState<string | null>(null);
  const [createLoading, setCreateLoading] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editNombre, setEditNombre] = useState("");
  const [editCategoria, setEditCategoria] = useState(DEFAULT_MATERIAL_CATEGORIA);
  const [editUnidad, setEditUnidad] = useState("");
  const [editPrecio, setEditPrecio] = useState("");
  const [rowErr, setRowErr] = useState<string | null>(null);
  const [rowLoading, setRowLoading] = useState(false);
  const [pendingMaterialDelete, setPendingMaterialDelete] = useState<{
    id: string;
    nombre: string;
  } | null>(null);
  const [materialDeleteLoading, setMaterialDeleteLoading] = useState(false);

  const [busqueda, setBusqueda] = useState("");
  const [filtroCategoria, setFiltroCategoria] = useState<"" | MaterialCategoriaSlug>("");

  const filtrados = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    return initial.filter((m) => {
      if (filtroCategoria && m.categoria !== filtroCategoria) return false;
      if (!q) return true;
      const nombre = m.nombre.toLowerCase();
      const id = m.id.toLowerCase();
      const unidad = m.unidadMedida.toLowerCase();
      const catLabel = labelMaterialCategoria(m.categoria).toLowerCase();
      const precioStr = String(m.precioUnitario);
      return (
        nombre.includes(q) ||
        id.includes(q) ||
        unidad.includes(q) ||
        catLabel.includes(q) ||
        m.categoria.toLowerCase().includes(q) ||
        precioStr.includes(q.replace(/\./g, ""))
      );
    });
  }, [initial, busqueda, filtroCategoria]);

  const hayFiltrosActivos = Boolean(busqueda.trim() || filtroCategoria);

  function limpiarFiltros() {
    setBusqueda("");
    setFiltroCategoria("");
  }

  async function onCreate(e: React.FormEvent) {
    e.preventDefault();
    setCreateErr(null);
    const precioNum = Number(createPrecio.replace(",", "."));
    if (!Number.isFinite(precioNum) || precioNum < 0) {
      setCreateErr("Indica un precio unitario válido.");
      return;
    }
    setCreateLoading(true);
    try {
      const res = await fetch("/api/admin/materiales", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({
          nombre: createNombre,
          categoria: createCategoria,
          unidad_medida: createUnidad,
          precio_unitario: precioNum,
        }),
      });
      const data = (await res.json().catch(() => null)) as { error?: string };
      if (!res.ok) throw new Error(data?.error ?? "No se pudo crear");
      setCreateNombre("");
      setCreateCategoria(DEFAULT_MATERIAL_CATEGORIA);
      setCreateUnidad("");
      setCreatePrecio("");
      setCreateOpen(false);
      router.refresh();
    } catch (err) {
      setCreateErr(err instanceof Error ? err.message : "Error");
    } finally {
      setCreateLoading(false);
    }
  }

  function startEdit(m: MaterialRow) {
    setEditingId(m.id);
    setEditNombre(m.nombre);
    setEditCategoria(
      isMaterialCategoriaSlug(m.categoria) ? m.categoria : DEFAULT_MATERIAL_CATEGORIA
    );
    setEditUnidad(m.unidadMedida);
    setEditPrecio(String(m.precioUnitario));
    setRowErr(null);
  }

  function cancelEdit() {
    setEditingId(null);
    setRowErr(null);
  }

  async function saveEdit(id: string) {
    setRowErr(null);
    const precioNum = Number(editPrecio.replace(",", "."));
    if (!Number.isFinite(precioNum) || precioNum < 0) {
      setRowErr("Indica un precio unitario válido.");
      return;
    }
    setRowLoading(true);
    try {
      const res = await fetch(`/api/admin/materiales/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({
          nombre: editNombre,
          categoria: editCategoria,
          unidad_medida: editUnidad,
          precio_unitario: precioNum,
        }),
      });
      const data = (await res.json().catch(() => null)) as { error?: string };
      if (!res.ok) throw new Error(data?.error ?? "No se pudo guardar");
      setEditingId(null);
      router.refresh();
    } catch (err) {
      setRowErr(err instanceof Error ? err.message : "Error");
    } finally {
      setRowLoading(false);
    }
  }

  async function executeDeleteMaterial() {
    const target = pendingMaterialDelete;
    if (!target) return;
    setRowErr(null);
    setMaterialDeleteLoading(true);
    setRowLoading(true);
    try {
      const res = await fetch(`/api/admin/materiales/${target.id}`, {
        method: "DELETE",
        credentials: "same-origin",
      });
      const data = (await res.json().catch(() => null)) as { error?: string };
      if (!res.ok) throw new Error(data?.error ?? "No se pudo eliminar");
      if (editingId === target.id) setEditingId(null);
      setPendingMaterialDelete(null);
      router.refresh();
    } catch (err) {
      setRowErr(err instanceof Error ? err.message : "Error");
    } finally {
      setMaterialDeleteLoading(false);
      setRowLoading(false);
    }
  }

  useEffect(() => {
    if (!createOpen) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape" && !createLoading) setCreateOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [createOpen, createLoading]);

  function closeCreateModal() {
    if (createLoading) return;
    setCreateOpen(false);
    setCreateErr(null);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-end gap-3">
        <button
          type="button"
          onClick={() => {
            setCreateErr(null);
            setCreateOpen(true);
          }}
          className="inline-flex items-center gap-2 rounded-full bg-[#1f1f1f] px-5 py-2.5 text-sm font-semibold text-white"
        >
          <Plus size={16} aria-hidden />
          Nuevo material
        </button>
      </div>

      <section className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-black/5">
        {rowErr ? (
          <p className="mb-3 rounded-xl border border-[#ffd1d1] bg-[#fff2f2] px-3 py-2 text-sm text-[#b42318]">
            {rowErr}
          </p>
        ) : null}

        <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div className="grid flex-1 gap-3 sm:grid-cols-2 lg:max-w-2xl">
            <label className="text-sm sm:col-span-2 lg:col-span-1">
              <span className="font-medium text-[#1f1f1f]">Buscar</span>
              <span className="relative mt-1 block">
                <Search
                  className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#888]"
                  aria-hidden
                />
                <input
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  type="search"
                  placeholder="Nombre, ID, unidad, categoría o precio…"
                  className="w-full rounded-xl border border-[#ddd] py-2 pl-9 pr-3 text-sm outline-none focus:border-[#1f1f1f] focus:ring-2 focus:ring-[#1f1f1f]/15"
                  autoComplete="off"
                />
              </span>
            </label>
            <label className="text-sm">
              <span className="font-medium text-[#1f1f1f]">Categoría</span>
              <select
                value={filtroCategoria}
                onChange={(e) =>
                  setFiltroCategoria(
                    e.target.value === "" ? "" : (e.target.value as MaterialCategoriaSlug)
                  )
                }
                className="mt-1 w-full rounded-xl border border-[#ddd] px-3 py-2 text-sm outline-none focus:border-[#1f1f1f] focus:ring-2 focus:ring-[#1f1f1f]/15"
              >
                <option value="">Todas las categorías</option>
                {MATERIAL_CATEGORIA_SLUGS.map((slug) => (
                  <option key={slug} value={slug}>
                    {labelMaterialCategoria(slug)}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <button
            type="button"
            onClick={limpiarFiltros}
            disabled={!hayFiltrosActivos}
            title={!hayFiltrosActivos ? "No hay filtros activos" : undefined}
            className="inline-flex shrink-0 items-center justify-center gap-2 self-start rounded-full border border-[#ddd] bg-white px-4 py-2.5 text-sm font-medium text-[#444] disabled:cursor-not-allowed disabled:opacity-45 lg:self-auto"
          >
            <FilterX size={16} aria-hidden />
            Limpiar filtros
          </button>
        </div>

        <p className="mb-3 text-xs text-[#666]">
          {initial.length === 0
            ? "No hay materiales registrados."
            : filtrados.length === initial.length
              ? `Mostrando ${filtrados.length} ${filtrados.length === 1 ? "material" : "materiales"}.`
              : `Mostrando ${filtrados.length} de ${initial.length} materiales.`}
        </p>

        <div className="overflow-auto">
          <table className="w-full min-w-[720px] text-sm">
            <thead>
              <tr className="text-left text-xs text-[#666]">
                <th className="pb-2 font-semibold">ID</th>
                <th className="pb-2 font-semibold">Nombre</th>
                <th className="pb-2 font-semibold">Categoría</th>
                <th className="pb-2 font-semibold">Unidad</th>
                <th className="pb-2 font-semibold">Precio unitario</th>
                <th className="pb-2 text-right font-semibold">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtrados.map((m) => (
                <tr key={m.id} className="border-t border-[#ece8df]">
                  <td className="py-3 font-mono text-xs">{m.id}</td>
                  <td className="py-3">
                    {editingId === m.id ? (
                      <input
                        value={editNombre}
                        onChange={(e) => setEditNombre(e.target.value)}
                        className="w-full rounded-lg border border-[#ddd] px-2 py-1"
                      />
                    ) : (
                      <span className="font-medium">{m.nombre}</span>
                    )}
                  </td>
                  <td className="py-3 text-[#666]">
                    {editingId === m.id ? (
                      <select
                        value={editCategoria}
                        onChange={(e) =>
                          setEditCategoria(e.target.value as MaterialCategoriaSlug)
                        }
                        className="w-full max-w-[200px] rounded-lg border border-[#ddd] px-2 py-1"
                      >
                        {MATERIAL_CATEGORIA_SLUGS.map((slug) => (
                          <option key={slug} value={slug}>
                            {labelMaterialCategoria(slug)}
                          </option>
                        ))}
                      </select>
                    ) : (
                      labelMaterialCategoria(m.categoria)
                    )}
                  </td>
                  <td className="py-3 text-[#666]">
                    {editingId === m.id ? (
                      <input
                        value={editUnidad}
                        onChange={(e) => setEditUnidad(e.target.value)}
                        className="w-full max-w-[140px] rounded-lg border border-[#ddd] px-2 py-1"
                      />
                    ) : (
                      m.unidadMedida
                    )}
                  </td>
                  <td className="py-3">
                    {editingId === m.id ? (
                      <input
                        value={editPrecio}
                        onChange={(e) => setEditPrecio(e.target.value)}
                        className="w-full max-w-[140px] rounded-lg border border-[#ddd] px-2 py-1"
                        inputMode="decimal"
                      />
                    ) : (
                      new Intl.NumberFormat("es-CO").format(m.precioUnitario)
                    )}
                  </td>
                  <td className="py-3 text-right">
                    {editingId === m.id ? (
                      <div className="flex flex-wrap justify-end gap-2">
                        <button
                          type="button"
                          disabled={rowLoading}
                          onClick={() => void saveEdit(m.id)}
                          className="rounded-full bg-[#1f1f1f] px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-60"
                        >
                          Guardar
                        </button>
                        <button
                          type="button"
                          disabled={rowLoading}
                          onClick={cancelEdit}
                          className="rounded-full bg-[#f6f5f3] px-3 py-1.5 text-xs font-medium ring-1 ring-black/10"
                        >
                          Cancelar
                        </button>
                      </div>
                    ) : (
                      <div className="flex flex-wrap justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => startEdit(m)}
                          title="Editar"
                          aria-label="Editar"
                          className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#f6f5f3] ring-1 ring-black/10"
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          type="button"
                          onClick={() => setPendingMaterialDelete({ id: m.id, nombre: m.nombre })}
                          title="Eliminar"
                          aria-label="Eliminar"
                          className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-[#ffd1d1] bg-[#fff8f8] text-[#b42318]"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
              {initial.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-6 text-center text-[#666]">
                    No hay materiales.
                  </td>
                </tr>
              ) : filtrados.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-6 text-center text-[#666]">
                    <p className="font-medium text-[#1f1f1f]">Sin resultados</p>
                    <p className="mt-1 text-sm">
                      Prueba otras palabras o cambia la categoría.{" "}
                      <button
                        type="button"
                        onClick={limpiarFiltros}
                        className="font-semibold text-[#1f1f1f] underline decoration-[#1f1f1f]/30 underline-offset-2 hover:decoration-[#1f1f1f]"
                      >
                        Limpiar filtros
                      </button>
                    </p>
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </section>

      {createOpen ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="nuevo-material-modal-title"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) closeCreateModal();
          }}
        >
          <div
            className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-3xl bg-white p-5 shadow-xl ring-1 ring-black/10 sm:p-6"
            onMouseDown={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between gap-3">
              <h2 id="nuevo-material-modal-title" className="text-lg font-semibold">
                Nuevo material
              </h2>
              <button
                type="button"
                onClick={closeCreateModal}
                disabled={createLoading}
                className="rounded-full bg-[#f6f5f3] px-4 py-2 text-sm font-medium ring-1 ring-black/10 disabled:opacity-50"
              >
                Cerrar
              </button>
            </div>

            <form onSubmit={(e) => void onCreate(e)} className="grid gap-4">
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <label className="text-sm">
                  Nombre
                  <input
                    value={createNombre}
                    onChange={(e) => setCreateNombre(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-[#ddd] px-3 py-2"
                    placeholder="Ej. Tela lino"
                    required
                  />
                </label>
                <label className="text-sm">
                  Categoría
                  <select
                    value={createCategoria}
                    onChange={(e) =>
                      setCreateCategoria(e.target.value as MaterialCategoriaSlug)
                    }
                    className="mt-1 w-full rounded-xl border border-[#ddd] px-3 py-2"
                  >
                    {MATERIAL_CATEGORIA_SLUGS.map((slug) => (
                      <option key={slug} value={slug}>
                        {labelMaterialCategoria(slug)}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="text-sm">
                  Unidad de medida
                  <input
                    value={createUnidad}
                    onChange={(e) => setCreateUnidad(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-[#ddd] px-3 py-2"
                    placeholder="m, m², unidad..."
                    required
                  />
                </label>
                <label className="text-sm">
                  Precio unitario
                  <input
                    value={createPrecio}
                    onChange={(e) => setCreatePrecio(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-[#ddd] px-3 py-2"
                    placeholder="Ej. 38000"
                    inputMode="decimal"
                    required
                  />
                </label>
              </div>
              {createErr ? (
                <p className="text-sm text-red-600" role="alert">
                  {createErr}
                </p>
              ) : null}
              <div className="flex justify-end border-t border-[#ece8df] pt-4">
                <button
                  type="submit"
                  disabled={createLoading}
                  className="rounded-full bg-[#1f1f1f] px-6 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
                >
                  {createLoading ? "Guardando..." : "Crear material"}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}

      <AdminConfirmModal
        open={pendingMaterialDelete !== null}
        title="¿Eliminar este material?"
        description={
          pendingMaterialDelete
            ? `Se eliminará «${pendingMaterialDelete.nombre}» del catálogo. Solo es posible si no está en uso en recetas de productos.`
            : ""
        }
        confirmLabel="Eliminar"
        cancelLabel="Cancelar"
        tone="danger"
        loading={materialDeleteLoading}
        onClose={() => {
          if (!materialDeleteLoading) setPendingMaterialDelete(null);
        }}
        onConfirm={executeDeleteMaterial}
      />
    </div>
  );
}

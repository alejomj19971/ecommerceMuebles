"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { AdminConfirmModal } from "@/components/admin/admin-confirm-modal";

export type RecetaLine = {
  idMaterial: string;
  nombre: string;
  unidad: string;
  cantidad: number;
  precioUnitario: number;
};

export type MaterialOption = {
  id: string;
  nombre: string;
  unidadMedida: string;
  precioUnitario: number;
};

type Props = {
  productId: string;
  initialLines: RecetaLine[];
  materiales: MaterialOption[];
};

export function ProductoRecetaEditor({
  productId,
  initialLines,
  materiales,
}: Props) {
  function formatMoney(value: number) {
    return `$${new Intl.NumberFormat("es-CO").format(value)}`;
  }

  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [selectMaterial, setSelectMaterial] = useState("");
  const [cantidadStr, setCantidadStr] = useState("1");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const [editingMaterialId, setEditingMaterialId] = useState<string | null>(
    null
  );
  const [editCantidad, setEditCantidad] = useState("");
  const [rowError, setRowError] = useState<string | null>(null);
  const [rowLoading, setRowLoading] = useState(false);
  const [pendingRecetaRemove, setPendingRecetaRemove] = useState<{
    idMaterial: string;
    nombre: string;
  } | null>(null);
  const [recetaRemoveLoading, setRecetaRemoveLoading] = useState(false);

  const closeModal = useCallback(() => {
    setOpen(false);
    setError(null);
    setSelectMaterial("");
    setCantidadStr("1");
  }, []);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") closeModal();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, closeModal]);

  async function submitAdd(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const cantidad = Number(cantidadStr.replace(",", "."));
    if (!selectMaterial) {
      setError("Selecciona un material.");
      return;
    }
    if (!Number.isFinite(cantidad) || cantidad <= 0) {
      setError("Indica una cantidad válida mayor que cero.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/admin/productos/${productId}/materiales`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({
          id_material: selectMaterial,
          cantidad,
        }),
      });
      const data = (await res.json().catch(() => null)) as { error?: string };
      if (!res.ok) throw new Error(data?.error ?? "No se pudo añadir");
      closeModal();
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error");
    } finally {
      setLoading(false);
    }
  }

  function startEdit(line: RecetaLine) {
    setEditingMaterialId(line.idMaterial);
    setEditCantidad(String(line.cantidad));
    setRowError(null);
  }

  function cancelEdit() {
    setEditingMaterialId(null);
    setRowError(null);
  }

  async function saveCantidad(idMaterial: string) {
    setRowError(null);
    const cantidad = Number(editCantidad.replace(",", "."));
    if (!Number.isFinite(cantidad) || cantidad <= 0) {
      setRowError("Cantidad inválida.");
      return;
    }
    setRowLoading(true);
    try {
      const res = await fetch(`/api/admin/productos/${productId}/materiales`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ id_material: idMaterial, cantidad }),
      });
      const data = (await res.json().catch(() => null)) as { error?: string };
      if (!res.ok) throw new Error(data?.error ?? "No se pudo actualizar");
      setEditingMaterialId(null);
      router.refresh();
    } catch (err) {
      setRowError(err instanceof Error ? err.message : "Error");
    } finally {
      setRowLoading(false);
    }
  }

  async function executeRemoveRecetaLine() {
    const target = pendingRecetaRemove;
    if (!target) return;
    setRowError(null);
    setRecetaRemoveLoading(true);
    setRowLoading(true);
    try {
      const res = await fetch(
        `/api/admin/productos/${productId}/materiales?id_material=${encodeURIComponent(target.idMaterial)}`,
        { method: "DELETE", credentials: "same-origin" }
      );
      const data = (await res.json().catch(() => null)) as { error?: string };
      if (!res.ok) throw new Error(data?.error ?? "No se pudo eliminar");
      if (editingMaterialId === target.idMaterial) setEditingMaterialId(null);
      setPendingRecetaRemove(null);
      router.refresh();
    } catch (err) {
      setRowError(err instanceof Error ? err.message : "Error");
    } finally {
      setRecetaRemoveLoading(false);
      setRowLoading(false);
    }
  }

  return (
    <section className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-black/5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">Receta (materiales)</h2>
          <p className="mt-1 text-sm text-[#666]">
            Añade insumos desde el catálogo de materiales. Si el material ya
            estaba, se actualiza la cantidad.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="shrink-0 rounded-full bg-[#1f1f1f] px-5 py-2.5 text-sm font-semibold text-white"
        >
          Añadir material
        </button>
      </div>

      {rowError ? (
        <p className="mt-3 rounded-xl border border-[#ffd1d1] bg-[#fff2f2] px-3 py-2 text-sm text-[#b42318]">
          {rowError}
        </p>
      ) : null}

      <div className="mt-4 overflow-auto">
        <table className="w-full min-w-[640px] text-sm">
          <thead>
            <tr className="text-left text-xs text-[#666]">
              <th className="pb-2 font-semibold">Material</th>
              <th className="pb-2 font-semibold">Unidad</th>
              <th className="pb-2 font-semibold">Cantidad</th>
              <th className="pb-2 font-semibold">Precio unitario</th>
              <th className="pb-2 font-semibold">Subtotal</th>
              <th className="pb-2 text-right font-semibold">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {initialLines.map((row) => (
              <tr
                key={row.idMaterial}
                className="border-t border-[#ece8df] align-middle"
              >
                <td className="py-3 font-medium">{row.nombre}</td>
                <td className="py-3 text-[#666]">{row.unidad}</td>
                <td className="py-3">
                  {editingMaterialId === row.idMaterial ? (
                    <input
                      value={editCantidad}
                      onChange={(e) => setEditCantidad(e.target.value)}
                      inputMode="decimal"
                      className="w-28 rounded-lg border border-[#ddd] px-2 py-1"
                    />
                  ) : (
                    row.cantidad
                  )}
                </td>
                <td className="py-3 text-[#666]">{formatMoney(row.precioUnitario)}</td>
                <td className="py-3 font-medium">
                  {formatMoney(
                    (editingMaterialId === row.idMaterial
                      ? Number(editCantidad.replace(",", "."))
                      : row.cantidad) * row.precioUnitario || 0
                  )}
                </td>
                <td className="py-3 text-right">
                  {editingMaterialId === row.idMaterial ? (
                    <div className="flex flex-wrap justify-end gap-2">
                      <button
                        type="button"
                        disabled={rowLoading}
                        onClick={() => void saveCantidad(row.idMaterial)}
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
                        onClick={() => startEdit(row)}
                        className="rounded-full bg-[#f6f5f3] px-3 py-1.5 text-xs font-medium ring-1 ring-black/10"
                      >
                        Editar cantidad
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setPendingRecetaRemove({
                            idMaterial: row.idMaterial,
                            nombre: row.nombre,
                          })
                        }
                        className="rounded-full border border-[#ffd1d1] bg-[#fff8f8] px-3 py-1.5 text-xs font-medium text-[#b42318]"
                      >
                        Quitar
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
            {initialLines.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-4 text-[#666]">
                  Sin materiales. Usa &quot;Añadir material&quot; para elegir del
                  listado.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>

      <AdminConfirmModal
        open={pendingRecetaRemove !== null}
        title="¿Quitar material de la receta?"
        description={
          pendingRecetaRemove
            ? `Se eliminará «${pendingRecetaRemove.nombre}» de la receta de este producto. Puedes volver a añadirlo después.`
            : ""
        }
        confirmLabel="Quitar"
        cancelLabel="Cancelar"
        tone="danger"
        loading={recetaRemoveLoading}
        onClose={() => {
          if (!recetaRemoveLoading) setPendingRecetaRemove(null);
        }}
        onConfirm={executeRemoveRecetaLine}
      />

      {open ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="receta-modal-title"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) closeModal();
          }}
        >
          <div
            className="w-full max-w-md rounded-3xl bg-white p-6 shadow-xl ring-1 ring-black/10"
            onMouseDown={(e) => e.stopPropagation()}
          >
            <h3 id="receta-modal-title" className="text-lg font-semibold">
              Añadir material a la receta
            </h3>
            <p className="mt-1 text-sm text-[#666]">
              Elige un insumo del catálogo e indica la cantidad (según la unidad
              del material).
            </p>

            {materiales.length === 0 ? (
              <div className="mt-4 space-y-4">
                <p className="text-sm text-[#b42318]">
                  No hay materiales en el sistema. Créalos en{" "}
                  <span className="font-medium">Admin → Materiales</span>.
                </p>
                <button
                  type="button"
                  onClick={closeModal}
                  className="rounded-full bg-[#f6f5f3] px-5 py-2.5 text-sm font-medium ring-1 ring-black/10"
                >
                  Cerrar
                </button>
              </div>
            ) : (
              <form className="mt-5 grid gap-4" onSubmit={(e) => void submitAdd(e)}>
                <label className="text-sm">
                  Material
                  <select
                    value={selectMaterial}
                    onChange={(e) => setSelectMaterial(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-[#ddd] px-3 py-2"
                    required
                  >
                    <option value="">— Selecciona —</option>
                    {materiales.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.nombre} ({m.unidadMedida}) - {formatMoney(m.precioUnitario)}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="text-sm">
                  Cantidad
                  <input
                    value={cantidadStr}
                    onChange={(e) => setCantidadStr(e.target.value)}
                    inputMode="decimal"
                    className="mt-1 w-full rounded-xl border border-[#ddd] px-3 py-2"
                    placeholder="Ej. 2.5"
                    required
                  />
                </label>
                {error ? (
                  <p className="text-sm text-red-600">{error}</p>
                ) : null}
                <div className="flex flex-wrap justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="rounded-full bg-[#f6f5f3] px-5 py-2.5 text-sm font-medium ring-1 ring-black/10"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="rounded-full bg-[#1f1f1f] px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
                  >
                    {loading ? "Guardando..." : "Añadir a la receta"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      ) : null}
    </section>
  );
}

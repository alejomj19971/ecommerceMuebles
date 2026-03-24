"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Calculator, FilterX, Pencil, Plus, Table, Trash2 } from "lucide-react";
import { AdminConfirmModal } from "@/components/admin/admin-confirm-modal";
import { downloadVentasDetalleXlsx } from "@/lib/export-ventas-xlsx";

type VentaDetalleRow = {
  id: string;
  idProducto: string;
  productoNombre: string;
  cantidad: number;
  precioUnitario: number;
};

type VentaRow = {
  id: string;
  numeroOrden: string;
  fechaIso: string;
  total: number;
  usuario: { id: string; nombre: string; email: string };
  detalles: VentaDetalleRow[];
};

type UsuarioOption = { id: string; nombre: string; email: string };
type ProductoOption = {
  id: string;
  nombre: string;
  precioVenta: number;
  precioFabricacion: number;
};
type DetalleForm = { idProducto: string; cantidad: string; precioUnitario: string };

type Props = {
  initialVentas: VentaRow[];
  usuarios: UsuarioOption[];
  productos: ProductoOption[];
};

function formatPrice(value: number) {
  return new Intl.NumberFormat("es-CO").format(value);
}

function formatDateInput(isoYmd: string) {
  const [y, m, d] = isoYmd.split("-").map(Number);
  if (!y || !m || !d) return isoYmd;
  return new Date(y, m - 1, d).toLocaleDateString("es-CO", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function toDatetimeLocalInput(iso: string) {
  const d = new Date(iso);
  const off = d.getTimezoneOffset();
  const local = new Date(d.getTime() - off * 60 * 1000);
  return local.toISOString().slice(0, 16);
}

export function AdminVentasCrud({ initialVentas, usuarios, productos }: Props) {
  const router = useRouter();
  const [desde, setDesde] = useState("");
  const [hasta, setHasta] = useState("");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<VentaRow | null>(null);
  const [idUsuario, setIdUsuario] = useState("");
  const [fecha, setFecha] = useState("");
  const [detalles, setDetalles] = useState<DetalleForm[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [totalesOpen, setTotalesOpen] = useState(false);
  const [totalesResumen, setTotalesResumen] = useState<{
    desdeTexto: string;
    hastaTexto: string;
    totalVendido: number;
    costoFabricacion: number;
    ganancia: number;
    ventasIncluidas: number;
    productosAgrupados: Array<{
      idProducto: string;
      productoNombre: string;
      cantidadTotal: number;
      vendidoTotal: number;
      costoTotal: number;
      ganancia: number;
    }>;
  } | null>(null);
  const [pendingVentaDelete, setPendingVentaDelete] = useState<VentaRow | null>(null);
  const [ventaDeleteLoading, setVentaDeleteLoading] = useState(false);
  const [ventaDeleteErr, setVentaDeleteErr] = useState<string | null>(null);
  const [exportExcelLoading, setExportExcelLoading] = useState(false);

  const filtered = useMemo(() => {
    const from = desde ? new Date(`${desde}T00:00:00`) : null;
    const to = hasta ? new Date(`${hasta}T23:59:59`) : null;
    return initialVentas.filter((v) => {
      const d = new Date(v.fechaIso);
      if (from && d < from) return false;
      if (to && d > to) return false;
      return true;
    });
  }, [initialVentas, desde, hasta]);

  const productoFabMap = useMemo(() => {
    const m = new Map<string, number>();
    for (const p of productos) {
      m.set(p.id, p.precioFabricacion);
    }
    return m;
  }, [productos]);

  function calcularTotalesRango() {
    const totalVendido = filtered.reduce((s, v) => s + v.total, 0);
    let costoFabricacion = 0;
    const productosAgrupadosMap = new Map<
      string,
      {
        idProducto: string;
        productoNombre: string;
        cantidadTotal: number;
        vendidoTotal: number;
        costoTotal: number;
      }
    >();
    for (const v of filtered) {
      for (const d of v.detalles) {
        const unitFab = productoFabMap.get(d.idProducto) ?? 0;
        costoFabricacion += d.cantidad * unitFab;
        const vendidoLinea = d.cantidad * d.precioUnitario;
        const costoLinea = d.cantidad * unitFab;
        const prev = productosAgrupadosMap.get(d.idProducto);
        if (prev) {
          prev.cantidadTotal += d.cantidad;
          prev.vendidoTotal += vendidoLinea;
          prev.costoTotal += costoLinea;
        } else {
          productosAgrupadosMap.set(d.idProducto, {
            idProducto: d.idProducto,
            productoNombre: d.productoNombre,
            cantidadTotal: d.cantidad,
            vendidoTotal: vendidoLinea,
            costoTotal: costoLinea,
          });
        }
      }
    }
    const productosAgrupados = [...productosAgrupadosMap.values()]
      .map((p) => ({
        ...p,
        ganancia: p.vendidoTotal - p.costoTotal,
      }))
      .sort((a, b) => b.vendidoTotal - a.vendidoTotal);
    const ganancia = totalVendido - costoFabricacion;
    const desdeTexto =
      !desde && !hasta
        ? "Todas las fechas"
        : desde
          ? formatDateInput(desde)
          : "Sin fecha inicial";
    const hastaTexto =
      !desde && !hasta
        ? "Todas las fechas"
        : hasta
          ? formatDateInput(hasta)
          : "Sin fecha final";
    setTotalesResumen({
      desdeTexto,
      hastaTexto,
      totalVendido,
      costoFabricacion,
      ganancia,
      ventasIncluidas: filtered.length,
      productosAgrupados,
    });
    setTotalesOpen(true);
  }

  function limpiarFiltroFechas() {
    setDesde("");
    setHasta("");
  }

  async function exportarDetalleExcelPeriodo() {
    if (filtered.length === 0) return;
    setExportExcelLoading(true);
    try {
      const base = `ventas-detalle-${desde || "todas-fechas"}-${hasta || "todas-fechas"}`;
      await downloadVentasDetalleXlsx(filtered, base);
    } catch (err) {
      console.error(err);
    } finally {
      setExportExcelLoading(false);
    }
  }

  function resetForm() {
    setIdUsuario(usuarios[0]?.id ?? "");
    setFecha(toDatetimeLocalInput(new Date().toISOString()));
    setDetalles([{ idProducto: "", cantidad: "1", precioUnitario: "0" }]);
    setError(null);
  }

  function startCreate() {
    setEditing(null);
    resetForm();
    setOpen(true);
  }

  function startEdit(v: VentaRow) {
    setEditing(v);
    setIdUsuario(v.usuario.id);
    setFecha(toDatetimeLocalInput(v.fechaIso));
    setDetalles(
      v.detalles.map((d) => ({
        idProducto: d.idProducto,
        cantidad: String(d.cantidad),
        precioUnitario: String(d.precioUnitario),
      }))
    );
    setError(null);
    setOpen(true);
  }

  function addDetalle() {
    setDetalles((prev) => [...prev, { idProducto: "", cantidad: "1", precioUnitario: "0" }]);
  }

  function removeDetalle(index: number) {
    setDetalles((prev) => prev.filter((_, i) => i !== index));
  }

  function updateDetalle(index: number, patch: Partial<DetalleForm>) {
    setDetalles((prev) => prev.map((d, i) => (i === index ? { ...d, ...patch } : d)));
  }

  function onSelectProducto(index: number, idProd: string) {
    const p = productos.find((x) => x.id === idProd);
    updateDetalle(index, {
      idProducto: idProd,
      precioUnitario: String(p?.precioVenta ?? 0),
    });
  }

  async function submitVenta(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!idUsuario) {
      setError("Selecciona un usuario.");
      return;
    }
    const mapped = [];
    for (const [i, d] of detalles.entries()) {
      if (!d.idProducto) {
        setError(`Selecciona producto en línea ${i + 1}.`);
        return;
      }
      const cantidad = Number(d.cantidad.replace(",", "."));
      const precio = Number(d.precioUnitario.replace(",", "."));
      if (!Number.isFinite(cantidad) || cantidad <= 0) {
        setError(`Cantidad inválida en línea ${i + 1}.`);
        return;
      }
      if (!Number.isFinite(precio) || precio < 0) {
        setError(`Precio inválido en línea ${i + 1}.`);
        return;
      }
      mapped.push({
        id_producto: d.idProducto,
        cantidad,
        precio_unitario: precio,
      });
    }

    setLoading(true);
    try {
      const url = editing ? `/api/admin/ventas/${editing.id}` : "/api/admin/ventas";
      const method = editing ? "PATCH" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({
          id_usuario: idUsuario,
          fecha: new Date(fecha).toISOString(),
          detalles: mapped,
        }),
      });
      const data = (await res.json().catch(() => null)) as { error?: string };
      if (!res.ok) throw new Error(data?.error ?? "No se pudo guardar");
      setOpen(false);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error");
    } finally {
      setLoading(false);
    }
  }

  async function executeDeleteVenta() {
    const v = pendingVentaDelete;
    if (!v) return;
    setVentaDeleteErr(null);
    setVentaDeleteLoading(true);
    try {
      const res = await fetch(`/api/admin/ventas/${v.id}`, {
        method: "DELETE",
        credentials: "same-origin",
      });
      const data = (await res.json().catch(() => null)) as { error?: string };
      if (!res.ok) throw new Error(data?.error ?? "No se pudo eliminar");
      setPendingVentaDelete(null);
      router.refresh();
    } catch (err) {
      setVentaDeleteErr(err instanceof Error ? err.message : "Error");
    } finally {
      setVentaDeleteLoading(false);
    }
  }

  const totalPreview = detalles.reduce((acc, d) => {
    const c = Number(d.cantidad.replace(",", "."));
    const p = Number(d.precioUnitario.replace(",", "."));
    if (!Number.isFinite(c) || !Number.isFinite(p)) return acc;
    return acc + c * p;
  }, 0);
  const costoFabricacionPreview = detalles.reduce((acc, d) => {
    const c = Number(d.cantidad.replace(",", "."));
    const p = productos.find((x) => x.id === d.idProducto);
    if (!Number.isFinite(c) || c <= 0 || !p) return acc;
    return acc + c * p.precioFabricacion;
  }, 0);
  const margenPreview = totalPreview - costoFabricacionPreview;
  const margenPct = totalPreview > 0 ? (margenPreview / totalPreview) * 100 : 0;

  return (
    <div className="space-y-4">
      <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-black/5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="grid flex-1 gap-3 sm:grid-cols-2 lg:max-w-xl">
            <label className="text-sm">
              Desde
              <input
                type="date"
                value={desde}
                onChange={(e) => setDesde(e.target.value)}
                className="mt-1 w-full rounded-xl border border-[#ddd] px-3 py-2"
              />
            </label>
            <label className="text-sm">
              Hasta
              <input
                type="date"
                value={hasta}
                onChange={(e) => setHasta(e.target.value)}
                className="mt-1 w-full rounded-xl border border-[#ddd] px-3 py-2"
              />
            </label>
          </div>
          <div className="flex flex-wrap items-center gap-2 lg:shrink-0">
            <button
              type="button"
              onClick={limpiarFiltroFechas}
              disabled={!desde && !hasta}
              title={!desde && !hasta ? "No hay fechas seleccionadas" : undefined}
              className="inline-flex items-center gap-2 rounded-full border border-[#ddd] bg-white px-4 py-2.5 text-sm font-medium text-[#444] disabled:cursor-not-allowed disabled:opacity-45"
            >
              <FilterX size={16} />
              Limpiar filtro
            </button>
            <button
              type="button"
              onClick={calcularTotalesRango}
              className="inline-flex items-center gap-2 rounded-full bg-[#f6f5f3] px-4 py-2.5 text-sm font-semibold ring-1 ring-black/10"
            >
              <Calculator size={16} />
              Calcular total
            </button>
            <button
              type="button"
              onClick={startCreate}
              className="inline-flex items-center gap-2 rounded-full bg-[#1f1f1f] px-5 py-2.5 text-sm font-semibold text-white"
            >
              <Plus size={16} />
              Crear venta
            </button>
          </div>
        </div>
        <p className="mt-3 text-xs text-[#666]">
          El listado se filtra al instante. «Calcular total» resume las ventas visibles (costo de fabricación con el precio actual de cada producto).
        </p>
      </div>

      {ventaDeleteErr ? (
        <p className="rounded-xl border border-[#ffd1d1] bg-[#fff2f2] px-3 py-2 text-sm text-[#b42318]">
          {ventaDeleteErr}
        </p>
      ) : null}

      <div className="space-y-4">
        {filtered.map((v) => (
          <article
            key={v.id}
            className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-black/5"
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold">{v.numeroOrden}</p>
                <p className="text-xs text-[#666]">ID interno: {v.id}</p>
                <p className="text-xs text-[#666]">
                  {v.usuario.nombre} · {v.usuario.email}
                </p>
                <p className="mt-1 text-xs text-[#666]">
                  {new Intl.DateTimeFormat("es-CO", {
                    dateStyle: "medium",
                    timeStyle: "short",
                  }).format(new Date(v.fechaIso))}
                </p>
              </div>
              <div className="flex items-start gap-3">
                <p className="text-lg font-semibold">${formatPrice(v.total)}</p>
                <div className="flex gap-2">
                  <button
                    type="button"
                    title="Editar"
                    aria-label="Editar"
                    onClick={() => startEdit(v)}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#f6f5f3] ring-1 ring-black/10"
                  >
                    <Pencil size={14} />
                  </button>
                  <button
                    type="button"
                    title="Eliminar"
                    aria-label="Eliminar"
                    onClick={() => {
                      setVentaDeleteErr(null);
                      setPendingVentaDelete(v);
                    }}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-[#ffd1d1] bg-[#fff8f8] text-[#b42318]"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
            <ul className="mt-4 space-y-2 border-t border-[#ece8df] pt-4 text-sm">
              {v.detalles.map((d) => (
                <li key={d.id} className="flex justify-between gap-3">
                  <span>
                    {d.productoNombre} <span className="text-[#666]">x{d.cantidad}</span>
                  </span>
                  <span className="shrink-0 text-[#666]">
                    ${formatPrice(d.precioUnitario)} c/u
                  </span>
                </li>
              ))}
            </ul>
          </article>
        ))}
        {filtered.length === 0 ? (
          <p className="text-sm text-[#666]">No hay ventas para ese rango.</p>
        ) : null}
      </div>

      <AdminConfirmModal
        open={pendingVentaDelete !== null}
        title="¿Eliminar esta venta?"
        description={
          pendingVentaDelete
            ? `Se eliminará la venta ${pendingVentaDelete.numeroOrden} y todo su detalle. Esta acción no se puede deshacer.`
            : ""
        }
        confirmLabel="Eliminar"
        cancelLabel="Cancelar"
        tone="danger"
        loading={ventaDeleteLoading}
        onClose={() => {
          if (!ventaDeleteLoading) {
            setPendingVentaDelete(null);
            setVentaDeleteErr(null);
          }
        }}
        onConfirm={executeDeleteVenta}
      />

      {totalesOpen && totalesResumen ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="totales-ventas-title"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setTotalesOpen(false);
          }}
        >
          <div
            className="flex max-h-[88vh] w-full max-w-md flex-col overflow-hidden rounded-3xl bg-white shadow-xl ring-1 ring-black/10"
            onMouseDown={(e) => e.stopPropagation()}
          >
            <div className="overflow-y-auto p-6">
              <h2 id="totales-ventas-title" className="text-lg font-semibold">
                Resumen del período
              </h2>
              <p className="mt-2 text-sm text-[#666]">
                <span className="font-medium text-[#1f1f1f]">Desde:</span>{" "}
                {totalesResumen.desdeTexto}
              </p>
              <p className="mt-1 text-sm text-[#666]">
                <span className="font-medium text-[#1f1f1f]">Hasta:</span>{" "}
                {totalesResumen.hastaTexto}
              </p>
              <p className="mt-2 text-xs text-[#888]">
                Ventas incluidas: {totalesResumen.ventasIncluidas}
              </p>
              <div className="mt-5 border-t border-[#ece8df] pt-4">
                <h3 className="text-sm font-semibold">Incluye</h3>
                {totalesResumen.productosAgrupados.length === 0 ? (
                  <p className="mt-2 text-sm text-[#666]">No hay productos en este rango.</p>
                ) : (
                  <ul className="mt-2 space-y-2 text-sm">
                    {totalesResumen.productosAgrupados.map((p) => (
                      <li
                        key={p.idProducto}
                        className="rounded-xl border border-[#ece8df] bg-[#faf9f7] px-3 py-2"
                      >
                        <p className="font-medium">{p.productoNombre}</p>
                        <p className="text-xs text-[#666]">
                          Cantidad: {p.cantidadTotal} · Vendido: $
                          {formatPrice(Math.round(p.vendidoTotal))}
                        </p>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <dl className="mt-5 space-y-3 border-t border-[#ece8df] pt-4 text-sm">
                <div className="flex justify-between gap-3">
                  <dt className="text-[#666]">Total vendido</dt>
                  <dd className="font-semibold">
                    ${formatPrice(Math.round(totalesResumen.totalVendido))}
                  </dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-[#666]">Total costo fabricación</dt>
                  <dd className="font-semibold">
                    ${formatPrice(Math.round(totalesResumen.costoFabricacion))}
                  </dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-[#666]">Ganancia</dt>
                  <dd
                    className={
                      totalesResumen.ganancia >= 0
                        ? "font-semibold text-green-700"
                        : "font-semibold text-red-700"
                    }
                  >
                    ${formatPrice(Math.round(totalesResumen.ganancia))}
                  </dd>
                </div>
              </dl>
            </div>
            <div className="space-y-2 border-t border-[#ece8df] p-4">
              <button
                type="button"
                disabled={exportExcelLoading || filtered.length === 0}
                onClick={() => void exportarDetalleExcelPeriodo()}
                className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-[#e7e3dc] bg-white py-2.5 text-sm font-semibold text-[#1f1f1f] disabled:cursor-not-allowed disabled:opacity-45"
              >
                <Table size={16} aria-hidden />
                {exportExcelLoading ? "Generando…" : "Exportar ventas"}
              </button>
              <button
                type="button"
                onClick={() => setTotalesOpen(false)}
                className="w-full rounded-full bg-[#1f1f1f] py-2.5 text-sm font-semibold text-white"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {open ? (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center bg-black/45 p-4 pt-10 sm:pt-14"
          role="dialog"
          aria-modal="true"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setOpen(false);
          }}
        >
          <div
            className="max-h-[90vh] w-full max-w-4xl overflow-auto rounded-3xl bg-white p-6 shadow-xl ring-1 ring-black/10"
            onMouseDown={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between gap-3">
              <h2 className="text-lg font-semibold">
                {editing ? "Editar venta" : "Crear venta"}
              </h2>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-full bg-[#f6f5f3] px-4 py-2 text-sm font-medium ring-1 ring-black/10"
              >
                Cerrar
              </button>
            </div>

            <form onSubmit={(e) => void submitVenta(e)} className="grid gap-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="text-sm">
                  Usuario
                  <select
                    value={idUsuario}
                    onChange={(e) => setIdUsuario(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-[#ddd] px-3 py-2"
                  >
                    {usuarios.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.nombre} ({u.email})
                      </option>
                    ))}
                  </select>
                </label>
                <label className="text-sm">
                  Fecha y hora
                  <input
                    type="datetime-local"
                    value={fecha}
                    onChange={(e) => setFecha(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-[#ddd] px-3 py-2"
                  />
                </label>
              </div>

              <div className="rounded-2xl border border-[#ece8df] bg-[#faf9f7] p-4">
                <div className="mb-2 flex items-center justify-between gap-2">
                  <h3 className="text-sm font-semibold">Detalle</h3>
                  <button
                    type="button"
                    onClick={addDetalle}
                    className="rounded-full bg-[#f6f5f3] px-3 py-1.5 text-xs font-medium ring-1 ring-black/10"
                  >
                    Añadir línea
                  </button>
                </div>
                <div className="mb-2 hidden text-xs text-[#666] sm:grid sm:grid-cols-[2fr_1fr_1fr_auto] sm:gap-2">
                  <span>Producto</span>
                  <span>Cantidad</span>
                  <span>Precio unitario</span>
                  <span className="text-right">Acción</span>
                </div>
                <div className="space-y-2">
                  {detalles.map((d, i) => (
                    <div key={`d-${i}`} className="grid gap-2 sm:grid-cols-[2fr_1fr_1fr_auto]">
                      <select
                        value={d.idProducto}
                        onChange={(e) => onSelectProducto(i, e.target.value)}
                        className="rounded-xl border border-[#ddd] px-3 py-2 text-sm"
                      >
                        <option value="">Selecciona producto</option>
                        {productos.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.nombre}
                          </option>
                        ))}
                      </select>
                      <input
                        value={d.cantidad}
                        onChange={(e) => updateDetalle(i, { cantidad: e.target.value })}
                        inputMode="decimal"
                        placeholder="Cantidad"
                        className="rounded-xl border border-[#ddd] px-3 py-2 text-sm"
                      />
                      <input
                        value={d.precioUnitario}
                        onChange={(e) => updateDetalle(i, { precioUnitario: e.target.value })}
                        inputMode="decimal"
                        placeholder="Precio c/u"
                        className="rounded-xl border border-[#ddd] px-3 py-2 text-sm"
                      />
                      <button
                        type="button"
                        onClick={() => removeDetalle(i)}
                        className="rounded-full border border-[#ffd1d1] bg-[#fff8f8] px-3 py-2 text-xs font-medium text-[#b42318]"
                      >
                        Quitar
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <p className="text-sm text-[#666]">
                Total estimado: <span className="font-semibold">${formatPrice(totalPreview)}</span>
              </p>
              <div className="rounded-2xl border border-[#ece8df] bg-[#f8fafc] p-4">
                <h3 className="text-sm font-semibold">Comparación (en vivo)</h3>
                <div className="mt-2 grid gap-2 text-sm sm:grid-cols-3">
                  <p>
                    Vendido: <span className="font-semibold">${formatPrice(totalPreview)}</span>
                  </p>
                  <p>
                    Costo fabricación:{" "}
                    <span className="font-semibold">${formatPrice(costoFabricacionPreview)}</span>
                  </p>
                  <p>
                    Margen:{" "}
                    <span className={margenPreview >= 0 ? "font-semibold text-green-700" : "font-semibold text-red-700"}>
                      ${formatPrice(margenPreview)} ({margenPct.toFixed(1)}%)
                    </span>
                  </p>
                </div>
              </div>

              {error ? <p className="text-sm text-red-600">{error}</p> : null}

              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="rounded-full bg-[#1f1f1f] px-6 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
                >
                  {loading ? "Guardando..." : editing ? "Guardar cambios" : "Crear venta"}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}

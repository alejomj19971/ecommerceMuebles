"use client";

import { useMemo, useState } from "react";
import type { AdminInventoryItem, AdminSaleLine } from "@/mocks/admin-data";
import { Button } from "@/components/ui/button";

type SaleFormDialogProps = {
  open: boolean;
  inventory: AdminInventoryItem[];
  onClose: () => void;
  invoiceNo: string;
  onSubmit: (payload: {
    customerName: string;
    method: "Efectivo" | "Tarjeta" | "Transferencia";
    lines: AdminSaleLine[];
  }) => void;
};

type LineDraft = {
  productId: string;
  qty: string; // input
};

const methods = ["Efectivo", "Tarjeta", "Transferencia"] as const;

function parseQty(value: string) {
  const n = Number(value.replace(/[^0-9]/g, ""));
  return Number.isFinite(n) ? n : 0;
}

function calcSubtotal(lines: AdminSaleLine[]) {
  return lines.reduce((acc, line) => acc + line.qty * line.unitPrice, 0);
}

export function SaleFormDialog({
  open,
  inventory,
  onClose,
  invoiceNo,
  onSubmit,
}: SaleFormDialogProps) {
  const [customerName, setCustomerName] = useState("");
  const [method, setMethod] = useState<(typeof methods)[number]>("Tarjeta");
  const [linesDraft, setLinesDraft] = useState<LineDraft[]>([
    { productId: inventory[0]?.id ?? "", qty: "1" },
  ]);

  const productById = useMemo(() => {
    return new Map(inventory.map((p) => [p.id, p]));
  }, [inventory]);

  const lines: AdminSaleLine[] = useMemo(() => {
    return linesDraft
      .filter((l) => l.productId)
      .map((draft) => {
        const product = productById.get(draft.productId);
        return {
          productId: draft.productId,
          qty: Math.max(1, parseQty(draft.qty)),
          unitPrice: product?.price ?? 0,
        };
      });
  }, [linesDraft, productById]);

  const subtotal = useMemo(() => calcSubtotal(lines), [lines]);
  const tax = useMemo(() => Math.round(subtotal * 0.19), [subtotal]);
  const total = useMemo(() => subtotal + tax, [subtotal, tax]);

  const canSubmit = useMemo(() => {
    if (!customerName.trim()) return false;
    if (inventory.length === 0) return false;
    if (lines.length === 0) return false;
    if (lines.some((l) => !productById.get(l.productId))) return false;
    return true;
  }, [customerName, inventory.length, lines, productById]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      role="dialog"
      aria-modal="true"
    >
      <div className="w-full max-w-3xl rounded-3xl bg-white p-5 shadow-sm ring-1 ring-black/5 sm:p-7">
        <div className="mb-5 flex items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold">Registrar venta</h2>
            <p className="mt-1 text-xs text-[#666]">
              Factura: <span className="font-semibold">{invoiceNo}</span>
            </p>
          </div>
          <button
            className="rounded-xl border border-[#e7e3dc] px-3 py-1 text-sm"
            onClick={onClose}
          >
            Cerrar
          </button>
        </div>

        <form
          className="space-y-5"
          onSubmit={(e) => {
            e.preventDefault();
            if (!canSubmit) return;
            onSubmit({
              customerName: customerName.trim(),
              method,
              lines,
            });
            onClose();
          }}
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="text-sm">
              Cliente
              <input
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="mt-1 w-full rounded-xl border border-[#ddd] px-3 py-2"
                placeholder="Nombre del cliente"
                required
              />
            </label>
            <label className="text-sm">
              Metodo de pago
              <select
                value={method}
                onChange={(e) => setMethod(e.target.value as typeof method)}
                className="mt-1 w-full rounded-xl border border-[#ddd] px-3 py-2"
              >
                {methods.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-sm font-semibold">Items</h3>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setLinesDraft((prev) => [
                    ...prev,
                    { productId: inventory[0]?.id ?? "", qty: "1" },
                  ]);
                }}
                className="h-9 rounded-full"
              >
                + Agregar item
              </Button>
            </div>

            <div className="space-y-3">
              {linesDraft.map((draft, idx) => {
                const product = productById.get(draft.productId);
                const qtyN = parseQty(draft.qty);
                const lowStock = product ? qtyN > product.stockQty : false;
                return (
                  <div
                    key={`${draft.productId}-${idx}`}
                    className="grid gap-3 sm:grid-cols-[1.5fr_0.7fr_auto] sm:items-end"
                  >
                    <label className="text-sm">
                      Producto
                      <select
                        value={draft.productId}
                        onChange={(e) => {
                          const next = [...linesDraft];
                          next[idx] = {
                            ...next[idx],
                            productId: e.target.value,
                          };
                          setLinesDraft(next);
                        }}
                        className="mt-1 w-full rounded-xl border border-[#ddd] px-3 py-2"
                      >
                        {inventory.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.name}
                          </option>
                        ))}
                      </select>
                      {lowStock ? (
                        <p className="mt-1 text-xs text-[#b42318]">
                          Stock insuficiente (disponible: {product?.stockQty})
                        </p>
                      ) : null}
                    </label>
                    <label className="text-sm">
                      Cantidad
                      <input
                        value={draft.qty}
                        onChange={(e) => {
                          const next = [...linesDraft];
                          next[idx] = { ...next[idx], qty: e.target.value };
                          setLinesDraft(next);
                        }}
                        className="mt-1 w-full rounded-xl border border-[#ddd] px-3 py-2"
                        inputMode="numeric"
                        required
                      />
                    </label>
                    <div className="flex justify-end">
                      <Button
                        type="button"
                        variant="outline"
                        className="h-9 rounded-full"
                        onClick={() => {
                          setLinesDraft((prev) => prev.filter((_, i) => i !== idx));
                        }}
                        disabled={linesDraft.length === 1}
                      >
                        Quitar
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="rounded-2xl bg-[#f6f5f3] p-4 text-sm">
            <div className="flex items-center justify-between">
              <span>Subtotal</span>
              <span className="font-semibold">${subtotal.toLocaleString("es-CO")}</span>
            </div>
            <div className="mt-2 flex items-center justify-between">
              <span>IVA (19%)</span>
              <span className="font-semibold">${tax.toLocaleString("es-CO")}</span>
            </div>
            <div className="mt-2 flex items-center justify-between border-t border-[#ece8df] pt-3">
              <span className="font-semibold">Total</span>
              <span className="font-semibold">${total.toLocaleString("es-CO")}</span>
            </div>
          </div>

          <div className="flex gap-3 justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="rounded-full"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="rounded-full"
              disabled={!canSubmit}
            >
              Guardar venta
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}


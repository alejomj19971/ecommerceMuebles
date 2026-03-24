/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useEffect, useMemo, useState } from "react";
import type { AdminInventoryItem, InventoryCategory } from "@/mocks/admin-data";
import { Button } from "@/components/ui/button";

type InventoryFormDialogProps = {
  open: boolean;
  mode: "create" | "edit";
  initialItem?: AdminInventoryItem;
  onClose: () => void;
  onSave: (item: Omit<AdminInventoryItem, "id"> & { id?: string }) => void;
};

const categories: InventoryCategory[] = [
  "Sala",
  "Dormitorio",
  "Comedor",
  "Oficina",
];

function parseNumber(value: string) {
  return Number(value.replace(/[^0-9.]/g, ""));
}

export function InventoryFormDialog({
  open,
  mode,
  initialItem,
  onClose,
  onSave,
}: InventoryFormDialogProps) {
  const [sku, setSku] = useState("");
  const [name, setName] = useState("");
  const [category, setCategory] = useState<InventoryCategory>("Sala");
  const [stockQty, setStockQty] = useState("0");
  const [minStockQty, setMinStockQty] = useState("0");
  const [price, setPrice] = useState("0");
  const [cost, setCost] = useState("0");

  useEffect(() => {
    if (!open) return;

    setSku(initialItem?.sku ?? "");
    setName(initialItem?.name ?? "");
    setCategory(initialItem?.category ?? "Sala");
    setStockQty(String(initialItem?.stockQty ?? 0));
    setMinStockQty(String(initialItem?.minStockQty ?? 0));
    setPrice(String(initialItem?.price ?? 0));
    setCost(String(initialItem?.cost ?? 0));
  }, [initialItem, mode, open]);

  const title = useMemo(
    () => (mode === "create" ? "Nuevo producto" : "Editar producto"),
    [mode]
  );

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      role="dialog"
      aria-modal="true"
    >
      <div className="w-full max-w-2xl rounded-3xl bg-white p-5 shadow-sm ring-1 ring-black/5 sm:p-7">
        <div className="mb-5 flex items-center justify-between gap-4">
          <h2 className="text-lg font-semibold">{title}</h2>
          <button
            className="rounded-xl border border-[#e7e3dc] px-3 py-1 text-sm"
            onClick={onClose}
          >
            Cerrar
          </button>
        </div>

        <form
          className="grid gap-4 sm:grid-cols-2"
          onSubmit={(e) => {
            e.preventDefault();
            onSave({
              id: initialItem?.id,
              sku: sku.trim(),
              name: name.trim(),
              category,
              stockQty: parseNumber(stockQty),
              minStockQty: parseNumber(minStockQty),
              price: parseNumber(price),
              cost: parseNumber(cost),
            });
            onClose();
          }}
        >
          <label className="text-sm">
            SKU
            <input
              value={sku}
              onChange={(e) => setSku(e.target.value)}
              className="mt-1 w-full rounded-xl border border-[#ddd] px-3 py-2"
              placeholder="AVD-001"
              required
            />
          </label>
          <label className="text-sm">
            Producto
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 w-full rounded-xl border border-[#ddd] px-3 py-2"
              placeholder="Nombre del mueble"
              required
            />
          </label>

          <label className="text-sm sm:col-span-2">
            Categoria
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as InventoryCategory)}
              className="mt-1 w-full rounded-xl border border-[#ddd] px-3 py-2"
            >
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </label>

          <label className="text-sm">
            Stock (unidades)
            <input
              value={stockQty}
              onChange={(e) => setStockQty(e.target.value)}
              className="mt-1 w-full rounded-xl border border-[#ddd] px-3 py-2"
              inputMode="numeric"
              required
            />
          </label>
          <label className="text-sm">
            Stock minimo
            <input
              value={minStockQty}
              onChange={(e) => setMinStockQty(e.target.value)}
              className="mt-1 w-full rounded-xl border border-[#ddd] px-3 py-2"
              inputMode="numeric"
              required
            />
          </label>

          <label className="text-sm">
            Precio (COP)
            <input
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="mt-1 w-full rounded-xl border border-[#ddd] px-3 py-2"
              inputMode="numeric"
              required
            />
          </label>
          <label className="text-sm">
            Costo (COP)
            <input
              value={cost}
              onChange={(e) => setCost(e.target.value)}
              className="mt-1 w-full rounded-xl border border-[#ddd] px-3 py-2"
              inputMode="numeric"
              required
            />
          </label>

          <div className="flex gap-3 sm:col-span-2 sm:justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="rounded-full"
            >
              Cancelar
            </Button>
            <Button type="submit" className="rounded-full">
              Guardar
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}


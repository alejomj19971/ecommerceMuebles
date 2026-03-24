/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

type ClosureFormDialogProps = {
  open: boolean;
  defaultStart: string;
  defaultEnd: string;
  onClose: () => void;
  onSubmit: (payload: { periodStart: string; periodEnd: string }) => void;
};

export function ClosureFormDialog({
  open,
  defaultStart,
  defaultEnd,
  onClose,
  onSubmit,
}: ClosureFormDialogProps) {
  const [periodStart, setPeriodStart] = useState(defaultStart);
  const [periodEnd, setPeriodEnd] = useState(defaultEnd);

  useEffect(() => {
    if (!open) return;
    setPeriodStart(defaultStart);
    setPeriodEnd(defaultEnd);
  }, [defaultEnd, defaultStart, open]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      role="dialog"
      aria-modal="true"
    >
      <div className="w-full max-w-xl rounded-3xl bg-white p-5 shadow-sm ring-1 ring-black/5 sm:p-7">
        <div className="mb-5 flex items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold">Crear cierre</h2>
            <p className="mt-1 text-xs text-[#666]">
              Periodo para consolidar ventas.
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
          className="grid gap-4"
          onSubmit={(e) => {
            e.preventDefault();
            onSubmit({ periodStart, periodEnd });
            onClose();
          }}
        >
          <label className="text-sm">
            Desde
            <input
              type="date"
              value={periodStart}
              onChange={(e) => setPeriodStart(e.target.value)}
              className="mt-1 w-full rounded-xl border border-[#ddd] px-3 py-2"
              required
            />
          </label>
          <label className="text-sm">
            Hasta
            <input
              type="date"
              value={periodEnd}
              onChange={(e) => setPeriodEnd(e.target.value)}
              className="mt-1 w-full rounded-xl border border-[#ddd] px-3 py-2"
              required
            />
          </label>

          <div className="flex gap-3 justify-end pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="rounded-full"
            >
              Cancelar
            </Button>
            <Button type="submit" className="rounded-full">
              Generar cierre
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}


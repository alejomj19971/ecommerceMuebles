"use client";

import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { CreateProductoForm } from "@/components/admin/create-producto-form";

type MaterialOption = {
  id: string;
  nombre: string;
  categoria: string;
  unidadMedida: string;
  precioUnitario: number;
};

type Props = {
  materiales: MaterialOption[];
};

export function CreateProductoModal({ materiales }: Props) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 rounded-full bg-[#1f1f1f] px-5 py-2.5 text-sm font-semibold text-white"
      >
        <Plus size={16} />
        Crear nuevo producto
      </button>

      {open ? (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/45 p-2 pt-6 sm:p-4 sm:pt-10"
          role="dialog"
          aria-modal="true"
          aria-labelledby="crear-producto-modal-title"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setOpen(false);
          }}
        >
          <div
            className="w-full max-w-[1100px] overflow-x-hidden rounded-3xl bg-white p-4 shadow-xl ring-1 ring-black/10 sm:max-h-[90vh] sm:overflow-auto sm:p-6"
            onMouseDown={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between gap-3">
              <h2 id="crear-producto-modal-title" className="text-lg font-semibold">
                Crear nuevo producto
              </h2>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-full bg-[#f6f5f3] px-4 py-2 text-sm font-medium ring-1 ring-black/10"
              >
                Cerrar
              </button>
            </div>

            <CreateProductoForm materiales={materiales} onCreated={() => setOpen(false)} />
          </div>
        </div>
      ) : null}
    </>
  );
}

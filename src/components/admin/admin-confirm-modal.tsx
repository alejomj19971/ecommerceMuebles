"use client";

import { useEffect } from "react";

type Props = {
  open: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  tone?: "danger" | "neutral";
  loading?: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
};

export function AdminConfirmModal({
  open,
  title,
  description,
  confirmLabel = "Confirmar",
  cancelLabel = "Cancelar",
  tone = "danger",
  loading = false,
  onClose,
  onConfirm,
}: Props) {
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape" && !loading) onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, loading, onClose]);

  if (!open) return null;

  const confirmClass =
    tone === "danger"
      ? "bg-[#b42318] text-white hover:bg-[#9a1d14] disabled:opacity-60"
      : "bg-[#1f1f1f] text-white hover:bg-black disabled:opacity-60";

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/45 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="admin-confirm-title"
      aria-describedby="admin-confirm-desc"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget && !loading) onClose();
      }}
    >
      <div
        className="w-full max-w-md rounded-3xl bg-white p-6 shadow-xl ring-1 ring-black/10"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <h2 id="admin-confirm-title" className="text-lg font-semibold text-[#1f1f1f]">
          {title}
        </h2>
        <p id="admin-confirm-desc" className="mt-3 text-sm leading-relaxed text-[#666]">
          {description}
        </p>
        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button
            type="button"
            disabled={loading}
            onClick={onClose}
            className="rounded-full border border-[#ddd] bg-white px-5 py-2.5 text-sm font-medium text-[#444] disabled:opacity-50"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            disabled={loading}
            onClick={() => void onConfirm()}
            className={`rounded-full px-5 py-2.5 text-sm font-semibold ${confirmClass}`}
          >
            {loading ? "Procesando…" : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

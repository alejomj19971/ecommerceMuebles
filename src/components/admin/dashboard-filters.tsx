"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { CalendarRange } from "lucide-react";

function toYmd(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

type Props = {
  desdeValue: string;
  hastaValue: string;
};

export function DashboardFilters({ desdeValue, hastaValue }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function applyRange(desde: string, hasta: string) {
    const q = new URLSearchParams();
    q.set("desde", desde);
    q.set("hasta", hasta);
    startTransition(() => {
      router.push(`/admin?${q.toString()}`);
    });
  }

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const d = String(fd.get("desde") ?? "").slice(0, 10);
    const h = String(fd.get("hasta") ?? "").slice(0, 10);
    if (d && h) applyRange(d, h);
  }

  function presetLastDays(n: number) {
    const hasta = new Date();
    const desde = new Date(hasta);
    desde.setDate(desde.getDate() - (n - 1));
    applyRange(toYmd(desde), toYmd(hasta));
  }

  function presetThisYear() {
    const hasta = new Date();
    const desde = new Date(hasta.getFullYear(), 0, 1);
    applyRange(toYmd(desde), toYmd(hasta));
  }

  /** Semana calendario: lunes 00:00 → domingo (fecha inclusive), hora local. */
  function presetThisWeek() {
    const now = new Date();
    const y = now.getFullYear();
    const mo = now.getMonth();
    const da = now.getDate();
    const dow = now.getDay();
    const daysSinceMonday = dow === 0 ? 6 : dow - 1;
    const monday = new Date(y, mo, da - daysSinceMonday);
    const sunday = new Date(y, mo, da - daysSinceMonday + 6);
    applyRange(toYmd(monday), toYmd(sunday));
  }

  return (
    <section className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-black/5 sm:p-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-start gap-3">
          <div className="rounded-xl bg-[#f6f5f3] p-2 ring-1 ring-black/5">
            <CalendarRange className="h-5 w-5 text-[#1f1f1f]" aria-hidden />
          </div>
          <div>
            <h2 className="text-lg font-semibold">Filtros de período</h2>
            <p className="mt-0.5 text-sm text-[#666]">
              Todas las gráficas y KPIs analíticos usan el rango seleccionado. Los contadores de
              catálogo (productos/materiales) siguen siendo totales globales.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            disabled={pending}
            onClick={presetThisWeek}
            title="Desde el lunes hasta el domingo de la semana actual (hora local)"
            className="rounded-full border border-[#1f1f1f] bg-[#1f1f1f] px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-50"
          >
            Esta semana
          </button>
          <button
            type="button"
            disabled={pending}
            onClick={() => presetLastDays(7)}
            className="rounded-full border border-[#e7e3dc] bg-[#faf9f7] px-3 py-1.5 text-xs font-semibold text-[#333] disabled:opacity-50"
          >
            Últimos 7 días
          </button>
          <button
            type="button"
            disabled={pending}
            onClick={() => presetLastDays(30)}
            className="rounded-full border border-[#e7e3dc] bg-[#faf9f7] px-3 py-1.5 text-xs font-semibold text-[#333] disabled:opacity-50"
          >
            30 días
          </button>
          <button
            type="button"
            disabled={pending}
            onClick={() => presetLastDays(90)}
            className="rounded-full border border-[#e7e3dc] bg-[#faf9f7] px-3 py-1.5 text-xs font-semibold text-[#333] disabled:opacity-50"
          >
            90 días
          </button>
          <button
            type="button"
            disabled={pending}
            onClick={presetThisYear}
            className="rounded-full border border-[#e7e3dc] bg-[#faf9f7] px-3 py-1.5 text-xs font-semibold text-[#333] disabled:opacity-50"
          >
            Año en curso
          </button>
        </div>
      </div>

      <form
        onSubmit={onSubmit}
        className="mt-4 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end"
      >
        <label className="text-sm sm:min-w-[160px]">
          <span className="font-medium text-[#1f1f1f]">Desde</span>
          <input
            name="desde"
            type="date"
            defaultValue={desdeValue}
            className="mt-1 w-full rounded-xl border border-[#ddd] px-3 py-2 text-sm"
            required
          />
        </label>
        <label className="text-sm sm:min-w-[160px]">
          <span className="font-medium text-[#1f1f1f]">Hasta</span>
          <input
            name="hasta"
            type="date"
            defaultValue={hastaValue}
            className="mt-1 w-full rounded-xl border border-[#ddd] px-3 py-2 text-sm"
            required
          />
        </label>
        <button
          type="submit"
          disabled={pending}
          className="rounded-full bg-[#1f1f1f] px-6 py-2.5 text-sm font-semibold text-white disabled:opacity-60 sm:mb-0.5"
        >
          {pending ? "Aplicando…" : "Aplicar fechas"}
        </button>
      </form>
    </section>
  );
}

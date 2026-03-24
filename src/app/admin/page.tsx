import { prisma } from "@/lib/prisma";
import { decimalToNumber } from "@/lib/decimal-utils";
import {
  buildDashboardInsightBullets,
  computeDashboardAnalytics,
  parseDashboardRange,
} from "@/lib/admin-dashboard-analytics";
import { DashboardCharts } from "@/components/admin/dashboard-charts";
import { DashboardFilters } from "@/components/admin/dashboard-filters";

function formatPrice(value: number) {
  return new Intl.NumberFormat("es-CO").format(Math.round(value));
}

/** Monto compacto para tarjetas (evita desborde en cifras grandes). */
function formatMoneyShort(value: number): string {
  const sign = value < 0 ? "−" : "";
  const n = Math.abs(Math.round(value));
  if (n >= 1_000_000) {
    const m = n / 1_000_000;
    const rounded = Math.round(m * 10) / 10;
    const body =
      rounded % 1 === 0
        ? String(Math.round(rounded))
        : String(rounded).replace(".", ",");
    return `${sign}$${body}M`;
  }
  if (n >= 10_000) {
    const k = Math.round(n / 1000);
    return `${sign}$${k}k`;
  }
  return `${sign}$${formatPrice(value)}`;
}

function formatMoneyDisplay(value: number): { headline: string; exact: string; showExact: boolean } {
  const exact = `$${formatPrice(value)}`;
  const showExact = Math.abs(value) >= 500_000;
  const headline = showExact ? formatMoneyShort(value) : exact;
  return { headline, exact, showExact };
}

function inputDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

type SearchParams = { desde?: string; hasta?: string };

export default async function AdminDashboardPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const sp = await searchParams;
  const range = parseDashboardRange(sp.desde, sp.hasta);

  const [productos, materiales, analytics, ultimas] = await Promise.all([
    prisma.producto.count(),
    prisma.material.count(),
    computeDashboardAnalytics(prisma, range),
    prisma.venta.findMany({
      where: { fecha: { gte: range.desde, lte: range.hasta } },
      orderBy: { fecha: "desc" },
      take: 8,
      include: {
        usuario: { select: { nombre: true, email: true } },
      },
    }),
  ]);

  const insights = buildDashboardInsightBullets(analytics);
  const kpiFacturado = formatMoneyDisplay(analytics.totalFacturadoOrdenes);
  const kpiTicket = formatMoneyDisplay(analytics.ticketPromedio);

  return (
    <div className="space-y-6 pb-10">
      <div>
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <p className="mt-1 text-sm text-[#666]">
          Vista analítica con datos desde PostgreSQL. Período activo:{" "}
          <span className="font-medium text-[#1f1f1f]">{analytics.rangoLabel}</span>.
        </p>
      </div>

      <DashboardFilters
        desdeValue={inputDate(range.desde)}
        hastaValue={inputDate(range.hasta)}
      />

      <div className="space-y-4">
        <p className="text-xs font-medium uppercase tracking-wider text-[#888]">
          Catálogo
        </p>
        <div className="grid min-w-0 gap-3 sm:grid-cols-3">
          <div className="flex min-h-[108px] min-w-0 flex-col rounded-2xl border border-[#ece8df] bg-white p-4 shadow-sm">
            <p className="text-xs font-medium text-[#666]">Productos</p>
            <p className="mt-auto pt-3 text-2xl font-semibold tabular-nums tracking-tight text-[#1f1f1f]">
              {productos}
            </p>
            <p className="mt-1 text-[11px] text-[#888]">En catálogo</p>
          </div>
          <div className="flex min-h-[108px] min-w-0 flex-col rounded-2xl border border-[#ece8df] bg-white p-4 shadow-sm">
            <p className="text-xs font-medium text-[#666]">Materiales</p>
            <p className="mt-auto pt-3 text-2xl font-semibold tabular-nums tracking-tight text-[#1f1f1f]">
              {materiales}
            </p>
            <p className="mt-1 text-[11px] text-[#888]">Insumos registrados</p>
          </div>
          <div className="flex min-h-[108px] min-w-0 flex-col rounded-2xl border border-[#ece8df] bg-white p-4 shadow-sm">
            <p className="text-xs font-medium text-[#666]">Órdenes</p>
            <p className="mt-auto pt-3 text-2xl font-semibold tabular-nums tracking-tight text-[#1f1f1f]">
              {analytics.ordenesEnPeriodo}
            </p>
            <p className="mt-1 text-[11px] text-[#888]">En el período filtrado</p>
          </div>
        </div>

        <p className="text-xs font-medium uppercase tracking-wider text-[#888]">
          Período seleccionado
        </p>
        <div className="grid min-w-0 gap-3 md:grid-cols-2">
          <div className="flex min-h-[120px] min-w-0 flex-col rounded-2xl border border-[#ece8df] bg-white p-4 shadow-sm">
            <p className="text-xs font-medium text-[#666]">Facturado (órdenes)</p>
            <p
              className="mt-auto break-words pt-3 text-xl font-semibold tabular-nums leading-tight tracking-tight text-[#1f1f1f] sm:text-2xl"
              title={kpiFacturado.exact}
            >
              {kpiFacturado.headline}
            </p>
            {kpiFacturado.showExact ? (
              <p className="mt-1 break-all text-[11px] leading-snug text-[#888] sm:break-words">
                {kpiFacturado.exact} · suma de totales
              </p>
            ) : (
              <p className="mt-1 text-[11px] text-[#888]">Suma de totales de venta</p>
            )}
          </div>
          <div className="flex min-h-[120px] min-w-0 flex-col rounded-2xl border border-[#ece8df] bg-white p-4 shadow-sm">
            <p className="text-xs font-medium text-[#666]">Ticket promedio</p>
            <p
              className="mt-auto break-words pt-3 text-xl font-semibold tabular-nums leading-tight tracking-tight text-[#1f1f1f] sm:text-2xl"
              title={kpiTicket.exact}
            >
              {kpiTicket.headline}
            </p>
            {kpiTicket.showExact ? (
              <p className="mt-1 break-all text-[11px] leading-snug text-[#888] sm:break-words">
                {kpiTicket.exact} · por orden
              </p>
            ) : (
              <p className="mt-1 text-[11px] text-[#888]">Por orden en el período</p>
            )}
          </div>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-3xl border border-[#ece8df] bg-white p-5 shadow-sm lg:col-span-2">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <p className="text-sm font-semibold text-[#1f1f1f]">
                Rentabilidad estimada (detalle de ventas)
              </p>
              <p className="mt-1 max-w-2xl text-xs leading-relaxed text-[#888]">
                Facturación por líneas (cantidad × precio unitario) frente al costo con el precio de
                fabricación actual en catálogo.
              </p>
            </div>
          </div>
          <div className="mt-5 grid min-w-0 gap-3 sm:grid-cols-3">
            {[
              {
                label: "Ventas (líneas)",
                value: analytics.totalVendido,
                tone: "neutral" as const,
              },
              {
                label: "Costo fabricación",
                value: analytics.totalCostoFabricacion,
                tone: "neutral" as const,
              },
              {
                label: "Ganancia bruta",
                sub: `${analytics.margenPct.toFixed(1)}% margen`,
                value: analytics.ganancia,
                tone: analytics.ganancia >= 0 ? ("positive" as const) : ("negative" as const),
              },
            ].map((cell) => {
              const d = formatMoneyDisplay(cell.value);
              return (
                <div
                  key={cell.label}
                  className="min-w-0 rounded-2xl bg-[#faf9f7] p-4 ring-1 ring-[#ece8df]/90"
                >
                  <p className="text-[11px] font-medium uppercase tracking-wide text-[#666]">
                    {cell.label}
                  </p>
                  <p
                    className={`mt-2 break-words text-lg font-semibold tabular-nums leading-snug sm:text-xl ${
                      cell.tone === "positive"
                        ? "text-green-700"
                        : cell.tone === "negative"
                          ? "text-red-700"
                          : "text-[#1f1f1f]"
                    }`}
                    title={d.exact}
                  >
                    {d.headline}
                  </p>
                  {d.showExact ? (
                    <p className="mt-1 break-all text-[10px] leading-snug text-[#888] sm:break-words">
                      {d.exact}
                    </p>
                  ) : null}
                  {"sub" in cell && cell.sub ? (
                    <p className="mt-1 text-xs font-medium text-[#57534e]">{cell.sub}</p>
                  ) : null}
                </div>
              );
            })}
          </div>
        </div>
        <div className="flex min-w-0 flex-col rounded-3xl border border-[#e7e3dc] bg-gradient-to-b from-[#faf9f7] to-[#f5f2ee] p-5 shadow-sm">
          <p className="text-sm font-semibold text-[#1f1f1f]">Lecturas rápidas</p>
          <p className="mt-0.5 text-[11px] text-[#888]">Ideas para revisar con tu equipo</p>
          <ul className="mt-4 space-y-3 text-xs leading-relaxed text-[#4f4f4f]">
            {insights.map((line, i) => (
              <li key={i} className="flex gap-2">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#1f1f1f]/40" />
                <span className="min-w-0">{line}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <DashboardCharts
        tendencia={analytics.tendencia}
        topProductos={analytics.topProductos}
        topMateriales={analytics.topMateriales}
      />

      <section className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-black/5 sm:p-6">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-semibold">Últimas ventas en el período</h2>
          <p className="text-xs text-[#888]">Hasta 8 movimientos más recientes</p>
        </div>
        {ultimas.length === 0 ? (
          <p className="text-sm text-[#666]">No hay ventas en este rango de fechas.</p>
        ) : (
          <div className="space-y-3">
            {ultimas.map((v) => (
              <div
                key={v.id.toString()}
                className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#ece8df] p-3"
              >
                <div>
                  <p className="text-sm font-semibold">{v.numeroOrden}</p>
                  <p className="text-xs text-[#666]">
                    {v.usuario.nombre} · {v.usuario.email}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold">
                    ${formatPrice(decimalToNumber(v.total))}
                  </p>
                  <p className="text-xs text-[#666]">
                    {new Intl.DateTimeFormat("es-CO", {
                      dateStyle: "medium",
                      timeStyle: "short",
                    }).format(v.fecha)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

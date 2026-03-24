"use client";

import {
  Area,
  Bar,
  BarChart,
  CartesianGrid,
  ComposedChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type TrendRow = { label: string; ventas: number; ordenes: number };
type RankRow = { nombre: string; valor: number; unidades?: number };

function moneyLabel(n: number) {
  return `$${new Intl.NumberFormat("es-CO").format(n)}`;
}

type Props = {
  tendencia: TrendRow[];
  topProductos: RankRow[];
  topMateriales: RankRow[];
};

export function DashboardCharts({ tendencia, topProductos, topMateriales }: Props) {
  const prodChart = topProductos.map((p) => ({
    nombre:
      p.nombre.length > 26 ? `${p.nombre.slice(0, 24).trim()}…` : p.nombre,
    facturacion: p.valor,
  }));

  const matChart = topMateriales.map((m) => ({
    nombre:
      m.nombre.length > 26 ? `${m.nombre.slice(0, 24).trim()}…` : m.nombre,
    consumo: m.valor,
  }));

  return (
    <div className="space-y-6">
      <section className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-black/5 sm:p-6">
        <h2 className="text-lg font-semibold">Tendencia de ventas</h2>
        <p className="mt-1 text-sm text-[#666]">
          Eje horizontal: <strong className="font-medium text-[#444]">año / semana ISO</strong>{" "}
          (etiqueta «Sem. AAAA/SS»). Área: suma de totales de orden por semana. Barras: órdenes en
          esa semana (eje derecho).
        </p>
        <div className="mt-4 h-72 w-full min-h-[280px]">
          {tendencia.length === 0 ? (
            <p className="flex h-full items-center justify-center text-sm text-[#666]">
              Sin datos en el período para graficar.
            </p>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={tendencia} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="fillVentas" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#1f1f1f" stopOpacity={0.2} />
                    <stop offset="100%" stopColor="#1f1f1f" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#ece8df" />
                <XAxis dataKey="label" tick={{ fontSize: 11 }} stroke="#888" />
                <YAxis
                  yAxisId="pesos"
                  tickFormatter={(v) =>
                    v >= 1_000_000 ? `${Math.round(v / 1_000_000)}M` : `${Math.round(v / 1000)}k`
                  }
                  tick={{ fontSize: 11 }}
                  stroke="#1f1f1f"
                  width={40}
                />
                <YAxis
                  yAxisId="ordenes"
                  orientation="right"
                  allowDecimals={false}
                  tick={{ fontSize: 11 }}
                  stroke="#9ca3af"
                  width={32}
                />
                <Tooltip
                  formatter={(value, name) => {
                    const n = Number(value ?? 0);
                    const label = String(name ?? "");
                    if (label.includes("Ventas")) return [moneyLabel(n), "Ventas"];
                    return [n, "Órdenes"];
                  }}
                  labelStyle={{ fontWeight: 600 }}
                  contentStyle={{
                    borderRadius: 12,
                    border: "1px solid #ece8df",
                  }}
                />
                <Bar
                  yAxisId="ordenes"
                  dataKey="ordenes"
                  fill="#e5e7eb"
                  barSize={14}
                  radius={[4, 4, 0, 0]}
                  name="Órdenes"
                />
                <Area
                  yAxisId="pesos"
                  type="monotone"
                  dataKey="ventas"
                  stroke="#1f1f1f"
                  fill="url(#fillVentas)"
                  strokeWidth={2}
                  name="Ventas ($)"
                />
              </ComposedChart>
            </ResponsiveContainer>
          )}
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
      <section className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-black/5 sm:p-6">
        <h2 className="text-lg font-semibold">Productos más vendidos</h2>
        <p className="mt-1 text-sm text-[#666]">
          Por facturación (cantidad × precio unitario en líneas de detalle).
        </p>
        <div className="mt-4 h-80 w-full min-h-[300px]">
          {prodChart.length === 0 ? (
            <p className="flex h-full items-center justify-center text-sm text-[#666]">
              Sin ventas con detalle en el período.
            </p>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={prodChart}
                layout="vertical"
                margin={{ top: 4, right: 16, left: 4, bottom: 4 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#ece8df" horizontal={false} />
                <XAxis type="number" hide />
                <YAxis
                  type="category"
                  dataKey="nombre"
                  width={108}
                  tick={{ fontSize: 10 }}
                  stroke="#666"
                  interval={0}
                />
                <Tooltip
                  formatter={(value) => moneyLabel(Number(value ?? 0))}
                  contentStyle={{ borderRadius: 12, border: "1px solid #ece8df" }}
                />
                <Bar dataKey="facturacion" fill="#1f1f1f" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </section>

      <section className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-black/5 sm:p-6">
        <h2 className="text-lg font-semibold">Materiales más utilizados</h2>
        <p className="mt-1 text-sm text-[#666]">
          Consumo estimado: unidades vendidas × cantidad en receta (producto_materiales). Si un
          producto no tiene receta, no aporta aquí.
        </p>
        <div className="mt-4 h-80 w-full min-h-[300px]">
          {matChart.length === 0 ? (
            <p className="flex h-full items-center justify-center text-sm text-[#666]">
              Sin recetas vinculadas o sin ventas en el período.
            </p>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={matChart}
                layout="vertical"
                margin={{ top: 4, right: 16, left: 4, bottom: 4 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#ece8df" horizontal={false} />
                <XAxis type="number" hide />
                <YAxis
                  type="category"
                  dataKey="nombre"
                  width={108}
                  tick={{ fontSize: 10 }}
                  stroke="#666"
                  interval={0}
                />
                <Tooltip
                  formatter={(value) => [`${Number(value ?? 0)} (u. receta)`, "Consumo"]}
                  contentStyle={{ borderRadius: 12, border: "1px solid #ece8df" }}
                />
                <Bar dataKey="consumo" fill="#57534e" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </section>
      </div>
    </div>
  );
}

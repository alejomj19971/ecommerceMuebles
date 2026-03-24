import type { PrismaClient } from "@/generated/prisma/client";
import { decimalToNumber } from "@/lib/decimal-utils";

export type DashboardDateRange = {
  desde: Date;
  hasta: Date;
};

function endOfDay(d: Date): Date {
  const x = new Date(d);
  x.setHours(23, 59, 59, 999);
  return x;
}

function startOfDay(d: Date): Date {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

/**
 * Clave estable año-semana (ISO 8601, semana empieza lunes).
 * Formato interno: YYYY-Www para ordenar lexicográficamente.
 */
function isoWeekKey(d: Date): string {
  const x = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const day = (x.getDay() + 6) % 7;
  x.setDate(x.getDate() - day + 3);
  const isoYear = x.getFullYear();
  const jan4 = new Date(isoYear, 0, 4);
  const jan4Day = (jan4.getDay() + 6) % 7;
  const week1Mon = new Date(isoYear, 0, 4 - jan4Day);
  const diffDays = Math.round((x.getTime() - week1Mon.getTime()) / 86400000);
  const isoWeek = 1 + Math.floor(diffDays / 7);
  return `${isoYear}-W${String(isoWeek).padStart(2, "0")}`;
}

/** Etiqueta para gráficas: "Sem. 2026/01" */
export function formatSemanaAnioLabel(weekKeyInternal: string): string {
  const [y, w] = weekKeyInternal.split("-W");
  if (!y || !w) return weekKeyInternal;
  return `Sem. ${y}/${w}`;
}

export type TrendPoint = { label: string; ventas: number; ordenes: number };

export type RankRow = { nombre: string; valor: number; unidades?: number };

export type DashboardAnalytics = {
  rangoLabel: string;
  /** Número de órdenes (ventas) en el rango */
  ordenesEnPeriodo: number;
  /** Suma de venta.total en el rango */
  totalFacturadoOrdenes: number;
  ticketPromedio: number;
  /** Suma (cantidad × precio unitario) en líneas de detalle */
  totalVendido: number;
  totalCostoFabricacion: number;
  ganancia: number;
  margenPct: number;
  tendencia: TrendPoint[];
  topProductos: RankRow[];
  topMateriales: RankRow[];
};

export function parseDashboardRange(
  desdeStr: string | undefined,
  hastaStr: string | undefined
): DashboardDateRange {
  const today = new Date();
  const hastaRaw = hastaStr ? new Date(`${hastaStr}T12:00:00`) : today;
  const hastaMid = Number.isNaN(hastaRaw.getTime()) ? today : hastaRaw;

  let desdeRaw: Date;
  if (desdeStr) {
    desdeRaw = new Date(`${desdeStr}T12:00:00`);
    if (Number.isNaN(desdeRaw.getTime())) {
      desdeRaw = new Date(hastaMid);
      desdeRaw.setDate(desdeRaw.getDate() - 89);
    }
  } else {
    desdeRaw = new Date(hastaMid);
    desdeRaw.setDate(desdeRaw.getDate() - 89);
  }

  let desde = startOfDay(desdeRaw);
  let hasta = endOfDay(hastaMid);
  if (desde > hasta) {
    const swap = desde.getTime();
    desde = startOfDay(hastaMid);
    hasta = endOfDay(new Date(swap));
  }
  return { desde, hasta };
}

export async function computeDashboardAnalytics(
  prisma: PrismaClient,
  range: DashboardDateRange
): Promise<DashboardAnalytics> {
  const { desde, hasta } = range;

  const ventas = await prisma.venta.findMany({
    where: { fecha: { gte: desde, lte: hasta } },
    orderBy: { fecha: "asc" },
    select: {
      id: true,
      fecha: true,
      total: true,
    },
  });

  const detalles = await prisma.detalleVenta.findMany({
    where: {
      venta: { fecha: { gte: desde, lte: hasta } },
    },
    select: {
      cantidad: true,
      precioUnitario: true,
      idProducto: true,
      producto: {
        select: {
          nombre: true,
          precioFabricacion: true,
          productoMateriales: {
            select: {
              cantidad: true,
              material: { select: { id: true, nombre: true } },
            },
          },
        },
      },
    },
  });

  const ordenesEnPeriodo = ventas.length;
  let sumaTotalesOrden = 0;
  for (const v of ventas) {
    sumaTotalesOrden += decimalToNumber(v.total);
  }
  let totalVendido = 0;
  let totalCostoFabricacion = 0;

  const productAgg = new Map<string, { nombre: string; unidades: number; revenue: number }>();
  const materialAgg = new Map<string, { nombre: string; consumo: number }>();

  for (const d of detalles) {
    const qty = decimalToNumber(d.cantidad);
    const pu = decimalToNumber(d.precioUnitario);
    const lineRev = qty * pu;
    totalVendido += lineRev;

    const pf = decimalToNumber(d.producto.precioFabricacion);
    totalCostoFabricacion += qty * pf;

    const pid = d.idProducto.toString();
    const prevP = productAgg.get(pid);
    if (prevP) {
      prevP.unidades += qty;
      prevP.revenue += lineRev;
    } else {
      productAgg.set(pid, {
        nombre: d.producto.nombre,
        unidades: qty,
        revenue: lineRev,
      });
    }

    for (const pm of d.producto.productoMateriales) {
      const matQty = qty * decimalToNumber(pm.cantidad);
      const mid = pm.material.id.toString();
      const prevM = materialAgg.get(mid);
      if (prevM) prevM.consumo += matQty;
      else materialAgg.set(mid, { nombre: pm.material.nombre, consumo: matQty });
    }
  }

  const ganancia = totalVendido - totalCostoFabricacion;
  const margenPct = totalVendido > 0 ? (ganancia / totalVendido) * 100 : 0;
  const ticketPromedio =
    ordenesEnPeriodo > 0 ? sumaTotalesOrden / ordenesEnPeriodo : 0;

  /** Tendencia siempre por año-semana ISO (alineado con reportes semanales). */
  const bucketVentas = new Map<string, number>();
  const bucketOrdenes = new Map<string, number>();

  for (const v of ventas) {
    const key = isoWeekKey(new Date(v.fecha));
    const t = decimalToNumber(v.total);
    bucketVentas.set(key, (bucketVentas.get(key) ?? 0) + t);
    bucketOrdenes.set(key, (bucketOrdenes.get(key) ?? 0) + 1);
  }

  const sortedKeys = [...bucketVentas.keys()].sort();
  const tendencia: TrendPoint[] = sortedKeys.map((key) => ({
    label: formatSemanaAnioLabel(key),
    ventas: Math.round(bucketVentas.get(key) ?? 0),
    ordenes: bucketOrdenes.get(key) ?? 0,
  }));

  const topProductos: RankRow[] = [...productAgg.values()]
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 8)
    .map((p) => ({
      nombre: p.nombre,
      valor: Math.round(p.revenue),
      unidades: Math.round(p.unidades * 100) / 100,
    }));

  const topMateriales: RankRow[] = [...materialAgg.values()]
    .sort((a, b) => b.consumo - a.consumo)
    .slice(0, 8)
    .map((m) => ({
      nombre: m.nombre,
      valor: Math.round(m.consumo * 1000) / 1000,
    }));

  const rangoLabel = `${formatEsDate(desde)} — ${formatEsDate(hasta)}`;

  return {
    rangoLabel,
    ordenesEnPeriodo,
    totalFacturadoOrdenes: sumaTotalesOrden,
    ticketPromedio,
    totalVendido,
    totalCostoFabricacion,
    ganancia,
    margenPct,
    tendencia,
    topProductos,
    topMateriales,
  };
}

function formatEsDate(d: Date): string {
  return d.toLocaleDateString("es-CO", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatMoney(n: number) {
  return new Intl.NumberFormat("es-CO").format(Math.round(n));
}

export function buildDashboardInsightBullets(a: DashboardAnalytics): string[] {
  const bullets: string[] = [];
  if (a.ordenesEnPeriodo === 0) {
    bullets.push(
      "En este rango no hay ventas. Amplía las fechas o registra ventas en el panel de ventas."
    );
    return bullets;
  }
  bullets.push(
    `${a.ordenesEnPeriodo} ${a.ordenesEnPeriodo === 1 ? "orden" : "órdenes"} en el período; ticket promedio (total de orden) $${formatMoney(a.ticketPromedio)}.`
  );
  bullets.push(
    `Total en cabecera de órdenes (suma de totales): $${formatMoney(a.totalFacturadoOrdenes)}. Detalle de líneas suma $${formatMoney(a.totalVendido)}; costo fabricación cargado en productos: $${formatMoney(a.totalCostoFabricacion)}.`
  );
  if (a.ganancia < 0) {
    bullets.push(
      "La suma de (cantidad × precio fábrica) supera lo facturado en líneas: revisa precios unitarios en ventas o actualiza precio de fabricación en productos."
    );
  } else if (a.margenPct < 18) {
    bullets.push(
      "Margen bruto bajo respecto al costo cargado hoy en productos; conviene revisar precios de venta o recetas de materiales."
    );
  } else if (a.margenPct > 55) {
    bullets.push(
      "Margen alto: confirma que el precio de fabricación refleja costos reales para evitar lecturas demasiado optimistas."
    );
  }
  const top = a.topProductos[0];
  if (top) {
    bullets.push(
      `Producto líder en facturación del período: «${top.nombre}» ($${formatMoney(top.valor)}).`
    );
  }
  const mat = a.topMateriales[0];
  if (mat) {
    bullets.push(
      `Insumo más consumido según recetas vendidas: «${mat.nombre}» (≈ ${mat.valor} unidades de receta).`
    );
  } else {
    bullets.push(
      "No hay consumo de materiales calculado: asigna recetas (producto → materiales) para ver ranking de insumos."
    );
  }
  return bullets;
}

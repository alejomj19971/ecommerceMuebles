import type { PrismaClient } from "@/generated/prisma/client";

type NumeroOrdenDb = Pick<PrismaClient, "venta">;

/** Genera un número de orden único legible para nuevas ventas (ej. ORD-20250324-0001). */
export async function generarNumeroOrdenVenta(
  prisma: NumeroOrdenDb
): Promise<string> {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const prefix = `ORD-${y}${m}${day}-`;

  const ultima = await prisma.venta.findFirst({
    where: { numeroOrden: { startsWith: prefix } },
    orderBy: { id: "desc" },
    select: { numeroOrden: true },
  });

  let seq = 1;
  if (ultima?.numeroOrden) {
    const part = ultima.numeroOrden.slice(prefix.length);
    const n = parseInt(part, 10);
    if (Number.isFinite(n)) seq = n + 1;
  }

  return `${prefix}${String(seq).padStart(4, "0")}`;
}

import type { PrismaClient } from "@/generated/prisma/client";
import { decimalToNumber } from "@/lib/decimal-utils";

type PrecioFabricacionDb = Pick<PrismaClient, "producto" | "productoMaterial">;

/** Recalcula y persiste el costo de fabricación según receta y precios unitarios actuales. */
export async function recalcularPrecioFabricacionProducto(
  db: PrecioFabricacionDb,
  idProducto: bigint
) {
  const lineas = await db.productoMaterial.findMany({
    where: { idProducto },
    include: { material: true },
  });

  const costo = lineas.reduce((acc, row) => {
    return acc + decimalToNumber(row.cantidad) * decimalToNumber(row.material.precioUnitario);
  }, 0);

  await db.producto.update({
    where: { id: idProducto },
    data: { precioFabricacion: Math.round(costo * 100) / 100 },
  });
}

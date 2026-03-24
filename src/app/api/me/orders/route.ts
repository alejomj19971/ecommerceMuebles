import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { decimalToNumber } from "@/lib/decimal-utils";
import { getSessionFromCookie } from "@/lib/auth";

export async function GET() {
  const session = await getSessionFromCookie();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let userId: bigint;
  try {
    userId = BigInt(session.userId);
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const ventas = await prisma.venta.findMany({
    where: { idUsuario: userId },
    orderBy: { fecha: "desc" },
    include: {
      detalles: {
        include: { producto: true },
      },
    },
  });

  return NextResponse.json({
    orders: ventas.map((v) => ({
      id: v.id.toString(),
      orderNo: v.numeroOrden,
      status: "COMPLETADA",
      paymentMethod: "N/A",
      subtotal: decimalToNumber(v.total),
      tax: 0,
      total: decimalToNumber(v.total),
      createdAt: v.fecha.toISOString(),
      items: v.detalles.map((d) => ({
        id: d.id.toString(),
        productId: d.idProducto.toString(),
        productName: d.producto.nombre,
        quantity: decimalToNumber(d.cantidad),
        unitPrice: decimalToNumber(d.precioUnitario),
      })),
    })),
  });
}

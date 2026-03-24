import { NextResponse } from "next/server";
import { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { getSessionFromCookie } from "@/lib/auth";

type DetalleInput = {
  id_producto?: string;
  cantidad?: number;
  precio_unitario?: number;
};

function parseBigInt(raw: string | undefined): bigint | null {
  if (!raw) return null;
  try {
    return BigInt(raw);
  } catch {
    return null;
  }
}

function parseDate(raw: string | undefined): Date | null {
  if (!raw) return null;
  const d = new Date(raw);
  if (Number.isNaN(d.getTime())) return null;
  return d;
}

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const session = await getSessionFromCookie();
  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const { id: idStr } = await context.params;
  const idVenta = parseBigInt(idStr);
  if (idVenta == null) {
    return NextResponse.json({ error: "ID inválido." }, { status: 400 });
  }

  const body = (await request.json()) as {
    id_usuario?: string;
    fecha?: string;
    detalles?: DetalleInput[];
  };
  const idUsuario = parseBigInt(body.id_usuario);
  const fecha = parseDate(body.fecha);
  const detalles = Array.isArray(body.detalles) ? body.detalles : [];

  if (idUsuario == null) {
    return NextResponse.json({ error: "Usuario inválido." }, { status: 400 });
  }
  if (fecha == null) {
    return NextResponse.json({ error: "Fecha inválida." }, { status: 400 });
  }
  if (detalles.length === 0) {
    return NextResponse.json({ error: "Agrega al menos un producto." }, { status: 400 });
  }

  const normalized: Array<{
    idProducto: bigint;
    cantidad: number;
    precioUnitario: number;
  }> = [];
  for (const [i, d] of detalles.entries()) {
    const idProducto = parseBigInt(d.id_producto);
    const cantidad = d.cantidad;
    const precio = d.precio_unitario;
    if (idProducto == null) {
      return NextResponse.json(
        { error: `Producto inválido en línea ${i + 1}.` },
        { status: 400 }
      );
    }
    if (typeof cantidad !== "number" || !Number.isFinite(cantidad) || cantidad <= 0) {
      return NextResponse.json(
        { error: `Cantidad inválida en línea ${i + 1}.` },
        { status: 400 }
      );
    }
    if (typeof precio !== "number" || !Number.isFinite(precio) || precio < 0) {
      return NextResponse.json(
        { error: `Precio unitario inválido en línea ${i + 1}.` },
        { status: 400 }
      );
    }
    normalized.push({
      idProducto,
      cantidad: Math.round(cantidad * 10000) / 10000,
      precioUnitario: Math.round(precio * 100) / 100,
    });
  }

  // Consolida líneas repetidas del mismo producto preservando el subtotal global.
  const consolidatedMap = new Map<
    string,
    { idProducto: bigint; cantidad: number; subtotal: number }
  >();
  for (const d of normalized) {
    const k = d.idProducto.toString();
    const prev = consolidatedMap.get(k);
    const lineSubtotal = d.cantidad * d.precioUnitario;
    if (!prev) {
      consolidatedMap.set(k, {
        idProducto: d.idProducto,
        cantidad: d.cantidad,
        subtotal: lineSubtotal,
      });
      continue;
    }
    prev.cantidad += d.cantidad;
    prev.subtotal += lineSubtotal;
  }
  const consolidated = [...consolidatedMap.values()].map((d) => ({
    idProducto: d.idProducto,
    cantidad: Math.round(d.cantidad * 10000) / 10000,
    precioUnitario:
      d.cantidad > 0 ? Math.round((d.subtotal / d.cantidad) * 100) / 100 : 0,
  }));

  const total = consolidated.reduce((acc, d) => acc + d.cantidad * d.precioUnitario, 0);

  try {
    await prisma.$transaction(async (tx) => {
      await tx.venta.update({
        where: { id: idVenta },
        data: {
          idUsuario,
          fecha,
          total: Math.round(total * 100) / 100,
        },
      });
      await tx.detalleVenta.deleteMany({ where: { idVenta } });
      await tx.detalleVenta.createMany({
        data: consolidated.map((d) => ({
          idVenta,
          idProducto: d.idProducto,
          cantidad: d.cantidad,
          precioUnitario: d.precioUnitario,
        })),
      });
    });
    return NextResponse.json({ ok: true });
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2025") {
      return NextResponse.json({ error: "Venta no encontrada." }, { status: 404 });
    }
    throw e;
  }
}

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const session = await getSessionFromCookie();
  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const { id: idStr } = await context.params;
  const idVenta = parseBigInt(idStr);
  if (idVenta == null) {
    return NextResponse.json({ error: "ID inválido." }, { status: 400 });
  }

  try {
    await prisma.venta.delete({ where: { id: idVenta } });
    return NextResponse.json({ ok: true });
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2025") {
      return NextResponse.json({ error: "Venta no encontrada." }, { status: 404 });
    }
    throw e;
  }
}

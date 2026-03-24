import { NextResponse } from "next/server";
import { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { getSessionFromCookie } from "@/lib/auth";
import { recalcularPrecioFabricacionProducto } from "@/lib/precio-fabricacion";

function parseProductId(raw: string): bigint | null {
  try {
    return BigInt(raw);
  } catch {
    return null;
  }
}

function parseMaterialId(raw: unknown): bigint | null {
  if (typeof raw !== "string") return null;
  try {
    return BigInt(raw);
  } catch {
    return null;
  }
}

function parseCantidad(raw: unknown): number | null {
  if (typeof raw !== "number" || !Number.isFinite(raw) || raw <= 0) return null;
  if (raw > 1_000_000) return null;
  return Math.round(raw * 10000) / 10000;
}

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const session = await getSessionFromCookie();
  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const { id: idStr } = await context.params;
  const idProducto = parseProductId(idStr);
  if (idProducto == null) {
    return NextResponse.json({ error: "ID de producto inválido" }, { status: 400 });
  }

  const producto = await prisma.producto.findUnique({ where: { id: idProducto } });
  if (!producto) {
    return NextResponse.json({ error: "Producto no encontrado" }, { status: 404 });
  }

  const body = (await request.json()) as {
    id_material?: string;
    cantidad?: number;
  };

  const idMaterial = parseMaterialId(body.id_material);
  const cantidad = parseCantidad(body.cantidad);

  if (idMaterial == null) {
    return NextResponse.json({ error: "Material inválido" }, { status: 400 });
  }
  if (cantidad == null) {
    return NextResponse.json(
      { error: "La cantidad debe ser un número mayor que cero." },
      { status: 400 }
    );
  }

  const material = await prisma.material.findUnique({ where: { id: idMaterial } });
  if (!material) {
    return NextResponse.json({ error: "Material no encontrado" }, { status: 404 });
  }

  const row = await prisma.$transaction(async (tx) => {
    const saved = await tx.productoMaterial.upsert({
      where: {
        idProducto_idMaterial: { idProducto, idMaterial },
      },
      create: {
        idProducto,
        idMaterial,
        cantidad,
      },
      update: { cantidad },
    });
    await recalcularPrecioFabricacionProducto(tx, idProducto);
    return saved;
  });

  return NextResponse.json({
    ok: true,
    linea: {
      idMaterial: row.idMaterial.toString(),
      cantidad: row.cantidad.toString(),
    },
  });
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
  const idProducto = parseProductId(idStr);
  if (idProducto == null) {
    return NextResponse.json({ error: "ID de producto inválido" }, { status: 400 });
  }

  const body = (await request.json()) as {
    id_material?: string;
    cantidad?: number;
  };

  const idMaterial = parseMaterialId(body.id_material);
  const cantidad = parseCantidad(body.cantidad);

  if (idMaterial == null) {
    return NextResponse.json({ error: "Material inválido" }, { status: 400 });
  }
  if (cantidad == null) {
    return NextResponse.json(
      { error: "La cantidad debe ser un número mayor que cero." },
      { status: 400 }
    );
  }

  try {
    const row = await prisma.$transaction(async (tx) => {
      const saved = await tx.productoMaterial.update({
        where: {
          idProducto_idMaterial: { idProducto, idMaterial },
        },
        data: { cantidad },
      });
      await recalcularPrecioFabricacionProducto(tx, idProducto);
      return saved;
    });
    return NextResponse.json({
      ok: true,
      linea: {
        idMaterial: row.idMaterial.toString(),
        cantidad: row.cantidad.toString(),
      },
    });
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2025") {
      return NextResponse.json(
        { error: "Esa línea no existe en la receta." },
        { status: 404 }
      );
    }
    throw e;
  }
}

export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const session = await getSessionFromCookie();
  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const { id: idStr } = await context.params;
  const idProducto = parseProductId(idStr);
  if (idProducto == null) {
    return NextResponse.json({ error: "ID de producto inválido" }, { status: 400 });
  }

  const url = new URL(request.url);
  const idMaterial = parseMaterialId(url.searchParams.get("id_material") ?? "");

  if (idMaterial == null) {
    return NextResponse.json({ error: "Falta id_material en la URL" }, { status: 400 });
  }

  try {
    await prisma.$transaction(async (tx) => {
      await tx.productoMaterial.delete({
        where: {
          idProducto_idMaterial: { idProducto, idMaterial },
        },
      });
      await recalcularPrecioFabricacionProducto(tx, idProducto);
    });
    return NextResponse.json({ ok: true });
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2025") {
      return NextResponse.json({ error: "Línea no encontrada" }, { status: 404 });
    }
    throw e;
  }
}

import { NextResponse } from "next/server";
import { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { getSessionFromCookie } from "@/lib/auth";
import { isCategoriaSlug } from "@/lib/utils";
import { normalizeImagenUrl } from "@/lib/admin-productos-shared";

function parseId(raw: string): bigint | null {
  try {
    return BigInt(raw);
  } catch {
    return null;
  }
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
  const id = parseId(idStr);
  if (id == null) {
    return NextResponse.json({ error: "ID inválido" }, { status: 400 });
  }

  const body = (await request.json()) as {
    nombre?: string;
    precio_venta?: number;
    categoria?: string;
    imagen_url?: string | null;
  };

  const nombre = body.nombre?.trim();
  const precioRaw = body.precio_venta;
  const cat = (body.categoria ?? "general").trim().toLowerCase();
  const imagenUrl = normalizeImagenUrl(body.imagen_url);

  if (!nombre) {
    return NextResponse.json({ error: "El nombre es obligatorio" }, { status: 400 });
  }
  if (
    typeof precioRaw !== "number" ||
    !Number.isFinite(precioRaw) ||
    precioRaw < 0
  ) {
    return NextResponse.json({ error: "Precio de venta inválido" }, { status: 400 });
  }
  if (!isCategoriaSlug(cat)) {
    return NextResponse.json({ error: "Categoría no válida" }, { status: 400 });
  }
  if (body.imagen_url != null && body.imagen_url !== "" && imagenUrl === null) {
    return NextResponse.json(
      { error: "La URL de imagen debe ser http o https y como máximo 2048 caracteres." },
      { status: 400 }
    );
  }

  try {
    const p = await prisma.producto.update({
      where: { id },
      data: {
        nombre,
        categoria: cat,
        precio_venta: precioRaw,
        imagen_url: imagenUrl,
      },
    });
    return NextResponse.json({
      ok: true,
      producto: {
        id: p.id.toString(),
        nombre: p.nombre,
        categoria: p.categoria,
        precio_venta: p.precio_venta.toString(),
        precio_fabricacion: p.precioFabricacion.toString(),
        imagen_url: p.imagen_url,
      },
    });
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2025") {
      return NextResponse.json({ error: "Producto no encontrado" }, { status: 404 });
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
  const id = parseId(idStr);
  if (id == null) {
    return NextResponse.json({ error: "ID inválido" }, { status: 400 });
  }

  const enVentas = await prisma.detalleVenta.count({ where: { idProducto: id } });
  if (enVentas > 0) {
    return NextResponse.json(
      {
        error:
          "No se puede eliminar: el producto aparece en ventas registradas. Solo puedes editarlo.",
      },
      { status: 409 }
    );
  }

  try {
    await prisma.producto.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2025") {
      return NextResponse.json({ error: "Producto no encontrado" }, { status: 404 });
    }
    throw e;
  }
}

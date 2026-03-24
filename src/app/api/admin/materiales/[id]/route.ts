import { NextResponse } from "next/server";
import { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { getSessionFromCookie } from "@/lib/auth";
import { recalcularPrecioFabricacionProducto } from "@/lib/precio-fabricacion";
import { isMaterialCategoriaSlug } from "@/lib/material-categoria";

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
    categoria?: string;
    unidad_medida?: string;
    precio_unitario?: number;
  };

  const nombre = body.nombre?.trim() ?? "";
  const categoriaRaw = body.categoria?.trim() ?? "";
  const unidad = body.unidad_medida?.trim() ?? "";
  const precioUnitario = body.precio_unitario;

  if (!nombre || nombre.length > 200) {
    return NextResponse.json(
      { error: "El nombre es obligatorio (máx. 200 caracteres)." },
      { status: 400 }
    );
  }
  if (!unidad || unidad.length > 50) {
    return NextResponse.json(
      { error: "La unidad de medida es obligatoria (máx. 50 caracteres)." },
      { status: 400 }
    );
  }
  if (
    typeof precioUnitario !== "number" ||
    !Number.isFinite(precioUnitario) ||
    precioUnitario < 0
  ) {
    return NextResponse.json(
      { error: "El precio unitario es obligatorio y debe ser un número válido." },
      { status: 400 }
    );
  }
  if (!categoriaRaw || !isMaterialCategoriaSlug(categoriaRaw)) {
    return NextResponse.json(
      { error: "La categoría del material es obligatoria y debe ser válida." },
      { status: 400 }
    );
  }

  try {
    const m = await prisma.$transaction(async (tx) => {
      const productosAfectados = await tx.productoMaterial.findMany({
        where: { idMaterial: id },
        select: { idProducto: true },
        distinct: ["idProducto"],
      });

      const updated = await tx.material.update({
        where: { id },
        data: {
          nombre,
          categoria: categoriaRaw,
          unidadMedida: unidad,
          precioUnitario,
        },
      });

      for (const p of productosAfectados) {
        await recalcularPrecioFabricacionProducto(tx, p.idProducto);
      }
      return updated;
    });

    return NextResponse.json({
      ok: true,
      material: {
        id: m.id.toString(),
        nombre: m.nombre,
        categoria: m.categoria,
        unidadMedida: m.unidadMedida,
        precioUnitario: m.precioUnitario.toString(),
      },
    });
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2025") {
      return NextResponse.json({ error: "Material no encontrado" }, { status: 404 });
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

  const enReceta = await prisma.productoMaterial.count({ where: { idMaterial: id } });
  if (enReceta > 0) {
    return NextResponse.json(
      {
        error:
          "No se puede eliminar: el material está usado en la receta de uno o más productos. Quita esas líneas primero.",
      },
      { status: 409 }
    );
  }

  try {
    await prisma.material.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2025") {
      return NextResponse.json({ error: "Material no encontrado" }, { status: 404 });
    }
    throw e;
  }
}

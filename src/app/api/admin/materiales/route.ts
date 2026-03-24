import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionFromCookie } from "@/lib/auth";
import {
  DEFAULT_MATERIAL_CATEGORIA,
  isMaterialCategoriaSlug,
} from "@/lib/material-categoria";

export async function POST(request: Request) {
  const session = await getSessionFromCookie();
  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const body = (await request.json()) as {
    nombre?: string;
    categoria?: string;
    unidad_medida?: string;
    precio_unitario?: number;
  };

  const nombre = body.nombre?.trim() ?? "";
  const categoriaRaw = body.categoria?.trim() ?? "";
  const categoria = isMaterialCategoriaSlug(categoriaRaw)
    ? categoriaRaw
    : DEFAULT_MATERIAL_CATEGORIA;
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
  if (categoriaRaw && !isMaterialCategoriaSlug(categoriaRaw)) {
    return NextResponse.json(
      { error: "La categoría del material no es válida." },
      { status: 400 }
    );
  }

  const m = await prisma.material.create({
    data: { nombre, categoria, unidadMedida: unidad, precioUnitario },
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
}

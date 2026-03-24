import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionFromCookie } from "@/lib/auth";
import { isCategoriaSlug } from "@/lib/utils";
import { normalizeImagenUrl } from "@/lib/admin-productos-shared";
import { recalcularPrecioFabricacionProducto } from "@/lib/precio-fabricacion";

export async function POST(request: Request) {
  const session = await getSessionFromCookie();
  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const body = (await request.json()) as {
    nombre?: string;
    precio_venta?: number;
    categoria?: string;
    imagen_url?: string | null;
    materiales?: Array<{ id_material?: string; cantidad?: number }>;
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
  const materialLines = Array.isArray(body.materiales) ? body.materiales : [];
  const normalizedLines: Array<{ idMaterial: bigint; cantidad: number }> = [];
  for (const [idx, line] of materialLines.entries()) {
    if (!line?.id_material) {
      return NextResponse.json(
        { error: `Material faltante en la línea ${idx + 1}.` },
        { status: 400 }
      );
    }
    let idMaterial: bigint;
    try {
      idMaterial = BigInt(line.id_material);
    } catch {
      return NextResponse.json(
        { error: `ID de material inválido en la línea ${idx + 1}.` },
        { status: 400 }
      );
    }
    if (
      typeof line.cantidad !== "number" ||
      !Number.isFinite(line.cantidad) ||
      line.cantidad <= 0
    ) {
      return NextResponse.json(
        { error: `Cantidad inválida en la línea ${idx + 1}.` },
        { status: 400 }
      );
    }
    normalizedLines.push({
      idMaterial,
      cantidad: Math.round(line.cantidad * 10000) / 10000,
    });
  }
  if (normalizedLines.length > 0) {
    const uniqueIds = [...new Set(normalizedLines.map((x) => x.idMaterial.toString()))].map(
      (x) => BigInt(x)
    );
    const existing = await prisma.material.findMany({
      where: { id: { in: uniqueIds } },
      select: { id: true },
    });
    if (existing.length !== uniqueIds.length) {
      return NextResponse.json(
        { error: "Uno o más materiales no existen." },
        { status: 400 }
      );
    }
  }

  const p = await prisma.$transaction(async (tx) => {
    const created = await tx.producto.create({
      data: {
        nombre,
        categoria: cat,
        precio_venta: precioRaw,
        imagen_url: imagenUrl,
      },
    });
    if (normalizedLines.length > 0) {
      const dedup = new Map<string, number>();
      for (const line of normalizedLines) {
        dedup.set(line.idMaterial.toString(), line.cantidad);
      }
      await tx.productoMaterial.createMany({
        data: [...dedup.entries()].map(([idMaterial, cantidad]) => ({
          idProducto: created.id,
          idMaterial: BigInt(idMaterial),
          cantidad,
        })),
      });
    }
    await recalcularPrecioFabricacionProducto(tx, created.id);
    return created;
  });

  return NextResponse.json({
    ok: true,
    producto: {
      id: p.id.toString(),
      nombre: p.nombre,
      categoria: p.categoria,
      precio_fabricacion: p.precioFabricacion.toString(),
      imagen_url: p.imagen_url,
    },
  });
}

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { decimalToNumber } from "@/lib/decimal-utils";
import { isCategoriaSlug, labelCategoria } from "@/lib/utils";
import { productImageOrPlaceholder } from "@/lib/product-image";

function formatPrice(value: number) {
  const formatted = new Intl.NumberFormat("es-CO").format(value);
  return `$${formatted}`;
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const q = url.searchParams.get("q");
  const categoryParam = url.searchParams.get("category")?.trim().toLowerCase() ?? null;

  const whereCategory =
    categoryParam && isCategoriaSlug(categoryParam)
      ? { categoria: categoryParam }
      : {};

  const productos = await prisma.producto.findMany({
    where: {
      ...whereCategory,
      ...(q
        ? {
            nombre: {
              contains: q,
              mode: "insensitive" as const,
            },
          }
        : {}),
    },
    orderBy: { id: "desc" },
    take: 48,
  });

  const products = productos.map((p) => ({
    slug: p.id.toString(),
    name: p.nombre,
    tag: "Catálogo",
    rating: null as number | null,
    image: productImageOrPlaceholder(p.imagen_url),
    price: formatPrice(decimalToNumber(p.precio_venta)),
    category: labelCategoria(p.categoria),
  }));

  return NextResponse.json({ products });
}

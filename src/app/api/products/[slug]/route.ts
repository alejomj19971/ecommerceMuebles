import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { decimalToNumber } from "@/lib/decimal-utils";
import { labelCategoria } from "@/lib/utils";
import { productImageOrPlaceholder } from "@/lib/product-image";

function formatPrice(value: number) {
  const formatted = new Intl.NumberFormat("es-CO").format(value);
  return `$${formatted}`;
}

export async function GET(
  _request: Request,
  context: { params: Promise<{ slug: string }> }
) {
  const { slug } = await context.params;

  let id: bigint;
  try {
    id = BigInt(slug);
  } catch {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const producto = await prisma.producto.findUnique({
    where: { id },
  });

  if (!producto) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const priceNum = decimalToNumber(producto.precio_venta);

  return NextResponse.json({
    product: {
      slug: producto.id.toString(),
      name: producto.nombre,
      tag: "Catálogo",
      rating: null as number | null,
      image: productImageOrPlaceholder(producto.imagen_url),
      price: formatPrice(priceNum),
      category: labelCategoria(producto.categoria),
      description:
        "Producto del catálogo. Precio y composición (receta) se gestionan en el panel administrativo.",
    },
  });
}

import { prisma } from "@/lib/prisma";
import { decimalToNumber } from "@/lib/decimal-utils";
import { isCategoriaSlug, labelCategoria } from "@/lib/utils";
import { productImageOrPlaceholder } from "@/lib/product-image";

function formatPrice(value: number) {
  const formatted = new Intl.NumberFormat("es-CO").format(value);
  return `$${formatted}`;
}

export type CatalogProductListItem = {
  slug: string;
  name: string;
  price: string;
  image: string;
  tag: string;
  category: string;
  rating: number | null;
};

export type CatalogProductDetail = CatalogProductListItem & {
  description: string;
};

export async function getCatalogProducts(options?: {
  q?: string | null;
  category?: string | null;
  take?: number;
}): Promise<{ products: CatalogProductListItem[] }> {
  const q = options?.q?.trim() || undefined;
  const categoryParam = options?.category?.trim().toLowerCase() ?? null;
  const take = options?.take ?? 48;

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
    take,
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

  return { products };
}

export async function getCatalogProductBySlug(
  slug: string
): Promise<CatalogProductDetail | null> {
  let id: bigint;
  try {
    id = BigInt(slug);
  } catch {
    return null;
  }

  const producto = await prisma.producto.findUnique({
    where: { id },
  });

  if (!producto) {
    return null;
  }

  const priceNum = decimalToNumber(producto.precio_venta);

  return {
    slug: producto.id.toString(),
    name: producto.nombre,
    tag: "Catálogo",
    rating: null,
    image: productImageOrPlaceholder(producto.imagen_url),
    price: formatPrice(priceNum),
    category: labelCategoria(producto.categoria),
    description:
      "Producto del catálogo. Precio y composición (receta) se gestionan en el panel administrativo.",
  };
}

export type Product = {
  slug: string;
  name: string;
  price: string;
  image: string;
  tag: string;
  category: "Sala" | "Dormitorio" | "Comedor" | "Oficina";
};

export type CategorySlug = "sala" | "dormitorio" | "comedor" | "oficina";

export const featuredProducts: Product[] = [
  {
    slug: "sofa-avondale",
    name: "Sofa Avondale",
    price: "$1.800.000",
    image:
      "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=1200&q=80",
    tag: "Top venta",
    category: "Sala",
  },
  {
    slug: "sofa-zuma",
    name: "Sofa Zuma",
    price: "$2.800.000",
    image:
      "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80",
    tag: "Top rated",
    category: "Dormitorio",
  },
  {
    slug: "silla-pershing",
    name: "Silla Pershing",
    price: "$2.900.000",
    image:
      "https://images.unsplash.com/photo-1582582494700-352fc74f7d10?auto=format&fit=crop&w=1200&q=80",
    tag: "Best price",
    category: "Comedor",
  },
  {
    slug: "silla-powell",
    name: "Silla Powell",
    price: "$2.000.000",
    image:
      "https://images.unsplash.com/photo-1592078615290-033ee584e267?auto=format&fit=crop&w=1200&q=80",
    tag: "Top rated",
    category: "Oficina",
  },
  {
    slug: "butaca-infini",
    name: "Butaca Infini",
    price: "$2.500.000",
    image:
      "https://images.unsplash.com/photo-1550226891-ef816aed4a98?auto=format&fit=crop&w=1200&q=80",
    tag: "Best price",
    category: "Sala",
  },
  {
    slug: "sofa-cerse",
    name: "Sofa Cerse",
    price: "$2.200.000",
    image:
      "https://images.unsplash.com/photo-1567016432779-094069958ea5?auto=format&fit=crop&w=1200&q=80",
    tag: "Top venta",
    category: "Comedor",
  },
];

export function getProductBySlug(slug: string) {
  return featuredProducts.find((product) => product.slug === slug);
}

export const roomCollections: Array<{
  title: string;
  slug: CategorySlug;
  image: string;
}> = [
  {
    title: "Muebles para sala",
    slug: "sala",
    image:
      "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=1400&q=80",
  },
  {
    title: "Dormitorio",
    slug: "dormitorio",
    image:
      "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1400&q=80",
  },
  {
    title: "Comedor",
    slug: "comedor",
    image:
      "https://images.unsplash.com/photo-1615876234886-fd9a39fda97f?auto=format&fit=crop&w=1400&q=80",
  },
  {
    title: "Oficina",
    slug: "oficina",
    image:
      "https://images.unsplash.com/photo-1486946255434-2466348c2166?auto=format&fit=crop&w=1400&q=80",
  },
];

const categoryBySlug: Record<CategorySlug, Product["category"]> = {
  sala: "Sala",
  dormitorio: "Dormitorio",
  comedor: "Comedor",
  oficina: "Oficina",
};

export function getProductsByCategorySlug(slug: CategorySlug) {
  return featuredProducts.filter(
    (product) => product.category === categoryBySlug[slug]
  );
}

export const benefits = [
  { title: "Compra segura", text: "Pagos protegidos y soporte personalizado." },
  { title: "Envio nacional", text: "Cobertura a todo el pais con tracking." },
  { title: "Cambios faciles", text: "Politica de cambios en los primeros 7 dias." },
];

export const testimonials = [
  {
    author: "Laura M.",
    text: "Excelente calidad. El sofa llego en perfecto estado y se ve premium.",
  },
  {
    author: "Carlos R.",
    text: "El proceso de compra fue simple y la atencion fue muy buena.",
  },
  {
    author: "Ana P.",
    text: "Los acabados son justo como en las fotos. Recomiendo la tienda.",
  },
];

export const faqs = [
  "Cual es el tiempo estimado de entrega?",
  "Tienen opcion de pago contra entrega?",
  "Como funcionan los cambios o garantias?",
  "Ofrecen armado de muebles?",
];

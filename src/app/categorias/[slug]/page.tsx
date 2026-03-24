import { notFound } from "next/navigation";
import { ProductCard } from "@/components/home/product-card";
import { SectionHeader } from "@/components/home/section-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { apiGet } from "@/lib/api-client";

type CategorySlug = "sala" | "dormitorio" | "comedor" | "oficina";

type CategoryPageProps = {
  params: Promise<{ slug: string }>;
};

const categoryNames: Record<CategorySlug, string> = {
  sala: "Sala",
  dormitorio: "Dormitorio",
  comedor: "Comedor",
  oficina: "Oficina",
};

function isCategorySlug(value: string): value is CategorySlug {
  return value in categoryNames;
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = await params;

  if (!isCategorySlug(slug)) {
    notFound();
  }

  const data = await apiGet<{
    products: Array<{
      slug: string;
      name: string;
      price: string;
      image: string;
      tag: string;
      category: string;
    }>;
  }>(`/api/products?category=${encodeURIComponent(slug)}`);

  return (
    <div className="min-h-screen bg-[#f5f2ee] text-[#1f1f1f]">
      <SiteHeader />

      <main className="mx-auto w-full max-w-6xl px-4 pb-14 sm:px-6 sm:pb-16 lg:px-8">
        <SectionHeader
          title={`Categoria: ${categoryNames[slug]}`}
          description="Seleccion de productos por categoria para navegar de forma rapida."
          className="mb-8 text-center"
        />

        <section className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-black/5 sm:p-8">
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {data.products.map((product) => (
              <ProductCard key={product.slug} {...product} />
            ))}
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}

import { CatalogClient } from "@/components/catalog/catalog-client";
import { SectionHeader } from "@/components/home/section-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { apiGet } from "@/lib/api-client";

export default async function ProductosPage() {
  const data = await apiGet<{ products: Array<{
    slug: string;
    name: string;
    price: string;
    image: string;
    tag: string;
    category: string;
  }> }>(`/api/products`);

  return (
    <div className="min-h-screen bg-[#f5f2ee] text-[#1f1f1f]">
      <SiteHeader />

      <main className="mx-auto w-full max-w-6xl px-4 pb-14 sm:px-6 sm:pb-16 lg:px-8">
        <SectionHeader
          title="Catalogo de muebles"
          description="Explora nuestros productos y usa filtros por categoria y precio."
          className="mb-8 text-center"
        />
        <CatalogClient products={data.products} />
      </main>
      <SiteFooter />
    </div>
  );
}

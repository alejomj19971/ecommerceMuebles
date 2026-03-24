import { CatalogClient } from "@/components/catalog/catalog-client";
import { SectionHeader } from "@/components/home/section-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { getCatalogProducts } from "@/lib/catalog-products";

export const revalidate = 60;

export default async function ProductosPage() {
  const data = await getCatalogProducts({ take: 48 });

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

import Image from "next/image";
import { notFound } from "next/navigation";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { ProductOptionsClient } from "@/components/product/product-options-client";
import { getCatalogProductBySlug } from "@/lib/catalog-products";

type ProductDetailPageProps = {
  params: Promise<{ slug: string }>;
};

export default async function ProductDetailPage({
  params,
}: ProductDetailPageProps) {
  const { slug } = await params;
  const product = await getCatalogProductBySlug(slug);
  if (!product) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-[#f5f2ee] text-[#1f1f1f]">
      <SiteHeader />

      <main className="mx-auto grid w-full max-w-6xl gap-6 px-4 pb-14 sm:px-6 sm:pb-16 lg:grid-cols-2 lg:gap-10 lg:px-8">
        <section className="rounded-3xl bg-white p-4 shadow-sm ring-1 ring-black/5 sm:p-6">
          <div className="relative h-72 overflow-hidden rounded-2xl sm:h-[28rem]">
            <Image
              src={product.image}
              alt={product.name}
              fill
              className="object-cover"
              priority
            />
          </div>
        </section>

        <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-black/5 sm:p-8">
          <p className="inline-block rounded-full bg-[#efefef] px-3 py-1 text-xs">
            {product.tag}
          </p>
          <h1 className="mt-4 text-3xl font-semibold sm:text-4xl">{product.name}</h1>
          <p className="mt-2 text-sm text-[#666]">Categoria: {product.category}</p>
          <p className="mt-5 text-2xl font-semibold">{product.price}</p>

          <p className="mt-6 text-sm leading-6 text-[#4f4f4f]">
            {product.description}
          </p>

          <ProductOptionsClient
            product={{
              slug: product.slug,
              name: product.name,
              price: product.price,
              image: product.image,
              category: product.category,
            }}
          />

          <div className="mt-8 rounded-2xl bg-[#f6f5f3] p-4 text-sm text-[#4f4f4f]">
            Envio y devolucion: envio nacional entre 3 y 7 dias habiles.
            Cambios dentro de los primeros 7 dias.
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}

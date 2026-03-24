import Link from "next/link";
import { ProductCard } from "@/components/home/product-card";
import { SectionHeader } from "@/components/home/section-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { featuredProducts } from "@/mocks/home-data";

const favoriteProducts = [featuredProducts[1], featuredProducts[3], featuredProducts[5]];

export default function FavoritosPage() {
  return (
    <div className="min-h-screen bg-[#f5f2ee] text-[#1f1f1f]">
      <SiteHeader />

      <main className="mx-auto w-full max-w-6xl px-4 pb-14 sm:px-6 sm:pb-16 lg:px-8">
        <SectionHeader
          title="Tus favoritos"
          description="Productos guardados para que puedas revisarlos y decidir tu compra."
          className="mb-8 text-center"
        />

        {favoriteProducts.length > 0 ? (
          <section className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-black/5 sm:p-8">
            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {favoriteProducts.map((product) => (
                <ProductCard key={product.slug} {...product} />
              ))}
            </div>
          </section>
        ) : (
          <section className="rounded-3xl bg-white p-8 text-center shadow-sm ring-1 ring-black/5">
            <h2 className="text-2xl font-semibold">Aun no tienes favoritos</h2>
            <p className="mt-3 text-sm text-[#666]">
              Guarda productos para encontrarlos rapido mas tarde.
            </p>
            <Link
              href="/productos"
              className="mt-6 inline-block rounded-full bg-[#1f1f1f] px-6 py-3 text-sm font-semibold text-white"
            >
              Explorar catalogo
            </Link>
          </section>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}

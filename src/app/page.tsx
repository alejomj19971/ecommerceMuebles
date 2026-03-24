import Image from "next/image";
import Link from "next/link";
import { BenefitCard } from "@/components/home/benefit-card";
import { ProductCard } from "@/components/home/product-card";
import { SectionHeader } from "@/components/home/section-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import {
  benefits,
  faqs,
  roomCollections,
  testimonials,
} from "@/mocks/home-data";

import { getCatalogProducts } from "@/lib/catalog-products";
import { CATEGORIA_LABELS, type CategoriaSlug } from "@/lib/utils";

/** Catálogo en caché; se actualiza sin redeploy completo. */
export const revalidate = 60;

export default async function Home() {
  const data = await getCatalogProducts({ take: 48 });

  const featuredProducts = [...data.products]
    .sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0))
    .slice(0, 6);

  const primeraImagenPorCategoria = new Map<string, string>();
  for (const p of data.products) {
    if (!primeraImagenPorCategoria.has(p.category)) {
      primeraImagenPorCategoria.set(p.category, p.image);
    }
  }

  const coleccionesConImagen = roomCollections.map((room) => {
    const etiqueta = CATEGORIA_LABELS[room.slug as CategoriaSlug];
    const desdeCatalogo = primeraImagenPorCategoria.get(etiqueta);
    return { ...room, image: desdeCatalogo ?? room.image };
  });

  return (
    <div className="bg-[#f5f2ee] text-[#1f1f1f]">
      <SiteHeader />

      <main className="mx-auto flex w-full max-w-6xl flex-col gap-12 px-4 pb-14 sm:gap-16 sm:px-6 sm:pb-16 lg:px-8">
        <section
          className="relative overflow-hidden rounded-3xl p-6 text-white sm:rounded-[2rem] sm:p-12"
          style={{
            backgroundImage:
              "linear-gradient(to right, rgba(0,0,0,0.50), rgba(0,0,0,0.20)), url('https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=1600&q=80')",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          <div className="max-w-2xl">
            <p className="mb-3 text-xs uppercase tracking-[0.2em] text-[#f4f4f4] sm:text-sm">
              Muebles premium
            </p>
            <h1 className="text-3xl font-semibold leading-tight sm:text-5xl">
              Encuentra el mueble perfecto para completar tu hogar
            </h1>
            <p className="mt-4 max-w-xl text-xs text-[#ececec] sm:text-base">
              Diseno elegante, acabados premium y confort real para sala,
              dormitorio y oficina.
            </p>
            <Link
              href="/productos"
              className="mt-6 inline-block rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-[#1f1f1f] sm:mt-8 sm:px-6 sm:py-3"
            >
              Comprar ahora
            </Link>
          </div>
        </section>

        <section>
          <SectionHeader
            title="Nuevas colecciones"
            description="Productos seleccionados para elevar el estilo de tus espacios."
          />
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {featuredProducts.map((product) => (
              <ProductCard key={product.name} {...product} />
            ))}
          </div>
        </section>

        <section>
          <SectionHeader
            title="Productos recomendados"
            description="Explora ambientes completos con una propuesta visual moderna."
          />
          <div className="grid gap-5 md:grid-cols-2">
            {coleccionesConImagen.map((room) => (
              <article key={room.title} className="group relative h-60 overflow-hidden rounded-2xl sm:h-72">
                <Image
                  src={room.image}
                  alt={room.title}
                  fill
                  className="object-cover transition duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-4 left-4 sm:bottom-5 sm:left-5">
                  <h3 className="text-xl font-semibold text-white sm:text-2xl">
                    {room.title}
                  </h3>
                  <Link
                    href={`/categorias/${room.slug}`}
                    className="mt-3 inline-block rounded-full bg-white px-4 py-2 text-xs font-semibold text-[#1f1f1f]"
                  >
                    Ver productos
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-black/5 sm:p-8">
          <SectionHeader title="Lo que ofrecemos" className="mb-6 text-center" />
          <div className="grid gap-4 md:grid-cols-3">
            {benefits.map((item) => (
              <BenefitCard key={item.title} {...item} />
            ))}
          </div>
        </section>

        <section>
          <SectionHeader title="Clientes felices" className="mb-6 text-center" />
          <div className="grid gap-4 md:grid-cols-3">
            {testimonials.map((item) => (
              <article key={item.author} className="rounded-2xl bg-white p-5">
                <p className="text-sm text-[#4f4f4f]">{item.text}</p>
                <p className="mt-4 text-sm font-semibold">{item.author}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="rounded-3xl bg-white p-6 sm:p-8">
          <SectionHeader title="Preguntas frecuentes" className="mb-6 text-center" />
          <div className="grid gap-3 md:grid-cols-2">
            {faqs.map((question) => (
              <div
                key={question}
                className="rounded-xl border border-[#e7e3dc] px-4 py-3 text-sm"
              >
                {question}
              </div>
            ))}
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}

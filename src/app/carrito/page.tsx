import { CartClient } from "@/components/cart/cart-client";
import { SectionHeader } from "@/components/home/section-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";

export default function CarritoPage() {
  return (
    <div className="min-h-screen bg-[#f5f2ee] text-[#1f1f1f]">
      <SiteHeader />

      <main className="mx-auto w-full max-w-6xl px-4 pb-14 sm:px-6 sm:pb-16 lg:px-8">
        <SectionHeader
          title="Tu carrito"
          description="Gestiona cantidades y revisa el resumen de compra antes del checkout."
          className="mb-8 text-center"
        />
        <CartClient />
      </main>
      <SiteFooter />
    </div>
  );
}

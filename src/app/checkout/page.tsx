import { CheckoutContactClient } from "@/components/checkout/checkout-contact-client";
import { SectionHeader } from "@/components/home/section-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";

export default function CheckoutPage() {
  return (
    <div className="min-h-screen bg-[#f5f2ee] text-[#1f1f1f]">
      <SiteHeader />

      <main className="mx-auto w-full max-w-6xl px-4 pb-14 sm:px-6 sm:pb-16 lg:px-8">
        <SectionHeader
          title="Checkout"
          description="Flujo visual de compra: datos, envio y pago (sin logica real)."
          className="mb-8 text-center"
        />

        <section className="mb-6 rounded-3xl bg-white p-5 shadow-sm ring-1 ring-black/5 sm:p-6">
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-xl bg-[#1f1f1f] px-4 py-3 text-sm font-semibold text-white">
              1. Datos personales
            </div>
            <div className="rounded-xl bg-[#efefef] px-4 py-3 text-sm font-semibold text-[#333]">
              2. Metodo de envio
            </div>
            <div className="rounded-xl bg-[#efefef] px-4 py-3 text-sm font-semibold text-[#333]">
              3. Pago
            </div>
          </div>
        </section>

        <CheckoutContactClient
          subtotalLabel="$6.800.000"
          envioLabel="$30.000"
          totalLabel="$6.830.000"
        />
      </main>
      <SiteFooter />
    </div>
  );
}

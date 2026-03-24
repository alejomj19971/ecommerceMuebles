import Link from "next/link";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";

export default function ConfirmacionPage() {
  return (
    <div className="min-h-screen bg-[#f5f2ee] text-[#1f1f1f]">
      <SiteHeader />

      <main className="mx-auto flex w-full max-w-6xl px-4 pb-14 sm:px-6 sm:pb-16 lg:px-8">
        <section className="mx-auto mt-4 w-full max-w-2xl rounded-3xl bg-white p-8 text-center shadow-sm ring-1 ring-black/5 sm:p-10">
          <p className="mx-auto mb-4 w-fit rounded-full bg-[#e7f5eb] px-3 py-1 text-xs font-semibold text-[#1f6b3d]">
            Orden confirmada
          </p>
          <h1 className="text-3xl font-semibold sm:text-4xl">
            Gracias por tu compra
          </h1>
          <p className="mt-4 text-sm text-[#666] sm:text-base">
            Este es un flujo visual del MVP. Tu orden <strong>#FS-1024</strong>{" "}
            fue generada exitosamente y recibiras una confirmacion por correo.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link
              href="/productos"
              className="rounded-full bg-[#1f1f1f] px-6 py-3 text-sm font-semibold text-white"
            >
              Seguir comprando
            </Link>
            <Link
              href="/mi-cuenta"
              className="rounded-full border border-[#d7d2c8] px-6 py-3 text-sm font-semibold text-[#1f1f1f]"
            >
              Ver mi cuenta
            </Link>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}

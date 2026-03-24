import Link from "next/link";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#f5f2ee] text-[#1f1f1f]">
      <SiteHeader />
      <main className="mx-auto flex w-full max-w-6xl px-4 pb-14 sm:px-6 sm:pb-16 lg:px-8">
        <section className="mx-auto mt-6 w-full max-w-2xl rounded-3xl bg-white p-8 text-center shadow-sm ring-1 ring-black/5 sm:p-10">
          <p className="text-sm text-[#666]">Error 404</p>
          <h1 className="mt-2 text-3xl font-semibold sm:text-4xl">
            Pagina no encontrada
          </h1>
          <p className="mt-4 text-sm text-[#666]">
            La ruta que buscas no existe o fue movida.
          </p>
          <Link
            href="/"
            className="mt-6 inline-block rounded-full bg-[#1f1f1f] px-6 py-3 text-sm font-semibold text-white"
          >
            Volver al inicio
          </Link>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}

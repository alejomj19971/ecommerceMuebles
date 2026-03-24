import { redirect } from "next/navigation";
import { getMe } from "@/lib/auth";
import { LoginForm } from "@/components/auth/login-form";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";

export default async function LoginPage() {
  const me = await getMe();

  if (me) {
    if (me.role === "ADMIN") return redirect("/admin");
    return redirect("/mi-cuenta");
  }

  return (
    <div className="min-h-screen bg-[#f5f2ee] text-[#1f1f1f]">
      <SiteHeader />

      <main className="mx-auto w-full max-w-2xl px-4 pb-14 pt-10 sm:px-6 sm:pb-16 lg:px-8">
        <section className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-black/5 sm:p-7">
          <h1 className="text-2xl font-semibold">Iniciar sesión</h1>
          <p className="mt-2 text-sm text-[#666]">
            Ingresa para ver tus pedidos o acceder al panel de administrador.
          </p>

          <div className="mt-6">
            <LoginForm />
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}


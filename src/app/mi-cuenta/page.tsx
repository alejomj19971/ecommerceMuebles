import Link from "next/link";
import { redirect } from "next/navigation";
import { SectionHeader } from "@/components/home/section-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { getMe } from "@/lib/auth";
import { LogoutButton } from "@/components/auth/logout-button";
import { prisma } from "@/lib/prisma";
import { decimalToNumber } from "@/lib/decimal-utils";

function formatPrice(value: number) {
  return new Intl.NumberFormat("es-CO").format(value);
}

function formatDate(iso: string) {
  try {
    return new Intl.DateTimeFormat("es-CO", { dateStyle: "medium" }).format(
      new Date(iso)
    );
  } catch {
    return iso;
  }
}

export default async function MiCuentaPage() {
  const me = await getMe();

  if (!me) {
    return redirect("/login");
  }
  if (me.role === "ADMIN") {
    return redirect("/admin");
  }

  let userId: bigint;
  try {
    userId = BigInt(me.id);
  } catch {
    return redirect("/login");
  }

  const orders = await prisma.venta.findMany({
    where: { idUsuario: userId },
    orderBy: { fecha: "desc" },
    include: {
      detalles: {
        include: { producto: true },
      },
    },
  });

  return (
    <div className="min-h-screen bg-[#f5f2ee] text-[#1f1f1f]">
      <SiteHeader />

      <main className="mx-auto w-full max-w-6xl px-4 pb-14 sm:px-6 sm:pb-16 lg:px-8">
        <SectionHeader
          title="Mi cuenta"
          description="Gestion de perfil con login real (rol: cliente/admin)."
          className="mb-8 text-center"
        />

        <section className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
          <div className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-black/5 sm:p-6">
            <h2 className="mb-5 text-xl font-semibold">
              Sesión activa
            </h2>

            <div className="space-y-4">
              <div>
                <p className="text-sm text-[#666]">Bienvenido</p>
                <p className="text-lg font-semibold">{me.name ?? me.email}</p>
                <p className="mt-1 text-sm text-[#666]">
                  Rol: <span className="font-semibold">{me.role}</span>
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <LogoutButton />
                <Link
                  href="/productos"
                  className="rounded-xl border border-[#d7d2c8] px-4 py-3 text-sm font-semibold text-[#1f1f1f]"
                >
                  Seguir comprando
                </Link>
              </div>
            </div>
          </div>

          <aside className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-black/5 sm:p-6">
            <h2 className="text-xl font-semibold">Acciones rapidas</h2>
            <div className="mt-5 grid gap-3">
              <Link
                href="/favoritos"
                className="rounded-xl bg-[#f6f5f3] px-4 py-3 text-sm font-medium"
              >
                Ver favoritos
              </Link>
              <Link
                href="/carrito"
                className="rounded-xl bg-[#f6f5f3] px-4 py-3 text-sm font-medium"
              >
                Ir al carrito
              </Link>
              <Link
                href="/checkout"
                className="rounded-xl bg-[#f6f5f3] px-4 py-3 text-sm font-medium"
              >
                Continuar checkout
              </Link>
            </div>
          </aside>
        </section>

        {me ? (
          <section className="mt-6 rounded-3xl bg-white p-5 shadow-sm ring-1 ring-black/5 sm:p-6">
            <div className="mb-4 flex items-center justify-between gap-3">
              <h2 className="text-xl font-semibold">Mis ventas</h2>
              <p className="text-sm text-[#666]">{orders.length} venta(s)</p>
            </div>

            {orders.length === 0 ? (
              <p className="text-sm text-[#666]">
                Aun no tienes ventas registradas.
              </p>
            ) : (
              <div className="space-y-4">
                {orders.slice(0, 10).map((o) => (
                  <article
                    key={o.id}
                    className="rounded-2xl border border-[#ece8df] p-4"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <p className="text-sm font-semibold">
                          N.º de orden: {o.numeroOrden}
                        </p>
                        <p className="text-xs text-[#666]">
                          {formatDate(o.fecha.toISOString())}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold">
                          ${formatPrice(decimalToNumber(o.total))}
                        </p>
                        <p className="text-xs text-[#666]">Registrada</p>
                      </div>
                    </div>

                    <div className="mt-3 text-sm text-[#666]">
                      Productos:{" "}
                      {o.detalles
                        .slice(0, 3)
                        .map(
                          (it) =>
                            `${it.producto.nombre} x${decimalToNumber(it.cantidad)}`
                        )
                        .join(", ")}
                      {o.detalles.length > 3 ? "..." : ""}
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        ) : null}
      </main>
      <SiteFooter />
    </div>
  );
}

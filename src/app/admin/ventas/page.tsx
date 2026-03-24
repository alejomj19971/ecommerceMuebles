import { prisma } from "@/lib/prisma";
import { decimalToNumber } from "@/lib/decimal-utils";
import { AdminVentasCrud } from "@/components/admin/admin-ventas-crud";

export default async function AdminVentasPage() {
  const [ventas, usuarios, productos] = await Promise.all([
    prisma.venta.findMany({
      orderBy: { fecha: "desc" },
      include: {
        usuario: { select: { id: true, nombre: true, email: true } },
        detalles: {
          include: { producto: true },
        },
      },
    }),
    prisma.usuario.findMany({
      orderBy: { nombre: "asc" },
      select: { id: true, nombre: true, email: true },
    }),
    prisma.producto.findMany({
      orderBy: { nombre: "asc" },
      select: { id: true, nombre: true, precio_venta: true, precioFabricacion: true },
    }),
  ]);

  const initialVentas = ventas.map((v) => ({
    id: v.id.toString(),
    numeroOrden: v.numeroOrden,
    fechaIso: v.fecha.toISOString(),
    total: decimalToNumber(v.total),
    usuario: {
      id: v.usuario.id.toString(),
      nombre: v.usuario.nombre,
      email: v.usuario.email,
    },
    detalles: v.detalles.map((d) => ({
      id: d.id.toString(),
      idProducto: d.idProducto.toString(),
      productoNombre: d.producto.nombre,
      cantidad: decimalToNumber(d.cantidad),
      precioUnitario: decimalToNumber(d.precioUnitario),
    })),
  }));
  const users = usuarios.map((u) => ({
    id: u.id.toString(),
    nombre: u.nombre,
    email: u.email,
  }));
  const products = productos.map((p) => ({
    id: p.id.toString(),
    nombre: p.nombre,
    precioVenta: decimalToNumber(p.precio_venta),
    precioFabricacion: decimalToNumber(p.precioFabricacion),
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Ventas</h1>
        <p className="mt-1 text-sm text-[#666]">
          Cada venta tiene un número de orden legible. El detalle conserva precios históricos.
        </p>
      </div>

      <AdminVentasCrud initialVentas={initialVentas} usuarios={users} productos={products} />
    </div>
  );
}

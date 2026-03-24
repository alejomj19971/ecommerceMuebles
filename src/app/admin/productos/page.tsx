import { prisma } from "@/lib/prisma";
import { decimalToNumber } from "@/lib/decimal-utils";
import { CreateProductoModal } from "@/components/admin/create-producto-modal";
import { AdminProductosTable } from "@/components/admin/admin-productos-table";

export default async function AdminProductosPage() {
  const [productos, materiales] = await Promise.all([
    prisma.producto.findMany({
      orderBy: { nombre: "asc" },
      include: {
        productoMateriales: true,
      },
    }),
    prisma.material.findMany({
      orderBy: { nombre: "asc" },
    }),
  ]);

  const initial = productos.map((p) => ({
    id: p.id.toString(),
    nombre: p.nombre,
    categoria: p.categoria,
    imagenUrl: p.imagen_url,
    precioVenta: decimalToNumber(p.precio_venta),
    precioFabricacion: decimalToNumber(p.precioFabricacion),
    recetaCount: p.productoMateriales.length,
  }));
  const materialOptions = materiales.map((m) => ({
    id: m.id.toString(),
    nombre: m.nombre,
    categoria: m.categoria,
    unidadMedida: m.unidadMedida,
    precioUnitario: decimalToNumber(m.precioUnitario),
  }));

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Productos</h1>
          <p className="mt-1 text-sm text-[#666]">
            Crea, edita o elimina productos. Precio y categoría van a la tienda;
            la receta (materiales) se gestiona en el detalle.
          </p>
        </div>
        <CreateProductoModal materiales={materialOptions} />
      </div>

      <AdminProductosTable initial={initial} />
    </div>
  );
}

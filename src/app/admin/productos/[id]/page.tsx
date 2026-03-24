import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { decimalToNumber } from "@/lib/decimal-utils";
import { ProductoRecetaEditor } from "@/components/admin/producto-receta-editor";
import { ProductoDetalleForm } from "@/components/admin/producto-detalle-form";
import { ProductoDetalleHeader } from "@/components/admin/producto-detalle-header";

type PageProps = { params: Promise<{ id: string }> };

export default async function AdminProductoDetallePage({ params }: PageProps) {
  const { id } = await params;
  let pid: bigint;
  try {
    pid = BigInt(id);
  } catch {
    notFound();
  }

  const [p, materiales] = await Promise.all([
    prisma.producto.findUnique({
      where: { id: pid },
      include: {
        productoMateriales: {
          include: { material: true },
          orderBy: { material: { nombre: "asc" } },
        },
      },
    }),
    prisma.material.findMany({
      orderBy: { nombre: "asc" },
    }),
  ]);

  if (!p) notFound();

  const initialLines = p.productoMateriales.map((row) => ({
    idMaterial: row.idMaterial.toString(),
    nombre: row.material.nombre,
    unidad: row.material.unidadMedida,
    cantidad: decimalToNumber(row.cantidad),
    precioUnitario: decimalToNumber(row.material.precioUnitario),
  }));

  const materialesOptions = materiales.map((m) => ({
    id: m.id.toString(),
    nombre: m.nombre,
    unidadMedida: m.unidadMedida,
    precioUnitario: decimalToNumber(m.precioUnitario),
  }));

  return (
    <div className="space-y-6">
      <ProductoDetalleHeader
        id={p.id.toString()}
        nombre={p.nombre}
        categoria={p.categoria}
        precioVenta={decimalToNumber(p.precio_venta)}
        precioFabricacion={decimalToNumber(p.precioFabricacion)}
      />

      <ProductoDetalleForm
        id={p.id.toString()}
        nombreInicial={p.nombre}
        precioInicial={decimalToNumber(p.precio_venta)}
        precioFabricacion={decimalToNumber(p.precioFabricacion)}
        categoriaInicial={p.categoria}
        imagenInicial={p.imagen_url}
      />

      <ProductoRecetaEditor
        productId={p.id.toString()}
        initialLines={initialLines}
        materiales={materialesOptions}
      />
    </div>
  );
}

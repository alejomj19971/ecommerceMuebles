import { prisma } from "@/lib/prisma";
import { MaterialesCrud } from "@/components/admin/materiales-crud";
import { decimalToNumber } from "@/lib/decimal-utils";

export default async function AdminMaterialesPage() {
  const materiales = await prisma.material.findMany({
    orderBy: { nombre: "asc" },
  });

  const initial = materiales.map((m) => ({
    id: m.id.toString(),
    nombre: m.nombre,
    categoria: m.categoria,
    unidadMedida: m.unidadMedida,
    precioUnitario: decimalToNumber(m.precioUnitario),
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Materiales</h1>
        <p className="mt-1 text-sm text-[#666]">
          Insumos del catálogo (tabla materiales). Crear, editar o eliminar
          insumos.
        </p>
      </div>

      <MaterialesCrud initial={initial} />
    </div>
  );
}

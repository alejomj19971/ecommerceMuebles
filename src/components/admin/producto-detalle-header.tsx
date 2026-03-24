import Link from "next/link";
import { labelCategoria } from "@/lib/utils";

type Props = {
  id: string;
  nombre: string;
  categoria: string;
  precioVenta: number;
  precioFabricacion: number;
};

function formatPrice(value: number) {
  return new Intl.NumberFormat("es-CO").format(value);
}

export function ProductoDetalleHeader({
  id,
  nombre,
  categoria,
  precioVenta,
  precioFabricacion,
}: Props) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div>
        <p className="text-xs text-[#666]">
          <Link href="/admin/productos" className="underline">
            Productos
          </Link>{" "}
          / {id}
        </p>
        <h1 className="mt-2 text-2xl font-semibold">{nombre}</h1>
        <p className="mt-1 text-sm text-[#666]">Categoría: {labelCategoria(categoria)}</p>
        <p className="mt-1 text-sm text-[#666]">Precio venta: ${formatPrice(precioVenta)}</p>
        <p className="mt-1 text-sm text-[#666]">
          Precio fabricación: ${formatPrice(precioFabricacion)}
        </p>
      </div>
    </div>
  );
}

export type VentaParaExport = {
  id: string;
  numeroOrden: string;
  fechaIso: string;
  usuario: { nombre: string; email: string };
  detalles: Array<{
    productoNombre: string;
    cantidad: number;
    precioUnitario: number;
  }>;
};

function lineasDetalle(ventas: VentaParaExport[]) {
  const lineas: Array<{
    "ID venta": string;
    "Número orden": string;
    "Fecha venta": string;
    Cliente: string;
    Email: string;
    Producto: string;
    Cantidad: number;
    "Precio unitario": number;
    Subtotal: number;
  }> = [];
  for (const v of ventas) {
    for (const d of v.detalles) {
      const subtotal = d.cantidad * d.precioUnitario;
      lineas.push({
        "ID venta": v.id,
        "Número orden": v.numeroOrden,
        "Fecha venta": new Date(v.fechaIso).toLocaleString("es-CO", {
          dateStyle: "short",
          timeStyle: "short",
        }),
        Cliente: v.usuario.nombre,
        Email: v.usuario.email,
        Producto: d.productoNombre,
        Cantidad: d.cantidad,
        "Precio unitario": d.precioUnitario,
        Subtotal: subtotal,
      });
    }
  }
  return lineas;
}

export async function downloadVentasDetalleXlsx(
  ventas: VentaParaExport[],
  filenameBase: string
) {
  const XLSX = await import("xlsx");
  const rows = lineasDetalle(ventas);
  const ws = XLSX.utils.json_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Detalle ventas");
  const safe = filenameBase.replace(/[^\w.-]+/g, "_").slice(0, 80);
  XLSX.writeFile(wb, `${safe || "ventas"}.xlsx`);
}

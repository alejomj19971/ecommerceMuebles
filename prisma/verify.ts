/**
 * Comprueba conexión y tablas mínimas (ejecutar con DATABASE_URL definida).
 * Uso: npx tsx prisma/verify.ts
 */
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("Falta DATABASE_URL en el entorno.");
  process.exit(1);
}

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: url }),
});

async function main() {
  const [roles, productos, ventas] = await Promise.all([
    prisma.rol.count(),
    prisma.producto.count(),
    prisma.venta.count(),
  ]);

  const muestra = await prisma.producto.findFirst({
    select: {
      id: true,
      nombre: true,
      categoria: true,
      precio_venta: true,
      precioFabricacion: true,
      imagen_url: true,
    },
  });

  console.log("Prisma OK:", { roles, productos, ventas });
  if (muestra) {
    console.log("Muestra producto:", {
      id: muestra.id.toString(),
      nombre: muestra.nombre,
      categoria: muestra.categoria,
      precio_venta: muestra.precio_venta.toString(),
      precio_fabricacion: muestra.precioFabricacion.toString(),
      imagen_url: muestra.imagen_url,
    });
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });

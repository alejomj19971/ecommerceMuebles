import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient({
  adapter: new PrismaPg({
    connectionString: process.env.DATABASE_URL as string,
  }),
});

async function main() {
  await prisma.detalleVenta.deleteMany();
  await prisma.venta.deleteMany();
  await prisma.productoMaterial.deleteMany();
  await prisma.producto.deleteMany();
  await prisma.material.deleteMany();
  await prisma.rolesPermiso.deleteMany();
  await prisma.usuario.deleteMany();
  await prisma.permiso.deleteMany();
  await prisma.rol.deleteMany();

  const rolAdmin = await prisma.rol.create({
    data: { nombreRol: "Administrador" },
  });
  const rolVendedor = await prisma.rol.create({
    data: { nombreRol: "Vendedor" },
  });

  const permisos = await prisma.$transaction([
    prisma.permiso.create({
      data: { descripcion: "Gestionar usuarios y roles" },
    }),
    prisma.permiso.create({
      data: { descripcion: "Registrar y consultar ventas" },
    }),
    prisma.permiso.create({
      data: { descripcion: "Administrar catálogo de productos" },
    }),
  ]);

  await prisma.rolesPermiso.createMany({
    data: [
      { idRol: rolAdmin.id, idPermiso: permisos[0].id },
      { idRol: rolAdmin.id, idPermiso: permisos[1].id },
      { idRol: rolAdmin.id, idPermiso: permisos[2].id },
      { idRol: rolVendedor.id, idPermiso: permisos[1].id },
    ],
  });

  const hashAdmin = await bcrypt.hash("admin123", 10);
  const hashVend = await bcrypt.hash("vendedor123", 10);

  const adminUser = await prisma.usuario.create({
    data: {
      nombre: "Admin Demo",
      email: "admin@ejemplo.com",
      password: hashAdmin,
      idRol: rolAdmin.id,
    },
  });

  const vendedorUser = await prisma.usuario.create({
    data: {
      nombre: "Luis Vendedor",
      email: "vendedor@ejemplo.com",
      password: hashVend,
      idRol: rolVendedor.id,
    },
  });

  const tela = await prisma.material.create({
    data: {
      nombre: "Tela chenille",
      categoria: "telas",
      unidadMedida: "m",
      precioUnitario: 38000,
    },
  });
  const espuma = await prisma.material.create({
    data: {
      nombre: "Espuma HR 35kg",
      categoria: "espumas",
      unidadMedida: "m²",
      precioUnitario: 52000,
    },
  });
  const tornillo = await prisma.material.create({
    data: {
      nombre: "Tornillo 1/4",
      categoria: "herraje",
      unidadMedida: "unidad",
      precioUnitario: 800,
    },
  });

  const sofa = await prisma.producto.create({
    data: {
      nombre: "Sofá 3 puestos lineal",
      categoria: "sala",
      precio_venta: 1890000,
      imagen_url:
        "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=1200&q=80",
    },
  });
  const sillon = await prisma.producto.create({
    data: {
      nombre: "Sillón individual tapizado",
      categoria: "sala",
      precio_venta: 650000,
      imagen_url:
        "https://images.unsplash.com/photo-1567538096631-e0c55bd6374c?auto=format&fit=crop&w=1200&q=80",
    },
  });
  const cama = await prisma.producto.create({
    data: {
      nombre: "Cama doble con cabecero tapizado",
      categoria: "dormitorio",
      precio_venta: 1200000,
      imagen_url:
        "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80",
    },
  });
  const mesa = await prisma.producto.create({
    data: {
      nombre: "Mesa comedor 6 puestos",
      categoria: "comedor",
      precio_venta: 980000,
      imagen_url:
        "https://images.unsplash.com/photo-1617806118233-18e1de247200?auto=format&fit=crop&w=1200&q=80",
    },
  });
  const escritorio = await prisma.producto.create({
    data: {
      nombre: "Escritorio ejecutivo",
      categoria: "oficina",
      precio_venta: 750000,
      imagen_url:
        "https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?auto=format&fit=crop&w=1200&q=80",
    },
  });
  const modular = await prisma.producto.create({
    data: {
      nombre: "Modular TV 2 módulos",
      categoria: "sala",
      precio_venta: 890000,
      imagen_url:
        "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=1200&q=80",
    },
  });

  await prisma.productoMaterial.createMany({
    data: [
      { idProducto: sofa.id, idMaterial: tela.id, cantidad: 12.5 },
      { idProducto: sofa.id, idMaterial: espuma.id, cantidad: 8 },
      { idProducto: sofa.id, idMaterial: tornillo.id, cantidad: 24 },
      { idProducto: sillon.id, idMaterial: tela.id, cantidad: 5 },
      { idProducto: sillon.id, idMaterial: espuma.id, cantidad: 3.5 },
      { idProducto: cama.id, idMaterial: tela.id, cantidad: 8 },
      { idProducto: cama.id, idMaterial: espuma.id, cantidad: 6 },
      { idProducto: mesa.id, idMaterial: tornillo.id, cantidad: 16 },
      { idProducto: escritorio.id, idMaterial: tornillo.id, cantidad: 12 },
      { idProducto: modular.id, idMaterial: tornillo.id, cantidad: 8 },
    ],
  });

  const productosConReceta = await prisma.producto.findMany({
    select: { id: true },
  });
  for (const prod of productosConReceta) {
    const lineas = await prisma.productoMaterial.findMany({
      where: { idProducto: prod.id },
      include: { material: true },
    });
    const costo = lineas.reduce((acc, row) => {
      return acc + Number(row.cantidad) * Number(row.material.precioUnitario);
    }, 0);
    await prisma.producto.update({
      where: { id: prod.id },
      data: { precioFabricacion: Math.round(costo * 100) / 100 },
    });
  }

  const v1 = await prisma.venta.create({
    data: {
      numeroOrden: "ORD-2025-0001",
      idUsuario: vendedorUser.id,
      total: 2540000,
    },
  });
  await prisma.detalleVenta.createMany({
    data: [
      {
        idVenta: v1.id,
        idProducto: sofa.id,
        cantidad: 1,
        precioUnitario: 1890000,
      },
      {
        idVenta: v1.id,
        idProducto: sillon.id,
        cantidad: 1,
        precioUnitario: 650000,
      },
    ],
  });

  const v2 = await prisma.venta.create({
    data: {
      numeroOrden: "ORD-2025-0002",
      idUsuario: vendedorUser.id,
      total: 650000,
    },
  });
  await prisma.detalleVenta.create({
    data: {
      idVenta: v2.id,
      idProducto: sillon.id,
      cantidad: 1,
      precioUnitario: 650000,
    },
  });

  console.log("Seed OK.", {
    admin: "admin@ejemplo.com / admin123",
    vendedor: "vendedor@ejemplo.com / vendedor123",
    adminId: adminUser.id.toString(),
    productos: 6,
    ventasEjemplo: ["ORD-2025-0001", "ORD-2025-0002"],
  });
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

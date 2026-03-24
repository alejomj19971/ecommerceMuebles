import { PrismaClient } from "@/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

// En Next.js (dev) es comun que el modulo se recargue; usamos un singleton
// para evitar crear muchos clientes de Prisma.
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter: new PrismaPg({
      connectionString: process.env.DATABASE_URL as string,
    }),
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;


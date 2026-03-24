-- AlterTable
ALTER TABLE "productos" ADD COLUMN IF NOT EXISTS "categoria" TEXT NOT NULL DEFAULT 'general';

-- CreateIndex
CREATE INDEX IF NOT EXISTS "productos_categoria_idx" ON "productos"("categoria");

-- AlterTable (número de orden en ventas; reemplaza el concepto de "orden" como referencia humana)
ALTER TABLE "ventas" ADD COLUMN IF NOT EXISTS "numero_orden" TEXT;

UPDATE "ventas" SET "numero_orden" = 'ORD-MIG-' || "id"::text WHERE "numero_orden" IS NULL;

ALTER TABLE "ventas" ALTER COLUMN "numero_orden" SET NOT NULL;

CREATE UNIQUE INDEX "ventas_numero_orden_key" ON "ventas"("numero_orden");

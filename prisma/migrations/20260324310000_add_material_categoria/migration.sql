-- AlterTable
ALTER TABLE "materiales" ADD COLUMN "categoria" TEXT NOT NULL DEFAULT 'telas';

-- CreateIndex
CREATE INDEX "materiales_categoria_idx" ON "materiales"("categoria");

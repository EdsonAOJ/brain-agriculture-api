-- CreateEnum
CREATE TYPE "DocumentType" AS ENUM ('CPF', 'CNPJ');

-- CreateTable
CREATE TABLE "producers" (
    "id" TEXT NOT NULL,
    "document" TEXT NOT NULL,
    "documentType" "DocumentType" NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "producers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "farms" (
    "id" TEXT NOT NULL,
    "producerId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "totalArea" DECIMAL(12,2) NOT NULL,
    "agriculturalArea" DECIMAL(12,2) NOT NULL,
    "vegetationArea" DECIMAL(12,2) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "farms_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "harvests" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "harvests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "crops" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "crops_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "planted_crops" (
    "id" TEXT NOT NULL,
    "farmId" TEXT NOT NULL,
    "harvestId" TEXT NOT NULL,
    "cropId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "planted_crops_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "producers_document_key" ON "producers"("document");

-- CreateIndex
CREATE INDEX "farms_producerId_idx" ON "farms"("producerId");

-- CreateIndex
CREATE INDEX "farms_state_idx" ON "farms"("state");

-- CreateIndex
CREATE UNIQUE INDEX "harvests_name_key" ON "harvests"("name");

-- CreateIndex
CREATE UNIQUE INDEX "crops_name_key" ON "crops"("name");

-- CreateIndex
CREATE INDEX "planted_crops_farmId_idx" ON "planted_crops"("farmId");

-- CreateIndex
CREATE INDEX "planted_crops_harvestId_idx" ON "planted_crops"("harvestId");

-- CreateIndex
CREATE INDEX "planted_crops_cropId_idx" ON "planted_crops"("cropId");

-- CreateIndex
CREATE UNIQUE INDEX "planted_crops_farmId_harvestId_cropId_key" ON "planted_crops"("farmId", "harvestId", "cropId");

-- AddForeignKey
ALTER TABLE "farms" ADD CONSTRAINT "farms_producerId_fkey" FOREIGN KEY ("producerId") REFERENCES "producers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "planted_crops" ADD CONSTRAINT "planted_crops_farmId_fkey" FOREIGN KEY ("farmId") REFERENCES "farms"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "planted_crops" ADD CONSTRAINT "planted_crops_harvestId_fkey" FOREIGN KEY ("harvestId") REFERENCES "harvests"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "planted_crops" ADD CONSTRAINT "planted_crops_cropId_fkey" FOREIGN KEY ("cropId") REFERENCES "crops"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

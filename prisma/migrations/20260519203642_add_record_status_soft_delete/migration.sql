/*
  Warnings:

  - Added the required column `updatedAt` to the `planted_crops` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "RecordStatus" AS ENUM ('ACTIVE', 'INACTIVE');

-- DropForeignKey
ALTER TABLE "farms" DROP CONSTRAINT "farms_producerId_fkey";

-- DropForeignKey
ALTER TABLE "planted_crops" DROP CONSTRAINT "planted_crops_farmId_fkey";

-- AlterTable
ALTER TABLE "crops" ADD COLUMN     "inactiveAt" TIMESTAMP(3),
ADD COLUMN     "status" "RecordStatus" NOT NULL DEFAULT 'ACTIVE';

-- AlterTable
ALTER TABLE "farms" ADD COLUMN     "inactiveAt" TIMESTAMP(3),
ADD COLUMN     "status" "RecordStatus" NOT NULL DEFAULT 'ACTIVE';

-- AlterTable
ALTER TABLE "harvests" ADD COLUMN     "inactiveAt" TIMESTAMP(3),
ADD COLUMN     "status" "RecordStatus" NOT NULL DEFAULT 'ACTIVE';

-- AlterTable
ALTER TABLE "planted_crops" ADD COLUMN     "inactiveAt" TIMESTAMP(3),
ADD COLUMN     "status" "RecordStatus" NOT NULL DEFAULT 'ACTIVE',
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "producers" ADD COLUMN     "inactiveAt" TIMESTAMP(3),
ADD COLUMN     "status" "RecordStatus" NOT NULL DEFAULT 'ACTIVE';

-- CreateIndex
CREATE INDEX "crops_status_idx" ON "crops"("status");

-- CreateIndex
CREATE INDEX "farms_status_idx" ON "farms"("status");

-- CreateIndex
CREATE INDEX "harvests_status_idx" ON "harvests"("status");

-- CreateIndex
CREATE INDEX "planted_crops_status_idx" ON "planted_crops"("status");

-- CreateIndex
CREATE INDEX "producers_status_idx" ON "producers"("status");

-- AddForeignKey
ALTER TABLE "farms" ADD CONSTRAINT "farms_producerId_fkey" FOREIGN KEY ("producerId") REFERENCES "producers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "planted_crops" ADD CONSTRAINT "planted_crops_farmId_fkey" FOREIGN KEY ("farmId") REFERENCES "farms"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

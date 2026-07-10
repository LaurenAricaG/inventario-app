/*
  Warnings:

  - You are about to drop the column `status` on the `direct_sales` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "direct_sales_status_idx";

-- AlterTable
ALTER TABLE "direct_sales" DROP COLUMN "status";

-- DropEnum
DROP TYPE "DirectSaleStatus";

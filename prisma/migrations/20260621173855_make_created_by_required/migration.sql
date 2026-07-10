/*
  Warnings:

  - Made the column `createdById` on table `brands` required. This step will fail if there are existing NULL values in that column.
  - Made the column `createdById` on table `campaign_orders` required. This step will fail if there are existing NULL values in that column.
  - Made the column `createdById` on table `campaigns` required. This step will fail if there are existing NULL values in that column.
  - Made the column `createdById` on table `catalog_pdfs` required. This step will fail if there are existing NULL values in that column.
  - Made the column `createdById` on table `categories` required. This step will fail if there are existing NULL values in that column.
  - Made the column `createdById` on table `clients` required. This step will fail if there are existing NULL values in that column.
  - Made the column `createdById` on table `companies` required. This step will fail if there are existing NULL values in that column.
  - Made the column `createdById` on table `direct_sales` required. This step will fail if there are existing NULL values in that column.
  - Made the column `createdById` on table `external_debts` required. This step will fail if there are existing NULL values in that column.
  - Made the column `createdById` on table `gender_segments` required. This step will fail if there are existing NULL values in that column.
  - Made the column `createdById` on table `payments` required. This step will fail if there are existing NULL values in that column.
  - Made the column `createdById` on table `products` required. This step will fail if there are existing NULL values in that column.
  - Made the column `createdById` on table `stock_movements` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "brands" DROP CONSTRAINT "brands_createdById_fkey";

-- DropForeignKey
ALTER TABLE "campaign_orders" DROP CONSTRAINT "campaign_orders_createdById_fkey";

-- DropForeignKey
ALTER TABLE "campaigns" DROP CONSTRAINT "campaigns_createdById_fkey";

-- DropForeignKey
ALTER TABLE "catalog_pdfs" DROP CONSTRAINT "catalog_pdfs_createdById_fkey";

-- DropForeignKey
ALTER TABLE "categories" DROP CONSTRAINT "categories_createdById_fkey";

-- DropForeignKey
ALTER TABLE "clients" DROP CONSTRAINT "clients_createdById_fkey";

-- DropForeignKey
ALTER TABLE "companies" DROP CONSTRAINT "companies_createdById_fkey";

-- DropForeignKey
ALTER TABLE "direct_sales" DROP CONSTRAINT "direct_sales_createdById_fkey";

-- DropForeignKey
ALTER TABLE "external_debts" DROP CONSTRAINT "external_debts_createdById_fkey";

-- DropForeignKey
ALTER TABLE "gender_segments" DROP CONSTRAINT "gender_segments_createdById_fkey";

-- DropForeignKey
ALTER TABLE "payments" DROP CONSTRAINT "payments_createdById_fkey";

-- DropForeignKey
ALTER TABLE "products" DROP CONSTRAINT "products_createdById_fkey";

-- DropForeignKey
ALTER TABLE "stock_movements" DROP CONSTRAINT "stock_movements_createdById_fkey";

-- AlterTable
ALTER TABLE "brands" ALTER COLUMN "createdById" SET NOT NULL;

-- AlterTable
ALTER TABLE "campaign_orders" ALTER COLUMN "createdById" SET NOT NULL;

-- AlterTable
ALTER TABLE "campaigns" ALTER COLUMN "createdById" SET NOT NULL;

-- AlterTable
ALTER TABLE "catalog_pdfs" ALTER COLUMN "createdById" SET NOT NULL;

-- AlterTable
ALTER TABLE "categories" ALTER COLUMN "createdById" SET NOT NULL;

-- AlterTable
ALTER TABLE "clients" ALTER COLUMN "createdById" SET NOT NULL;

-- AlterTable
ALTER TABLE "companies" ALTER COLUMN "createdById" SET NOT NULL;

-- AlterTable
ALTER TABLE "direct_sales" ALTER COLUMN "createdById" SET NOT NULL;

-- AlterTable
ALTER TABLE "external_debts" ALTER COLUMN "createdById" SET NOT NULL;

-- AlterTable
ALTER TABLE "gender_segments" ALTER COLUMN "createdById" SET NOT NULL;

-- AlterTable
ALTER TABLE "payments" ALTER COLUMN "createdById" SET NOT NULL;

-- AlterTable
ALTER TABLE "products" ALTER COLUMN "createdById" SET NOT NULL;

-- AlterTable
ALTER TABLE "stock_movements" ALTER COLUMN "createdById" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "companies" ADD CONSTRAINT "companies_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "brands" ADD CONSTRAINT "brands_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "campaigns" ADD CONSTRAINT "campaigns_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "catalog_pdfs" ADD CONSTRAINT "catalog_pdfs_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "categories" ADD CONSTRAINT "categories_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gender_segments" ADD CONSTRAINT "gender_segments_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "products" ADD CONSTRAINT "products_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_movements" ADD CONSTRAINT "stock_movements_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "clients" ADD CONSTRAINT "clients_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "external_debts" ADD CONSTRAINT "external_debts_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "campaign_orders" ADD CONSTRAINT "campaign_orders_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "direct_sales" ADD CONSTRAINT "direct_sales_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

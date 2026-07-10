/*
  Warnings:

  - You are about to drop the column `deletedAt` on the `external_debts` table. All the data in the column will be lost.
  - You are about to drop the column `deletedById` on the `external_debts` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "external_debts" DROP CONSTRAINT "external_debts_deletedById_fkey";

-- DropIndex
DROP INDEX "external_debts_deletedAt_idx";

-- DropIndex
DROP INDEX "external_debts_deletedById_idx";

-- AlterTable
ALTER TABLE "external_debts" DROP COLUMN "deletedAt",
DROP COLUMN "deletedById";

-- DropForeignKey
ALTER TABLE "audit_logs" DROP CONSTRAINT "audit_logs_userId_fkey";

-- AlterTable
ALTER TABLE "audit_logs" ALTER COLUMN "userId" DROP NOT NULL;

-- CreateIndex
CREATE INDEX "brands_createdById_idx" ON "brands"("createdById");

-- CreateIndex
CREATE INDEX "brands_updatedById_idx" ON "brands"("updatedById");

-- CreateIndex
CREATE INDEX "brands_deletedById_idx" ON "brands"("deletedById");

-- CreateIndex
CREATE INDEX "campaign_orders_createdById_idx" ON "campaign_orders"("createdById");

-- CreateIndex
CREATE INDEX "campaign_orders_updatedById_idx" ON "campaign_orders"("updatedById");

-- CreateIndex
CREATE INDEX "campaign_orders_deletedById_idx" ON "campaign_orders"("deletedById");

-- CreateIndex
CREATE INDEX "campaigns_createdById_idx" ON "campaigns"("createdById");

-- CreateIndex
CREATE INDEX "campaigns_updatedById_idx" ON "campaigns"("updatedById");

-- CreateIndex
CREATE INDEX "campaigns_deletedById_idx" ON "campaigns"("deletedById");

-- CreateIndex
CREATE INDEX "catalog_pdfs_deletedAt_idx" ON "catalog_pdfs"("deletedAt");

-- CreateIndex
CREATE INDEX "catalog_pdfs_createdById_idx" ON "catalog_pdfs"("createdById");

-- CreateIndex
CREATE INDEX "catalog_pdfs_updatedById_idx" ON "catalog_pdfs"("updatedById");

-- CreateIndex
CREATE INDEX "catalog_pdfs_deletedById_idx" ON "catalog_pdfs"("deletedById");

-- CreateIndex
CREATE INDEX "categories_createdById_idx" ON "categories"("createdById");

-- CreateIndex
CREATE INDEX "categories_updatedById_idx" ON "categories"("updatedById");

-- CreateIndex
CREATE INDEX "categories_deletedById_idx" ON "categories"("deletedById");

-- CreateIndex
CREATE INDEX "clients_createdById_idx" ON "clients"("createdById");

-- CreateIndex
CREATE INDEX "clients_updatedById_idx" ON "clients"("updatedById");

-- CreateIndex
CREATE INDEX "clients_deletedById_idx" ON "clients"("deletedById");

-- CreateIndex
CREATE INDEX "companies_createdById_idx" ON "companies"("createdById");

-- CreateIndex
CREATE INDEX "companies_updatedById_idx" ON "companies"("updatedById");

-- CreateIndex
CREATE INDEX "companies_deletedById_idx" ON "companies"("deletedById");

-- CreateIndex
CREATE INDEX "direct_sales_createdById_idx" ON "direct_sales"("createdById");

-- CreateIndex
CREATE INDEX "direct_sales_updatedById_idx" ON "direct_sales"("updatedById");

-- CreateIndex
CREATE INDEX "direct_sales_deletedById_idx" ON "direct_sales"("deletedById");

-- CreateIndex
CREATE INDEX "external_debts_createdById_idx" ON "external_debts"("createdById");

-- CreateIndex
CREATE INDEX "external_debts_updatedById_idx" ON "external_debts"("updatedById");

-- CreateIndex
CREATE INDEX "external_debts_deletedById_idx" ON "external_debts"("deletedById");

-- CreateIndex
CREATE INDEX "gender_segments_createdById_idx" ON "gender_segments"("createdById");

-- CreateIndex
CREATE INDEX "gender_segments_updatedById_idx" ON "gender_segments"("updatedById");

-- CreateIndex
CREATE INDEX "gender_segments_deletedById_idx" ON "gender_segments"("deletedById");

-- CreateIndex
CREATE INDEX "payments_createdById_idx" ON "payments"("createdById");

-- CreateIndex
CREATE INDEX "payments_updatedById_idx" ON "payments"("updatedById");

-- CreateIndex
CREATE INDEX "products_createdById_idx" ON "products"("createdById");

-- CreateIndex
CREATE INDEX "products_updatedById_idx" ON "products"("updatedById");

-- CreateIndex
CREATE INDEX "products_deletedById_idx" ON "products"("deletedById");

-- CreateIndex
CREATE INDEX "roles_createdById_idx" ON "roles"("createdById");

-- CreateIndex
CREATE INDEX "roles_updatedById_idx" ON "roles"("updatedById");

-- CreateIndex
CREATE INDEX "roles_deletedById_idx" ON "roles"("deletedById");

-- CreateIndex
CREATE INDEX "stock_movements_createdById_idx" ON "stock_movements"("createdById");

-- CreateIndex
CREATE INDEX "users_createdById_idx" ON "users"("createdById");

-- CreateIndex
CREATE INDEX "users_updatedById_idx" ON "users"("updatedById");

-- CreateIndex
CREATE INDEX "users_deletedById_idx" ON "users"("deletedById");

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

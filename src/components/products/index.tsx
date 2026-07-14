"use client";

import { useState } from "react";
import { toast } from "sonner";
import { FiPlus, FiPackage } from "react-icons/fi";
import Button from "@/components/ui/Button";
import ConfirmModal from "@/components/ui/ConfirmModal";
import Pagination from "@/components/ui/Pagination";
import SearchInput from "@/components/ui/SearchInput";
import { deleteProductAction } from "@/lib/product";
import { ProductWithRelations } from "@/types/models";
import TableProducts from "./TableProducts";
import FormProducts from "./FormProducts";
import DetailProductModal from "./DetailProductModal";
import PageHeader from "@/components/ui/PageHeader";

interface ProductsProps {
  initialProducts: ProductWithRelations[];
  genders: { id: number; name: string }[];
  categories: { id: number; name: string }[];
  brands: { id: number; name: string }[];
  overallCount: number;
  totalItems: number;
  totalPages: number;
  currentPage: number;
  itemsPerPage: number;
  search: string;
  permissions: string[];
}

export default function Products({
  initialProducts,
  genders,
  categories,
  brands,
  overallCount,
  totalItems,
  totalPages,
  currentPage,
  itemsPerPage,
  search,
  permissions,
}: ProductsProps) {
  const canCreate = permissions.includes("products:create");
  const canUpdate = permissions.includes("products:update");
  const canDelete = permissions.includes("products:delete");
  const canReadCost = permissions.includes("products:cost-read");

  // Modals state
  const [isOpenFormModal, setIsOpenFormModal] = useState(false);
  const [isOpenDeleteModal, setIsOpenDeleteModal] = useState(false);
  const [isOpenDetailModal, setIsOpenDetailModal] = useState(false);
  const [selectedProduct, setSelectedProduct] =
    useState<ProductWithRelations | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleOpenForm = (product: ProductWithRelations | null = null) => {
    setSelectedProduct(product);
    setIsOpenFormModal(true);
  };

  const handleOpenDelete = (product: ProductWithRelations) => {
    setSelectedProduct(product);
    setIsOpenDeleteModal(true);
  };

  const handleOpenDetail = (product: ProductWithRelations) => {
    setSelectedProduct(product);
    setIsOpenDetailModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedProduct) return;
    setIsSubmitting(true);

    try {
      const res = await deleteProductAction(selectedProduct.id);
      if (res.success) {
        toast.success(res.message);
        setIsOpenDeleteModal(false);
      } else {
        toast.error(res.message);
      }
    } catch (error) {
      toast.error("Ocurrió un error inesperado al eliminar el producto.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Inventario de Productos"
        subtitle="Administración del stock, precios y catálogo general de productos."
        breadcrumbs={[
          { label: "admin", href: "/admin" },
          { label: "productos" },
        ]}
        action={
          overallCount > 0 && canCreate ? (
            <Button
              variant="primary"
              onClick={() => handleOpenForm(null)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold shadow-sm shrink-0"
            >
              <FiPlus className="w-4 h-4" />
              Nuevo producto
            </Button>
          ) : undefined
        }
      />

      {/* Main Container */}
      {overallCount === 0 ? (
        /* Empty State */
        <div className="flex flex-col items-center justify-center py-16 px-6 bg-bg-card border border-border-default/50 rounded-2xl text-center shadow-xs max-w-lg mx-auto my-8 select-none">
          <div className="w-16 h-16 rounded-2xl bg-beauty-50 dark:bg-beauty-950 flex items-center justify-center text-beauty-600 mb-5 border border-beauty-100 dark:border-beauty-500 shadow-xs">
            <FiPackage className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-text-primary mb-2">
            No hay productos registrados
          </h3>
          <p className="text-xs text-text-secondary mb-8 leading-relaxed max-w-sm">
            Para comenzar a vender, registra tu primer producto con su respectivo stock, código, categoría y galería de imágenes.
          </p>
          {canCreate && (
            <Button
              variant="primary"
              onClick={() => handleOpenForm(null)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold shadow-sm"
            >
              <FiPlus className="w-4 h-4" />
              Nuevo producto
            </Button>
          )}
        </div>
      ) : (
        /* Records Table */
        <div className="bg-bg-card border border-border-default/80 rounded-2xl shadow-xs overflow-hidden">
          {/* Filters Bar */}
          <div className="px-6 py-4 border-b border-border-soft flex flex-col md:flex-row items-stretch md:items-center gap-4 bg-bg-card">
            <div className="flex-1 max-w-md">
              <SearchInput placeholder="Buscar por nombre o código de producto..." />
            </div>
            <div className="text-xs text-text-secondary md:ml-auto select-none font-medium">
              Total: {overallCount} productos registrados
            </div>
          </div>

          {/* Search No Results State */}
          {totalItems === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 px-4 text-center select-none">
              <div className="w-12 h-12 rounded-full bg-bg-surface flex items-center justify-center text-text-tertiary mb-3">
                <FiPackage className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-text-primary mb-1">
                No se encontraron productos
              </h3>
              <p className="text-xs text-text-secondary max-w-xs leading-relaxed">
                No hay resultados para "{search}". Intenta con otros términos de búsqueda.
              </p>
            </div>
          ) : (
            <>
              {/* Table Component */}
              <TableProducts
                products={initialProducts}
                currentPage={currentPage}
                itemsPerPage={itemsPerPage}
                canUpdate={canUpdate}
                canDelete={canDelete}
                canReadCost={canReadCost}
                onEdit={handleOpenForm}
                onDelete={handleOpenDelete}
                onView={handleOpenDetail}
              />

              {/* Pagination */}
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={totalItems}
                itemsPerPage={itemsPerPage}
              />
            </>
          )}
        </div>
      )}

      {/* Form Modal */}
      <FormProducts
        isOpen={isOpenFormModal}
        onClose={() => setIsOpenFormModal(false)}
        product={selectedProduct}
        brands={brands}
        categories={categories}
        genders={genders}
      />

      {/* Detail Modal */}
      <DetailProductModal
        isOpen={isOpenDetailModal}
        onClose={() => setIsOpenDetailModal(false)}
        product={selectedProduct}
        canReadCost={canReadCost}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={isOpenDeleteModal}
        onClose={() => setIsOpenDeleteModal(false)}
        onConfirm={handleDeleteConfirm}
        isLoading={isSubmitting}
        title="¿Eliminar este producto?"
        description={`Esta acción ocultará el producto "${selectedProduct?.name}" del inventario general. ¿Deseas continuar?`}
        confirmText="Sí, eliminar"
        cancelText="Cancelar"
        variant="danger"
      />
    </div>
  );
}

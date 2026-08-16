"use client";

import { useState } from "react";
import { toast } from "sonner";
import { FiPlus } from "react-icons/fi";
import { AiOutlineProduct } from "react-icons/ai";
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
          canCreate ? (
            <Button
              variant="primary"
              onClick={() => handleOpenForm(null)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold shadow-sm shrink-0"
            >
              <FiPlus className="w-4 h-4" />
              <span>Nuevo producto</span>
            </Button>
          ) : undefined
        }
      />

      {/* Main Container */}
      <div className="bg-bg-card border border-border-default/80 rounded-2xl shadow-xs overflow-hidden">
        {/* Filters Bar */}
        <div className="px-6 py-4 border-b border-border-soft flex flex-col md:flex-row items-stretch md:items-center gap-4 bg-bg-card">
          <div className="flex-1 max-w-md">
            <SearchInput placeholder="Buscar por nombre o código de producto..." />
          </div>
          <div className="text-xs text-text-secondary md:ml-auto select-none font-medium">
            Total: {totalItems} {totalItems === 1 ? "producto encontrado" : "productos encontrados"}
          </div>
        </div>

        {/* Content / Empty State */}
        {initialProducts.length === 0 ? (
          <div className="p-12 text-center select-none bg-bg-card">
            <AiOutlineProduct className="w-10 h-10 text-text-tertiary mx-auto mb-3" />
            <h3 className="text-sm font-bold text-text-primary">
              {overallCount === 0 ? "No hay productos registrados" : "No se encontraron productos"}
            </h3>
            <p className="text-xs text-text-secondary mt-1 max-w-sm mx-auto">
              {overallCount === 0
                ? "Para comenzar a vender, registra tu primer producto con su respectivo stock, código, categoría y galería de imágenes."
                : search
                ? `No hay resultados para "${search}". Intenta con otros términos de búsqueda.`
                : "Intenta cambiar los términos de búsqueda o filtros aplicados."}
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

"use client";

import { useState } from "react";
import { toast } from "sonner";
import { FiPlus, FiLayers, FiTag } from "react-icons/fi";
import Button from "@/components/ui/Button";
import ConfirmModal from "@/components/ui/ConfirmModal";
import Pagination from "@/components/ui/Pagination";
import SearchInput from "@/components/ui/SearchInput";
import { deleteCategoryAction } from "@/lib/category";
import { SerializedCategory } from "@/types/categories";
import TableCategories from "./TableCategories";
import FormCategories from "./FormCategories";

interface CategoriesProps {
  initialCategories: SerializedCategory[];
  overallCount: number;
  totalItems: number;
  totalPages: number;
  currentPage: number;
  itemsPerPage: number;
  search: string;
  permissions: string[];
}

export default function Categories({
  initialCategories,
  overallCount,
  totalItems,
  totalPages,
  currentPage,
  itemsPerPage,
  search,
  permissions,
}: CategoriesProps) {
  const canCreate = permissions.includes("categories:create");
  const canUpdate = permissions.includes("categories:update");
  const canDelete = permissions.includes("categories:delete");

  // Modals state
  const [isOpenFormModal, setIsOpenFormModal] = useState(false);
  const [isOpenDeleteModal, setIsOpenDeleteModal] = useState(false);
  const [selectedCategory, setSelectedCategory] =
    useState<SerializedCategory | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleOpenForm = (category: SerializedCategory | null = null) => {
    setSelectedCategory(category);
    setIsOpenFormModal(true);
  };

  const handleOpenDelete = (category: SerializedCategory) => {
    setSelectedCategory(category);
    setIsOpenDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedCategory) return;
    setIsSubmitting(true);

    try {
      const res = await deleteCategoryAction(selectedCategory.id);
      if (res.success) {
        toast.success(res.message);
        setIsOpenDeleteModal(false);
      } else {
        toast.error(res.message);
      }
    } catch (error) {
      toast.error("Ocurrió un error inesperado al eliminar la categoría.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Module Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-text-primary">
            Categorías
          </h2>
          <p className="text-xs sm:text-sm text-text-secondary mt-0.5">
            Administración de categorías para los productos del inventario.
          </p>
        </div>
        {overallCount > 0 && canCreate && (
          <Button
            variant="primary"
            onClick={() => handleOpenForm(null)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold self-start sm:self-auto shadow-sm shrink-0"
          >
            <FiPlus className="w-4 h-4" />
            Nueva categoría
          </Button>
        )}
      </div>

      {/* Main Content */}
      {overallCount === 0 ? (
        /* Empty State */
        <div className="flex flex-col items-center justify-center py-16 px-6 bg-bg-card border border-border-default/50 rounded-2xl text-center shadow-xs max-w-lg mx-auto my-8 select-none">
          <div className="w-16 h-16 rounded-2xl bg-beauty-50 dark:bg-beauty-950 flex items-center justify-center text-beauty-600 mb-5 border border-beauty-100 dark:border-beauty-500 shadow-xs">
            <FiTag className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-text-primary mb-2">
            No hay categorías registradas
          </h3>
          <p className="text-xs text-text-secondary mb-8 leading-relaxed max-w-sm">
            Para comenzar a organizar tus productos, crea tu primera categoría
            global con el siguiente botón.
          </p>
          {canCreate && (
            <Button
              variant="primary"
              onClick={() => handleOpenForm(null)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold shadow-sm"
            >
              <FiPlus className="w-4 h-4" />
              Nueva categoría
            </Button>
          )}
        </div>
      ) : (
        /* Records Table */
        <div className="bg-bg-card border border-border-default/80 rounded-2xl shadow-xs overflow-hidden">
          {/* Filters Bar */}
          <div className="px-6 py-4 border-b border-border-soft flex flex-col md:flex-row items-stretch md:items-center gap-4 bg-bg-card">
            <div className="flex-1 max-w-md">
              <SearchInput placeholder="Buscar por nombre de categoría..." />
            </div>
            <div className="text-xs text-text-secondary md:ml-auto select-none font-medium">
              Total: {overallCount} categorías registradas
            </div>
          </div>

          {/* Search No Results State */}
          {totalItems === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 px-4 text-center select-none">
              <div className="w-12 h-12 rounded-full bg-bg-surface flex items-center justify-center text-text-tertiary mb-3">
                <FiTag className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-text-primary mb-1">
                No se encontraron categorías
              </h3>
              <p className="text-xs text-text-secondary max-w-xs leading-relaxed">
                No hay resultados para "{search}". Intenta con otros términos de
                búsqueda.
              </p>
            </div>
          ) : (
            <>
              {/* Table Component */}
              <TableCategories
                categories={initialCategories}
                currentPage={currentPage}
                itemsPerPage={itemsPerPage}
                canUpdate={canUpdate}
                canDelete={canDelete}
                onEdit={handleOpenForm}
                onDelete={handleOpenDelete}
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
      <FormCategories
        isOpen={isOpenFormModal}
        onClose={() => setIsOpenFormModal(false)}
        category={selectedCategory}
      />

      {/* Logical Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={isOpenDeleteModal}
        onClose={() => setIsOpenDeleteModal(false)}
        onConfirm={handleDeleteConfirm}
        isLoading={isSubmitting}
        title="¿Eliminar esta categoría?"
        description={`Esta acción ocultará la categoría "${selectedCategory?.name}" del listado general. ¿Deseas continuar?`}
        confirmText="Sí, eliminar"
        cancelText="Cancelar"
        variant="danger"
      />
    </div>
  );
}

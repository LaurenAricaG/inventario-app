"use client";

import { useState } from "react";
import { toast } from "sonner";
import { FiPlus, FiTag } from "react-icons/fi";
import Button from "@/components/ui/Button";
import ConfirmModal from "@/components/ui/ConfirmModal";
import Pagination from "@/components/ui/Pagination";
import SearchInput from "@/components/ui/SearchInput";
import { deleteCategoryAction } from "@/lib/category";
import { SerializedCategory } from "@/types/categories";
import TableCategories from "./TableCategories";
import FormCategories from "./FormCategories";
import PageHeader from "@/components/ui/PageHeader";

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
      <PageHeader
        title="Categorías"
        subtitle="Administración de categorías para clasificación de productos."
        breadcrumbs={[
          { label: "admin", href: "/admin" },
          { label: "categorías" },
        ]}
        action={
          canCreate ? (
            <Button
              variant="primary"
              onClick={() => handleOpenForm(null)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold shadow-sm shrink-0"
            >
              <FiPlus className="w-4 h-4" />
              <span>Nueva categoría</span>
            </Button>
          ) : undefined
        }
      />

      {/* Main Content */}
      <div className="bg-bg-card border border-border-default/80 rounded-2xl shadow-xs overflow-hidden">
        {/* Filters Bar */}
        <div className="px-6 py-4 border-b border-border-soft flex flex-col md:flex-row items-stretch md:items-center gap-4 bg-bg-card">
          <div className="flex-1 max-w-md">
            <SearchInput placeholder="Buscar por nombre de categoría..." />
          </div>
          <div className="text-xs text-text-secondary md:ml-auto select-none font-medium">
            Total: {totalItems} {totalItems === 1 ? "categoría encontrada" : "categorías encontradas"}
          </div>
        </div>

        {/* Content / Empty State */}
        {initialCategories.length === 0 ? (
          <div className="p-12 text-center select-none bg-bg-card">
            <FiTag className="w-10 h-10 text-text-tertiary mx-auto mb-3" />
            <h3 className="text-sm font-bold text-text-primary">
              {overallCount === 0 ? "No hay categorías registradas" : "No se encontraron categorías"}
            </h3>
            <p className="text-xs text-text-secondary mt-1 max-w-sm mx-auto">
              {overallCount === 0
                ? "Para comenzar a organizar tus productos, crea tu primera categoría global."
                : search
                ? `No hay resultados para "${search}". Intenta con otros términos de búsqueda.`
                : "Intenta cambiar los términos de búsqueda o filtros aplicados."}
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

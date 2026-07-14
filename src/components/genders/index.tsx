"use client";

import { useState } from "react";
import { toast } from "sonner";
import { FiPlus, FiLayers } from "react-icons/fi";
import Button from "@/components/ui/Button";
import ConfirmModal from "@/components/ui/ConfirmModal";
import Pagination from "@/components/ui/Pagination";
import SearchInput from "@/components/ui/SearchInput";
import { deleteGenderAction } from "@/lib/gender";
import { SerializedGenderSegment } from "@/types";
import TableGenders from "./TableGenders";
import FormGenders from "./FormGenders";
import PageHeader from "@/components/ui/PageHeader";

interface GendersProps {
  initialGenders: SerializedGenderSegment[];
  overallCount: number;
  totalItems: number;
  totalPages: number;
  currentPage: number;
  itemsPerPage: number;
  search: string;
  permissions: string[];
}

export default function Genders({
  initialGenders,
  overallCount,
  totalItems,
  totalPages,
  currentPage,
  itemsPerPage,
  search,
  permissions,
}: GendersProps) {
  const canCreate = permissions.includes("genders:create");
  const canUpdate = permissions.includes("genders:update");
  const canDelete = permissions.includes("genders:delete");

  // Modals state
  const [isOpenFormModal, setIsOpenFormModal] = useState(false);
  const [isOpenDeleteModal, setIsOpenDeleteModal] = useState(false);
  const [selectedGender, setSelectedGender] =
    useState<SerializedGenderSegment | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleOpenForm = (gender: SerializedGenderSegment | null = null) => {
    setSelectedGender(gender);
    setIsOpenFormModal(true);
  };

  const handleOpenDelete = (gender: SerializedGenderSegment) => {
    setSelectedGender(gender);
    setIsOpenDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedGender) return;
    setIsSubmitting(true);

    try {
      const res = await deleteGenderAction(selectedGender.id);
      if (res.success) {
        toast.success(res.message);
        setIsOpenDeleteModal(false);
      } else {
        toast.error(res.message);
      }
    } catch (error) {
      toast.error("Ocurrió un error inesperado al eliminar el género.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Géneros"
        subtitle="Administración de géneros para clasificación de productos"
        breadcrumbs={[
          { label: "admin", href: "/admin" },
          { label: "generos" },
        ]}
        action={
          overallCount > 0 && canCreate ? (
            <Button
              variant="primary"
              onClick={() => handleOpenForm(null)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold shadow-sm shrink-0"
            >
              <FiPlus className="w-4 h-4" />
              Nuevo género
            </Button>
          ) : undefined
        }
      />

      {/* Main Content */}
      {overallCount === 0 ? (
        /* Empty State */
        <div className="flex flex-col items-center justify-center py-16 px-6 bg-bg-card border border-border-default/50 rounded-2xl text-center shadow-xs max-w-lg mx-auto my-8 select-none">
          <div className="w-16 h-16 rounded-2xl bg-beauty-50 dark:bg-beauty-950 flex items-center justify-center text-beauty-600 mb-5 border border-beauty-100 dark:border-beauty-500 shadow-xs">
            <FiLayers className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-text-primary mb-2">
            No hay géneros registrados
          </h3>
          <p className="text-xs text-text-secondary mb-8 leading-relaxed max-w-sm">
            Para comenzar a organizar tus productos por segmento de género, crea
            tu primer género con el siguiente botón.
          </p>
          {canCreate && (
            <Button
              variant="primary"
              onClick={() => handleOpenForm(null)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold shadow-sm"
            >
              <FiPlus className="w-4 h-4" />
              Nuevo género
            </Button>
          )}
        </div>
      ) : (
        /* Records Table */
        <div className="bg-bg-card border border-border-default/80 rounded-2xl shadow-xs overflow-hidden">
          {/* Filters Bar */}
          <div className="px-6 py-4 border-b border-border-soft flex flex-col md:flex-row items-stretch md:items-center gap-4 bg-bg-card">
            <div className="flex-1 max-w-md">
              <SearchInput placeholder="Buscar por nombre..." />
            </div>
            <div className="text-xs text-text-secondary md:ml-auto select-none font-medium">
              Total: {overallCount} géneros registrados
            </div>
          </div>

          {/* Search No Results State */}
          {totalItems === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 px-4 text-center select-none">
              <div className="w-12 h-12 rounded-full bg-bg-surface flex items-center justify-center text-text-tertiary mb-3">
                <FiLayers className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-text-primary mb-1">
                No se encontraron géneros
              </h3>
              <p className="text-xs text-text-secondary max-w-xs leading-relaxed">
                No hay resultados para "{search}". Intenta con otros términos de
                búsqueda.
              </p>
            </div>
          ) : (
            <>
              {/* Table Component */}
              <TableGenders
                genders={initialGenders}
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
      <FormGenders
        isOpen={isOpenFormModal}
        onClose={() => setIsOpenFormModal(false)}
        gender={selectedGender}
      />

      {/* Logical Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={isOpenDeleteModal}
        onClose={() => setIsOpenDeleteModal(false)}
        onConfirm={handleDeleteConfirm}
        isLoading={isSubmitting}
        title="¿Eliminar este género?"
        description={`Esta acción ocultará el género "${selectedGender?.name}" del listado general y del catálogo activo. No se perderán los productos existentes asociados a este género. ¿Deseas continuar?`}
        confirmText="Sí, eliminar"
        cancelText="Cancelar"
        variant="danger"
      />
    </div>
  );
}

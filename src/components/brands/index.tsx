"use client";

import { useState } from "react";
import { toast } from "sonner";
import { FiPlus } from "react-icons/fi";
import { TbBrandAirtable } from "react-icons/tb";
import Button from "@/components/ui/Button";
import ConfirmModal from "@/components/ui/ConfirmModal";
import Pagination from "@/components/ui/Pagination";
import SearchInput from "@/components/ui/SearchInput";
import { deleteBrandAction } from "@/lib/brand";
import { SerializedBrand } from "@/types/brands";
import TableBrands from "./TableBrands";
import FormBrands from "./FormBrands";
import PageHeader from "@/components/ui/PageHeader";

interface BrandsProps {
  initialMarcas: SerializedBrand[];
  companies: { id: number; name: string }[];
  overallCount: number;
  totalItems: number;
  totalPages: number;
  currentPage: number;
  itemsPerPage: number;
  search: string;
  permissions: string[];
}

export default function Brands({
  initialMarcas,
  companies,
  overallCount,
  totalItems,
  totalPages,
  currentPage,
  itemsPerPage,
  search,
  permissions,
}: BrandsProps) {
  const canCreate = permissions.includes("brands:create");
  const canUpdate = permissions.includes("brands:update");
  const canDelete = permissions.includes("brands:delete");

  // Modals state
  const [isOpenFormModal, setIsOpenFormModal] = useState(false);
  const [isOpenDeleteModal, setIsOpenDeleteModal] = useState(false);
  const [selectedBrand, setSelectedBrand] = useState<SerializedBrand | null>(
    null,
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleOpenForm = (brand: SerializedBrand | null = null) => {
    setSelectedBrand(brand);
    setIsOpenFormModal(true);
  };

  const handleOpenDelete = (brand: SerializedBrand) => {
    setSelectedBrand(brand);
    setIsOpenDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedBrand) return;
    setIsSubmitting(true);

    try {
      const res = await deleteBrandAction(selectedBrand.id);
      if (res.success) {
        toast.success(res.message);
        setIsOpenDeleteModal(false);
      } else {
        if (res.isWarning) {
          toast.warning(res.message);
        } else {
          toast.error(res.message);
        }
        setIsOpenDeleteModal(false);
      }
    } catch (error) {
      toast.error("Ocurrió un error inesperado al eliminar la marca.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Marcas"
        subtitle="Administración de marcas."
        breadcrumbs={[
          { label: "admin", href: "/admin" },
          { label: "marcas" },
        ]}
        action={
          canCreate ? (
            <Button
              variant="primary"
              onClick={() => handleOpenForm(null)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold shadow-sm shrink-0"
            >
              <FiPlus className="w-4 h-4" />
              <span>Nueva marca</span>
            </Button>
          ) : undefined
        }
      />

      {/* Main Content */}
      <div className="bg-bg-card border border-border-default/80 rounded-2xl shadow-xs overflow-hidden">
        {/* Filters Bar */}
        <div className="px-6 py-4 border-b border-border-soft flex flex-col md:flex-row items-stretch md:items-center gap-4 bg-bg-card">
          <div className="flex-1 max-w-md">
            <SearchInput placeholder="Buscar por nombre de marca..." />
          </div>
          <div className="text-xs text-text-secondary md:ml-auto select-none font-medium">
            Total: {totalItems} {totalItems === 1 ? "marca encontrada" : "marcas encontradas"}
          </div>
        </div>

        {/* Content / Empty State */}
        {initialMarcas.length === 0 ? (
          <div className="p-12 text-center select-none bg-bg-card">
            <TbBrandAirtable className="w-10 h-10 text-text-tertiary mx-auto mb-3" />
            <h3 className="text-sm font-bold text-text-primary">
              {overallCount === 0 ? "No hay marcas registradas" : "No se encontraron marcas"}
            </h3>
            <p className="text-xs text-text-secondary mt-1 max-w-sm mx-auto">
              {overallCount === 0
                ? "Para comenzar a organizar tus marcas de catálogo, crea tu primera marca."
                : search
                ? `No hay resultados para "${search}". Intenta con otros términos de búsqueda.`
                : "Intenta cambiar los términos de búsqueda o filtros aplicados."}
            </p>
          </div>
        ) : (
          <>
            {/* Table Component */}
            <TableBrands
              brands={initialMarcas}
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
      <FormBrands
        isOpen={isOpenFormModal}
        onClose={() => setIsOpenFormModal(false)}
        brand={selectedBrand}
        companies={companies}
      />

      {/* Logical Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={isOpenDeleteModal}
        onClose={() => setIsOpenDeleteModal(false)}
        onConfirm={handleDeleteConfirm}
        isLoading={isSubmitting}
        title="¿Eliminar esta marca?"
        description={`Esta acción ocultará la marca "${selectedBrand?.name}" del listado general y del catálogo activo. No se perderán los productos existentes asociados a esta marca. ¿Deseas continuar?`}
        confirmText="Sí, eliminar"
        cancelText="Cancelar"
        variant="danger"
      />
    </div>
  );
}

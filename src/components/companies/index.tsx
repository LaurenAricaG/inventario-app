"use client";

import { useState } from "react";
import { toast } from "sonner";
import { FiPlus } from "react-icons/fi";
import { HiOutlineSquares2X2 } from "react-icons/hi2";
import Button from "@/components/ui/Button";
import ConfirmModal from "@/components/ui/ConfirmModal";
import Pagination from "@/components/ui/Pagination";
import SearchInput from "@/components/ui/SearchInput";
import { deleteCompanyAction } from "@/lib/company";
import { SerializedCompany } from "@/types/companies";
import TableCompanies from "./TableCompanies";
import FormCompanies from "./FormCompanies";

interface CompaniesProps {
  initialEmpresas: SerializedCompany[];
  overallCount: number;
  totalItems: number;
  totalPages: number;
  currentPage: number;
  itemsPerPage: number;
  search: string;
  permissions: string[];
}

export default function Companies({
  initialEmpresas,
  overallCount,
  totalItems,
  totalPages,
  currentPage,
  itemsPerPage,
  search,
  permissions,
}: CompaniesProps) {
  const canCreate = permissions.includes("companies:create");
  const canUpdate = permissions.includes("companies:update");
  const canDelete = permissions.includes("companies:delete");

  // Modals state
  const [isOpenFormModal, setIsOpenFormModal] = useState(false);
  const [isOpenDeleteModal, setIsOpenDeleteModal] = useState(false);
  const [selectedCompany, setSelectedCompany] =
    useState<SerializedCompany | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleOpenForm = (company: SerializedCompany | null = null) => {
    setSelectedCompany(company);
    setIsOpenFormModal(true);
  };

  const handleOpenDelete = (company: SerializedCompany) => {
    setSelectedCompany(company);
    setIsOpenDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedCompany) return;
    setIsSubmitting(true);

    try {
      const res = await deleteCompanyAction(selectedCompany.id);
      if (res.success) {
        toast.success(res.message);
        setIsOpenDeleteModal(false);
      } else {
        toast.error(res.message);
      }
    } catch (error) {
      toast.error("Ocurrió un error inesperado al eliminar la empresa.");
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
            Empresas
          </h2>
          <p className="text-xs sm:text-sm text-text-secondary mt-0.5">
            Administración de empresas para clasificación de productos
          </p>
        </div>
        {overallCount > 0 && canCreate && (
          <Button
            variant="primary"
            onClick={() => handleOpenForm(null)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold self-start sm:self-auto shadow-sm shrink-0"
          >
            <FiPlus className="w-4 h-4" />
            Nueva empresa
          </Button>
        )}
      </div>

      {/* Main Content */}
      {overallCount === 0 ? (
        /* Empty State */
        <div className="flex flex-col items-center justify-center py-16 px-6 bg-bg-card border border-border-default/50 rounded-2xl text-center shadow-xs max-w-lg mx-auto my-8 select-none">
          <div className="w-16 h-16 rounded-2xl bg-beauty-50 dark:bg-beauty-950 flex items-center justify-center text-beauty-600 mb-5 border border-beauty-100 dark:border-beauty-500 shadow-xs">
            <HiOutlineSquares2X2 className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-text-primary mb-2">
            No hay empresas registradas
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
              Nueva empresa
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
              Total: {overallCount} empresas registradas
            </div>
          </div>

          {/* Search No Results State */}
          {totalItems === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 px-4 text-center select-none">
              <div className="w-12 h-12 rounded-full bg-bg-surface flex items-center justify-center text-text-tertiary mb-3">
                <HiOutlineSquares2X2 className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-text-primary mb-1">
                No se encontraron empresas
              </h3>
              <p className="text-xs text-text-secondary max-w-xs leading-relaxed">
                No hay resultados para "{search}". Intenta con otros términos de
                búsqueda.
              </p>
            </div>
          ) : (
            <>
              {/* Table Component */}
              <TableCompanies
                companies={initialEmpresas}
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
      <FormCompanies
        isOpen={isOpenFormModal}
        onClose={() => setIsOpenFormModal(false)}
        company={selectedCompany}
      />

      {/* Logical Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={isOpenDeleteModal}
        onClose={() => setIsOpenDeleteModal(false)}
        onConfirm={handleDeleteConfirm}
        isLoading={isSubmitting}
        title="¿Eliminar esta empresa?"
        description={`Esta acción ocultará la empresa "${selectedCompany?.name}" del listado general y del catálogo activo. No se perderán los productos existentes asociados a esta empresa. ¿Deseas continuar?`}
        confirmText="Sí, eliminar"
        cancelText="Cancelar"
        variant="danger"
      />
    </div>
  );
}

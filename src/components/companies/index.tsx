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
import PageHeader from "@/components/ui/PageHeader";

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
        if (res.isWarning) {
          toast.warning(res.message);
        } else {
          toast.error(res.message);
        }
        setIsOpenDeleteModal(false);
      }
    } catch (error) {
      toast.error("Ocurrió un error inesperado al eliminar la empresa.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Empresas"
        subtitle="Administración de empresas para clasificación de productos."
        breadcrumbs={[
          { label: "admin", href: "/admin" },
          { label: "empresas" },
        ]}
        action={
          canCreate ? (
            <Button
              variant="primary"
              onClick={() => handleOpenForm(null)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold shadow-sm shrink-0"
            >
              <FiPlus className="w-4 h-4" />
              <span>Nueva empresa</span>
            </Button>
          ) : undefined
        }
      />

      {/* Main Content */}
      <div className="bg-bg-card border border-border-default/80 rounded-2xl shadow-xs overflow-hidden">
        {/* Filters Bar */}
        <div className="px-6 py-4 border-b border-border-soft flex flex-col md:flex-row items-stretch md:items-center gap-4 bg-bg-card">
          <div className="flex-1 max-w-md">
            <SearchInput placeholder="Buscar por nombre..." />
          </div>
          <div className="text-xs text-text-secondary md:ml-auto select-none font-medium">
            Total: {totalItems} {totalItems === 1 ? "empresa encontrada" : "empresas encontradas"}
          </div>
        </div>

        {/* Content / Empty State */}
        {initialEmpresas.length === 0 ? (
          <div className="p-12 text-center select-none bg-bg-card">
            <HiOutlineSquares2X2 className="w-10 h-10 text-text-tertiary mx-auto mb-3" />
            <h3 className="text-sm font-bold text-text-primary">
              {overallCount === 0 ? "No hay empresas registradas" : "No se encontraron empresas"}
            </h3>
            <p className="text-xs text-text-secondary mt-1 max-w-sm mx-auto">
              {overallCount === 0
                ? "Para comenzar a organizar tus productos y marcas, crea tu primera empresa."
                : search
                ? `No hay resultados para "${search}". Intenta con otros términos de búsqueda.`
                : "Intenta cambiar los términos de búsqueda o filtros aplicados."}
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

"use client";

import { useState } from "react";
import { toast } from "sonner";
import { FiPlus, FiCalendar, FiFileText, FiCheckCircle, FiCircle } from "react-icons/fi";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/Button";
import ConfirmModal from "@/components/ui/ConfirmModal";
import Pagination from "@/components/ui/Pagination";
import SearchInput from "@/components/ui/SearchInput";
import { deleteCampaignAction } from "@/lib/campaign";
import { deleteCatalogPdfAction } from "@/lib/catalog";
import { SerializedCampaign } from "@/types/campaigns";
import { SerializedCatalogPdf } from "@/types/catalogs";
import { cn } from "@/utils/cn.utils";
import TableCampaigns from "./TableCampaigns";
import FormCampaigns from "./FormCampaigns";
import TableCatalogPdfs from "./TableCatalogPdfs";
import FormCatalogPdfs from "./FormCatalogPdfs";
import PageHeader from "@/components/ui/PageHeader";

interface CampaignsProps {
  tab: string;
  initialCampanias: SerializedCampaign[];
  companies: { id: number; name: string }[];
  overallCount: number;
  totalItems: number;
  totalPages: number;
  currentPage: number;
  itemsPerPage: number;
  search: string;
  onlyActive: boolean;
  permissions: string[];

  // Catálogos PDF
  catalogPdfs: SerializedCatalogPdf[];
  overallCatalogsCount: number;
  allCampaignsForSelect: {
    id: number;
    number: string;
    companyId: number;
    isActive: boolean;
    startDate: Date | string;
    endDate: Date | string;
    company: {
      id: number;
      name: string;
    };
  }[];
  brands: { id: number; name: string; companyId: number }[];
  existingCatalogPdfs: { campaignId: number; brandId: number }[];
}

export default function Campaigns({
  tab,
  initialCampanias,
  companies,
  overallCount,
  totalItems,
  totalPages,
  currentPage,
  itemsPerPage,
  search,
  onlyActive,
  permissions,

  // Catálogos PDF
  catalogPdfs,
  overallCatalogsCount,
  allCampaignsForSelect,
  brands,
  existingCatalogPdfs,
}: CampaignsProps) {
  const router = useRouter();
  const isCampaignsTab = tab === "campanias";

  // Permisos
  const canReadCampaigns = permissions.includes("campaigns:read");
  const canCreateCampaign = permissions.includes("campaigns:create");
  const canUpdateCampaign = permissions.includes("campaigns:update");
  const canDeleteCampaign = permissions.includes("campaigns:delete");

  const canReadCatalog = permissions.includes("catalogs:read");
  const canUploadCatalog = permissions.includes("catalogs:upload");
  const canUpdateCatalog = permissions.includes("catalogs:update");
  const canDeleteCatalog = permissions.includes("catalogs:delete");

  // Estado modales Campañas
  const [isOpenFormModal, setIsOpenFormModal] = useState(false);
  const [isOpenDeleteModal, setIsOpenDeleteModal] = useState(false);
  const [selectedCampaign, setSelectedCampaign] =
    useState<SerializedCampaign | null>(null);

  // Estado modales Catálogos PDF
  const [isOpenCatalogModal, setIsOpenCatalogModal] = useState(false);
  const [isOpenDeleteCatalogModal, setIsOpenDeleteCatalogModal] =
    useState(false);
  const [selectedCatalog, setSelectedCatalog] =
    useState<SerializedCatalogPdf | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Manejo de Campañas
  const handleOpenForm = (campaign: SerializedCampaign | null = null) => {
    setSelectedCampaign(campaign);
    setIsOpenFormModal(true);
  };

  const handleOpenDelete = (campaign: SerializedCampaign) => {
    setSelectedCampaign(campaign);
    setIsOpenDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedCampaign) return;
    setIsSubmitting(true);

    try {
      const res = await deleteCampaignAction(selectedCampaign.id);
      if (res.success) {
        toast.success(res.message);
      } else {
        toast.error(res.message);
      }
      setIsOpenDeleteModal(false);
    } catch (error) {
      toast.error("Ocurrió un error inesperado al eliminar la campaña.");
      setIsOpenDeleteModal(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Manejo de Catálogos PDF
  const handleOpenCatalogForm = (
    catalog: SerializedCatalogPdf | null = null,
  ) => {
    setSelectedCatalog(catalog);
    setIsOpenCatalogModal(true);
  };

  const handleOpenDeleteCatalog = (catalog: SerializedCatalogPdf) => {
    setSelectedCatalog(catalog);
    setIsOpenDeleteCatalogModal(true);
  };

  const handleDeleteCatalogConfirm = async () => {
    if (!selectedCatalog) return;
    setIsSubmitting(true);

    try {
      const res = await deleteCatalogPdfAction(selectedCatalog.id);
      if (res.success) {
        toast.success(res.message);
      } else {
        toast.error(res.message);
      }
      setIsOpenDeleteCatalogModal(false);
    } catch (error) {
      toast.error("Ocurrió un error inesperado al eliminar el catálogo.");
      setIsOpenDeleteCatalogModal(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTabChange = (newTab: string) => {
    router.push(`?tab=${newTab}`);
  };

  const handleToggleOnlyActive = () => {
    const params = new URLSearchParams();
    params.set("tab", tab);
    params.set("onlyActive", onlyActive ? "false" : "true");
    if (search) params.set("search", search);
    router.push(`?${params.toString()}`);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Campañas / Catálogos PDF"
        subtitle="Administración de períodos de campañas, calendarios de venta y documentos PDF"
        breadcrumbs={[
          { label: "admin", href: "/admin" },
          { label: "campañas" },
        ]}
        action={
          isCampaignsTab
            ? overallCount > 0 && canCreateCampaign ? (
              <Button
                variant="primary"
                onClick={() => handleOpenForm(null)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold shadow-sm shrink-0"
              >
                <FiPlus className="w-4 h-4" />
                Nueva campaña
              </Button>
            ) : undefined
            : overallCount > 0 && canUploadCatalog ? (
              <Button
                variant="primary"
                onClick={() => handleOpenCatalogForm(null)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold shadow-sm shrink-0"
              >
                <FiPlus className="w-4 h-4" />
                Subir catálogo
              </Button>
            ) : undefined
        }
      />

      {/* Selector de Pestañas (Tabs) Premium Segmentadas */}
      <div className="flex items-center p-1 rounded-xl bg-bg-surface border border-border-default/50 self-start select-none w-full sm:w-auto gap-1">
        {canReadCampaigns && (
          <button
            type="button"
            onClick={() => handleTabChange("campanias")}
            className={cn(
              "flex-1 sm:flex-none py-2 px-5 text-xs sm:text-sm font-bold rounded-lg transition-all duration-200 cursor-pointer flex items-center justify-center gap-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-beauty-400",
              isCampaignsTab
                ? "bg-bg-card text-beauty-500 shadow-xs border border-border-default/30"
                : "text-text-secondary hover:text-text-primary hover:bg-bg-surface/50 border border-transparent",
            )}
          >
            <FiCalendar
              className={cn(
                "w-3.5 h-3.5 transition-colors",
                isCampaignsTab ? "text-beauty-500" : "text-text-tertiary",
              )}
            />
            <span>Campañas</span>
          </button>
        )}
        {canReadCatalog && (
          <button
            type="button"
            onClick={() => handleTabChange("catalogos")}
            className={cn(
              "flex-1 sm:flex-none py-2 px-5 text-xs sm:text-sm font-bold rounded-lg transition-all duration-200 cursor-pointer flex items-center justify-center gap-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-beauty-400",
              !isCampaignsTab
                ? "bg-bg-card text-beauty-500 shadow-xs border border-border-default/30"
                : "text-text-secondary hover:text-text-primary hover:bg-bg-surface/50 border border-transparent",
            )}
          >
            <FiFileText
              className={cn(
                "w-3.5 h-3.5 transition-colors",
                !isCampaignsTab ? "text-beauty-500" : "text-text-tertiary",
              )}
            />
            <span>Catálogos PDF</span>
          </button>
        )}
      </div>

      {/* Contenido Principal */}
      {overallCount === 0 ? (
        /* Empty State */
        <div className="flex flex-col items-center justify-center py-16 px-6 bg-bg-card border border-border-default/50 rounded-2xl text-center shadow-xs max-w-lg mx-auto my-8 select-none">
          <div className="w-16 h-16 rounded-2xl bg-beauty-50 dark:bg-beauty-950 flex items-center justify-center text-beauty-600 mb-5 border border-beauty-100 dark:border-beauty-500 shadow-xs">
            {isCampaignsTab ? (
              <FiCalendar className="w-8 h-8" />
            ) : (
              <FiFileText className="w-8 h-8" />
            )}
          </div>
          <h3 className="text-lg font-bold text-text-primary mb-2">
            {isCampaignsTab
              ? "No hay campañas registradas"
              : "No hay catálogos PDF cargados"}
          </h3>
          <p className="text-xs text-text-secondary mb-8 leading-relaxed max-w-sm">
            {isCampaignsTab
              ? "Para comenzar a gestionar los períodos y catálogos de tus marcas, crea tu primera campaña."
              : "Asocia archivos PDF de catálogos a las campañas activas y marcas del sistema."}
          </p>
          {isCampaignsTab
            ? canCreateCampaign && (
              <Button
                variant="primary"
                onClick={() => handleOpenForm(null)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold shadow-sm"
              >
                <FiPlus className="w-4 h-4" />
                Nueva campaña
              </Button>
            )
            : canUploadCatalog && (
              <Button
                variant="primary"
                onClick={() => handleOpenCatalogForm(null)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold shadow-sm"
              >
                <FiPlus className="w-4 h-4" />
                Subir catálogo
              </Button>
            )}
        </div>
      ) : (
        /* Tabla de Registros */
        <div className="bg-bg-card border border-border-default/80 rounded-2xl shadow-xs overflow-hidden">
          {/* Barra de Filtros */}
          <div className="px-6 py-4 border-b border-border-soft flex flex-col md:flex-row items-stretch md:items-center gap-4 bg-bg-card">
            <div className="flex-1 max-w-md">
              <SearchInput
                placeholder={
                  isCampaignsTab
                    ? "Buscar por número de campaña..."
                    : "Buscar por título, marca o campaña..."
                }
              />
            </div>
            {/* Toggle solo campaña activa (solo en pestaña de catálogos) */}
            {!isCampaignsTab && (
              <button
                type="button"
                onClick={handleToggleOnlyActive}
                className={cn(
                  "flex items-center gap-2 px-4 py-3 rounded-xl text-xs font-semibold border transition-all duration-200 cursor-pointer select-none shrink-0",
                  onlyActive
                    ? "bg-beauty-400/10 border-beauty-400/30 text-beauty-600 dark:text-beauty-400"
                    : "bg-bg-surface border-border-default text-text-secondary hover:text-text-primary",
                )}
                title={onlyActive ? "Mostrando solo campaña activa." : "Mostrando todos los catálogos."}
              >
                {onlyActive
                  ? <FiCheckCircle className="w-3.5 h-3.5" />
                  : <FiCircle className="w-3.5 h-3.5" />}
                Campaña activa
              </button>
            )}
            <div className="text-xs text-text-secondary md:ml-auto select-none font-medium">
              Total: {overallCount} {isCampaignsTab ? "campañas" : "catálogos"}{" "}
              registrados
            </div>
          </div>

          {/* Sin Resultados de Búsqueda */}
          {totalItems === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 px-4 text-center select-none">
              <div className="w-12 h-12 rounded-full bg-bg-surface flex items-center justify-center text-text-tertiary mb-3">
                {isCampaignsTab ? (
                  <FiCalendar className="w-6 h-6" />
                ) : (
                  <FiFileText className="w-6 h-6" />
                )}
              </div>
              <h3 className="text-sm font-bold text-text-primary mb-1">
                {isCampaignsTab
                  ? "No se encontraron campañas"
                  : "No se encontraron catálogos"}
              </h3>
              <p className="text-xs text-text-secondary max-w-xs leading-relaxed">
                No hay resultados para "{search}". Intenta con otros términos de
                búsqueda.
              </p>
            </div>
          ) : (
            <>
              {/* Renderizado Condicional de Tablas */}
              {isCampaignsTab ? (
                <TableCampaigns
                  campaigns={initialCampanias}
                  currentPage={currentPage}
                  itemsPerPage={itemsPerPage}
                  canUpdate={canUpdateCampaign}
                  canDelete={canDeleteCampaign}
                  onEdit={handleOpenForm}
                  onDelete={handleOpenDelete}
                />
              ) : (
                <TableCatalogPdfs
                  catalogs={catalogPdfs}
                  currentPage={currentPage}
                  itemsPerPage={itemsPerPage}
                  canUpdate={canUpdateCatalog}
                  canDelete={canDeleteCatalog}
                  onEdit={handleOpenCatalogForm}
                  onDelete={handleOpenDeleteCatalog}
                />
              )}

              {/* Paginación */}
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

      {/* Modal Campañas */}
      <FormCampaigns
        isOpen={isOpenFormModal}
        onClose={() => setIsOpenFormModal(false)}
        campaign={selectedCampaign}
        companies={companies}
      />

      {/* Modal Confirmar Eliminación Campaña */}
      <ConfirmModal
        isOpen={isOpenDeleteModal}
        onClose={() => setIsOpenDeleteModal(false)}
        onConfirm={handleDeleteConfirm}
        isLoading={isSubmitting}
        title="¿Eliminar esta campaña?"
        description={`Esta acción ocultará la campaña "${selectedCampaign?.number}" del listado general. ¿Deseas continuar?`}
        confirmText="Sí, eliminar"
        cancelText="Cancelar"
        variant="danger"
      />

      {/* Modal Catálogos PDF */}
      <FormCatalogPdfs
        isOpen={isOpenCatalogModal}
        onClose={() => setIsOpenCatalogModal(false)}
        catalog={selectedCatalog}
        campaigns={allCampaignsForSelect}
        brands={brands}
        companies={companies}
        existingCatalogPdfs={existingCatalogPdfs}
      />

      {/* Modal Confirmar Eliminación Catálogo PDF */}
      <ConfirmModal
        isOpen={isOpenDeleteCatalogModal}
        onClose={() => setIsOpenDeleteCatalogModal(false)}
        onConfirm={handleDeleteCatalogConfirm}
        isLoading={isSubmitting}
        title="¿Eliminar este catálogo PDF?"
        description={`Esta acción ocultará el catálogo de la marca "${selectedCatalog?.brand?.name}" de la campaña "${selectedCatalog?.campaign?.number}". ¿Deseas continuar?`}
        confirmText="Sí, eliminar"
        cancelText="Cancelar"
        variant="danger"
      />
    </div>
  );
}

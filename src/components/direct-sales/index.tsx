"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { FiPlus, FiShoppingBag } from "react-icons/fi";
import ConfirmModal from "@/components/ui/ConfirmModal";
import Pagination from "@/components/ui/Pagination";
import SearchInput from "@/components/ui/SearchInput";
import { deleteDirectSaleAction } from "@/lib/direct-sale";
import { SerializedDirectSaleWithRelations } from "@/types/direct-sale";
import TableDirectSales from "./TableDirectSales";
import DetailSaleModal from "./DetailSaleModal";
import PageHeader from "@/components/ui/PageHeader";

interface DirectSalesProps {
  initialSales: SerializedDirectSaleWithRelations[];
  overallCount: number;
  totalItems: number;
  totalPages: number;
  currentPage: number;
  itemsPerPage: number;
  search: string;
  permissions: string[];
}

export default function DirectSales({
  initialSales,
  overallCount,
  totalItems,
  totalPages,
  currentPage,
  itemsPerPage,
  search,
  permissions,
}: DirectSalesProps) {
  const router = useRouter();
  const canCreate = permissions.includes("sales:create");
  const canDelete = permissions.includes("sales:delete");

  // Confirm delete modal state
  const [isOpenDeleteModal, setIsOpenDeleteModal] = useState(false);
  const [selectedSale, setSelectedSale] =
    useState<SerializedDirectSaleWithRelations | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Detail view modal state
  const [isOpenViewModal, setIsOpenViewModal] = useState(false);
  const [viewingSale, setViewingSale] =
    useState<SerializedDirectSaleWithRelations | null>(null);

  const handleOpenView = (sale: SerializedDirectSaleWithRelations) => {
    setViewingSale(sale);
    setIsOpenViewModal(true);
  };

  const handleOpenDelete = (sale: SerializedDirectSaleWithRelations) => {
    setSelectedSale(sale);
    setIsOpenDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedSale) return;
    setIsSubmitting(true);

    try {
      const res = await deleteDirectSaleAction(selectedSale.id);
      if (res.success) {
        toast.success(res.message);
        setIsOpenDeleteModal(false);
      } else {
        toast.error(res.message);
      }
    } catch (error) {
      toast.error("Ocurrió un error inesperado al anular la venta.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Ventas Directas"
        subtitle="Listado de ventas directas."
        breadcrumbs={[
          { label: "admin", href: "/admin" },
          { label: "ventas" },
        ]}
        action={
          canCreate ? (
            <Link
              href="/admin/ventas/nueva"
              className="flex items-center justify-center px-4 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap transition-all duration-200 cursor-pointer select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed bg-beauty-400 hover:bg-beauty-600 text-white shadow-sm shadow-beauty-400/10 focus-visible:ring-beauty-400 gap-2 shrink-0"
            >
              <FiPlus className="w-4 h-4" />
              Nueva Venta
            </Link>
          ) : undefined
        }
      />

      {/* Filter and Table Section */}
      {overallCount === 0 && !search ? (
        /* Empty State */
        <div className="flex flex-col items-center justify-center py-16 px-6 bg-bg-card border border-border-default/50 rounded-2xl text-center shadow-xs max-w-lg mx-auto my-8 select-none">
          <div className="w-16 h-16 rounded-2xl bg-beauty-50 dark:bg-beauty-950 flex items-center justify-center text-beauty-600 mb-5 border border-beauty-100 dark:border-beauty-500 shadow-xs">
            <FiShoppingBag className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-text-primary mb-2">
            Sin Ventas Registradas
          </h3>
          <p className="text-xs text-text-secondary leading-relaxed max-w-sm">
            Aún no has registrado ninguna venta directa en el sistema. Presiona
            el botón &ldquo;Nueva Venta&rdquo; en la esquina superior para
            registrar la primera.
          </p>
          {canCreate && (
            <Link
              href="/admin/ventas/nueva"
              className="mt-6 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-beauty-600 text-white text-xs font-semibold hover:bg-beauty-700 transition-colors shadow-xs"
            >
              <FiPlus className="w-4 h-4" />
              Registrar primera venta
            </Link>
          )}
        </div>
      ) : (
        /* Table and Search list view */
        <div className="bg-bg-card border border-border-default/80 rounded-2xl shadow-xs overflow-hidden">
          {/* Barra de Filtros */}
          <div className="px-6 py-4 border-b border-border-soft flex flex-col md:flex-row items-stretch md:items-center gap-4 bg-bg-card">
            <div className="flex-1 max-w-md">
              <SearchInput placeholder="Buscar por cliente..." />
            </div>
            <div className="text-xs text-text-secondary md:ml-auto select-none font-medium">
              Mostrando {initialSales.length} de {totalItems} registros
            </div>
          </div>

          {/* Tabla de Ventas Directas */}
          <div className="overflow-x-auto">
            <TableDirectSales
              sales={initialSales}
              currentPage={currentPage}
              itemsPerPage={itemsPerPage}
              canDelete={canDelete}
              onDelete={handleOpenDelete}
              onView={handleOpenView}
            />
          </div>

          {/* Paginación */}
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={totalItems}
            itemsPerPage={itemsPerPage}
          />
        </div>
      )}

      {/* Delete/Annul confirmation Modal */}
      <ConfirmModal
        isOpen={isOpenDeleteModal}
        onClose={() => setIsOpenDeleteModal(false)}
        onConfirm={handleDeleteConfirm}
        title="Anular Venta Directa"
        description={
          selectedSale
            ? `¿Está seguro de que desea anular la venta #${selectedSale.id} realizada a ${selectedSale.client.name} por un total de S/ ${selectedSale.total.toFixed(2)}? Esta acción devolverá los productos vendidos al inventario y registrará la devolución en el Kardex.`
            : ""
        }
        confirmText="Sí, Anular Venta"
        cancelText="No, Mantener"
        variant="danger"
        isLoading={isSubmitting}
      />

      {/* Detail view Modal */}
      <DetailSaleModal
        isOpen={isOpenViewModal}
        onClose={() => setIsOpenViewModal(false)}
        sale={viewingSale}
      />
    </div>
  );
}

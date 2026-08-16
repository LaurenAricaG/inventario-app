"use client";

import { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { FiPlus, FiShoppingCart } from "react-icons/fi";
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
      setIsOpenDeleteModal(false);
      if (res.success) {
        toast.success(res.message);
      } else {
        toast.error(res.message);
      }
    } catch (error) {
      setIsOpenDeleteModal(false);
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
        breadcrumbs={[{ label: "admin", href: "/admin" }, { label: "ventas" }]}
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
      <div className="bg-bg-card border border-border-default/80 rounded-2xl shadow-xs overflow-hidden">
        {/* Barra de Filtros */}
        <div className="px-6 py-4 border-b border-border-soft flex flex-col md:flex-row items-stretch md:items-center gap-4 bg-bg-card">
          <div className="flex-1 max-w-md">
            <SearchInput placeholder="Buscar por cliente..." />
          </div>
          <div className="text-xs text-text-secondary md:ml-auto select-none font-medium">
            Total: {totalItems} {totalItems === 1 ? "venta encontrada" : "ventas encontradas"}
          </div>
        </div>

        {/* Listado / Empty State */}
        {initialSales.length === 0 ? (
          <div className="p-12 text-center select-none bg-bg-card">
            <FiShoppingCart className="w-10 h-10 text-text-tertiary mx-auto mb-3" />
            <h3 className="text-sm font-bold text-text-primary">
              {overallCount === 0 ? "Sin Ventas Registradas" : "No se encontraron ventas"}
            </h3>
            <p className="text-xs text-text-secondary mt-1 max-w-sm mx-auto">
              {overallCount === 0
                ? "Aún no has registrado ninguna venta directa en el sistema. Presiona el botón \"Nueva Venta\" para registrar la primera."
                : search
                ? `No hay resultados para "${search}". Intenta con otros términos de búsqueda.`
                : "Intenta cambiar los términos de búsqueda o filtros aplicados."}
            </p>
          </div>
        ) : (
          <>
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
          </>
        )}
      </div>

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

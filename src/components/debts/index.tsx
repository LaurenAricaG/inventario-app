"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FiAlertTriangle, FiPlus } from "react-icons/fi";
import { toast } from "sonner";
import ErrorBoundary from "@/components/error/ErrorBoundary";
import SearchInput from "@/components/ui/SearchInput";
import Pagination from "@/components/ui/Pagination";
import Button from "@/components/ui/Button";
import ConfirmModal from "@/components/ui/ConfirmModal";
import TableDebts from "./TableDebts";
import FormDebts from "./FormDebts";
import PageHeader from "@/components/ui/PageHeader";
import { deleteExternalDebtAction } from "@/lib/external-debt";

interface SerializedDebt {
  id: number;
  clientId: number;
  amount: number;
  reason: string;
  notes: string | null;
  createdAt: string;
  client: { id: number; name: string };
}

interface DebtsProps {
  initialDebts: SerializedDebt[];
  clients: { id: number; name: string }[];
  totalItems: number;
  totalPages: number;
  currentPage: number;
  itemsPerPage: number;
  search: string;
  permissions: string[];
}

export default function Debts({
  initialDebts,
  clients,
  totalItems,
  totalPages,
  currentPage,
  itemsPerPage,
  permissions,
}: DebtsProps) {
  const router = useRouter();

  // Estados de Modales
  const [isOpenCreateModal, setIsOpenCreateModal] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const canCreateDebt = permissions.includes("debts:create");
  const canDeleteDebt = permissions.includes("debts:delete");

  const handleAnulateConfirm = async () => {
    if (!deleteTargetId) return;
    setIsDeleting(true);
    try {
      const res = await deleteExternalDebtAction(deleteTargetId);
      if (res.success) {
        toast.success(res.message);
        setDeleteTargetId(null);
        router.refresh();
      } else {
        toast.error(res.message);
      }
    } catch (error: any) {
      toast.error(error.message || "Error al anular la deuda.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Control de Deudas Adicionales"
        subtitle="Registro de cargos externos y saldos pendientes iniciales de clientes"
        breadcrumbs={[
          { label: "admin", href: "/admin" },
          { label: "deudas" },
        ]}
        action={
          canCreateDebt ? (
            <Button
              variant="primary"
              onClick={() => setIsOpenCreateModal(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold shadow-sm shrink-0"
            >
              <FiPlus className="w-4 h-4" />
              <span>Registrar Deuda</span>
            </Button>
          ) : undefined
        }
      />

      {/* Caja Contenedora Premium */}
      <div className="bg-bg-card border border-border-default/80 rounded-2xl shadow-xs overflow-hidden">
        {/* Barra de Filtros */}
        <div className="px-6 py-4 border-b border-border-soft flex flex-col md:flex-row items-stretch md:items-center gap-4 bg-bg-card">
          <div className="flex-1 max-w-md">
            <SearchInput placeholder="Buscar por cliente, motivo o notas..." />
          </div>
          <div className="text-xs text-text-secondary select-none font-medium md:ml-auto">
            Total: {totalItems} deudas registradas
          </div>
        </div>

        {/* Listado de Deudas */}
        {initialDebts.length === 0 ? (
          <div className="p-12 text-center select-none bg-bg-card">
            <FiAlertTriangle className="w-10 h-10 text-text-tertiary mx-auto mb-3" />
            <h3 className="text-sm font-bold text-text-primary">
              No se encontraron deudas
            </h3>
            <p className="text-xs text-text-secondary mt-1 max-w-sm mx-auto">
              Intenta cambiar los términos de búsqueda o filtros aplicados.
            </p>
          </div>
        ) : (
          <ErrorBoundary>
            <TableDebts
              debts={initialDebts}
              canDelete={canDeleteDebt}
              onDelete={setDeleteTargetId}
            />

            {/* Paginación */}
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={totalItems}
              itemsPerPage={itemsPerPage}
            />
          </ErrorBoundary>
        )}
      </div>

      {/* Modal para Registrar Deuda */}
      <FormDebts
        isOpen={isOpenCreateModal}
        onClose={() => setIsOpenCreateModal(false)}
        clients={clients}
        onSuccess={() => {
          setIsOpenCreateModal(false);
          router.refresh();
        }}
      />

      {/* Confirmación para Anulación */}
      <ConfirmModal
        isOpen={deleteTargetId !== null}
        onClose={() => setDeleteTargetId(null)}
        onConfirm={handleAnulateConfirm}
        isLoading={isDeleting}
        title="¿Anular este cargo?"
        description="Esta acción eliminará de forma irreversible el registro seleccionado y actualizará el saldo de inmediato. ¿Deseas continuar?"
        confirmText="Confirmar Anulación"
        cancelText="Cancelar"
        variant="danger"
      />
    </div>
  );
}

"use client";

import { useState, useTransition } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { FiDollarSign, FiPlus, FiFilter } from "react-icons/fi";
import { toast } from "sonner";
import { PaymentMethod } from "@/generated/prisma";
import ErrorBoundary from "@/components/error/ErrorBoundary";
import SearchInput from "@/components/ui/SearchInput";
import Pagination from "@/components/ui/Pagination";
import Button from "@/components/ui/Button";
import Select from "@/components/ui/Select";
import ConfirmModal from "@/components/ui/ConfirmModal";
import TablePayments from "./TablePayments";
import FormPayments from "./FormPayments";
import { deletePaymentAction } from "@/lib/payment";

interface SerializedPayment {
  id: number;
  clientId: number;
  amount: number;
  method: PaymentMethod;
  note: string | null;
  paidAt: string;
  client: { id: number; name: string };
}

interface PaymentsProps {
  initialPayments: SerializedPayment[];
  clients: { id: number; name: string; balance: number }[];
  totalItems: number;
  totalPages: number;
  currentPage: number;
  itemsPerPage: number;
  search: string;
  selectedMethod: string;
  permissions: string[];
}

const methodTranslations: Record<PaymentMethod, string> = {
  CASH: "Efectivo",
  YAPE: "Yape",
  PLIN: "Plin",
  BANK_TRANSFER: "Transf. Bancaria",
  OTHER: "Otro",
};

export default function Payments({
  initialPayments,
  clients,
  totalItems,
  totalPages,
  currentPage,
  itemsPerPage,
  selectedMethod,
  permissions,
}: PaymentsProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  // Estados de Modales
  const [isOpenCreateModal, setIsOpenCreateModal] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const canCreatePayment = permissions.includes("payments:create");
  const canDeletePayment = permissions.includes("payments:delete");

  // Manejar cambio en filtro de método de pago
  const handleMethodChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const params = new URLSearchParams(searchParams.toString());
    const val = e.target.value;
    if (val && val !== "ALL") {
      params.set("method", val);
    } else {
      params.delete("method");
    }
    params.delete("page"); // Reset a pág 1
    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  };

  const handleAnulateConfirm = async () => {
    if (!deleteTargetId) return;
    setIsDeleting(true);
    try {
      const res = await deletePaymentAction(deleteTargetId);
      if (res.success) {
        toast.success(res.message);
        setDeleteTargetId(null);
        router.refresh();
      } else {
        toast.error(res.message);
      }
    } catch (error: any) {
      toast.error(error.message || "Error al anular el pago.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Cabecera del Módulo */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-text-primary animate-fade-in">
            Registro de Pagos Recibidos
          </h2>
          <p className="text-xs sm:text-sm text-text-secondary mt-0.5">
            Administración central de abonos y facturación de cuentas
          </p>
        </div>

        {canCreatePayment && (
          <Button
            variant="primary"
            onClick={() => setIsOpenCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold self-start sm:self-auto shadow-sm shrink-0"
          >
            <FiPlus className="w-4 h-4" />
            <span>Registrar Pago</span>
          </Button>
        )}
      </div>

      {/* Caja Contenedora Premium */}
      <div className="bg-bg-card border border-border-default/80 rounded-2xl shadow-xs overflow-hidden">
        {/* Barra de Filtros */}
        <div className="px-6 py-4 border-b border-border-soft flex flex-col md:flex-row items-stretch md:items-center gap-4 bg-bg-card">
          <div className="flex-1 max-w-md">
            <SearchInput placeholder="Buscar por cliente o nota..." />
          </div>
          <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center md:ml-auto">
            <div className="flex items-center gap-2 select-none text-xs">
              <FiFilter className="w-3.5 h-3.5 text-text-tertiary shrink-0" />
              <span className="font-semibold text-text-secondary">Método:</span>
            </div>
            <Select
              value={selectedMethod || "ALL"}
              onChange={handleMethodChange}
              disabled={isPending}
              className="w-full sm:w-48 text-xs font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-beauty-400"
            >
              <option value="ALL">Todos los métodos</option>
              {Object.keys(methodTranslations).map((key) => (
                <option key={key} value={key}>
                  {methodTranslations[key as PaymentMethod]}
                </option>
              ))}
            </Select>
            <div className="text-xs text-text-secondary select-none font-medium sm:ml-4 flex items-center shrink-0">
              Total: {totalItems} pagos
            </div>
          </div>
        </div>

        {/* Listado de Pagos */}
        {initialPayments.length === 0 ? (
          <div className="p-12 text-center select-none bg-bg-card">
            <FiDollarSign className="w-10 h-10 text-text-tertiary mx-auto mb-3" />
            <h3 className="text-sm font-bold text-text-primary">
              No se encontraron pagos
            </h3>
            <p className="text-xs text-text-secondary mt-1 max-w-sm mx-auto">
              Intenta cambiar los términos de búsqueda o filtros aplicados.
            </p>
          </div>
        ) : (
          <ErrorBoundary>
            <TablePayments
              payments={initialPayments}
              canDelete={canDeletePayment}
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

      {/* Modal para Registrar Pago */}
      <FormPayments
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
        title="¿Anular este pago?"
        description="Esta acción eliminará de forma irreversible el registro seleccionado y actualizará el saldo de inmediato. ¿Deseas continuar?"
        confirmText="Confirmar Anulación"
        cancelText="Cancelar"
        variant="danger"
      />
    </div>
  );
}

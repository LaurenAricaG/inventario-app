"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useRouter, useSearchParams } from "next/navigation";
import { cn } from "@/utils/cn.utils";
import PageHeader from "@/components/ui/PageHeader";
import {
  FiArrowLeft,
  FiDollarSign,
  FiAlertTriangle,
  FiExternalLink,
} from "react-icons/fi";
import { FaWhatsapp } from "react-icons/fa";
import Button from "@/components/ui/Button";
import ButtonIcon from "@/components/ui/ButtonIcon";
import ConfirmModal from "@/components/ui/ConfirmModal";
import DetailSaleModal from "@/components/direct-sales/DetailSaleModal";
import OrderDetailModal from "./OrderDetailModal";
import FormPayments from "@/components/payments/FormPayments";
import FormDebts from "@/components/debts/FormDebts";
import MovementHistoryTable, { MovementItem } from "./MovementHistoryTable";
import Pagination from "@/components/ui/Pagination";
import { deletePaymentAction } from "@/lib/payment";
import { deleteExternalDebtAction } from "@/lib/external-debt";

interface ClientDetailsDashboardProps {
  client: {
    id: number;
    name: string;
    phone: string | null;
    address: string | null;
    notes: string | null;
    shareToken: string;
    createdAt: string;
  };
  campaigns: {
    id: number;
    number: string;
    company: { name: string };
  }[];
  movements: MovementItem[];
  permissions: string[];
  summary: {
    totalSales: number;
    totalExternalDebts: number;
    totalPayments: number;
    balance: number;
  };
  currentPage: number;
  totalPages: number;
  totalItems: number;
}

export default function ClientDetailsDashboard({
  client,
  movements,
  permissions,
  summary,
  currentPage,
  totalPages,
  totalItems,
}: ClientDetailsDashboardProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const source = searchParams.get("source") || "movimientos";

  const sourceMappers: Record<string, { label: string; href: string }> = {
    clientes: { label: "clientes", href: "/admin/clientes" },
    pagos: { label: "pagos", href: "/admin/pagos" },
    deudas: { label: "deudas", href: "/admin/deudas" },
    deuda: { label: "deudas", href: "/admin/deudas" },
    bitacora: { label: "bitácora", href: "/admin/bitacora" },
    movimientos: { label: "movimientos", href: "/admin/movimientos" },
  };

  const currentSource = sourceMappers[source] || sourceMappers.movimientos;

  const breadcrumbs = [
    { label: "admin", href: "/admin" },
    { label: currentSource.label, href: currentSource.href },
    { label: "fic cliente" },
  ];

  const [origin, setOrigin] = useState("");

  // Estados de Modales
  const [isOpenPaymentModal, setIsOpenPaymentModal] = useState(false);
  const [isOpenDebtModal, setIsOpenDebtModal] = useState(false);
  const [selectedSale, setSelectedSale] = useState<any | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{
    id: number;
    type: "PAGO" | "DEUDA";
  } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const canCreatePayment = permissions.includes("payments:create");
  const canCreateDebt = permissions.includes("debts:create");
  const canDeletePayment = permissions.includes("payments:delete");
  const canDeleteDebt = permissions.includes("debts:delete");

  const cleanPhone = client.phone ? client.phone.replace(/\D/g, "") : "";

  useEffect(() => {
    if (typeof window !== "undefined") {
      setOrigin(window.location.origin);
    }
  }, []);

  const handleAnulateConfirm = async () => {
    if (!deleteTarget) return;
    const target = deleteTarget;
    setDeleteTarget(null);
    setIsDeleting(true);

    try {
      let res;
      if (target.type === "PAGO") {
        res = await deletePaymentAction(target.id);
      } else {
        res = await deleteExternalDebtAction(target.id);
      }

      if (res.success) {
        toast.success(res.message);
        router.refresh();
      } else {
        toast.error(res.message);
      }
    } catch (error: any) {
      toast.error("Ocurrió un error inesperado al anular la transacción.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Ficha de Cuenta del Cliente"
        subtitle={`Historial de transacciones y saldos de ${client.name}`}
        breadcrumbs={breadcrumbs}
        action={
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push(currentSource.href)}
            className="flex items-center gap-2 border-border-strong text-text-primary hover:bg-bg-surface"
          >
            <FiArrowLeft className="w-4 h-4" />
            Volver
          </Button>
        }
      />

      {/* Top Grid: Datos de Cliente + Saldo Pendiente */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Datos del Cliente */}
        <div className="lg:col-span-2 bg-bg-card border border-border-default/70 p-6 rounded-3xl shadow-xs flex flex-col justify-between select-none">
          <div className="space-y-2">
            <h3 className="text-xl sm:text-2xl font-black text-text-primary tracking-tight">
              {client.name}
            </h3>

            <div className="space-y-1 pt-1">
              {client.phone ? (
                <p className="text-xs text-text-secondary font-medium">
                  <span className="font-semibold text-text-primary">Teléfono:</span> {client.phone}
                </p>
              ) : (
                <p className="text-xs text-text-tertiary font-medium italic">
                  Sin teléfono registrado
                </p>
              )}
              {client.address && (
                <p className="text-xs text-text-secondary">
                  <span className="font-semibold text-text-primary">Dirección:</span> {client.address}
                </p>
              )}
              {client.notes && (
                <p className="text-xs text-text-tertiary italic">
                  <span className="font-semibold text-text-secondary not-italic">Nota:</span> {client.notes}
                </p>
              )}
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between border-t border-border-soft pt-4 mt-4 gap-3">
            <span className="text-xs font-semibold text-text-secondary">
              Compartir Estado:
            </span>
            <div className="flex items-center gap-2">
              <ButtonIcon
                href={`https://api.whatsapp.com/send?${cleanPhone
                    ? `phone=${cleanPhone.startsWith("51") ? cleanPhone : "51" + cleanPhone}&`
                    : ""
                  }text=${encodeURIComponent(
                    `Hola ${client.name}, te comparto el enlace para que puedas ver el estado de tu cuenta de pedidos y pagos: ${origin}/c/${client.shareToken}`,
                  )}`}
                target="_blank"
                variant="success"
                icon={FaWhatsapp}
                iconClassName="text-success-text"
                title="Compartir por WhatsApp"
              />
              <ButtonIcon
                href={`/c/${client.shareToken}`}
                target="_blank"
                variant="beauty"
                icon={FiExternalLink}
                title="Abrir enlace de estado de cuenta"
              />
            </div>
          </div>
        </div>

        {/* Card: Saldo Neto Deudor / Pendiente */}
        <div
          className={cn(
            "lg:col-span-1 border p-6 rounded-3xl shadow-sm flex flex-col justify-between transition-all duration-300 relative overflow-hidden select-none",
            summary.balance > 0.01
              ? "bg-danger-bg/20 border-danger-text/20"
              : "bg-success-bg/20 border-success-text/20",
          )}
        >
          {/* Icono decorativo de fondo */}
          <div className="absolute right-4 top-4 opacity-10 dark:opacity-20 pointer-events-none">
            <FiDollarSign
              className={cn(
                "w-12 h-12",
                summary.balance > 0.01
                  ? "text-danger-text"
                  : "text-success-text",
              )}
            />
          </div>

          <span className="text-[10px] text-text-tertiary font-extrabold uppercase tracking-wider block">
            Saldo pendiente
          </span>

          <div className="mt-3">
            <p
              className={cn(
                "text-3xl font-black font-mono tracking-tight",
                summary.balance > 0.01
                  ? "text-danger-text"
                  : "text-success-text",
              )}
            >
              S/ {summary.balance.toFixed(2)}
            </p>

            <div className="mt-2.5 flex items-center">
              <span
                className={cn(
                  "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold border shadow-xs select-none",
                  summary.balance > 0.01
                    ? "bg-danger-bg/40 border-danger-text/10 text-danger-text"
                    : "bg-success-bg/40 border-success-text/10 text-success-text",
                )}
              >
                {summary.balance > 0.01 ? (
                  <>
                    <span className="w-1.5 h-1.5 rounded-full bg-danger-text animate-pulse" />
                    Pendiente de Pago
                  </>
                ) : (
                  <>
                    <span className="w-1.5 h-1.5 rounded-full bg-success-text" />
                    Al Día / Cancelado
                  </>
                )}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Contenido de Movimientos (Pestañas) */}
      <div className="overflow-hidden bg-bg-card border border-border-default/80 rounded-2xl shadow-xs">
        <div className="p-4 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border-soft bg-bg-card">
          <h3 className="text-lg font-bold text-text-primary select-none">
            Historial de Movimientos
          </h3>
          <div className="grid grid-cols-2 sm:flex sm:items-center gap-2.5 sm:gap-3 w-full sm:w-auto">
            {canCreatePayment && (
              <Button
                variant="outline"
                onClick={() => {
                  if (summary.balance <= 0) {
                    toast.warning("El saldo pendiente es 0");
                    return;
                  }
                  setIsOpenPaymentModal(true);
                }}
                className="w-full sm:w-auto flex items-center justify-center gap-1.5 sm:gap-2 border-border-default/60 hover:bg-beauty-400/10 hover:text-beauty-500 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-beauty-400 text-xs font-bold py-2 px-3 sm:px-4 rounded-xl cursor-pointer"
              >
                <FiDollarSign className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">Nuevo Pago</span>
              </Button>
            )}
            {canCreateDebt && (
              <Button
                variant="outline"
                onClick={() => setIsOpenDebtModal(true)}
                className="w-full sm:w-auto flex items-center justify-center gap-1.5 sm:gap-2 border-border-default/60 hover:bg-beauty-400/10 hover:text-beauty-500 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-beauty-400 text-xs font-bold py-2 px-3 sm:px-4 rounded-xl cursor-pointer"
              >
                <FiAlertTriangle className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">Nueva Deuda</span>
              </Button>
            )}
          </div>
        </div>

        <MovementHistoryTable
          movements={movements}
          onViewDirectSale={setSelectedSale}
          onViewCampaignOrder={setSelectedOrder}
          onDeletePayment={(id) => setDeleteTarget({ id, type: "PAGO" })}
          onDeleteExternalDebt={(id) => setDeleteTarget({ id, type: "DEUDA" })}
          canDeletePayment={canDeletePayment}
          canDeleteDebt={canDeleteDebt}
        />

        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={totalItems}
          itemsPerPage={10}
        />
      </div>

      {/* Modal de Detalle Venta Directa */}
      {selectedSale && (
        <DetailSaleModal
          isOpen={!!selectedSale}
          onClose={() => setSelectedSale(null)}
          sale={selectedSale}
          isPublic={false}
        />
      )}

      {/* Modal de Detalle Pedido Catálogo */}
      {selectedOrder && (
        <OrderDetailModal
          isOpen={!!selectedOrder}
          onClose={() => setSelectedOrder(null)}
          order={selectedOrder}
          isPublic={false}
        />
      )}

      <FormPayments
        isOpen={isOpenPaymentModal}
        onClose={() => setIsOpenPaymentModal(false)}
        clientId={client.id}
        clientBalance={summary.balance}
        onSuccess={() => {
          setIsOpenPaymentModal(false);
          router.refresh();
        }}
      />

      {/* Modal para Registrar Deuda */}
      <FormDebts
        isOpen={isOpenDebtModal}
        onClose={() => setIsOpenDebtModal(false)}
        clientId={client.id}
        onSuccess={() => {
          setIsOpenDebtModal(false);
          router.refresh();
        }}
      />

      {/* Confirmación para Anulación */}
      <ConfirmModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleAnulateConfirm}
        isLoading={isDeleting}
        title={`¿Anular este ${deleteTarget?.type === "PAGO" ? "pago" : "cargo"}?`}
        description={`Esta acción eliminará de forma irreversible el registro seleccionado y actualizará el saldo de inmediato. ¿Deseas continuar?`}
        confirmText="Confirmar Anulación"
        cancelText="Cancelar"
        variant="danger"
      />
    </div>
  );
}

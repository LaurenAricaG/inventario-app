"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { cn } from "@/utils/cn.utils";
import {
  FiArrowLeft,
  FiDollarSign,
  FiAlertTriangle,
  FiExternalLink,
} from "react-icons/fi";
import { FaWhatsapp } from "react-icons/fa";
import Button from "@/components/ui/Button";
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
    setIsDeleting(true);

    try {
      let res;
      if (deleteTarget.type === "PAGO") {
        res = await deletePaymentAction(deleteTarget.id);
      } else {
        res = await deleteExternalDebtAction(deleteTarget.id);
      }

      if (res.success) {
        toast.success(res.message);
        setDeleteTarget(null);
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
      {/* Botón de retorno y título */}
      <div className="flex items-center gap-3">
        <Link
          href="/admin/movimientos"
          className="p-2 rounded-xl border border-border-default/60 bg-bg-card hover:bg-beauty-400/10 text-text-secondary hover:text-beauty-500 hover:scale-[1.04] active:scale-[0.96] transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-beauty-400"
          title="Regresar a saldos de clientes"
        >
          <FiArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h2 className="text-xl font-bold tracking-tight text-text-primary">
            Ficha de Cuenta del Cliente
          </h2>
        </div>
      </div>

      {/* Top Grid: Datos de Cliente + Resumen Consolidado */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Datos del Cliente */}
        <div className="lg:col-span-1 bg-bg-card border border-border-default/70 p-6 rounded-3xl shadow-xs flex flex-col justify-between select-none">
          <div className="space-y-2">
            <h3 className="text-xl font-black text-text-primary tracking-tight">
              {client.name}
            </h3>

            <>
              {client.phone ? (
                <p className="text-xs text-text-secondary font-medium">
                  Teléfono: {client.phone}
                </p>
              ) : (
                <p className="text-xs text-text-tertiary font-medium italic">
                  Sin teléfono registrado
                </p>
              )}
              {client.address && (
                <p className="text-xs text-text-secondary">
                  Dirección: {client.address}
                </p>
              )}
              {client.notes && (
                <p className="text-xs text-text-tertiary italic">
                  Nota: {client.notes}
                </p>
              )}
            </>
          </div>

          <div className="flex items-center justify-between border-t border-border-soft pt-4 mt-4">
            <span className="text-xs font-semibold text-text-secondary">
              Compartir Estado:
            </span>
            <div className="flex items-center gap-2">
              <a
                href={`https://api.whatsapp.com/send?${cleanPhone
                  ? `phone=${cleanPhone.startsWith("51") ? cleanPhone : "51" + cleanPhone}&`
                  : ""
                  }text=${encodeURIComponent(
                    `Hola ${client.name}, te comparto el enlace para que puedas ver el estado de tu cuenta de pedidos y pagos: ${origin}/c/${client.shareToken}`,
                  )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-xl border border-border-default/60 bg-bg-card hover:bg-success-bg/20 text-success-text hover:text-success-text hover:scale-[1.04] active:scale-[0.96] transition-all duration-200 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-success-text"
                title="Compartir por WhatsApp"
              >
                <FaWhatsapp className="w-4 h-4 text-green-600 dark:text-green-500" />
              </a>
              <Link
                href={`/c/${client.shareToken}`}
                target="_blank"
                className="p-2 rounded-xl border border-border-default/60 bg-bg-card hover:bg-beauty-400/10 text-text-secondary hover:text-beauty-500 hover:scale-[1.04] active:scale-[0.96] transition-all duration-200 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-beauty-400"
                title="Abrir enlace de estado de cuenta"
              >
                <FiExternalLink className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>

        {/* Resumen Financiero */}
        <div className="lg:col-span-2 grid grid-cols-2 sm:grid-cols-4 gap-4 select-none">
          {/* Card: Total Compras */}
          <div className="bg-bg-card border border-border-default/70 p-5 rounded-3xl shadow-xs flex flex-col justify-between">
            <span className="text-[10px] text-text-tertiary font-bold uppercase tracking-wider">
              Total Compras
            </span>
            <div>
              <p className="text-lg font-black font-mono text-text-primary mt-2">
                S/ {summary.totalSales.toFixed(2)}
              </p>
              <span className="text-[9px] text-text-tertiary font-semibold block mt-1">
                Ventas registradas
              </span>
            </div>
          </div>

          {/* Card: Deudas Adicionales */}
          <div className="bg-bg-card border border-border-default/70 p-5 rounded-3xl shadow-xs flex flex-col justify-between">
            <span className="text-[10px] text-text-tertiary font-bold uppercase tracking-wider">
              Deudas Adicionales
            </span>
            <div>
              <p className="text-lg font-black font-mono text-text-primary mt-2">
                S/ {summary.totalExternalDebts.toFixed(2)}
              </p>
              <span className="text-[9px] text-text-tertiary font-semibold block mt-1">
                Cargos externos
              </span>
            </div>
          </div>

          {/* Card: Abonos / Pagado */}
          <div className="bg-bg-card border border-border-default/70 p-5 rounded-3xl shadow-xs flex flex-col justify-between">
            <span className="text-[10px] text-text-tertiary font-bold uppercase tracking-wider">
              Abonos / Pagado
            </span>
            <div>
              <p className="text-lg font-black font-mono text-success-text mt-2">
                S/ {summary.totalPayments.toFixed(2)}
              </p>
              <span className="text-[9px] text-success-text/80 font-bold block mt-1">
                Total abonado
              </span>
            </div>
          </div>

          {/* Card: Saldo Neto Deudor */}
          <div
            className={cn(
              "border p-6 rounded-3xl shadow-sm flex flex-col justify-between transition-all duration-300 relative overflow-hidden",
              summary.balance > 0.01
                ? "bg-gradient-to-br from-red-500/10 to-rose-500/5 border-red-500/20 dark:from-red-950/20 dark:to-zinc-950"
                : "bg-gradient-to-br from-green-500/10 to-emerald-500/5 border-green-500/20 dark:from-green-950/20 dark:to-zinc-950",
            )}
          >
            {/* Icono decorativo de fondo */}
            <div className="absolute right-4 top-4 opacity-10 dark:opacity-20 pointer-events-none">
              <FiDollarSign className={cn(
                "w-12 h-12",
                summary.balance > 0.01 ? "text-red-500" : "text-green-500"
              )} />
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
      </div>

      {/* Contenido de Movimientos (Pestañas) */}
      <div className="overflow-hidden bg-bg-card border border-border-default/80 rounded-2xl shadow-xs">
        <div className=" p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border-soft bg-bg-card">
          <h3 className="text-lg font-bold text-text-primary select-none">
            Historial de Movimientos
          </h3>
          <div className="flex items-center gap-3">
            {canCreatePayment && (
              <Button
                variant="outline"
                onClick={() => setIsOpenPaymentModal(true)}
                className="flex items-center gap-2 border-border-default/60 hover:bg-beauty-400/10 hover:text-beauty-500 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-beauty-400 text-xs font-bold py-2 px-4 rounded-xl cursor-pointer"
              >
                <FiDollarSign className="w-3.5 h-3.5" />
                <span>Registrar Pago</span>
              </Button>
            )}
            {canCreateDebt && (
              <Button
                variant="outline"
                onClick={() => setIsOpenDebtModal(true)}
                className="flex items-center gap-2 border-border-default/60 hover:bg-beauty-400/10 hover:text-beauty-500 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-beauty-400 text-xs font-bold py-2 px-4 rounded-xl cursor-pointer"
              >
                <FiAlertTriangle className="w-3.5 h-3.5" />
                <span>Registrar Deuda</span>
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

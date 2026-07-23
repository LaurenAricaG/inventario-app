"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { formatDateUTC } from "@/utils/date.utils";
import { toast } from "sonner";
import {
  FiArrowLeft,
  FiUser,
  FiTruck,
  FiCheckCircle,
  FiAlertCircle,
  FiCalendar,
} from "react-icons/fi";
import Button from "@/components/ui/Button";
import PageHeader from "@/components/ui/PageHeader";
import { transitionOrderStatusAction } from "@/lib/campaign-order/index";
import { CampaignOrderStatus, ItemArrivalStatus } from "@/generated/prisma";

interface SerializedCampaign {
  id: number;
  number: string;
  company: { id: number; name: string };
  paymentDate?: string | null;
}

interface SerializedOrderItem {
  id: number;
  catalogPrice: number;
  quantity: number;
  arrivalStatus: ItemArrivalStatus;
  substitute?: {
    catalogPrice: number;
  } | null;
}

interface SerializedCampaignOrder {
  id: number;
  clientId: number;
  campaignId: number;
  status: CampaignOrderStatus;
  notes: string | null;
  discount: number;
  total: number | null;
  paymentDate: string | null;
  client: { id: number; name: string };
  campaign: SerializedCampaign;
  items: SerializedOrderItem[];
}

interface OrderDeliveryConsoleProps {
  campaign: SerializedCampaign;
  orders: SerializedCampaignOrder[];
}

export default function OrderDeliveryConsole({
  campaign,
  orders,
}: OrderDeliveryConsoleProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleUpdateStatus = async (
    orderId: number,
    status: CampaignOrderStatus,
    successMsg: string,
  ) => {
    try {
      const res = await transitionOrderStatusAction(orderId, status);
      if (res.success) {
        toast.success(successMsg);
        router.refresh();
      } else {
        toast.error(res.message);
      }
    } catch (error: any) {
      toast.error(error.message || "Error al actualizar estado del pedido.");
    }
  };

  // Calcular el total a cobrar de cada pedido
  const getOrderTotals = (order: SerializedCampaignOrder) => {
    const subtotal = order.items.reduce((sum, item) => {
      if (item.arrivalStatus === ItemArrivalStatus.MISSING) return sum;
      const price =
        item.arrivalStatus === ItemArrivalStatus.SUBSTITUTED &&
          item.substitute?.catalogPrice !== undefined &&
          item.substitute?.catalogPrice !== null
          ? item.substitute.catalogPrice
          : item.catalogPrice;
      return sum + item.quantity * price;
    }, 0);
    const total = Math.max(0, subtotal - order.discount);
    return { subtotal, total };
  };

  // Filtrar pedidos listos para entregar (que no estén entregados/anulados y tengan al menos un producto que no haya faltado)
  const pendingDeliveries = orders.filter((o) => {
    if (o.status !== CampaignOrderStatus.PACKED) return false;
    const itemsToDeliverCount = o.items.filter(
      (i) => i.arrivalStatus !== ItemArrivalStatus.MISSING,
    ).length;
    return itemsToDeliverCount > 0;
  });
  const deliveredOrders = orders.filter(
    (o) => o.status === CampaignOrderStatus.DELIVERED,
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Despacho y Entrega Rápida de Pedidos"
        subtitle={`Campaña: ${campaign.company.name} - ${campaign.number}`}
        breadcrumbs={[
          { label: "admin", href: "/admin" },
          { label: "pedidos", href: "/admin/pedidos" },
          { label: "entregar pedidos" },
        ]}
        action={
          <Button
            type="button"
            variant="outline"
            onClick={() =>
              router.push(`/admin/pedidos?campaignId=${campaign.id}`)
            }
            className="flex items-center gap-2 border-border-strong text-text-primary hover:bg-bg-surface"
          >
            <FiArrowLeft className="w-4 h-4" />
            Volver
          </Button>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 select-none">
        {/* Panel Izquierdo/Centro: Pedidos por Entregar (Ancho 2 cols) */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-sm font-bold text-text-primary flex items-center gap-2 px-1">
            <FiTruck className="w-4.5 h-4.5 text-warning-text" />
            Pedidos Pendientes de Entrega ({pendingDeliveries.length})
          </h2>

          {pendingDeliveries.length === 0 ? (
            <div className="p-10 border border-dashed border-border-default rounded-3xl text-center bg-bg-card text-text-tertiary">
              <FiAlertCircle className="w-8 h-8 text-text-tertiary mx-auto mb-3" />
              No hay pedidos pendientes de entrega para esta campaña.
            </div>
          ) : (
            <div className="space-y-3">
              {pendingDeliveries.map((order) => {
                const { subtotal, total } = getOrderTotals(order);
                const itemsCount = order.items.filter(
                  (i) => i.arrivalStatus !== ItemArrivalStatus.MISSING,
                ).length;

                return (
                  <div
                    key={order.id}
                    className="p-5 bg-bg-card border border-border-default/80 rounded-2xl shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-beauty-500/30 transition-all duration-200"
                  >
                    <div className="space-y-2 min-w-0">
                      {/* Cliente */}
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-beauty-500/10 text-beauty-500 flex items-center justify-center shrink-0 border border-beauty-500/10">
                          <FiUser className="w-4 h-4" />
                        </div>
                        <div>
                          <span className="font-extrabold text-text-primary text-sm block">
                            {order.client.name}
                          </span>
                          <span className="text-[10px] text-text-tertiary font-semibold block">
                            {itemsCount} productos • Estado:{" "}
                            {order.status === "PACKED"
                              ? "Empacado"
                              : "Verificado"}
                          </span>
                        </div>
                      </div>

                      {/* Detalles del total y notas */}
                      <div className="flex flex-wrap items-center gap-3 pt-0.5">
                        {order.discount > 0 && (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-danger-bg/50 border border-danger-text/10 text-danger-text">
                            Descuento: -S/ {order.discount.toFixed(2)}
                          </span>
                        )}
                        {order.notes && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-warning-bg/50 border border-warning-text/10 text-warning-text">
                            <FiCalendar className="w-3 h-3 text-warning-text shrink-0" />
                            Nota: {order.notes}
                          </span>
                        )}
                        {order.paymentDate && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-beauty-500/10 border border-beauty-500/20 text-beauty-600 dark:text-beauty-400">
                            <FiCalendar className="w-3 h-3 text-beauty-500 shrink-0" />
                            F. Pago: {formatDateUTC(order.paymentDate)}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Costo y Botón de Entrega */}
                    <div className="flex items-center justify-between sm:justify-end gap-5 border-t sm:border-t-0 border-border-soft pt-3 sm:pt-0 shrink-0">
                      <div className="text-left sm:text-right">
                        <span className="text-[10px] text-text-tertiary font-bold uppercase tracking-wider block">
                          Total a Cobrar
                        </span>
                        <span className="font-mono font-black text-text-primary text-sm sm:text-base mt-0.5 block">
                          S/ {total.toFixed(2)}
                        </span>
                      </div>

                      <Button
                        type="button"
                        variant="primary"
                        onClick={() =>
                          handleUpdateStatus(
                            order.id,
                            CampaignOrderStatus.DELIVERED,
                            `Pedido de ${order.client.name} marcado como entregado.`,
                          )
                        }
                        className="py-2 px-4 text-xs font-bold rounded-xl gap-1.5 bg-success-text hover:bg-success-text/90 border-transparent text-white shadow-sm shrink-0"
                      >
                        <FiCheckCircle className="w-4 h-4 shrink-0" />
                        Entregar
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Panel Derecho: Entregados (Ancho 1 col) */}
        <div className="space-y-4">
          <h2 className="text-sm font-bold text-text-primary flex items-center gap-2 px-1">
            <FiCheckCircle className="w-4.5 h-4.5 text-success-text" />
            Entregados Recientemente ({deliveredOrders.length})
          </h2>

          {deliveredOrders.length === 0 ? (
            <div className="p-8 border border-dashed border-border-default rounded-3xl text-center bg-bg-card/40 text-text-tertiary text-xs">
              Ningún pedido entregado todavía.
            </div>
          ) : (
            <div className="space-y-3">
              {deliveredOrders.map((order) => {
                const { total } = getOrderTotals(order);
                return (
                  <div
                    key={order.id}
                    className="p-4 bg-bg-card border border-border-default/80 rounded-2xl shadow-xs space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 min-w-0">
                        <FiUser className="w-4 h-4 text-success-text shrink-0" />
                        <span className="font-bold text-text-primary text-xs truncate">
                          {order.client.name}
                        </span>
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <div className="flex justify-between items-center text-[11px] bg-bg-surface p-2 border border-border-soft/60 rounded-xl">
                        <span className="text-text-secondary">Por cobrar:</span>
                        <span className="font-mono font-bold text-success-text">
                          S/ {total.toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-[11px] bg-bg-surface p-2 border border-border-soft/60 rounded-xl select-none">
                        <span className="text-text-secondary">F. Pago:</span>
                        <span className="font-mono text-text-primary font-bold">
                          {order.paymentDate
                            ? formatDateUTC(order.paymentDate)
                            : "Sin definir"}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

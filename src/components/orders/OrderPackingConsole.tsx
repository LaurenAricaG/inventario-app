"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  FiArrowLeft,
  FiCheck,
  FiArchive,
  FiAlertCircle,
  FiUser,
  FiRotateCcw,
} from "react-icons/fi";
import { cn } from "@/utils/cn.utils";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import Form, { FormField } from "@/components/ui/Form";
import Input from "@/components/ui/Input";
import {
  transitionOrderStatusAction,
  updateOrderDiscountAndNotesAction,
} from "@/lib/campaign-order/index";
import { CampaignOrderStatus, ItemArrivalStatus } from "@/generated/prisma";

interface SerializedBrand {
  id: number;
  name: string;
}

interface SerializedCampaign {
  id: number;
  number: string;
  company: { id: number; name: string };
  paymentDate?: string | null;
}

interface SerializedOrderItem {
  id: number;
  brandId: number;
  productCode: string | null;
  productName: string;
  catalogPrice: number;
  costPrice: number | null;
  quantity: number;
  arrivalStatus: ItemArrivalStatus;
  substituteCode: string | null;
  substituteName: string | null;
  substitutePrice: number | null;
  substituteCostPrice: number | null;
  brand: SerializedBrand;
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

interface OrderPackingConsoleProps {
  campaign: SerializedCampaign;
  orders: SerializedCampaignOrder[];
}

export default function OrderPackingConsole({
  campaign,
  orders,
}: OrderPackingConsoleProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // Guardar estado local de las casillas de verificación de productos empacados
  const [checkedItems, setCheckedItems] = useState<Record<number, boolean>>({});

  // Estados del modal de Descuento/Plazo de Pago
  const [packingOrder, setPackingOrder] =
    useState<SerializedCampaignOrder | null>(null);
  const [discountInput, setDiscountInput] = useState("0");
  const [notesInput, setNotesInput] = useState("");
  const [paymentDateInput, setPaymentDateInput] = useState("");

  const toggleItemCheck = (itemId: number) => {
    setCheckedItems((prev) => ({
      ...prev,
      [itemId]: !prev[itemId],
    }));
  };

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

  const handleConfirmPacking = async () => {
    if (!packingOrder) return;
    const orderId = packingOrder.id;
    const discount = parseFloat(discountInput) || 0;
    const notes = notesInput ? notesInput.trim() : null;
    const paymentDateStr = paymentDateInput || null;

    try {
      // 1. Guardar descuento, nota y fecha de pago en base de datos
      const resDiscount = await updateOrderDiscountAndNotesAction(
        orderId,
        discount,
        notes,
        paymentDateStr,
      );
      if (!resDiscount.success) {
        toast.error(resDiscount.message);
        return;
      }

      // 2. Transicionar estado del pedido a PACKED
      const resStatus = await transitionOrderStatusAction(
        orderId,
        CampaignOrderStatus.PACKED,
      );
      if (resStatus.success) {
        toast.success("Pedido empacado y listo para entrega.");
        setPackingOrder(null);
        router.refresh();
      } else {
        toast.error(resStatus.message);
      }
    } catch (error: any) {
      toast.error("Error al completar el empaque de la bolsa.");
    }
  };

  // Filtrar pedidos pendientes de empacar (VERIFIED) y listos (PACKED)
  // Filtrar pedidos pendientes de empacar (VERIFIED) que tengan al menos un producto que no haya faltado
  const pendingOrders = orders.filter((o) => {
    if (o.status !== CampaignOrderStatus.VERIFIED) return false;
    const itemsToPackCount = o.items.filter(
      (i) => i.arrivalStatus !== ItemArrivalStatus.MISSING,
    ).length;
    return itemsToPackCount > 0;
  });
  const packedOrders = orders.filter(
    (o) => o.status === CampaignOrderStatus.PACKED,
  );

  return (
    <div className="space-y-6">
      {/* Botón Volver y Encabezado */}
      <div className="flex items-center gap-3">
        <button
          onClick={() =>
            router.push(`/admin/pedidos?campaignId=${campaign.id}`)
          }
          className="p-2.5 rounded-xl border border-border-default/60 bg-bg-surface hover:bg-bg-surface-hover text-text-secondary hover:text-text-primary hover:scale-[1.04] active:scale-[0.96] transition-all duration-200 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-beauty-500/20"
        >
          <FiArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <h1 className="text-2xl font-black text-text-primary tracking-tight">
            Guía de Armado de Bolsas y Empacado
          </h1>
          <p className="text-xs text-text-secondary mt-0.5">
            Campaña:{" "}
            <span className="font-bold text-text-primary">
              {campaign.company.name} - {campaign.number}
            </span>
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 select-none">
        {/* Panel Izquierdo/Centro: Pendientes de Empacado (Ancho 2 cols) */}
        <div className="lg:col-span-2 space-y-5">
          <h2 className="text-sm font-bold text-text-primary flex items-center gap-2 px-1">
            <FiArchive className="w-4 h-4 text-warning-text" />
            Bolsas Pendientes de Armado ({pendingOrders.length})
          </h2>

          {pendingOrders.length === 0 ? (
            <div className="p-10 border border-dashed border-border-default rounded-3xl text-center bg-bg-card text-text-tertiary">
              <FiAlertCircle className="w-8 h-8 text-text-tertiary mx-auto mb-3" />
              No hay pedidos en estado **Verificado** listos para empacar.
              <p className="text-xs text-text-tertiary mt-2">
                Asegúrate de verificar primero la recepción de productos en el
                módulo correspondiente.
              </p>
            </div>
          ) : (
            pendingOrders.map((order) => {
              // Filtrar ítems que no sean FALTANTES (MISSING)
              const itemsToPack = order.items.filter(
                (i) => i.arrivalStatus !== ItemArrivalStatus.MISSING,
              );
              const allChecked = itemsToPack.every((i) => checkedItems[i.id]);

              return (
                <div
                  key={order.id}
                  className="bg-bg-card border border-border-default/80 rounded-2xl shadow-xs overflow-hidden"
                >
                  {/* Ficha Cliente */}
                  <div className="px-6 py-4 bg-bg-surface/50 border-b border-border-soft flex flex-wrap items-center justify-between gap-4">
                    <div className="flex flex-wrap items-center gap-3">
                      <div className="flex items-center gap-2">
                        <FiUser className="w-4.5 h-4.5 text-beauty-500 shrink-0" />
                        <span className="font-extrabold text-text-primary text-sm">
                          {order.client.name}
                        </span>
                        <span className="text-xs text-text-tertiary font-semibold">
                          ({itemsToPack.length} items a empacar)
                        </span>
                      </div>
                      {order.discount > 0 && (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-danger-bg/50 border border-danger-text/10 text-danger-text">
                          Descuento: -S/ {order.discount.toFixed(2)}
                        </span>
                      )}
                      {order.notes && (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-warning-bg/50 border border-warning-text/10 text-warning-text">
                          Plazo: {order.notes}
                        </span>
                      )}
                    </div>
                    <Button
                      type="button"
                      variant="primary"
                      onClick={() => {
                        setPackingOrder(order);
                        setDiscountInput(order.discount.toString());
                        setNotesInput(order.notes || "");
                        setPaymentDateInput(
                          order.paymentDate
                            ? order.paymentDate.split("T")[0]
                            : order.campaign.paymentDate
                              ? order.campaign.paymentDate.split("T")[0]
                              : "",
                        );
                      }}
                      className={cn(
                        "py-1.5 px-4 text-xs font-bold rounded-xl gap-1.5 transition-all duration-300",
                        allChecked
                          ? "bg-beauty-500 hover:bg-beauty-600 border-transparent text-white shadow-sm"
                          : "bg-bg-surface hover:bg-bg-surface-hover border-border-strong text-text-secondary",
                      )}
                    >
                      <FiCheck className="w-4 h-4 shrink-0" />
                      Marcar como Empacado
                    </Button>
                  </div>

                  {/* Checklist de productos */}
                  <div className="p-4 divide-y divide-border-soft/50">
                    {itemsToPack.length === 0 ? (
                      <div className="p-4 text-center text-xs text-text-tertiary">
                        No hay productos que empacar (todos figuraban como
                        faltantes).
                      </div>
                    ) : (
                      itemsToPack.map((item) => {
                        const isChecked = checkedItems[item.id] || false;
                        const isSubstitute =
                          item.arrivalStatus === ItemArrivalStatus.SUBSTITUTED;

                        return (
                          <div
                            key={item.id}
                            onClick={() => toggleItemCheck(item.id)}
                            className={cn(
                              "flex items-center justify-between py-3.5 px-4 hover:bg-bg-surface/30 rounded-xl transition-all duration-150 cursor-pointer select-none",
                              isChecked && "bg-success-bg/10",
                            )}
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              {/* Checkbox visual */}
                              <div
                                className={cn(
                                  "w-5 h-5 rounded-md border flex items-center justify-center shrink-0 transition-all duration-150",
                                  isChecked
                                    ? "bg-success-text border-success-text text-white"
                                    : "border-border-default bg-bg-card",
                                )}
                              >
                                {isChecked && (
                                  <FiCheck className="w-3.5 h-3.5 stroke-3" />
                                )}
                              </div>

                              <div className="min-w-0">
                                <span
                                  className={cn(
                                    "text-xs font-mono text-text-tertiary block",
                                  )}
                                >
                                  Cod:{" "}
                                  {isSubstitute
                                    ? item.substituteCode || "S/C"
                                    : item.productCode || "S/C"}
                                </span>
                                {isSubstitute ? (
                                  <div className="space-y-0.5">
                                    <span className="text-[11px] text-text-tertiary line-through block">
                                      {item.productName}
                                    </span>
                                    <span className="text-info-text text-sm font-bold block">
                                      [Sustituto] {item.substituteName}
                                    </span>
                                  </div>
                                ) : (
                                  <span
                                    className={cn(
                                      "text-sm font-bold text-text-primary block",
                                      isChecked &&
                                        "line-through text-text-tertiary font-normal",
                                    )}
                                  >
                                    {item.productName}
                                  </span>
                                )}
                              </div>
                            </div>

                            <div className="flex items-center gap-4 shrink-0">
                              <span className="text-xs font-semibold text-text-secondary bg-bg-surface px-2.5 py-1 rounded-lg border border-border-default/50">
                                Cant: {item.quantity} u.
                              </span>
                              <span className="text-xs font-bold text-text-tertiary">
                                {item.brand.name}
                              </span>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Panel Derecho: Empacados Listos (Ancho 1 col) */}
        <div className="space-y-5">
          <h2 className="text-sm font-bold text-text-primary flex items-center gap-2 px-1">
            <FiCheck className="w-5 h-5 text-success-text border border-success-text/30 bg-success-bg/10 rounded-full p-0.5" />
            Bolsas Listas para Entrega ({packedOrders.length})
          </h2>

          {packedOrders.length === 0 ? (
            <div className="p-8 border border-dashed border-border-default rounded-3xl text-center bg-bg-card/40 text-text-tertiary text-xs">
              Ninguna bolsa armada todavía.
            </div>
          ) : (
            packedOrders.map((order) => (
              <div
                key={order.id}
                className="p-4 bg-bg-card border border-border-default/80 rounded-2xl shadow-xs space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 min-w-0">
                    <FiUser className="w-4 h-4 text-success-text shrink-0" />
                    <span className="font-bold text-text-primary text-xs truncate">
                      {order.client.name}
                    </span>
                  </div>
                </div>
                <div className="text-[11px] text-text-secondary bg-bg-surface p-3 border border-border-soft/60 rounded-xl space-y-1">
                  {order.items
                    .filter(
                      (i) => i.arrivalStatus !== ItemArrivalStatus.MISSING,
                    )
                    .map((item) => (
                      <div key={item.id} className="flex justify-between">
                        <span className="truncate pr-2">
                          {item.arrivalStatus === ItemArrivalStatus.SUBSTITUTED
                            ? item.substituteName
                            : item.productName}
                        </span>
                        <span className="font-semibold shrink-0">
                          x{item.quantity}
                        </span>
                      </div>
                    ))}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Modal de Descuento y Notas al Empacar */}
      {packingOrder &&
        (() => {
          const itemsToPack = packingOrder.items.filter(
            (i) => i.arrivalStatus !== ItemArrivalStatus.MISSING,
          );
          const subtotal = itemsToPack.reduce((s, item) => {
            const price =
              item.arrivalStatus === ItemArrivalStatus.SUBSTITUTED &&
              item.substitutePrice !== null
                ? item.substitutePrice
                : item.catalogPrice;
            return s + item.quantity * price;
          }, 0);
          const totalNeto = Math.max(
            0,
            subtotal - (parseFloat(discountInput) || 0),
          );

          return (
            <Modal
              isOpen={!!packingOrder}
              onClose={() => setPackingOrder(null)}
              title={`Empacar Pedido: ${packingOrder.client.name}`}
              size="sm"
            >
              <Form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleConfirmPacking();
                }}
                className="space-y-4"
              >
                <div className="text-xs text-text-secondary select-none">
                  Revisa el detalle de productos a empacar y configura el
                  descuento o notas de pago.
                </div>

                {/* Detalle de Productos (Boleta) */}
                <div className="border border-border-default/60 rounded-2xl bg-bg-surface p-4 space-y-2 select-none">
                  <span className="text-[10px] text-text-tertiary font-extrabold uppercase tracking-wider block">
                    Detalle del Pedido
                  </span>
                  <div className="max-h-36 overflow-y-auto space-y-1.5 pr-1 divide-y divide-border-soft/30 scrollbar-thin">
                    {itemsToPack.map((item) => {
                      const price =
                        item.arrivalStatus === ItemArrivalStatus.SUBSTITUTED &&
                        item.substitutePrice !== null
                          ? item.substitutePrice
                          : item.catalogPrice;
                      const name =
                        item.arrivalStatus === ItemArrivalStatus.SUBSTITUTED &&
                        item.substituteName
                          ? item.substituteName
                          : item.productName;
                      return (
                        <div
                          key={item.id}
                          className="flex justify-between items-center text-xs pt-1.5 first:pt-0"
                        >
                          <div className="truncate pr-2">
                            <span className="font-bold text-text-primary block truncate">
                              {name}
                            </span>
                            <span className="text-[10px] text-text-tertiary block font-mono">
                              Cod:{" "}
                              {item.arrivalStatus ===
                              ItemArrivalStatus.SUBSTITUTED
                                ? item.substituteCode || "S/C"
                                : item.productCode || "S/C"}
                            </span>
                          </div>
                          <div className="shrink-0 text-right">
                            <span className="text-text-secondary text-[11px] block">
                              {item.quantity} x S/ {price.toFixed(2)}
                            </span>
                            <span className="font-bold font-mono text-text-primary text-[11px] block">
                              S/ {(item.quantity * price).toFixed(2)}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="pt-2 border-t border-dashed border-border-default flex flex-col gap-1 text-[11px]">
                    <div className="flex justify-between items-center text-text-secondary">
                      <span>Subtotal:</span>
                      <span className="font-bold font-mono">
                        S/ {subtotal.toFixed(2)}
                      </span>
                    </div>
                    {(parseFloat(discountInput) || 0) > 0 && (
                      <div className="flex justify-between items-center text-danger-text font-bold">
                        <span>Descuento:</span>
                        <span className="font-mono">
                          -S/ {(parseFloat(discountInput) || 0).toFixed(2)}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between items-center text-xs font-extrabold text-beauty-500 pt-1.5 border-t border-border-soft mt-1">
                      <span>Total Neto:</span>
                      <span className="font-mono text-sm font-black">
                        S/ {totalNeto.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>

                <FormField label="Descuento Especial (S/)">
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={discountInput}
                    onChange={(e) => setDiscountInput(e.target.value)}
                    placeholder="0.00"
                    autoFocus
                  />
                </FormField>

                <FormField label="Nota / Plazo de Pago (Opcional)">
                  <Input
                    type="text"
                    value={notesInput}
                    onChange={(e) => setNotesInput(e.target.value)}
                    placeholder="Ej. Pagar hasta 15 de diciembre"
                  />
                </FormField>

                <FormField label="Fecha Límite de Pago (Opcional)">
                  <Input
                    type="date"
                    value={paymentDateInput}
                    onChange={(e) => setPaymentDateInput(e.target.value)}
                    placeholder="Seleccionar fecha"
                  />
                </FormField>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-border-soft">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setPackingOrder(null)}
                  >
                    Cancelar
                  </Button>
                  <Button type="submit" variant="primary" disabled={isPending}>
                    Confirmar y Empacar
                  </Button>
                </div>
              </Form>
            </Modal>
          );
        })()}
    </div>
  );
}

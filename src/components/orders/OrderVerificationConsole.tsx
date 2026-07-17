"use client";

import { useState, useTransition, Fragment } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  FiArrowLeft,
  FiAlertCircle,
  FiChevronDown,
  FiUser,
  FiPackage,
} from "react-icons/fi";
import { cn } from "@/utils/cn.utils";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Modal from "@/components/ui/Modal";
import PageHeader from "@/components/ui/PageHeader";
import Form, { FormField } from "@/components/ui/Form";
import {
  updateItemArrivalStatusAction,
  updateItemsArrivalStatusAction,
  transitionOrderStatusAction,
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
}

interface SerializedOrderItem {
  id: number;
  brandId: number;
  productCode: string | null;
  productName: string;
  catalogPrice: number;
  quantity: number;
  arrivalStatus: ItemArrivalStatus;
  substitute?: {
    productCode: string | null;
    productName: string;
    catalogPrice: number;
  } | null;
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
  client: { id: number; name: string };
  campaign: SerializedCampaign;
  items: SerializedOrderItem[];
}

interface OrderVerificationConsoleProps {
  campaign: SerializedCampaign;
  orders: SerializedCampaignOrder[];
}

const statusTranslations: Record<ItemArrivalStatus, string> = {
  PENDING: "Pendiente",
  RECEIVED: "Recibido",
  MISSING: "Faltante (No llegó)",
  SUBSTITUTED: "Sustituido",
};

const statusColors: Record<ItemArrivalStatus, string> = {
  PENDING: "bg-warning-bg/40 border-warning-text/10 text-warning-text",
  RECEIVED: "bg-success-bg/40 border-success-text/10 text-success-text",
  MISSING: "bg-danger-bg/40 border-danger-text/10 text-danger-text",
  SUBSTITUTED: "bg-info-bg/40 border-info-text/10 text-info-text",
};

export default function OrderVerificationConsole({
  campaign,
  orders,
}: OrderVerificationConsoleProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // Buscar ítem para sustituto (soporta unitario o lote)
  const [substitutingItem, setSubstitutingItem] = useState<{
    type: "single" | "group";
    id?: number;
    itemIds?: number[];
    productName: string;
    productCode: string | null;
    catalogPrice: number;
    quantity: number;
  } | null>(null);

  const [subCode, setSubCode] = useState("");
  const [subName, setSubName] = useState("");
  const [subPrice, setSubPrice] = useState("");
  const [isSubmittingSubstitute, setIsSubmittingSubstitute] = useState(false);

  // Estados colapsados de productos consolidados
  const [expandedGroupKeys, setExpandedGroupKeys] = useState<
    Record<string, boolean>
  >({});

  const toggleGroupExpand = (key: string) => {
    setExpandedGroupKeys((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  }; // Cambiar estado de arribo del ítem individual
  const handleItemArrival = async (
    itemId: number,
    arrivalStatus: ItemArrivalStatus,
    substituteData?: any,
  ) => {
    try {
      const res = await updateItemArrivalStatusAction(
        itemId,
        arrivalStatus,
        substituteData,
      );
      if (res.success) {
        toast.success(res.message);

        // Buscar la orden correspondiente
        const order = orders.find((o) => o.items.some((i) => i.id === itemId));
        if (order) {
          const allOtherItemsChecked = order.items.every((item) =>
            item.id === itemId
              ? arrivalStatus !== ItemArrivalStatus.PENDING
              : item.arrivalStatus !== ItemArrivalStatus.PENDING,
          );

          // Si todos están verificados y el estado actual de la orden es PENDING, transicionamos automáticamente
          if (
            allOtherItemsChecked &&
            order.status === CampaignOrderStatus.PENDING
          ) {
            // Verificar si todos los productos de la orden faltaron
            const allItemsMissing = order.items.every((item) =>
              item.id === itemId
                ? arrivalStatus === ItemArrivalStatus.MISSING
                : item.arrivalStatus === ItemArrivalStatus.MISSING,
            );

            const targetStatus = allItemsMissing
              ? CampaignOrderStatus.CANCELLED
              : CampaignOrderStatus.VERIFIED;
            const resStatus = await transitionOrderStatusAction(
              order.id,
              targetStatus,
            );
            if (resStatus.success) {
              const statusMsg = allItemsMissing
                ? `Pedido de ${order.client.name} anulado automáticamente (todos los productos faltaron).`
                : `Pedido de ${order.client.name} verificado automáticamente.`;
              toast.success(statusMsg);
            }
          }
        }

        router.refresh();
      } else {
        toast.error(res.message);
      }
    } catch (error: any) {
      toast.error(error.message || "Error al actualizar estado del producto.");
    }
  };

  // Cambiar estado de arribo del lote
  const handleBatchArrival = async (
    itemIds: number[],
    arrivalStatus: ItemArrivalStatus,
    substituteData?: any,
  ) => {
    try {
      const res = await updateItemsArrivalStatusAction(
        itemIds,
        arrivalStatus,
        substituteData,
      );
      if (res.success) {
        toast.success(res.message);
        router.refresh();
      } else {
        toast.error(res.message);
      }
    } catch (error: any) {
      toast.error(error.message || "Error al actualizar estado del lote.");
    }
  };

  // Abrir modal de sustituto
  const handleOpenSubstituteModal = (
    type: "single" | "group",
    data: {
      id?: number;
      itemIds?: number[];
      productName: string;
      productCode: string | null;
      catalogPrice: number;
      quantity: number;
    },
  ) => {
    setSubstitutingItem({ type, ...data });
    setSubCode(data.productCode || "");
    setSubName(data.productName ? `${data.productName} (Sustituto)` : "");
    setSubPrice(data.catalogPrice.toString());
  };

  const handleSaveSubstitute = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!substitutingItem) return;
    if (!subName.trim()) {
      toast.error("El nombre del producto sustituto es obligatorio.");
      return;
    }
    const priceNum = parseFloat(subPrice);
    if (isNaN(priceNum) || priceNum <= 0) {
      toast.error("Por favor, ingresa un precio de catálogo válido.");
      return;
    }

    setIsSubmittingSubstitute(true);
    try {
      const subData = {
        productCode: subCode.trim(),
        productName: subName.trim(),
        catalogPrice: priceNum,
      };

      if (substitutingItem.type === "single") {
        await handleItemArrival(
          substitutingItem.id!,
          ItemArrivalStatus.SUBSTITUTED,
          subData,
        );
      } else {
        await handleBatchArrival(
          substitutingItem.itemIds!,
          ItemArrivalStatus.SUBSTITUTED,
          subData,
        );
      }
      setSubstitutingItem(null);
    } catch (error: any) {
      toast.error(error.message || "Error al aplicar sustituto.");
    } finally {
      setIsSubmittingSubstitute(false);
    }
  };

  // Finalizar verificación del pedido del cliente
  const handleVerifyOrder = async (orderId: number) => {
    try {
      const order = orders.find((o) => o.id === orderId);
      const allItemsMissing =
        order?.items.every(
          (item) => item.arrivalStatus === ItemArrivalStatus.MISSING,
        ) || false;
      const targetStatus = allItemsMissing
        ? CampaignOrderStatus.CANCELLED
        : CampaignOrderStatus.VERIFIED;

      const res = await transitionOrderStatusAction(orderId, targetStatus);
      if (res.success) {
        const successMsg = allItemsMissing
          ? "Pedido anulado (todos los productos faltaron)."
          : "Pedido verificado y listo para empacado.";
        toast.success(successMsg);
        router.refresh();
      } else {
        toast.error(res.message);
      }
    } catch (error: any) {
      toast.error(error.message || "Error al verificar el pedido.");
    }
  };

  // Calcular avance general
  const totalItems = orders.reduce(
    (sum, order) => sum + order.items.reduce((s, i) => s + i.quantity, 0),
    0,
  );
  const verifiedItems = orders.reduce(
    (sum, order) =>
      sum +
      order.items.reduce(
        (s, i) =>
          s + (i.arrivalStatus !== ItemArrivalStatus.PENDING ? i.quantity : 0),
        0,
      ),
    0,
  );
  const progressPercent =
    totalItems > 0 ? Math.round((verifiedItems / totalItems) * 100) : 0;

  // Agrupamiento y procesamiento de productos de campaña
  const groupedProductsMap = new Map<
    string,
    {
      key: string;
      productName: string;
      productCode: string | null;
      brandName: string;
      catalogPrice: number;
      totalQuantity: number;
      items: {
        id: number;
        orderId: number;
        clientId: number;
        clientName: string;
        quantity: number;
        arrivalStatus: ItemArrivalStatus;
        substitute?: {
          productCode: string | null;
          productName: string;
          catalogPrice: number;
        } | null;
        orderStatus: CampaignOrderStatus;
      }[];
    }
  >();

  orders.forEach((order) => {
    order.items.forEach((item) => {
      const key = `${item.brandId}-${item.productName}-${item.productCode || ""}-${item.catalogPrice}`;
      if (!groupedProductsMap.has(key)) {
        groupedProductsMap.set(key, {
          key,
          productName: item.productName,
          productCode: item.productCode,
          brandName: item.brand.name,
          catalogPrice: item.catalogPrice,
          totalQuantity: 0,
          items: [],
        });
      }
      const group = groupedProductsMap.get(key)!;
      group.totalQuantity += item.quantity;
      group.items.push({
        id: item.id,
        orderId: order.id,
        clientId: order.clientId,
        clientName: order.client.name,
        quantity: item.quantity,
        arrivalStatus: item.arrivalStatus,
        substitute: item.substitute,
        orderStatus: order.status,
      });
    });
  });

  const groupedProducts = Array.from(groupedProductsMap.values()).sort((a, b) =>
    a.productName.localeCompare(b.productName),
  );

  const getGroupStatus = (
    groupItems: { arrivalStatus: ItemArrivalStatus }[],
  ) => {
    if (groupItems.length === 0) return "PENDING";
    const statuses = groupItems.map((i) => i.arrivalStatus);
    if (statuses.every((s) => s === "RECEIVED")) return "RECEIVED";
    if (statuses.every((s) => s === "MISSING")) return "MISSING";
    if (statuses.every((s) => s === "SUBSTITUTED")) return "SUBSTITUTED";
    if (statuses.every((s) => s === "PENDING")) return "PENDING";
    return "INCOMPLETE";
  };

  const groupStatusTranslations: Record<string, string> = {
    PENDING: "Pendiente",
    RECEIVED: "Completo",
    MISSING: "Faltó",
    SUBSTITUTED: "Sustituido",
    INCOMPLETE: "Incompleto",
  };

  const groupStatusColors: Record<string, string> = {
    PENDING: "bg-warning-bg/40 border-warning-text/10 text-warning-text",
    RECEIVED: "bg-success-bg/40 border-success-text/10 text-success-text",
    MISSING: "bg-danger-bg/40 border-danger-text/10 text-danger-text",
    SUBSTITUTED: "bg-info-bg/40 border-info-text/10 text-info-text",
    INCOMPLETE:
      "bg-pink-100 text-pink-800 dark:bg-pink-900/40 dark:text-pink-200 border-pink-200/20",
  };

  const getPendingItemIds = (
    groupItems: { id: number; orderStatus: CampaignOrderStatus }[],
  ) => {
    return groupItems
      .filter(
        (i) =>
          i.orderStatus === CampaignOrderStatus.PENDING,
      )
      .map((i) => i.id);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Verificación de Arribos y Cajas"
        subtitle={`Campaña: ${campaign.company.name} - ${campaign.number}`}
        breadcrumbs={[
          { label: "admin", href: "/admin" },
          { label: "pedidos", href: "/admin/pedidos" },
          { label: "verificar pedidos" },
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

      {/* Barra de Progreso de Verificación */}
      <div className="p-5 bg-bg-card border border-border-default/70 rounded-3xl shadow-xs space-y-3 select-none">
        <div className="flex items-center justify-between text-xs font-bold text-text-secondary">
          <span className="flex items-center gap-1.5">
            <FiPackage className="w-4 h-4 text-beauty-500" />
            Progreso de Recepción
          </span>
          <span className="font-mono">
            {verifiedItems} / {totalItems} unidades ({progressPercent}%)
          </span>
        </div>
        <div className="w-full bg-bg-surface border border-border-default/50 rounded-full h-3.5 overflow-hidden p-0.5">
          <div
            className="bg-linear-to-r from-beauty-400 to-beauty-500 h-full rounded-full transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Listado Consolidado de Productos */}
      <div className="space-y-4">
        {orders.length === 0 ? (
          <div className="p-10 border border-dashed border-border-default rounded-3xl text-center bg-bg-card text-text-tertiary">
            <FiAlertCircle className="w-8 h-8 text-text-tertiary mx-auto mb-3" />
            No hay ningún pedido registrado en esta campaña para verificar.
          </div>
        ) : (
          <div className="bg-bg-card border border-border-default/80 rounded-3xl shadow-xs overflow-hidden">
            <div className="px-6 py-4 bg-bg-surface/50 border-b border-border-soft flex items-center justify-between">
              <span className="font-extrabold text-text-primary text-sm">
                Listado Consolidado de Productos de la Campaña (
                {groupedProducts.length} productos únicos)
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="border-b border-border-soft bg-bg-surface/30 select-none">
                    <th className="px-4 py-3 font-semibold text-text-secondary uppercase tracking-wider w-10"></th>
                    <th className="px-4 py-3 font-semibold text-text-secondary uppercase tracking-wider">
                      Código
                    </th>
                    <th className="px-4 py-3 font-semibold text-text-secondary uppercase tracking-wider">
                      Marca
                    </th>
                    <th className="px-4 py-3 font-semibold text-text-secondary uppercase tracking-wider">
                      Producto
                    </th>
                    <th className="px-4 py-3 font-semibold text-text-secondary text-right uppercase tracking-wider">
                      Precio Catálogo
                    </th>
                    <th className="px-4 py-3 font-semibold text-text-secondary text-center uppercase tracking-wider">
                      Cant. Pedida
                    </th>
                    <th className="px-4 py-3 font-semibold text-text-secondary text-center tracking-wider">
                      Estado
                    </th>
                    <th className="px-4 py-3 font-semibold text-text-secondary text-center uppercase tracking-wider w-96">
                      Verificación Consolidada (Acción Masiva)
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-soft/40">
                  {groupedProducts.map((group) => {
                    const groupStatus = getGroupStatus(group.items);
                    const isExpanded = !!expandedGroupKeys[group.key];
                    const pendingItemIds = getPendingItemIds(group.items);
                    const isGroupFullyVerified = pendingItemIds.length === 0;
                    const allItemIds = group.items.map((i) => i.id);

                    return (
                      <Fragment key={group.key}>
                        <tr
                          className={cn(
                            "hover:bg-bg-surface/10 transition-colors duration-150",
                            groupStatus === "PENDING" ? "" : "bg-bg-surface/5",
                          )}
                        >
                          {/* Botón de Colapso */}
                          <td className="px-4 py-3 text-center">
                            <button
                              type="button"
                              onClick={() => toggleGroupExpand(group.key)}
                              className="p-1 rounded-md text-text-secondary hover:bg-bg-surface transition-all cursor-pointer"
                            >
                              <FiChevronDown
                                className={cn(
                                  "w-4 h-4 transition-transform duration-200",
                                  isExpanded && "rotate-180",
                                )}
                              />
                            </button>
                          </td>
                          <td className="px-4 py-3 font-mono text-text-secondary">
                            {group.productCode || "S/C"}
                          </td>
                          <td className="px-4 py-3 font-semibold text-text-secondary">
                            {group.brandName}
                          </td>
                          <td className="px-4 py-3 font-bold text-text-primary">
                            {group.productName}
                          </td>
                          <td className="px-4 py-3 text-right font-mono text-text-secondary">
                            S/ {group.catalogPrice.toFixed(2)}
                          </td>
                          <td className="px-4 py-3 text-center font-bold text-text-primary">
                            {group.totalQuantity} u.
                          </td>
                          <td className="px-4 py-3 text-center whitespace-nowrap">
                            <span
                              className={cn(
                                "px-2.5 py-0.5 rounded-full text-[10px] font-bold border",
                                groupStatusColors[groupStatus],
                              )}
                            >
                              {groupStatusTranslations[groupStatus]}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center justify-center gap-1.5 select-none">
                              <button
                                type="button"
                                disabled={isGroupFullyVerified}
                                onClick={() =>
                                  handleBatchArrival(
                                    pendingItemIds,
                                    ItemArrivalStatus.RECEIVED,
                                  )
                                }
                                className={cn(
                                  "px-2 py-1.5 rounded-lg border text-[10px] font-bold cursor-pointer transition-all duration-150 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed",
                                  groupStatus === "RECEIVED"
                                    ? "bg-success-bg border-success-text/20 text-success-text font-black"
                                    : "border-border-default/60 bg-bg-surface hover:bg-success-bg/20 text-text-secondary hover:text-success-text",
                                )}
                                title="Todo el lote llegó completo"
                              >
                                Completo
                              </button>
                              <button
                                type="button"
                                disabled={isGroupFullyVerified}
                                onClick={() =>
                                  handleBatchArrival(
                                    pendingItemIds,
                                    ItemArrivalStatus.MISSING,
                                  )
                                }
                                className={cn(
                                  "px-2 py-1.5 rounded-lg border text-[10px] font-bold cursor-pointer transition-all duration-150 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed",
                                  groupStatus === "MISSING"
                                    ? "bg-danger-bg border-danger-text/20 text-danger-text font-black"
                                    : "border-border-default/60 bg-bg-surface hover:bg-danger-bg/20 text-text-secondary hover:text-danger-text",
                                )}
                                title="No llegó ninguna unidad"
                              >
                                Faltó
                              </button>
                              <button
                                type="button"
                                disabled={isGroupFullyVerified}
                                onClick={() =>
                                  handleOpenSubstituteModal("group", {
                                    itemIds: pendingItemIds,
                                    productName: group.productName,
                                    productCode: group.productCode,
                                    catalogPrice: group.catalogPrice,
                                    quantity: group.totalQuantity,
                                  })
                                }
                                className={cn(
                                  "px-2 py-1.5 rounded-lg border text-[10px] font-bold cursor-pointer transition-all duration-150 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed",
                                  groupStatus === "SUBSTITUTED"
                                    ? "bg-info-bg border-info-text/20 text-info-text font-black"
                                    : "border-border-default/60 bg-bg-surface hover:bg-info-bg/20 text-text-secondary hover:text-info-text",
                                )}
                                title="Sustituir todo el lote por otro producto"
                              >
                                Diferente
                              </button>
                              <button
                                type="button"
                                disabled={isGroupFullyVerified}
                                onClick={() => toggleGroupExpand(group.key)}
                                className={cn(
                                  "px-2 py-1.5 rounded-lg border text-[10px] font-bold cursor-pointer transition-all duration-150 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed",
                                  groupStatus === "INCOMPLETE"
                                    ? "bg-pink-100 border-pink-300 text-pink-800 font-black dark:bg-pink-900/40 dark:text-pink-200"
                                    : "border-border-default/60 bg-bg-surface hover:bg-pink-500/10 text-text-secondary hover:text-pink-600",
                                )}
                                title="Registrar cantidades parciales o clientes específicos"
                              >
                                Incompleto
                              </button>
                            </div>
                          </td>
                        </tr>

                        {/* Fila Acordeón: Distribución por Cliente */}
                        {isExpanded && (
                          <tr>
                            <td
                              colSpan={8}
                              className="bg-bg-surface/30 p-4 border-l-4 border-beauty-400"
                            >
                              <div className="space-y-3">
                                <span className="text-[10px] font-extrabold uppercase tracking-wider text-text-secondary block">
                                  Distribución por Clientes (Asignación Manual):
                                </span>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                  {group.items.map((subItem) => {
                                    const isItemVerified =
                                      subItem.orderStatus !==
                                      CampaignOrderStatus.PENDING;

                                    return (
                                      <div
                                        key={subItem.id}
                                        className="p-3 bg-bg-card border border-border-default/60 rounded-xl flex flex-col justify-between space-y-2.5"
                                      >
                                        <div className="flex items-center justify-between text-xs">
                                          <span className="font-bold text-text-primary flex items-center gap-1">
                                            <FiUser className="w-3.5 h-3.5 text-text-tertiary" />
                                            {subItem.clientName}
                                          </span>
                                          <span className="font-semibold text-text-secondary bg-bg-surface px-1.5 py-0.5 rounded border border-border-default/30">
                                            Cant: {subItem.quantity}
                                          </span>
                                        </div>

                                        {subItem.arrivalStatus ===
                                          ItemArrivalStatus.SUBSTITUTED &&
                                          subItem.substitute?.productName && (
                                            <div className="text-[10px] bg-info-bg/10 border border-info-text/20 text-info-text p-1.5 rounded-lg">
                                              [Sustituto]{" "}
                                              <span className="font-semibold">
                                                {subItem.substitute.productName}
                                              </span>{" "}
                                              (Cod:{" "}
                                              {subItem.substitute.productCode || "S/C"})
                                            </div>
                                          )}

                                        <div className="flex items-center justify-between pt-1 border-t border-border-soft/30 gap-2">
                                          <span
                                            className={cn(
                                              "px-2 py-0.5 rounded-full text-[9px] font-bold border",
                                              statusColors[
                                              subItem.arrivalStatus
                                              ],
                                            )}
                                          >
                                            {
                                              statusTranslations[
                                              subItem.arrivalStatus
                                              ]
                                            }
                                          </span>
                                          <div className="flex gap-1">
                                            <button
                                              type="button"
                                              disabled={isItemVerified}
                                              onClick={() =>
                                                handleItemArrival(
                                                  subItem.id,
                                                  ItemArrivalStatus.RECEIVED,
                                                )
                                              }
                                              className={cn(
                                                "px-2 py-1 rounded text-[9px] font-bold cursor-pointer transition-all disabled:opacity-50",
                                                subItem.arrivalStatus ===
                                                  ItemArrivalStatus.RECEIVED
                                                  ? "bg-success-text text-white font-black"
                                                  : "bg-bg-surface hover:bg-success-bg/30 text-text-secondary hover:text-success-text border border-border-default/50",
                                              )}
                                            >
                                              Llegó
                                            </button>
                                            <button
                                              type="button"
                                              disabled={isItemVerified}
                                              onClick={() =>
                                                handleItemArrival(
                                                  subItem.id,
                                                  ItemArrivalStatus.MISSING,
                                                )
                                              }
                                              className={cn(
                                                "px-2 py-1 rounded text-[9px] font-bold cursor-pointer transition-all disabled:opacity-50",
                                                subItem.arrivalStatus ===
                                                  ItemArrivalStatus.MISSING
                                                  ? "bg-danger-text text-white font-black"
                                                  : "bg-bg-surface hover:bg-danger-bg/30 text-text-secondary hover:text-danger-text border border-border-default/50",
                                              )}
                                            >
                                              Faltó
                                            </button>
                                            <button
                                              type="button"
                                              disabled={isItemVerified}
                                              onClick={() =>
                                                handleOpenSubstituteModal(
                                                  "single",
                                                  {
                                                    id: subItem.id,
                                                    productName:
                                                      group.productName,
                                                    productCode:
                                                      group.productCode,
                                                    catalogPrice:
                                                      group.catalogPrice,
                                                    quantity: subItem.quantity,
                                                  },
                                                )
                                              }
                                              className={cn(
                                                "px-2 py-1 rounded text-[9px] font-bold cursor-pointer transition-all disabled:opacity-50",
                                                subItem.arrivalStatus ===
                                                  ItemArrivalStatus.SUBSTITUTED
                                                  ? "bg-info-text text-white font-black"
                                                  : "bg-bg-surface hover:bg-info-bg/30 text-text-secondary hover:text-info-text border border-border-default/50",
                                              )}
                                            >
                                              Sust.
                                            </button>
                                          </div>
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Modal para Registrar Sustituto */}
      {substitutingItem && (
        <Modal
          isOpen={!!substitutingItem}
          onClose={() => setSubstitutingItem(null)}
          title={`Registrar Producto Sustituto enviado por ${campaign.company.name}`}
          size="md"
          footer={
            <div className="flex items-center gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setSubstitutingItem(null)}
                disabled={isSubmittingSubstitute}
                className="border-border-strong text-text-primary hover:bg-bg-surface"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                variant="primary"
                form="substitute-form"
                loading={isSubmittingSubstitute}
              >
                Aplicar Sustituto
              </Button>
            </div>
          }
        >
          <Form
            id="substitute-form"
            onSubmit={handleSaveSubstitute}
            className="space-y-4 text-sm text-text-secondary select-none"
          >
            <div className="p-3 bg-bg-surface border border-border-default/50 rounded-xl mb-4">
              <p className="text-xs">
                Producto original pedido:{" "}
                <span className="font-bold text-text-primary">
                  {substitutingItem.productName}
                </span>{" "}
                ({substitutingItem.quantity} u.)
              </p>
              <p className="text-xs mt-1">
                Precio de catálogo original:{" "}
                <span className="font-mono font-bold text-text-primary">
                  S/ {substitutingItem.catalogPrice.toFixed(2)}
                </span>
              </p>
            </div>

            <FormField label="Código del Producto Sustituto">
              <Input
                value={subCode}
                onChange={(e) => setSubCode(e.target.value)}
                placeholder="Ej. 67890"
              />
            </FormField>

            <FormField label="Nombre/Descripción del Sustituto">
              <Input
                value={subName}
                onChange={(e) => setSubName(e.target.value)}
                placeholder="Ej. Labial Colorfix Carmín"
                required
              />
            </FormField>

            <FormField label="Precio Catálogo del Sustituto (S/)">
              <Input
                type="number"
                step="0.01"
                min="0"
                value={subPrice}
                onChange={(e) => setSubPrice(e.target.value)}
                placeholder="0.00"
                required
              />
            </FormField>
          </Form>
        </Modal>
      )}
    </div>
  );
}

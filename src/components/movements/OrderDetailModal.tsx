"use client";

import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import { CampaignOrderWithRelations } from "@/types/models";

import { useSystemConfig } from "@/context/SystemConfigContext";

interface OrderDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: CampaignOrderWithRelations | null;
  isPublic?: boolean;
}

const statusTranslations: Record<string, string> = {
  PENDING: "Pendiente",
  ARRIVED: "Llegado",
  VERIFIED: "Verificado",
  PACKED: "Empacado",
  DELIVERED: "Entregado",
  CANCELLED: "Cancelado",
};

const statusColors: Record<string, string> = {
  PENDING: "bg-warning-bg/50 border-warning-text/10 text-warning-text",
  ARRIVED: "bg-info-bg/50 border-info-text/10 text-info-text",
  VERIFIED:
    "bg-beauty-100 text-beauty-800 dark:bg-beauty-900/60 dark:text-beauty-200 border-beauty-400/10",
  PACKED:
    "bg-beauty-200 text-beauty-900 dark:bg-beauty-900/80 dark:text-beauty-100 border-beauty-400/20",
  DELIVERED: "bg-success-bg/50 border-success-text/10 text-success-text",
  CANCELLED: "bg-danger-bg/50 border-danger-text/10 text-danger-text",
};

const itemStatusTranslations: Record<string, string> = {
  PENDING: "Pendiente",
  RECEIVED: "Recibido",
  MISSING: "Faltante",
  SUBSTITUTED: "Sustituido",
};

const itemStatusColors: Record<string, string> = {
  PENDING: "bg-warning-bg/40 border-warning-text/10 text-warning-text",
  RECEIVED: "bg-success-bg/40 border-success-text/10 text-success-text",
  MISSING: "bg-danger-bg/40 border-danger-text/10 text-danger-text",
  SUBSTITUTED: "bg-info-bg/40 border-info-text/10 text-info-text",
};

export default function OrderDetailModal({
  isOpen,
  onClose,
  order,
  isPublic = false,
}: OrderDetailModalProps) {
  const systemConfig = useSystemConfig();
  if (!order) return null;

  const formatDate = (dateInput: Date | string) => {
    try {
      const date = new Date(dateInput);
      return date.toLocaleDateString("es-ES", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return String(dateInput);
    }
  };

  const formatOnlyDate = (dateInput: Date | string) => {
    try {
      const date = new Date(dateInput);
      const day = String(date.getUTCDate()).padStart(2, "0");
      const month = String(date.getUTCMonth() + 1).padStart(2, "0");
      const year = date.getUTCFullYear();
      return `${day}/${month}/${year}`;
    } catch {
      return String(dateInput);
    }
  };

  const calculatedSubtotal = order.items.reduce((sum, item) => {
    if (item.arrivalStatus === "MISSING") return sum;
    const price =
      item.arrivalStatus === "SUBSTITUTED" && item.substitutePrice !== null
        ? item.substitutePrice
        : item.catalogPrice;
    return sum + item.quantity * price;
  }, 0);

  // VISTA PÚBLICA DE TICKET
  if (isPublic) {
    const isDeliveredOrCancelled =
      order.status === "DELIVERED" || order.status === "CANCELLED";
    const netTotal =
      order.status === "CANCELLED"
        ? 0
        : order.total || calculatedSubtotal - order.discount;
    const activeItems = order.items.filter(
      (item) => item.arrivalStatus !== "MISSING",
    );

    return (
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title="Detalle de Pedido"
        size="md"
        footer={
          <Button
            variant="outline"
            onClick={onClose}
            className="border-border-strong text-text-primary hover:bg-bg-surface"
          >
            Cerrar
          </Button>
        }
      >
        <div className="max-w-md mx-auto font-sans text-sm text-text-primary space-y-4 p-2 md:p-4 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-xs">
          {/* Header */}
          <div className="text-center pb-3 border-b border-dashed border-beauty-500/20 flex flex-col items-center">
            {systemConfig?.systemLogoUrl ? (
              <img
                src={systemConfig.systemLogoUrl}
                alt={systemConfig.systemName || "Logo"}
                className="w-12 h-12 object-contain mb-2 rounded-xl bg-bg-surface p-0.5 border border-border-soft"
              />
            ) : null}
            <h3 className="text-xl font-black text-beauty-600 dark:text-beauty-400 tracking-widest">
              {systemConfig?.systemName || "Inventario"}
            </h3>
            <p className="text-[10px] text-text-primary font-bold uppercase tracking-widest mt-4 text-start">
              {(order.campaign as any).company?.name ||
                order.items[0]?.brand.name ||
                ""}{" "}
              - Campaña {order.campaign.number}
            </p>
            <div className="text-left mt-2 text-xs text-text-secondary space-y-1">
              <div>
                <span className="font-bold text-text-primary">
                  F. Registro:
                </span>{" "}
                {formatDate(order.createdAt)}
              </div>
            </div>
          </div>

          {/* Items Table */}
          <div className="py-2">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-bg-surface text-text-secondary font-bold uppercase text-[10px] tracking-wider border-y border-dashed border-beauty-500/20">
                  <th className="py-2.5 px-2">PROD.</th>
                  <th className="py-2.5 px-2 text-center w-12">CANT.</th>
                  <th className="py-2.5 px-2 text-right w-20">P. UNIT</th>
                  <th className="py-2.5 px-2 text-right w-20">TOTAL</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-dashed divide-beauty-500/10">
                {activeItems.length === 0 ? (
                  <tr>
                    <td
                      colSpan={4}
                      className="py-4 text-center text-text-tertiary"
                    >
                      No hay productos registrados (o están en estado Faltante).
                    </td>
                  </tr>
                ) : (
                  activeItems.map((item) => {
                    const isSubstituted = item.arrivalStatus === "SUBSTITUTED";
                    const displayName = isSubstituted
                      ? `${item.productName} (Sustituido por: ${item.substituteName})`
                      : item.productName;
                    const displayPrice =
                      isSubstituted && item.substitutePrice !== null
                        ? item.substitutePrice
                        : item.catalogPrice;

                    return (
                      <tr key={item.id}>
                        <td className="py-3 px-2">
                          <span className="font-bold text-text-primary block leading-tight">
                            {displayName}
                          </span>
                          <span className="text-[10px] text-text-tertiary mt-0.5 block">
                            Marca: {item.brand.name}
                          </span>
                        </td>
                        <td className="py-3 px-2 text-center font-mono font-bold text-text-secondary">
                          {item.quantity}
                        </td>
                        <td className="py-3 px-2 text-right font-mono text-text-secondary">
                          {displayPrice.toFixed(2)}
                        </td>
                        <td className="py-3 px-2 text-right font-mono font-bold text-text-primary">
                          {(item.quantity * displayPrice).toFixed(2)}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Totales */}
          {isDeliveredOrCancelled && (
            <div className="pt-3 border-t border-dashed border-beauty-500/20 flex flex-col items-end gap-1.5 text-xs">
              <div className="flex justify-between w-full max-w-50 text-text-secondary text-right">
                <span>Subtotal:</span>
                <span className="font-mono">
                  S/ {calculatedSubtotal.toFixed(2)}
                </span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between w-full max-w-50 text-danger-text font-semibold text-right">
                  <span>Descuento:</span>
                  <span className="font-mono">
                    -S/ {order.discount.toFixed(2)}
                  </span>
                </div>
              )}
              <div className="flex justify-between w-full max-w-50 text-sm font-black text-beauty-600 dark:text-beauty-400 text-right">
                <span>Total Neto:</span>
                <span className="font-mono text-base">
                  S/ {netTotal.toFixed(2)}
                </span>
              </div>
            </div>
          )}

          {/* Plazo / Mensaje de Pago */}
          {order.status === "DELIVERED" && order.notes && (
            <div className="mt-4 p-3 border border-dashed border-beauty-500/30 bg-beauty-500/5 rounded-2xl text-[11px] text-text-secondary">
              <span className="font-bold uppercase tracking-wider block text-[9px] mb-1">
                Nota de Pago:
              </span>
              {order.notes}
            </div>
          )}

          {/* Fecha límite de pago - Fuera de totales y llamativo */}
          {order.paymentDate && (
            <div className="mt-4 p-3 bg-beauty-500/10 border border-dashed border-beauty-500/30 text-beauty-600 dark:text-beauty-400 rounded-xl text-center font-extrabold text-[12px] select-none">
              Fecha límite de pago hasta {formatOnlyDate(order.paymentDate)}
            </div>
          )}

          {/* Footer */}
          <div className="text-center pt-4 border-t border-dashed border-beauty-500/20 mt-4 select-none">
            <p className="text-xs font-black text-beauty-500 dark:text-beauty-400 tracking-wider">
              ¡GRACIAS POR TU PREFERENCIA!
            </p>
          </div>
        </div>
      </Modal>
    );
  }

  // VISTA ADMINISTRATIVA NORMAL
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Ficha de Pedido de Catálogo"
      size="xl"
      footer={
        <Button
          variant="outline"
          onClick={onClose}
          className="border-border-strong text-text-primary hover:bg-bg-surface"
        >
          Cerrar
        </Button>
      }
    >
      <div className="p-4 md:p-6 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-xs font-sans text-zinc-900 dark:text-zinc-100 space-y-6">
        {/* Cabecera */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b-2 border-dashed border-zinc-200 dark:border-zinc-800 pb-5 select-none">
          <div className="flex items-center gap-3">
            {systemConfig?.systemLogoUrl ? (
              <img
                src={systemConfig.systemLogoUrl}
                alt={systemConfig.systemName || "Logo"}
                className="w-12 h-12 object-contain rounded-xl bg-bg-surface p-0.5 border border-border-soft shrink-0"
              />
            ) : null}
            <div>
              <h3 className="text-xl font-black text-beauty-600 dark:text-beauty-400 tracking-widest">
                {systemConfig?.systemName || "Inventario"}
              </h3>
              <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest mt-1">
                {(order.campaign as any).company?.name ||
                  order.items[0]?.brand.name ||
                  ""}{" "}
                - Campaña {order.campaign.number}
              </p>
            </div>
          </div>
          <div className="border-2 border-beauty-400 rounded-xl p-3 text-center min-w-45 self-stretch sm:self-auto">
            <span className="text-[10px] font-extrabold text-beauty-600 dark:text-beauty-400 uppercase tracking-widest">
              Campaña Catálogo
            </span>
            <div className="text-base font-mono font-black text-beauty-600 dark:text-beauty-400 mt-1">
              N° PC-{order.id.toString().padStart(6, "0")}
            </div>
          </div>
        </div>

        {/* Datos Cliente & Emisión */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="space-y-2.5">
            <div className="flex items-start">
              <span className="w-24 text-zinc-400 font-bold uppercase tracking-wider shrink-0 select-none">
                Cliente:
              </span>
              <span className="font-bold text-zinc-900 dark:text-zinc-100">
                {order.client.name}
              </span>
            </div>
            <div className="flex items-start">
              <span className="w-24 text-zinc-400 font-bold uppercase tracking-wider shrink-0 select-none">
                Estado Pedido:
              </span>
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                  statusColors[order.status]
                }`}
              >
                {statusTranslations[order.status] || order.status}
              </span>
            </div>
          </div>
          <div className="space-y-2.5">
            <div className="flex items-start">
              <span className="w-24 text-zinc-400 font-bold uppercase tracking-wider shrink-0 select-none">
                F. Registro:
              </span>
              <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                {formatDate(order.createdAt)}
              </span>
            </div>
          </div>
        </div>

        {/* Separador */}
        <hr className="border-t border-dashed border-zinc-200 dark:border-zinc-800" />

        {/* Productos Table */}
        <div className="overflow-x-auto select-none">
          <table className="w-full text-left text-xs sm:text-sm border-collapse">
            <thead>
              <tr className="bg-zinc-50 dark:bg-zinc-900 text-zinc-500 dark:text-zinc-400 font-bold uppercase text-[10px] tracking-wider border-b-2 border-dashed border-zinc-200 dark:border-zinc-800">
                <th className="py-2.5 px-3 w-28">Cód. Prod</th>
                <th className="py-2.5 px-3">Prod.</th>
                <th className="py-2.5 px-3 text-center w-20">Cant.</th>
                <th className="py-2.5 px-3 text-center w-28">Estado</th>
                <th className="py-2.5 px-3 text-right w-28">Precio</th>
                <th className="py-2.5 px-3 text-right w-28">Subtotal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dashed divide-zinc-200 dark:divide-zinc-800">
              {order.items.map((item) => {
                const isSubstituted = item.arrivalStatus === "SUBSTITUTED";
                const displayCode = isSubstituted
                  ? item.substituteCode
                  : item.productCode;
                const displayName = isSubstituted
                  ? `${item.productName} (Sustituido por: ${item.substituteName})`
                  : item.productName;
                const displayPrice =
                  isSubstituted && item.substitutePrice !== null
                    ? item.substitutePrice
                    : item.catalogPrice;

                return (
                  <tr
                    key={item.id}
                    className="hover:bg-zinc-50/50 dark:hover:bg-zinc-900/30"
                  >
                    <td className="py-3 px-3 font-mono text-zinc-500 dark:text-zinc-400 text-xs">
                      {displayCode || "-"}
                    </td>
                    <td className="py-3 px-3">
                      <div className="flex flex-col">
                        <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                          {displayName}
                        </span>
                        <span className="text-[10px] text-text-tertiary mt-0.5">
                          Marca: {item.brand.name}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-3 text-center font-mono font-medium text-zinc-900 dark:text-zinc-100">
                      {item.quantity}
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                          itemStatusColors[item.arrivalStatus]
                        }`}
                      >
                        {itemStatusTranslations[item.arrivalStatus] ||
                          item.arrivalStatus}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right font-mono text-zinc-500 dark:text-zinc-400">
                      {displayPrice.toFixed(2)}
                    </td>
                    <td className="py-3 px-3 text-right font-mono font-bold text-zinc-900 dark:text-zinc-100">
                      {item.arrivalStatus === "MISSING"
                        ? "0.00"
                        : (item.quantity * displayPrice).toFixed(2)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Separador */}
        <hr className="border-t border-dashed border-zinc-200 dark:border-zinc-800" />

        {/* Resumen Final */}
        <div className="flex flex-col md:flex-row gap-6 justify-between items-start">
          <div className="flex-1 w-full">
            {order.notes ? (
              <div className="p-3.5 border-l-4 border-beauty-400 bg-zinc-50 dark:bg-zinc-900 rounded-r-xl text-xs space-y-1">
                <span className="font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider text-[10px] select-none">
                  Observaciones:
                </span>
                <p className="text-zinc-600 dark:text-zinc-300 italic">
                  {order.notes}
                </p>
              </div>
            ) : (
              <div className="h-full"></div>
            )}
          </div>

          <div className="w-full md:w-64 space-y-3">
            <div className="border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 bg-zinc-50/50 dark:bg-zinc-900/30 space-y-2.5">
              <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400 select-none">
                <span>SUBTOTAL:</span>
                <span className="font-mono font-bold">
                  S/ {calculatedSubtotal.toFixed(2)}
                </span>
              </div>
              {order.discount > 0 && (
                <div className="flex items-center justify-between text-xs text-danger-text font-medium select-none">
                  <span>DESCUENTO:</span>
                  <span className="font-mono font-bold">
                    -S/ {order.discount.toFixed(2)}
                  </span>
                </div>
              )}
              <hr className="border-t border-dashed border-zinc-200 dark:border-zinc-800" />
              <div className="flex items-center justify-between text-sm font-black text-beauty-500 dark:text-beauty-400 select-none">
                <span>TOTAL NETO:</span>
                <span className="font-mono text-base">
                  S/{" "}
                  {order.status === "CANCELLED"
                    ? "0.00"
                    : (
                        order.total || calculatedSubtotal - order.discount
                      ).toFixed(2)}
                </span>
              </div>
            </div>
            {order.paymentDate && (
              <div className="p-3 bg-beauty-500/10 border border-dashed border-beauty-500/30 text-beauty-600 dark:text-beauty-400 rounded-xl text-center font-extrabold text-[12.5px] select-none">
                Fecha límite de pago hasta {formatOnlyDate(order.paymentDate)}
              </div>
            )}
          </div>
        </div>

        {/* Info Deuda */}
        <div className="bg-bg-surface/50 border border-border-default/60 rounded-xl p-3 text-center text-xs text-text-secondary select-none font-medium">
          {order.status === "DELIVERED" ? (
            <span className="text-success-text">
              ✔ Este pedido fue entregado el{" "}
              {order.deliveredAt ? formatDate(order.deliveredAt) : "N/A"} y se
              encuentra sumado al saldo del cliente.
            </span>
          ) : order.status === "CANCELLED" ? (
            <span className="text-danger-text">
              ⚠ Este pedido se encuentra en estado "Cancelado" y no alterará el
              saldo del cliente.
            </span>
          ) : (
            <span className="text-text-tertiary">
              ⚠ Este pedido se encuentra en estado "
              {statusTranslations[order.status]}" y no alterará el saldo del
              cliente hasta ser marcado como "Entregado".
            </span>
          )}
        </div>
      </div>
    </Modal>
  );
}

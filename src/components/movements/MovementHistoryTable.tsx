"use client";

import { FiEye, FiTrash2, FiCalendar, FiArrowDownLeft, FiArrowUpRight, FiPlus } from "react-icons/fi";
import { formatDateLocal } from "@/utils/date.utils";
import ErrorBoundary from "@/components/error/ErrorBoundary";
import ButtonIcon from "@/components/ui/ButtonIcon";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/Table";

export interface MovementItem {
  id: string; // E.g., 'ds-1', 'co-2', 'ed-3', 'p-4'
  originalId: number;
  type: "VENTA_DIRECTA" | "PEDIDO_CATALOGO" | "DEUDA_EXTERNA" | "PAGO";
  date: string;
  amount: number;
  description: string;
  status?: string; // Optional (e.g., DELIVERED, PENDING) for campaign orders
  raw: any; // Raw object for detail modals
}

interface MovementHistoryTableProps {
  movements: MovementItem[];
  onViewDirectSale: (sale: any) => void;
  onViewCampaignOrder: (order: any) => void;
  onDeletePayment: (id: number) => void;
  onDeleteExternalDebt: (id: number) => void;
  canDeletePayment: boolean;
  canDeleteDebt: boolean;
}

const typeConfig = {
  VENTA_DIRECTA: {
    label: "Venta Directa",
    badge: "bg-beauty-100 text-beauty-800 dark:bg-beauty-900/60 dark:text-beauty-200 border-beauty-400/10",
    icon: FiArrowUpRight,
    iconColor: "text-pink-500",
    sign: "+",
    signColor: "text-text-primary",
  },
  PEDIDO_CATALOGO: {
    label: "Pedido Catálogo",
    badge: "bg-info-bg/50 border-info-text/10 text-info-text",
    icon: FiArrowUpRight,
    iconColor: "text-info-text",
    sign: "+",
    signColor: "text-text-primary",
  },
  DEUDA_EXTERNA: {
    label: "Deuda Externa",
    badge: "bg-warning-bg/50 border-warning-text/10 text-warning-text",
    icon: FiPlus,
    iconColor: "text-warning-text",
    sign: "+",
    signColor: "text-warning-text",
  },
  PAGO: {
    label: "Abono / Pago",
    badge: "bg-success-bg/50 border-success-text/10 text-success-text",
    icon: FiArrowDownLeft,
    iconColor: "text-success-text",
    sign: "-",
    signColor: "text-success-text",
  },
};

const orderStatusTranslations: Record<string, string> = {
  PENDING: "Pendiente",
  VERIFIED: "Verificado",
  PACKED: "Empacado",
  DELIVERED: "Entregado",
  CANCELLED: "Cancelado",
};

export default function MovementHistoryTable({
  movements,
  onViewDirectSale,
  onViewCampaignOrder,
  onDeletePayment,
  onDeleteExternalDebt,
  canDeletePayment,
  canDeleteDebt,
}: MovementHistoryTableProps) {

  return (
    <ErrorBoundary variant="embedded" title="Historial de Movimientos">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-28">Fecha</TableHead>
            <TableHead className="w-36">Tipo Movimiento</TableHead>
            <TableHead className="hidden md:table-cell">Detalle</TableHead>
            <TableHead className="text-right w-32">Monto</TableHead>
            <TableHead className="text-center w-28">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {movements.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={5}
                className="text-center py-12 text-text-tertiary"
              >
                No se registraron movimientos en la cuenta de este cliente.
              </TableCell>
            </TableRow>
          ) : (
            movements.map((movement) => {
              const config = typeConfig[movement.type];
              const Icon = config.icon;
              const isCatalog = movement.type === "PEDIDO_CATALOGO";
              const isDelivered = isCatalog && movement.status === "DELIVERED";
              const isCancelled = isCatalog && movement.status === "CANCELLED";

              // Si un pedido de catálogo no ha sido entregado o está cancelado, no suma a la deuda real en el historial visual
              const isEffectiveDebt = !isCatalog || isDelivered;
              const displaySign = isEffectiveDebt ? config.sign : "";
              const displayColor = isEffectiveDebt ? config.signColor : "text-text-tertiary/60 line-through";

              return (
                <TableRow key={movement.id} className={isCancelled ? "opacity-60" : ""}>
                  {/* Fecha */}
                  <TableCell>
                    <div className="flex items-center gap-1.5 text-text-secondary text-xs sm:text-sm font-medium">
                      <FiCalendar className="w-3.5 h-3.5 text-text-tertiary" />
                      <span suppressHydrationWarning>{formatDateLocal(movement.date)}</span>
                    </div>
                  </TableCell>

                  {/* Tipo Movimiento Badge */}
                  <TableCell>
                    <div className="flex flex-col gap-1 items-start">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${config.badge
                          }`}
                      >
                        <Icon className={`w-3 h-3 mr-1 shrink-0 ${config.iconColor}`} />
                        {config.label}
                      </span>

                      {/* Mostrar estado solo si es pedido de catálogo */}
                      {isCatalog && (
                        <span className={`text-[9px] font-bold px-1.5 rounded-md border ${isDelivered
                          ? "bg-success-bg/30 text-success-text border-success-text/10"
                          : isCancelled
                            ? "bg-danger-bg/30 text-danger-text border-danger-text/10"
                            : "bg-warning-bg/30 text-warning-text border-warning-text/10"
                          }`}>
                          Estado: {orderStatusTranslations[movement.status!] || movement.status}
                        </span>
                      )}
                    </div>
                  </TableCell>

                  {/* Detalle / Glosa */}
                  <TableCell className="hidden md:table-cell text-xs sm:text-sm text-text-primary">
                    <div className="font-semibold">{movement.description}</div>
                    {movement.raw.note && (
                      <div className="text-[11px] text-text-tertiary mt-0.5 italic">
                        Nota: {movement.raw.note}
                      </div>
                    )}
                    {movement.raw.notes && (
                      <div className="text-[11px] text-text-tertiary mt-0.5 italic">
                        Obs: {movement.raw.notes}
                      </div>
                    )}
                    {/* Indicar si el pedido no suma a deuda */}
                    {isCatalog && !isDelivered && !isCancelled && (
                      <div className="text-[10px] text-warning-text font-medium mt-0.5">
                        * No suma al saldo hasta ser entregado
                      </div>
                    )}
                  </TableCell>

                  {/* Monto */}
                  <TableCell className={`text-right font-mono font-bold text-sm ${displayColor}`}>
                    {displaySign} S/ {movement.amount.toFixed(2)}
                  </TableCell>

                  {/* Acciones */}
                  <TableCell className="text-center">
                    <div className="flex items-center justify-center gap-2">
                      {/* Ver detalles para Ventas o Pedidos */}
                      {movement.type === "VENTA_DIRECTA" && (
                        <ButtonIcon
                          onClick={() => onViewDirectSale(movement.raw)}
                          variant="beauty"
                          icon={FiEye}
                          title="Ver boleta de venta"
                        />
                      )}
                      {movement.type === "PEDIDO_CATALOGO" && (
                        <ButtonIcon
                          onClick={() => onViewCampaignOrder(movement.raw)}
                          variant="beauty"
                          icon={FiEye}
                          title="Ver detalles del pedido"
                        />
                      )}

                      {/* Eliminar pagos o deudas externas */}
                      {movement.type === "PAGO" && canDeletePayment && (
                        <ButtonIcon
                          onClick={() => onDeletePayment(movement.originalId)}
                          variant="danger"
                          icon={FiTrash2}
                          title="Anular Pago"
                        />
                      )}
                      {movement.type === "DEUDA_EXTERNA" && canDeleteDebt && (
                        <ButtonIcon
                          onClick={() => onDeleteExternalDebt(movement.originalId)}
                          variant="danger"
                          icon={FiTrash2}
                          title="Anular Deuda Externa"
                        />
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </ErrorBoundary>
  );
}

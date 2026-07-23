"use client";

import { useState } from "react";
import { formatDateTime } from "@/utils/date.utils";
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
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import { FiEye, FiCalendar, FiUser, FiFileText } from "react-icons/fi";
import { SerializedStockMovement } from "@/types/stockmovement";
import { cn } from "@/utils/cn.utils";

interface TableInventoryProps {
  movements: SerializedStockMovement[];
  currentPage: number;
  itemsPerPage: number;
}

const translateReason = (reason: string, type?: string) => {
  switch (reason) {
    case "PURCHASE":
      return "Compra";
    case "SALE":
      return "Venta";
    case "GIFT":
      return type === "INPUT" ? "Regalo Recibido" : "Regalo a Cliente";
    case "PERSONAL_USE":
      return "Uso Personal";
    case "LOSS_OR_DAMAGE":
      return "Pérdida o Daño";
    case "ADJUSTMENT":
      return type === "INPUT" ? "Ajuste (Ingreso)" : "Ajuste (Salida)";
    case "RETURN":
      return "Devolución";
    case "LOAN":
      return type === "INPUT" ? "Retorno de Préstamo" : "Préstamo";
    default:
      return reason;
  }
};

const getReasonBadgeClass = (reason: string) => {
  switch (reason) {
    case "PURCHASE":
      return "bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/10";
    case "SALE":
      return "bg-success-bg text-success-text border border-success-text/10";
    case "GIFT":
      return "bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/10";
    case "PERSONAL_USE":
      return "bg-pink-500/10 text-pink-600 dark:text-pink-400 border border-pink-500/10";
    case "LOSS_OR_DAMAGE":
      return "bg-danger-bg text-danger-text border border-danger-text/15";
    case "ADJUSTMENT":
      return "bg-bg-surface text-text-secondary border border-border-default/60";
    case "RETURN":
      return "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/10";
    case "LOAN":
      return "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/10";
    default:
      return "bg-bg-surface text-text-secondary border border-border-default/60";
  }
};

export default function TableInventory({
  movements,
  currentPage,
  itemsPerPage,
}: TableInventoryProps) {
  const [activeDetail, setActiveDetail] =
    useState<SerializedStockMovement | null>(null);

  return (
    <ErrorBoundary variant="embedded" title="Tabla de Kardex">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="text-center w-16">N°</TableHead>
            <TableHead className="text-left w-28">Código</TableHead>
            <TableHead className="text-left">Producto</TableHead>
            <TableHead className="text-center w-24">Cantidad</TableHead>
            <TableHead className="text-left w-36">Motivo</TableHead>
            <TableHead className="text-left">Notas / Observaciones</TableHead>
            <TableHead className="text-left w-44">Fecha y Hora</TableHead>
            <TableHead className="text-left w-32">Registrado por</TableHead>
            <TableHead className="text-center w-20">Detalle</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {movements.map((movement, index) => {
            const isInput = movement.type === "INPUT";

            return (
              <TableRow key={movement.id}>
                {/* Número */}
                <TableCell className="font-mono text-xs text-text-tertiary text-center">
                  {(currentPage - 1) * itemsPerPage + index + 1}
                </TableCell>

                {/* Código */}
                <TableCell className="text-left font-mono text-xs text-text-secondary">
                  {movement.product.code || (
                    <span className="text-text-tertiary italic">
                      Sin código
                    </span>
                  )}
                </TableCell>

                {/* Info Principal del Producto */}
                <TableCell className="text-left">
                  <div className="font-semibold text-text-primary text-sm leading-snug">
                    {movement.product.name}
                  </div>
                </TableCell>

                {/* Cantidad (Con Badge de entrada o salida) */}
                <TableCell className="text-center">
                  <span
                    className={cn(
                      "px-2.5 py-0.5 rounded-full text-xs font-bold font-mono tracking-wide",
                      isInput
                        ? "bg-success-bg text-success-text"
                        : "bg-danger-bg text-danger-text",
                    )}
                  >
                    {isInput ? "+" : "-"}
                    {movement.quantity}
                  </span>
                </TableCell>

                {/* Motivo */}
                <TableCell className="text-left select-none py-2.5">
                  <div className="flex flex-col gap-0.5 items-start">
                    <span
                      className={cn(
                        "inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider",
                        getReasonBadgeClass(movement.reason),
                      )}
                    >
                      {translateReason(movement.reason, movement.type)}
                    </span>
                    <span className="text-[9px] text-text-tertiary font-semibold tracking-wide uppercase">
                      {isInput ? "Ingreso de stock" : "Salida de stock"}
                    </span>
                  </div>
                </TableCell>

                {/* Notas */}
                <TableCell className="text-left text-xs text-text-secondary">
                  <div
                    className="block truncate max-w-30 sm:max-w-50"
                    title={movement.notes || ""}
                  >
                    {movement.notes || (
                      <span className="text-text-tertiary italic">
                        Sin notas
                      </span>
                    )}
                  </div>
                </TableCell>

                {/* Fecha y Hora */}
                <TableCell className="text-left font-mono text-xs text-text-secondary">
                  <span suppressHydrationWarning>
                    {formatDateTime(movement.createdAt)}
                  </span>
                </TableCell>

                {/* Registrado por */}
                <TableCell className="text-left text-xs text-text-secondary">
                  <div
                    className="truncate max-w-30"
                    title={movement.createdBy.name}
                  >
                    {movement.createdBy.name}
                  </div>
                </TableCell>

                {/* Acciones */}
                <TableCell className="text-center">
                  <ButtonIcon
                    onClick={() => setActiveDetail(movement)}
                    variant="info"
                    icon={FiEye}
                    title="Ver detalle del movimiento"
                  />
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>

      {/* Modal de Detalle */}
      {activeDetail && (
        <Modal
          isOpen={!!activeDetail}
          onClose={() => setActiveDetail(null)}
          title="Detalle de Movimiento de Stock"
          size="md"
          footer={
            <Button
              variant="outline"
              onClick={() => setActiveDetail(null)}
              className="border-border-strong text-text-primary hover:bg-bg-surface px-6"
            >
              Cerrar
            </Button>
          }
        >
          <div className="space-y-5">
            {/* Cabecera del Producto */}
            <div className="p-4 rounded-2xl bg-bg-surface border border-border-default/60">
              <span className="text-[10px] font-bold tracking-wider text-beauty-500 uppercase">
                {activeDetail.product.brand?.name || "Sin Marca"}
              </span>
              <h4 className="font-semibold text-text-primary text-base leading-snug truncate">
                {activeDetail.product.name}
              </h4>
              {activeDetail.product.code && (
                <p className="text-xs font-mono text-text-tertiary mt-0.5">
                  Código: {activeDetail.product.code}
                </p>
              )}
            </div>

            {/* Detalles del Ajuste */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-3.5 rounded-2xl bg-bg-card border border-border-default/50 space-y-1">
                <span className="text-[10px] font-medium text-text-tertiary uppercase tracking-wider block">
                  Tipo de Movimiento
                </span>
                <span
                  className={cn(
                    "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold font-mono tracking-wide",
                    activeDetail.type === "INPUT"
                      ? "bg-success-bg text-success-text"
                      : "bg-danger-bg text-danger-text",
                  )}
                >
                  {activeDetail.type === "INPUT" ? "+" : "-"}
                  {activeDetail.quantity} unidades
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-bg-card border border-border-default/50 space-y-1">
                <span className="text-[10px] font-medium text-text-tertiary uppercase tracking-wider block">
                  Motivo
                </span>
                <div className="flex flex-col gap-0.5 items-start">
                  <span
                    className={cn(
                      "inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider",
                      getReasonBadgeClass(activeDetail.reason),
                    )}
                  >
                    {translateReason(activeDetail.reason, activeDetail.type)}
                  </span>
                  <span className="text-[9px] text-text-tertiary font-semibold tracking-wide uppercase">
                    {activeDetail.type === "INPUT"
                      ? "Ingreso de stock"
                      : "Salida de stock"}
                  </span>
                </div>
              </div>
            </div>

            {/* Sección de Notas / Justificación */}
            <div className="p-4 rounded-2xl bg-bg-card border border-border-default/50 space-y-2">
              <div className="flex items-center gap-2 text-text-secondary text-xs font-semibold">
                <FiFileText className="w-3.5 h-3.5 text-text-tertiary" />
                <span>Notas / Justificación del Ajuste</span>
              </div>
              <p className="text-xs text-text-primary whitespace-pre-wrap leading-relaxed">
                {activeDetail.notes || (
                  <span className="text-text-tertiary italic">
                    Sin notas ni observaciones registradas.
                  </span>
                )}
              </p>
            </div>

            {/* Auditoría / Registro */}
            <div className="p-4 rounded-2xl bg-bg-surface border border-border-default/40 space-y-3">
              <div className="flex items-center gap-3 text-xs text-text-secondary">
                <FiCalendar className="w-4 h-4 text-text-tertiary shrink-0" />
                <div>
                  <span className="text-[10px] text-text-tertiary block uppercase font-medium">
                    Fecha y Hora de Registro
                  </span>
                  <span
                    suppressHydrationWarning
                    className="font-medium text-text-primary"
                  >
                    {formatDateTime(activeDetail.createdAt)}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3 text-xs text-text-secondary border-t border-border-default/30 pt-2.5">
                <FiUser className="w-4 h-4 text-text-tertiary shrink-0" />
                <div>
                  <span className="text-[10px] text-text-tertiary block uppercase font-medium">
                    Registrado por
                  </span>
                  <span className="font-medium text-text-primary">
                    {activeDetail.createdBy.name}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </ErrorBoundary>
  );
}

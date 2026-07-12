"use client";

import { useState } from "react";
import { cn } from "@/utils/cn.utils";
import { FiDollarSign, FiEye, FiCalendar } from "react-icons/fi";
import { MovementItem } from "./MovementHistoryTable";
import DetailSaleModal from "@/components/direct-sales/DetailSaleModal";
import OrderDetailModal from "./OrderDetailModal";
import Pagination from "@/components/ui/Pagination";
import ButtonIcon from "@/components/ui/ButtonIcon";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/Table";

interface ClientPublicPortalProps {
  client: {
    id: number;
    name: string;
    phone: string | null;
    address: string | null;
    notes: string | null;
    shareToken: string;
    createdAt: string;
  };
  movements: MovementItem[];
  balance: number;
  currentPage: number;
  totalPages: number;
  totalItems: number;
}

const typeTranslations: Record<string, string> = {
  VENTA_DIRECTA: "Venta Directa",
  PEDIDO_CATALOGO: "Pedido Catálogo",
  DEUDA_EXTERNA: "Deuda Adicional",
  PAGO: "Abono / Pago",
};

const typeColors: Record<string, string> = {
  VENTA_DIRECTA: "bg-pink-100 text-pink-800 dark:bg-pink-900/40 dark:text-pink-200 border-pink-200/20",
  PEDIDO_CATALOGO: "bg-info-bg/50 border-info-text/10 text-info-text",
  DEUDA_EXTERNA: "bg-warning-bg/40 border-warning-text/10 text-warning-text",
  PAGO: "bg-success-bg/40 border-success-text/10 text-success-text",
};

export default function ClientPublicPortal({
  client,
  movements,
  balance,
  currentPage,
  totalPages,
  totalItems,
}: ClientPublicPortalProps) {
  const [selectedSale, setSelectedSale] = useState<any | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);

  const formatDate = (dateInput: Date | string) => {
    try {
      const date = new Date(dateInput);
      return date.toLocaleDateString("es-ES", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
    } catch {
      return String(dateInput);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Grid: Bienvenida + Saldo Pendiente */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Tarjeta de Bienvenida */}
        <div className="lg:col-span-2 bg-bg-card border border-border-default/70 p-6 rounded-3xl shadow-xs flex flex-col justify-between select-none relative overflow-hidden bg-gradient-to-br from-beauty-500/5 to-pink-500/5 dark:from-beauty-900/10 dark:to-zinc-900/5 border-beauty-500/20">
          <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-beauty-500/10 dark:bg-beauty-500/5 rounded-full blur-3xl pointer-events-none" />

          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-beauty-500 to-pink-600 flex items-center justify-center text-white font-black text-lg shadow-sm shadow-beauty-500/20 shrink-0 select-none">
              {client.name.charAt(0).toUpperCase()}
            </div>
            <div className="space-y-1 flex-1">
              <span className="text-[10px] text-beauty-600 dark:text-beauty-400 font-extrabold uppercase tracking-widest block">
                Bienvenido(a) a tu portal
              </span>
              <h3 className="text-xl font-black text-text-primary tracking-tight">
                ¡Hola, {client.name}! 👋
              </h3>
              <p className="text-xs text-text-secondary">
                Aquí puedes consultar el detalle de tus compras, abonos y saldos en tiempo real.
              </p>
            </div>
          </div>
        </div>

        {/* Tarjeta de Saldo Pendiente */}
        <div
          className={cn(
            "border p-6 rounded-3xl shadow-sm flex flex-col justify-between transition-all duration-300 relative overflow-hidden",
            balance > 0.01
              ? "bg-gradient-to-br from-red-500/10 to-rose-500/5 border-red-500/20 dark:from-red-950/20 dark:to-zinc-950"
              : "bg-gradient-to-br from-green-500/10 to-emerald-500/5 border-green-500/20 dark:from-green-950/20 dark:to-zinc-950",
          )}
        >
          {/* Icono de fondo */}
          <div className="absolute right-4 top-4 opacity-10 dark:opacity-20 pointer-events-none">
            <FiDollarSign className={cn(
              "w-12 h-12",
              balance > 0.01 ? "text-red-500" : "text-green-500"
            )} />
          </div>

          <span className="text-[10px] text-text-tertiary font-extrabold uppercase tracking-wider block">
            Saldo pendiente
          </span>

          <div className="mt-3">
            <p
              className={cn(
                "text-3xl font-black font-mono tracking-tight",
                balance > 0.01
                  ? "text-danger-text"
                  : "text-success-text",
              )}
            >
              S/ {balance.toFixed(2)}
            </p>

            <div className="mt-2.5 flex items-center">
              <span
                className={cn(
                  "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold border shadow-xs select-none",
                  balance > 0.01
                    ? "bg-danger-bg/40 border-danger-text/10 text-danger-text"
                    : "bg-success-bg/40 border-success-text/10 text-success-text",
                )}
              >
                {balance > 0.01 ? (
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

      {/* Historial de Movimientos */}

      <div className="bg-bg-card border border-border-default/80 rounded-2xl shadow-xs overflow-hidden">
        <div className=" p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border-soft bg-bg-card">
          <h3 className="text-lg font-bold text-text-primary select-none">
            Historial de Movimientos
          </h3>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-left">Fecha</TableHead>
              <TableHead className="text-left">Tipo Movimiento</TableHead>
              <TableHead className="hidden md:table-cell text-left">Detalle</TableHead>
              <TableHead className="text-right">Monto</TableHead>
              <TableHead className="text-center w-24">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {movements.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="py-8 text-center text-text-tertiary italic">
                  No hay movimientos registrados en tu cuenta
                </TableCell>
              </TableRow>
            ) : (
              movements.map((m) => {
                const hasDetails = m.type === "VENTA_DIRECTA" || m.type === "PEDIDO_CATALOGO";
                const isPayment = m.type === "PAGO";
                const isNegative = isPayment;
                const isZero = Math.abs(m.amount) < 0.01;

                return (
                  <TableRow key={m.id}>
                    <TableCell className="whitespace-nowrap text-text-secondary select-none font-medium">
                      <div className="flex items-center gap-2">
                        <FiCalendar className="w-4 h-4 text-text-tertiary shrink-0" />
                        <span>{formatDate(m.date)}</span>
                      </div>
                    </TableCell>
                    <TableCell className="whitespace-nowrap select-none">
                      <span
                        className={cn(
                          "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border",
                          typeColors[m.type]
                        )}
                      >
                        {typeTranslations[m.type] || m.type}
                      </span>
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-text-primary font-medium">
                      {m.type === "PEDIDO_CATALOGO" ? (
                        <>{m.raw.campaign.company.name} - Campaña {m.raw.campaign.number}</>
                      ) : (
                        <>{m.description}</>
                      )}
                    </TableCell>
                    <TableCell
                      className={cn(
                        "text-right font-mono font-bold whitespace-nowrap",
                        isZero
                          ? "text-text-tertiary"
                          : isNegative
                            ? "text-success-text"
                            : "text-danger-text"
                      )}
                    >
                      {isZero
                        ? "S/ 0.00"
                        : `${isNegative ? "- " : "+ "}S/ ${m.amount.toFixed(2)}`}
                    </TableCell>
                    <TableCell className="text-center whitespace-nowrap">
                      {hasDetails ? (
                        <ButtonIcon
                          onClick={() => {
                            if (m.type === "VENTA_DIRECTA") setSelectedSale(m.raw);
                            else setSelectedOrder(m.raw);
                          }}
                          variant="beauty"
                          icon={FiEye}
                          title="Ver detalles"
                        />
                      ) : (
                        <span className="text-text-tertiary font-mono text-xs select-none">-</span>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
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
          isPublic={true}
        />
      )}

      {/* Modal de Detalle Pedido Catálogo */}
      {selectedOrder && (
        <OrderDetailModal
          isOpen={!!selectedOrder}
          onClose={() => setSelectedOrder(null)}
          order={selectedOrder}
          isPublic={true}
        />
      )}
    </div>
  );
}

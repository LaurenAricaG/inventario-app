"use client";

import Link from "next/link";
import { FiCalendar, FiTrash2 } from "react-icons/fi";
import { PaymentMethod } from "@/generated/prisma";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/Table";
import { cn } from "@/utils/cn.utils";

interface SerializedPayment {
  id: number;
  clientId: number;
  amount: number;
  method: PaymentMethod;
  note: string | null;
  paidAt: string;
  client: { id: number; name: string };
}

interface TablePaymentsProps {
  payments: SerializedPayment[];
  canDelete: boolean;
  onDelete: (id: number) => void;
}

const methodTranslations: Record<PaymentMethod, string> = {
  CASH: "Efectivo",
  YAPE: "Yape",
  PLIN: "Plin",
  BANK_TRANSFER: "Transf. Bancaria",
  OTHER: "Otro",
};

const badgeColors: Record<PaymentMethod, string> = {
  CASH: "bg-blue-50/70 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800",
  YAPE: "bg-purple-50/70 text-purple-700 border-purple-200 dark:bg-purple-900/20 dark:text-purple-300 dark:border-purple-800",
  PLIN: "bg-teal-50/70 text-teal-700 border-teal-200 dark:bg-teal-900/20 dark:text-teal-300 dark:border-teal-800",
  BANK_TRANSFER: "bg-indigo-50/70 text-indigo-700 border-indigo-200 dark:bg-indigo-900/20 dark:text-indigo-300 dark:border-indigo-800",
  OTHER: "bg-stone-50/70 text-stone-700 border-stone-200 dark:bg-stone-900/20 dark:text-stone-300 dark:border-stone-800",
};

export default function TablePayments({
  payments,
  canDelete,
  onDelete,
}: TablePaymentsProps) {
  const formatLocalDate = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleDateString("es-PE", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
    } catch {
      return isoString;
    }
  };

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="text-left w-[200px]">Cliente</TableHead>
            <TableHead className="text-right w-[110px]">Monto</TableHead>
            <TableHead className="text-center w-[120px]">Método</TableHead>
            <TableHead className="text-center w-[180px]">Fecha de Pago</TableHead>
            <TableHead className="text-left min-w-[200px]">Notas / Observaciones</TableHead>
            {canDelete && <TableHead className="text-center w-[80px]">Acciones</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {payments.map((payment) => (
            <TableRow key={payment.id} className="hover:bg-bg-surface/30">
              {/* Cliente */}
              <TableCell className="text-left font-bold text-text-primary">
                <Link
                  href={`/admin/movimientos/${payment.clientId}`}
                  className="hover:text-beauty-500 hover:underline transition-all"
                  title="Ver cuenta de movimientos del cliente"
                >
                  {payment.client.name}
                </Link>
                <span className="text-[10px] text-text-tertiary font-semibold block mt-0.5">
                  ID Cliente: {payment.clientId}
                </span>
              </TableCell>

              {/* Monto */}
              <TableCell className="text-right font-black font-mono text-success-text">
                S/ {payment.amount.toFixed(2)}
              </TableCell>

              {/* Método */}
              <TableCell className="text-center">
                <span
                  className={cn(
                    "inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border",
                    badgeColors[payment.method]
                  )}
                >
                  {methodTranslations[payment.method]}
                </span>
              </TableCell>

              {/* Fecha de Pago */}
              <TableCell className="text-center text-xs text-text-secondary font-medium whitespace-nowrap">
                <span suppressHydrationWarning className="flex items-center justify-center gap-1 font-semibold text-text-primary whitespace-nowrap">
                  <FiCalendar className="w-3.5 h-3.5 text-text-tertiary shrink-0" />
                  {formatLocalDate(payment.paidAt)}
                </span>
              </TableCell>

              {/* Notas */}
              <TableCell className="text-left text-xs text-text-secondary italic">
                {payment.note ? (
                  <p className="max-w-[200px] sm:max-w-[250px] truncate whitespace-nowrap" title={payment.note}>
                    {payment.note}
                  </p>
                ) : (
                  <span className="text-text-tertiary">Sin observaciones</span>
                )}
              </TableCell>

              {/* Acciones */}
              {canDelete && (
                <TableCell className="text-center">
                  <div className="flex justify-center">
                    <button
                      type="button"
                      onClick={() => onDelete(payment.id)}
                      className="p-2 rounded-xl bg-danger-bg/40 border border-danger-text/15 text-danger-text hover:bg-danger-bg/80 hover:border-danger-text/30 hover:scale-[1.04] active:scale-[0.96] transition-all duration-200 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-danger-text"
                      title="Anular Pago"
                    >
                      <FiTrash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

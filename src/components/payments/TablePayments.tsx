"use client";

import { FiCalendar, FiTrash2 } from "react-icons/fi";
import { PaymentMethod } from "@/generated/prisma";
import ButtonIcon from "@/components/ui/ButtonIcon";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/Table";
import { cn } from "@/utils/cn.utils";
import { formatDateLocal } from "@/utils/date.utils";
import LinkComponent from "next/link";

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

import {
  paymentMethodTranslations as methodTranslations,
  paymentMethodBadgeColors as badgeColors,
} from "@/utils/translations.utils";

export default function TablePayments({
  payments,
  canDelete,
  onDelete,
}: TablePaymentsProps) {
  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="text-left w-50">Cliente</TableHead>
            <TableHead className="text-right w-27.5">Monto</TableHead>
            <TableHead className="text-center w-30">Método</TableHead>
            <TableHead className="text-center w-45">Fecha de Pago</TableHead>
            <TableHead className="text-left min-w-50">
              Notas / Observaciones
            </TableHead>
            {canDelete && (
              <TableHead className="text-center w-20">Acciones</TableHead>
            )}
          </TableRow>
        </TableHeader>
        <TableBody>
          {payments.map((payment) => (
            <TableRow key={payment.id} className="hover:bg-bg-surface/30">
              <TableCell className="text-left font-semibold text-text-primary">
                <LinkComponent
                  href={`/admin/movimientos/${payment.client.id}?source=pagos`}
                  className="hover:text-beauty-500 transition-colors focus-visible:outline-none focus-visible:text-beauty-500"
                >
                  {payment.client.name}
                </LinkComponent>
                <span className="text-[10px] text-text-tertiary font-medium block mt-0.5">
                  ID: {payment.clientId}
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
                    badgeColors[payment.method],
                  )}
                >
                  {methodTranslations[payment.method]}
                </span>
              </TableCell>

              {/* Fecha de Pago */}
              <TableCell className="text-center text-xs text-text-secondary font-medium whitespace-nowrap">
                <span
                  suppressHydrationWarning
                  className="flex items-center justify-center gap-1 font-semibold text-text-primary whitespace-nowrap"
                >
                  <FiCalendar className="w-3.5 h-3.5 text-text-tertiary shrink-0" />
                  {formatDateLocal(payment.paidAt)}
                </span>
              </TableCell>

              {/* Notas */}
              <TableCell className="text-left text-xs text-text-secondary italic">
                {payment.note ? (
                  <p
                    className="max-w-50 sm:max-w-62.5 truncate whitespace-nowrap"
                    title={payment.note}
                  >
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
                    <ButtonIcon
                      onClick={() => onDelete(payment.id)}
                      variant="danger"
                      icon={FiTrash2}
                      title="Anular Pago"
                    />
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

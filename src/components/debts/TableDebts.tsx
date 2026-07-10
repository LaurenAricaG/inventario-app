"use client";

import Link from "next/link";
import { FiCalendar, FiTrash2 } from "react-icons/fi";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/Table";

interface SerializedDebt {
  id: number;
  clientId: number;
  amount: number;
  reason: string;
  notes: string | null;
  createdAt: string;
  client: { id: number; name: string };
}

interface TableDebtsProps {
  debts: SerializedDebt[];
  canDelete: boolean;
  onDelete: (id: number) => void;
}

export default function TableDebts({
  debts,
  canDelete,
  onDelete,
}: TableDebtsProps) {
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
            <TableHead className="text-left w-[200px]">Motivo</TableHead>
            <TableHead className="text-center w-[180px]">Fecha de Registro</TableHead>
            <TableHead className="text-left min-w-[200px]">Notas / Observaciones</TableHead>
            {canDelete && <TableHead className="text-center w-[80px]">Acciones</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {debts.map((debt) => (
            <TableRow key={debt.id} className="hover:bg-bg-surface/30">
              {/* Cliente */}
              <TableCell className="text-left font-bold text-text-primary">
                <Link
                  href={`/admin/movimientos/${debt.clientId}`}
                  className="hover:text-beauty-500 hover:underline transition-all"
                  title="Ver cuenta de movimientos del cliente"
                >
                  {debt.client.name}
                </Link>
                <span className="text-[10px] text-text-tertiary font-semibold block mt-0.5">
                  ID Cliente: {debt.clientId}
                </span>
              </TableCell>

              {/* Monto */}
              <TableCell className="text-right font-black font-mono text-danger-text">
                S/ {debt.amount.toFixed(2)}
              </TableCell>

              {/* Motivo */}
              <TableCell className="text-left text-xs font-semibold text-text-primary">
                {debt.reason}
              </TableCell>

              {/* Fecha */}
              <TableCell className="text-center text-xs text-text-secondary font-medium whitespace-nowrap">
                <span suppressHydrationWarning className="flex items-center justify-center gap-1 font-semibold text-text-primary whitespace-nowrap">
                  <FiCalendar className="w-3.5 h-3.5 text-text-tertiary shrink-0" />
                  {formatLocalDate(debt.createdAt)}
                </span>
              </TableCell>

              {/* Notas */}
              <TableCell className="text-left text-xs text-text-secondary italic">
                {debt.notes ? (
                  <p className="max-w-[200px] sm:max-w-[250px] truncate whitespace-nowrap" title={debt.notes}>
                    {debt.notes}
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
                      onClick={() => onDelete(debt.id)}
                      className="p-2 rounded-xl bg-danger-bg/40 border border-danger-text/15 text-danger-text hover:bg-danger-bg/80 hover:border-danger-text/30 hover:scale-[1.04] active:scale-[0.96] transition-all duration-200 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-danger-text"
                      title="Anular Deuda"
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

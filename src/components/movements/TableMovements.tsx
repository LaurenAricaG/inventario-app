"use client";

import { FiEye } from "react-icons/fi";
import ButtonIcon from "@/components/ui/ButtonIcon";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/Table";

export interface SerializedClientBalance {
  id: number;
  name: string;
  phone: string | null;
  address: string | null;
  totalSales: number;
  totalExternalDebts: number;
  totalPayments: number;
  balance: number;
}

interface TableMovementsProps {
  clients: SerializedClientBalance[];
  currentPage: number;
  itemsPerPage: number;
}

export default function TableMovements({
  clients,
  currentPage,
  itemsPerPage,
}: TableMovementsProps) {
  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="text-center w-16">N°</TableHead>
            <TableHead>Cliente</TableHead>
            <TableHead className="text-right">Compras Totales</TableHead>
            <TableHead className="text-right">Deudas Ext.</TableHead>
            <TableHead className="text-right">Total Pagado</TableHead>
            <TableHead className="text-right">Saldo Pendiente</TableHead>
            <TableHead className="text-center w-32">Estado</TableHead>
            <TableHead className="text-center w-20">Ficha</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {clients.map((client, index) => {
            const hasDebt = client.balance > 0.01;

            return (
              <TableRow key={client.id}>
                {/* N° Correlativo */}
                <TableCell className="font-mono text-xs text-text-tertiary text-center">
                  {(currentPage - 1) * itemsPerPage + index + 1}
                </TableCell>

                {/* Cliente Avatar y Nombre */}
                <TableCell>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-text-primary truncate leading-snug">
                      {client.name}
                    </p>
                    {client.phone && (
                      <p className="text-[11px] text-text-tertiary font-mono mt-0.5">
                        {client.phone}
                      </p>
                    )}
                  </div>
                </TableCell>

                {/* Compras Totales */}
                <TableCell className="text-right font-mono text-xs text-text-secondary">
                  S/ {client.totalSales.toFixed(2)}
                </TableCell>

                {/* Deudas Externas */}
                <TableCell className="text-right font-mono text-xs text-text-secondary">
                  S/ {client.totalExternalDebts.toFixed(2)}
                </TableCell>

                {/* Total Pagado */}
                <TableCell className="text-right font-mono text-xs text-text-secondary">
                  S/ {client.totalPayments.toFixed(2)}
                </TableCell>

                {/* Saldo Pendiente */}
                <TableCell
                  className={`text-right font-mono font-bold text-sm ${hasDebt
                    ? "text-danger-text"
                    : client.balance < -0.01
                      ? "text-success-text"
                      : "text-text-primary"
                    }`}
                >
                  S/ {client.balance.toFixed(2)}
                </TableCell>

                {/* Estado Badge */}
                <TableCell className="text-center">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${hasDebt
                      ? "bg-danger-bg/50 border-danger-text/10 text-danger-text"
                      : client.balance < -0.01
                        ? "bg-info-bg/50 border-info-text/10 text-info-text"
                        : "bg-success-bg/50 border-success-text/10 text-success-text"
                      }`}
                  >
                    {hasDebt
                      ? "Con Deuda"
                      : client.balance < -0.01
                        ? "A Favor"
                        : "Sin Deuda"}
                  </span>
                </TableCell>

                {/* Enlace Ficha Detalle */}
                <TableCell className="text-center">
                  <div className="flex justify-center">
                    <ButtonIcon
                      href={`/admin/movimientos/${client.id}`}
                      variant="beauty"
                      icon={FiEye}
                      title="Ver movimientos y saldos"
                    />
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}

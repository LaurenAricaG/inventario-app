import { FiArrowRight } from "react-icons/fi";
import Link from "next/link";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/Table";

export interface PendingDebtor {
  name: string;
  phone: string;
  lastOrder: string;
  debt: number;
  status: "Vencido" | "Pendiente";
}

interface TableDashboardProps {
  debtors: PendingDebtor[];
  debtorsCount: number;
  totalOutstanding: number;
  canViewTransactions?: boolean;
}

function getInitials(name: string) {
  return name
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase();
}

const avatarColors = [
  "bg-beauty-100 text-beauty-800",
  "bg-info-bg text-info-text",
  "bg-success-bg text-success-text",
  "bg-warning-bg text-warning-text",
  "bg-danger-bg text-danger-text",
];

export default function TableDashboard({
  debtors,
  debtorsCount,
  totalOutstanding,
  canViewTransactions = false,
}: TableDashboardProps) {
  return (
    <div className="bg-bg-card border border-border-default rounded-2xl overflow-hidden flex flex-col justify-between">
      <div>
        {/* Header de la tabla */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border-default">
          <div>
            <h3 className="font-semibold text-text-primary text-sm">
              Deudas pendientes por cobrar
            </h3>
            <p className="text-xs text-text-secondary mt-0.5">
              Clientes con saldos sin pagar (Top 5 mayores deudores)
            </p>
          </div>
          {canViewTransactions && (
            <Link
              href="/admin/movimientos"
              className="text-xs font-semibold text-beauty-600 hover:text-beauty-800 flex items-center gap-1 transition-colors"
            >
              Ver saldos
              <FiArrowRight className="w-3.5 h-3.5" />
            </Link>
          )}
        </div>

        {/* Tabla utilizando el componente común UI Table */}
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Cliente</TableHead>
              <TableHead>Última Operación</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="text-right">Deuda</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {debtors.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-10 text-text-secondary text-sm">
                  No hay deudas pendientes actualmente. ¡Buen trabajo!
                </TableCell>
              </TableRow>
            ) : (
              debtors.map((debtor, index) => (
                <TableRow key={index}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-semibold shrink-0 ${avatarColors[index % avatarColors.length]}`}
                      >
                        {getInitials(debtor.name)}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-text-primary leading-tight">
                          {debtor.name}
                        </p>
                        <p className="text-[11px] text-text-tertiary">
                          {debtor.phone}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-xs text-text-secondary">
                    {debtor.lastOrder}
                  </TableCell>
                  <TableCell>
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium ${
                        debtor.status === "Vencido"
                          ? "bg-danger-bg text-danger-text"
                          : "bg-warning-bg text-warning-text"
                      }`}
                    >
                      {debtor.status}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <span
                      className={`text-sm font-semibold ${
                        debtor.status === "Vencido"
                          ? "text-danger-text"
                          : "text-text-primary"
                      }`}
                    >
                      S/. {debtor.debt.toFixed(2)}
                    </span>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pie de tabla: total */}
      <div className="flex items-center justify-between px-6 py-3.5 bg-bg-surface border-t border-border-default">
        <p className="text-xs text-text-secondary">
          {debtorsCount} {debtorsCount === 1 ? 'cliente tiene deuda activa' : 'clientes tienen deuda activa'}
        </p>
        <p className="text-sm font-semibold text-text-primary">
          Por cobrar total:{" "}
          <span className="text-danger-text">
            S/. {totalOutstanding.toLocaleString("es-PE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        </p>
      </div>
    </div>
  );
}

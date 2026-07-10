"use client";

import { FiTrash2, FiCalendar, FiUser, FiInfo, FiEye, FiPrinter } from "react-icons/fi";
import { printDirectSale } from "@/utils/print-direct-sale";
import ErrorBoundary from "@/components/error/ErrorBoundary";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/Table";
import { SerializedDirectSaleWithRelations } from "@/types/direct-sale";

interface TableDirectSalesProps {
  sales: SerializedDirectSaleWithRelations[];
  currentPage: number;
  itemsPerPage: number;
  canDelete: boolean;
  onDelete: (sale: SerializedDirectSaleWithRelations) => void;
  onView: (sale: SerializedDirectSaleWithRelations) => void;
}

export default function TableDirectSales({
  sales,
  currentPage,
  itemsPerPage,
  canDelete,
  onDelete,
  onView,
}: TableDirectSalesProps) {
  // Format Date to Local format (only Date, no Time)
  const formatLocalDate = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleDateString("es-ES", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
    } catch {
      return isoString;
    }
  };

  return (
    <ErrorBoundary variant="embedded" title="Tabla de Ventas Directas">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="text-center w-16">N°</TableHead>
            <TableHead className="text-center w-24">Venta ID</TableHead>
            <TableHead className="hidden md:table-cell">Fecha</TableHead>
            <TableHead>Cliente</TableHead>
            <TableHead className="text-right">Subtotal</TableHead>
            <TableHead className="text-right">Descuento</TableHead>
            <TableHead className="text-right">Total</TableHead>
            <TableHead className="text-center w-28">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sales.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={8}
                className="text-center py-10 text-text-tertiary"
              >
                No se encontraron ventas directas registradas.
              </TableCell>
            </TableRow>
          ) : (
            sales.map((sale, index) => {
              const subtotal = sale.items.reduce(
                (sum, item) => sum + item.quantity * item.unitPrice,
                0
              );

              return (
                <TableRow key={sale.id}>
                  {/* N° Correlativo de tabla */}
                  <TableCell className="font-mono text-xs text-text-tertiary text-center">
                    {(currentPage - 1) * itemsPerPage + index + 1}
                  </TableCell>

                  {/* Venta ID */}
                  <TableCell className="font-mono text-xs font-semibold text-text-primary text-center">
                    #{sale.id}
                  </TableCell>

                  {/* Fecha de Creación */}
                  <TableCell className="hidden md:table-cell">
                    <div className="flex items-center gap-1.5 text-text-secondary text-xs sm:text-sm">
                      <FiCalendar className="w-3.5 h-3.5 text-text-tertiary" />
                      <span>{formatLocalDate(sale.createdAt)}</span>
                    </div>
                  </TableCell>

                  {/* Cliente */}
                  <TableCell>
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2">
                        <FiUser className="w-3.5 h-3.5 text-text-tertiary" />
                        <span className="font-medium text-text-primary">
                          {sale.client.name}
                        </span>
                      </div>
                      {sale.notes && (
                        <span className="text-[11px] text-text-tertiary mt-0.5 truncate max-w-[200px]" title={sale.notes}>
                          {sale.notes}
                        </span>
                      )}
                    </div>
                  </TableCell>

                  {/* Subtotal */}
                  <TableCell className="text-right font-mono text-xs text-text-secondary">
                    S/ {subtotal.toFixed(2)}
                  </TableCell>

                  {/* Descuento */}
                  <TableCell className="text-right font-mono text-xs text-text-secondary">
                    {sale.discount > 0 ? `-S/ ${sale.discount.toFixed(2)}` : "S/ 0.00"}
                  </TableCell>

                  {/* Total Cobrado */}
                  <TableCell className="text-right font-mono font-bold text-sm text-text-primary">
                    S/ {sale.total.toFixed(2)}
                  </TableCell>

                  {/* Acciones */}
                  <TableCell className="text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        type="button"
                        onClick={() => onView(sale)}
                        className="p-2 rounded-xl bg-bg-surface border border-border-default/60 text-text-secondary hover:bg-beauty-500/10 hover:border-beauty-500/30 hover:text-beauty-600 dark:hover:text-beauty-400 hover:scale-[1.04] active:scale-[0.96] transition-all duration-200 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-beauty-500/20"
                        title="Ver detalle de la venta"
                      >
                        <FiEye className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => printDirectSale(sale)}
                        className="p-2 rounded-xl bg-bg-surface border border-border-default/60 text-text-secondary hover:bg-beauty-500/10 hover:border-beauty-500/30 hover:text-beauty-600 dark:hover:text-beauty-400 hover:scale-[1.04] active:scale-[0.96] transition-all duration-200 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-beauty-500/20"
                        title="Imprimir boleta de venta"
                      >
                        <FiPrinter className="w-3.5 h-3.5" />
                      </button>
                      {canDelete && (
                        <button
                          type="button"
                          onClick={() => onDelete(sale)}
                          className="p-2 rounded-xl bg-danger-bg/40 border border-danger-text/15 text-danger-text hover:bg-danger-bg/80 hover:border-danger-text/30 hover:scale-[1.04] active:scale-[0.96] transition-all duration-200 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-danger-text/20"
                          title="Anular Venta Directa (Devolverá stock)"
                        >
                          <FiTrash2 className="w-3.5 h-3.5" />
                        </button>
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

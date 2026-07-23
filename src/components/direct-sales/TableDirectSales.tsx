"use client";

import {
  FiTrash2,
  FiCalendar,
  FiUser,
  FiEye,
  FiFileText,
} from "react-icons/fi";
import { generatePdfDirectSale } from "@/utils/generate-pdf-direct-sale";
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
import { SerializedDirectSaleWithRelations } from "@/types/direct-sale";
import { useSystemConfig } from "@/context/SystemConfigContext";

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
  const systemConfig = useSystemConfig();

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
                0,
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
                      <span suppressHydrationWarning>
                        {formatDateLocal(sale.createdAt)}
                      </span>
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
                    </div>
                  </TableCell>

                  {/* Subtotal */}
                  <TableCell className="text-right font-mono text-xs text-text-secondary">
                    S/ {subtotal.toFixed(2)}
                  </TableCell>

                  {/* Descuento */}
                  <TableCell className="text-right font-mono text-xs text-text-secondary">
                    {sale.discount > 0
                      ? `-S/ ${sale.discount.toFixed(2)}`
                      : "S/ 0.00"}
                  </TableCell>

                  {/* Total Cobrado */}
                  <TableCell className="text-right font-mono font-bold text-sm text-text-primary">
                    S/ {sale.total.toFixed(2)}
                  </TableCell>

                  {/* Acciones */}
                  <TableCell className="text-center">
                    <div className="flex items-center justify-center gap-2">
                      <ButtonIcon
                        onClick={() => onView(sale)}
                        variant="info"
                        icon={FiEye}
                        title="Ver detalle de la venta"
                      />
                      <ButtonIcon
                        onClick={() =>
                          generatePdfDirectSale(
                            sale,
                            systemConfig?.systemName ?? "Inventario",
                          )
                        }
                        variant="secondary"
                        icon={FiFileText}
                        title="Descargar boleta de venta (PDF)"
                      />
                      {canDelete && (
                        <ButtonIcon
                          onClick={() => onDelete(sale)}
                          variant="danger"
                          icon={FiTrash2}
                          title="Anular Venta Directa (Devolverá stock)"
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

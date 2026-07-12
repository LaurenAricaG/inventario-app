"use client";

import { FiEdit2, FiTrash2, FiEye } from "react-icons/fi";
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
import { ProductWithRelations } from "@/types/models";
import { cn } from "@/utils/cn.utils";

interface TableProductsProps {
  products: ProductWithRelations[];
  currentPage: number;
  itemsPerPage: number;
  canUpdate: boolean;
  canDelete: boolean;
  canReadCost: boolean;
  onEdit: (product: ProductWithRelations) => void;
  onDelete: (product: ProductWithRelations) => void;
  onView: (product: ProductWithRelations) => void;
}

export default function TableProducts({
  products,
  currentPage,
  itemsPerPage,
  canUpdate,
  canDelete,
  canReadCost,
  onEdit,
  onDelete,
  onView,
}: TableProductsProps) {

  return (
    <ErrorBoundary variant="embedded" title="Tabla de Productos">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="text-center w-16">N°</TableHead>
            <TableHead className="text-left w-28">Código</TableHead>
            <TableHead className="text-left">Producto</TableHead>
            <TableHead className="text-left">Marca / Categoría</TableHead>
            <TableHead className="text-center w-24">Stock</TableHead>
            <TableHead className="text-right w-28">Precio</TableHead>
            {canReadCost && <TableHead className="text-right w-28">Costo</TableHead>}
            <TableHead className="text-center w-28">Estado</TableHead>
            <TableHead className="text-center w-32">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={canReadCost ? 10 : 9}
                className="text-center py-10 text-text-tertiary"
              >
                No se encontraron productos registrados.
              </TableCell>
            </TableRow>
          ) : (
            products.map((product, index) => {

              return (
                <TableRow key={product.id}>
                  {/* Número */}
                  <TableCell className="font-mono text-xs text-text-tertiary text-center">
                    {(currentPage - 1) * itemsPerPage + index + 1}
                  </TableCell>

                  {/* Código */}
                  <TableCell className="text-left font-mono text-xs text-text-secondary">
                    {product.code || <span className="text-text-tertiary italic">Sin código</span>}
                  </TableCell>

                  {/* Info Principal del Producto */}
                  <TableCell className="text-left">
                    <p className="font-semibold text-text-primary text-sm leading-snug">
                      {product.name}
                    </p>
                  </TableCell>

                  {/* Atributos (Marca, Categoría, Género) */}
                  <TableCell className="text-left">
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold bg-beauty-50 text-beauty-800 dark:bg-beauty-950/20 dark:text-beauty-300 border border-beauty-100 dark:border-beauty-500/10">
                          {product.brand.name}
                        </span>
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-medium bg-bg-surface text-text-secondary border border-border-soft">
                          {product.category.name}
                        </span>
                      </div>
                      {product.genderSegment && (
                        <span className="inline-flex items-center text-[10px] font-semibold text-text-tertiary">
                          Género: {product.genderSegment.name}
                        </span>
                      )}
                    </div>
                  </TableCell>

                  {/* Stock */}
                  <TableCell className="text-center font-medium">
                    <div className="flex flex-col items-center">
                      <span
                        className={cn(
                          "px-2.5 py-0.5 rounded-full text-xs font-bold font-mono tracking-wide",
                          product.stock === 0
                            ? "bg-danger-bg text-danger-text"
                            : product.stock < 5
                              ? "bg-warning-bg text-warning-text"
                              : "bg-success-bg text-success-text"
                        )}
                      >
                        {product.stock}
                      </span>
                      {product.stock < 5 && product.stock > 0 && (
                        <span className="text-[9px] text-warning-text font-semibold mt-1">
                          Stock Bajo
                        </span>
                      )}
                      {product.stock === 0 && (
                        <span className="text-[9px] text-danger-text font-bold mt-1">
                          Agotado
                        </span>
                      )}
                    </div>
                  </TableCell>

                  {/* Precio de Venta */}
                  <TableCell className="text-right font-mono font-semibold text-text-primary text-sm">
                    S/. {product.price.toFixed(2)}
                  </TableCell>

                  {/* Precio de Costo (Restringido) */}
                  {canReadCost && (
                    <TableCell className="text-right font-mono text-text-secondary text-xs">
                      {product.costPrice !== null ? (
                        `S/. ${product.costPrice.toFixed(2)}`
                      ) : (
                        <span className="text-text-tertiary italic">- no reg -</span>
                      )}
                    </TableCell>
                  )}

                  {/* Estado de disponibilidad */}
                  <TableCell className="text-center select-none">
                    {product.isAvailable ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-success-bg text-success-text">
                        <span className="w-1.5 h-1.5 rounded-full bg-success-text animate-pulse" />
                        Activo
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-bg-surface border border-border-default text-text-tertiary">
                        <span className="w-1.5 h-1.5 rounded-full bg-text-tertiary" />
                        Pausado
                      </span>
                    )}
                  </TableCell>

                  {/* Acciones */}
                  <TableCell className="text-center">
                    <div className="flex items-center justify-center gap-2">
                      <ButtonIcon
                        onClick={() => onView(product)}
                        variant="info"
                        icon={FiEye}
                        title="Ver Producto"
                      />
                      {canUpdate && (
                        <ButtonIcon
                          onClick={() => onEdit(product)}
                          variant="warning"
                          icon={FiEdit2}
                          title="Editar Producto"
                        />
                      )}
                      {canDelete && (
                        <ButtonIcon
                          onClick={() => onDelete(product)}
                          variant="danger"
                          icon={FiTrash2}
                          title="Eliminar Producto"
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

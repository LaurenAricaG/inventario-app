"use client";

import { FiEdit2, FiTrash2 } from "react-icons/fi";
import ErrorBoundary from "@/components/error/ErrorBoundary";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/Table";
import { SerializedCategory } from "@/types/categories";

interface TableCategoriesProps {
  categories: SerializedCategory[];
  currentPage: number;
  itemsPerPage: number;
  canUpdate: boolean;
  canDelete: boolean;
  onEdit: (category: SerializedCategory) => void;
  onDelete: (category: SerializedCategory) => void;
}

export default function TableCategories({
  categories,
  currentPage,
  itemsPerPage,
  canUpdate,
  canDelete,
  onEdit,
  onDelete,
}: TableCategoriesProps) {
  return (
    <ErrorBoundary variant="embedded" title="Tabla de Categorías">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="text-center w-20">Número</TableHead>
            <TableHead className="text-left">Categoría</TableHead>
            <TableHead className="text-center w-36">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {categories.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={3}
                className="text-center py-10 text-text-tertiary"
              >
                No se encontraron categorías registradas.
              </TableCell>
            </TableRow>
          ) : (
            categories.map((category, index) => (
              <TableRow key={category.id}>
                {/* Número */}
                <TableCell className="font-mono text-xs text-text-tertiary text-center">
                  {(currentPage - 1) * itemsPerPage + index + 1}
                </TableCell>

                {/* Categoría (Nombre) */}
                <TableCell className="text-left">
                  <span className="font-semibold text-text-primary">
                    {category.name}
                  </span>
                </TableCell>

                {/* Acciones de fila */}
                <TableCell className="text-center">
                  <div className="flex items-center justify-center gap-2">
                    {canUpdate && (
                      <button
                        onClick={() => onEdit(category)}
                        className="p-2 rounded-xl bg-warning-bg/40 border border-warning-text/15 text-warning-text hover:bg-warning-bg/80 hover:border-warning-text/30 hover:scale-[1.04] active:scale-[0.96] transition-all duration-200 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-warning-text/20"
                        title="Editar Categoría"
                      >
                        <FiEdit2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                    {canDelete && (
                      <button
                        onClick={() => onDelete(category)}
                        className="p-2 rounded-xl bg-danger-bg/40 border border-danger-text/15 text-danger-text hover:bg-danger-bg/80 hover:border-danger-text/30 hover:scale-[1.04] active:scale-[0.96] transition-all duration-200 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-danger-text/20"
                        title="Eliminar Categoría"
                      >
                        <FiTrash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </ErrorBoundary>
  );
}

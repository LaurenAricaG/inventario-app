"use client";

import { FiEdit2, FiTrash2 } from "react-icons/fi";
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
                      <ButtonIcon
                        onClick={() => onEdit(category)}
                        variant="warning"
                        icon={FiEdit2}
                        title="Editar Categoría"
                      />
                    )}
                    {canDelete && (
                      <ButtonIcon
                        onClick={() => onDelete(category)}
                        variant="danger"
                        icon={FiTrash2}
                        title="Eliminar Categoría"
                      />
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

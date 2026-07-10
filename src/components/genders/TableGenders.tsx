"use client";

import { FiEdit2, FiTrash2, FiCalendar } from "react-icons/fi";
import ErrorBoundary from "@/components/error/ErrorBoundary";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/Table";
import { SerializedGenderSegment } from "@/types";

interface TableGendersProps {
  genders: SerializedGenderSegment[];
  currentPage: number;
  itemsPerPage: number;
  canUpdate: boolean;
  canDelete: boolean;
  onEdit: (gender: SerializedGenderSegment) => void;
  onDelete: (gender: SerializedGenderSegment) => void;
}

export default function TableGenders({
  genders,
  currentPage,
  itemsPerPage,
  canUpdate,
  canDelete,
  onEdit,
  onDelete,
}: TableGendersProps) {
  return (
    <ErrorBoundary variant="embedded" title="Tabla de Géneros">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-40">Número</TableHead>
            <TableHead>Nombre</TableHead>
            <TableHead className="hidden sm:table-cell">Fecha Registro</TableHead>
            <TableHead className="text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {genders.map((gender, index) => (
            <TableRow key={gender.id}>
              {/* Número */}
              <TableCell className="font-mono text-xs text-text-tertiary">
                {(currentPage - 1) * itemsPerPage + index + 1}
              </TableCell>

              {/* Nombre */}
              <TableCell className="font-semibold text-text-primary">
                {gender.name}
              </TableCell>

              {/* Fecha de creación */}
              <TableCell className="hidden sm:table-cell text-xs text-text-secondary">
                <div className="flex items-center gap-1.5">
                  <FiCalendar className="w-3.5 h-3.5 text-text-tertiary" />
                  <span>
                    {new Date(gender.createdAt).toLocaleDateString("es-PE", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </span>
                </div>
              </TableCell>

              {/* Acciones de fila */}
              <TableCell className="text-right">
                <div className="flex items-center justify-end gap-2">
                  {canUpdate && (
                    <button
                      onClick={() => onEdit(gender)}
                      className="p-2 rounded-xl bg-warning-bg/40 border border-warning-text/15 text-warning-text hover:bg-warning-bg/80 hover:border-warning-text/30 hover:scale-[1.04] active:scale-[0.96] transition-all duration-200 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-warning-text/20"
                      title="Editar Género"
                    >
                      <FiEdit2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                  {canDelete && (
                    <button
                      onClick={() => onDelete(gender)}
                      className="p-2 rounded-xl bg-danger-bg/40 border border-danger-text/15 text-danger-text hover:bg-danger-bg/80 hover:border-danger-text/30 hover:scale-[1.04] active:scale-[0.96] transition-all duration-200 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-danger-text/20"
                      title="Eliminar Género"
                    >
                      <FiTrash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </ErrorBoundary>
  );
}

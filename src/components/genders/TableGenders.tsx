"use client";

import { FiEdit2, FiTrash2, FiCalendar } from "react-icons/fi";
import { formatDateLong } from "@/utils/date.utils";
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
                  <span suppressHydrationWarning>{formatDateLong(gender.createdAt)}</span>
                </div>
              </TableCell>

              {/* Acciones de fila */}
              <TableCell className="text-right">
                <div className="flex items-center justify-end gap-2">
                  {canUpdate && (
                    <ButtonIcon
                      onClick={() => onEdit(gender)}
                      variant="warning"
                      icon={FiEdit2}
                      title="Editar Género"
                    />
                  )}
                  {canDelete && (
                    <ButtonIcon
                      onClick={() => onDelete(gender)}
                      variant="danger"
                      icon={FiTrash2}
                      title="Eliminar Género"
                    />
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

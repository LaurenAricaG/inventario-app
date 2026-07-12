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
import { SerializedBrand } from "@/types/brands";

interface TableBrandsProps {
  brands: SerializedBrand[];
  currentPage: number;
  itemsPerPage: number;
  canUpdate: boolean;
  canDelete: boolean;
  onEdit: (brand: SerializedBrand) => void;
  onDelete: (brand: SerializedBrand) => void;
}

interface NoImagePlaceholderProps {
  className?: string;
  p?: string;
  borderClass?: string;
}

function NoImagePlaceholder({
  className = "w-10 h-10",
  p = "p-1.5",
  borderClass = "border border-border-default/60",
}: NoImagePlaceholderProps) {
  return (
    <div
      className={`${className} rounded-xl ${borderClass} bg-bg-surface overflow-hidden flex items-center justify-center shadow-xs select-none shrink-0`}
    >
      <svg
        viewBox="0 0 100 100"
        className={`w-full h-full ${p} text-text-tertiary`}
        fill="none"
        stroke="currentColor"
        strokeWidth="3.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect x="26" y="26" width="48" height="48" rx="8" ry="8" />
        <circle cx="42" cy="42" r="6" />
        <path d="M74 60L62 48L38 72" />
        <path d="M74 68L66 60L58 68" />
      </svg>
    </div>
  );
}

export default function TableBrands({
  brands,
  currentPage,
  itemsPerPage,
  canUpdate,
  canDelete,
  onEdit,
  onDelete,
}: TableBrandsProps) {
  return (
    <ErrorBoundary variant="embedded" title="Tabla de Marcas">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="text-center w-20">Número</TableHead>
            <TableHead className="text-center">Marca</TableHead>
            <TableHead className="text-center">Empresa</TableHead>
            <TableHead className="text-center w-36">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {brands.map((marca, index) => (
            <TableRow key={marca.id}>
              {/* Número */}
              <TableCell className="font-mono text-xs text-text-tertiary text-center">
                {(currentPage - 1) * itemsPerPage + index + 1}
              </TableCell>

              {/* Marca (Logo + Nombre) */}
              <TableCell className="text-center">
                <div className="flex items-center justify-center gap-3">
                  {marca.logoUrl ? (
                    <div className="w-10 h-10 rounded-xl border border-border-default/60 bg-bg-surface overflow-hidden flex items-center justify-center shadow-xs shrink-0">
                      <img
                        src={marca.logoUrl}
                        alt={`Logo ${marca.name}`}
                        className="w-full h-full object-contain p-1.5"
                      />
                    </div>
                  ) : (
                    <NoImagePlaceholder className="w-10 h-10" p="p-1.5" />
                  )}
                  <span className="font-semibold text-text-primary text-left">
                    {marca.name}
                  </span>
                </div>
              </TableCell>

              {/* Empresa relacionada */}
              <TableCell className="text-center">
                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[12px] font-semibold bg-beauty-50 text-beauty-700 border border-beauty-100 dark:text-beauty-400 dark:border-beauty-300/40">
                  {marca.company?.name || "Sin empresa"}
                </span>
              </TableCell>

              {/* Acciones de fila */}
              <TableCell className="text-center">
                <div className="flex items-center justify-center gap-2">
                  {canUpdate && (
                    <ButtonIcon
                      onClick={() => onEdit(marca)}
                      variant="warning"
                      icon={FiEdit2}
                      title="Editar Marca"
                    />
                  )}
                  {canDelete && (
                    <ButtonIcon
                      onClick={() => onDelete(marca)}
                      variant="danger"
                      icon={FiTrash2}
                      title="Eliminar Marca"
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

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
import { SerializedCompany } from "@/types/companies";
import { cn } from "@/utils/cn.utils";
import { getCompanyBadgeStyle } from "@/utils/brand.utils";

interface TableCompaniesProps {
  companies: SerializedCompany[];
  currentPage: number;
  itemsPerPage: number;
  canUpdate: boolean;
  canDelete: boolean;
  onEdit: (company: SerializedCompany) => void;
  onDelete: (company: SerializedCompany) => void;
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

export default function TableCompanies({
  companies,
  currentPage,
  itemsPerPage,
  canUpdate,
  canDelete,
  onEdit,
  onDelete,
}: TableCompaniesProps) {
  return (
    <ErrorBoundary variant="embedded" title="Tabla de Empresas">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="text-center w-20">Número</TableHead>
            <TableHead className="text-center">Empresa</TableHead>
            <TableHead className="text-center w-36">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {companies.map((empresa, index) => (
            <TableRow key={empresa.id}>
              {/* Número */}
              <TableCell className="font-mono text-xs text-text-tertiary text-center">
                {(currentPage - 1) * itemsPerPage + index + 1}
              </TableCell>

              {/* Empresa (Logo + Nombre) */}
              <TableCell className="text-center">
                <div className="flex items-center justify-center gap-3">
                  {empresa.logoUrl ? (
                    <div className="w-10 h-10 rounded-xl border border-border-default/60 bg-bg-surface overflow-hidden flex items-center justify-center shadow-xs shrink-0">
                      <img
                        src={empresa.logoUrl}
                        alt={`Logo ${empresa.name}`}
                        className="w-full h-full object-contain p-1.5"
                      />
                    </div>
                  ) : (
                    <NoImagePlaceholder className="w-10 h-10" p="p-1.5" />
                  )}
                  <span className={cn("inline-flex items-center px-2.5 py-1 rounded-md font-semibold text-xs border", getCompanyBadgeStyle(empresa.name))}>
                    {empresa.name}
                  </span>
                </div>
              </TableCell>

              {/* Acciones de fila */}
              <TableCell className="text-center">
                <div className="flex items-center justify-center gap-2">
                  {canUpdate && (
                    <ButtonIcon
                      onClick={() => onEdit(empresa)}
                      variant="warning"
                      icon={FiEdit2}
                      title="Editar Empresa"
                    />
                  )}
                  {canDelete && (
                    <ButtonIcon
                      onClick={() => onDelete(empresa)}
                      variant="danger"
                      icon={FiTrash2}
                      title="Eliminar Empresa"
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

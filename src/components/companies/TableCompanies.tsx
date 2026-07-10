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
import { SerializedCompany } from "@/types/companies";

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
                  <span className="font-semibold text-text-primary text-left">
                    {empresa.name}
                  </span>
                </div>
              </TableCell>

              {/* Acciones de fila */}
              <TableCell className="text-center">
                <div className="flex items-center justify-center gap-2">
                  {canUpdate && (
                    <button
                      onClick={() => onEdit(empresa)}
                      className="p-2 rounded-xl bg-warning-bg/40 border border-warning-text/15 text-warning-text hover:bg-warning-bg/80 hover:border-warning-text/30 hover:scale-[1.04] active:scale-[0.96] transition-all duration-200 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-warning-text/20"
                      title="Editar Empresa"
                    >
                      <FiEdit2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                  {canDelete && (
                    <button
                      onClick={() => onDelete(empresa)}
                      className="p-2 rounded-xl bg-danger-bg/40 border border-danger-text/15 text-danger-text hover:bg-danger-bg/80 hover:border-danger-text/30 hover:scale-[1.04] active:scale-[0.96] transition-all duration-200 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-danger-text/20"
                      title="Eliminar Empresa"
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

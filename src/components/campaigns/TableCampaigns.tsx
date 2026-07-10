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
import { SerializedCampaign } from "@/types/campaigns";

interface TableCampaignsProps {
  campaigns: SerializedCampaign[];
  currentPage: number;
  itemsPerPage: number;
  canUpdate: boolean;
  canDelete: boolean;
  onEdit: (campaign: SerializedCampaign) => void;
  onDelete: (campaign: SerializedCampaign) => void;
}

export default function TableCampaigns({
  campaigns,
  currentPage,
  itemsPerPage,
  canUpdate,
  canDelete,
  onEdit,
  onDelete,
}: TableCampaignsProps) {
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("es-PE", {
      year: "numeric",
      month: "short",
      day: "numeric",
      timeZone: "UTC", // Usar UTC para evitar desfases causados por la zona horaria local
    });
  };

  return (
    <ErrorBoundary variant="embedded" title="Tabla de Campañas">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="text-center w-20">Número</TableHead>
            <TableHead className="text-center">Empresa</TableHead>
            <TableHead className="text-center">Campaña</TableHead>
            <TableHead className="text-center">Fecha Inicio</TableHead>
            <TableHead className="text-center">Fecha Fin</TableHead>
            <TableHead className="text-center">Estado</TableHead>
            <TableHead className="text-center w-36">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {campaigns.map((campania, index) => (
            <TableRow key={campania.id}>
              {/* Número de Fila */}
              <TableCell className="font-mono text-xs text-text-tertiary text-center">
                {(currentPage - 1) * itemsPerPage + index + 1}
              </TableCell>

              {/* Empresa Relacionada */}
              <TableCell className="text-center">
                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[12px] font-semibold bg-bg-surface text-text-secondary border border-border-default/50">
                  {campania.company?.name || "Sin empresa"}
                </span>
              </TableCell>

              {/* Código de Campaña */}
              <TableCell className="text-center">
                <span className="font-bold text-text-primary">
                  {campania.number}
                </span>
              </TableCell>

              {/* Fecha Inicio */}
              <TableCell className="text-center text-xs text-text-secondary">
                <div className="flex items-center justify-center gap-1.5">
                  <FiCalendar className="w-3.5 h-3.5 text-text-tertiary" />
                  <span>{formatDate(campania.startDate)}</span>
                </div>
              </TableCell>

              {/* Fecha Fin */}
              <TableCell className="text-center text-xs text-text-secondary">
                <div className="flex items-center justify-center gap-1.5">
                  <FiCalendar className="w-3.5 h-3.5 text-text-tertiary" />
                  <span>{formatDate(campania.endDate)}</span>
                </div>
              </TableCell>

              {/* Estado (Activa/Inactiva) */}
              <TableCell className="text-center">
                {campania.isActive ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-success-bg text-success-text">
                    <span className="w-1.5 h-1.5 rounded-full bg-success-text animate-pulse" />
                    Activa
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-bg-surface border border-border-default text-text-tertiary">
                    <span className="w-1.5 h-1.5 rounded-full bg-text-tertiary" />
                    Inactiva
                  </span>
                )}
              </TableCell>

              {/* Acciones */}
              <TableCell className="text-center">
                <div className="flex items-center justify-center gap-2">
                  {canUpdate && (
                    <button
                      onClick={() => onEdit(campania)}
                      className="p-2 rounded-xl bg-warning-bg/40 border border-warning-text/15 text-warning-text hover:bg-warning-bg/80 hover:border-warning-text/30 hover:scale-[1.04] active:scale-[0.96] transition-all duration-200 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-warning-text/20"
                      title="Editar Campaña"
                    >
                      <FiEdit2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                  {canDelete && (
                    <button
                      onClick={() => onDelete(campania)}
                      className="p-2 rounded-xl bg-danger-bg/40 border border-danger-text/15 text-danger-text hover:bg-danger-bg/80 hover:border-danger-text/30 hover:scale-[1.04] active:scale-[0.96] transition-all duration-200 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-danger-text/20"
                      title="Eliminar Campaña"
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

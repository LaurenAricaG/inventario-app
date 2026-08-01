"use client";

import { FiEye } from "react-icons/fi";
import { formatDateTimeWithSeconds } from "@/utils/date.utils";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/Table";
import ButtonIcon from "@/components/ui/ButtonIcon";
import ErrorBoundary from "@/components/error/ErrorBoundary";
import { auditActionTranslations } from "@/utils/translations.utils";
import { SerializedAuditLog } from "./index";

interface LogsTableProps {
  logs: SerializedAuditLog[];
  onViewDetails: (log: SerializedAuditLog) => void;
  getEntityLabel: (entityName: string) => string;
}

const actionColors: Record<string, string> = {
  CREATE: "bg-success-bg/50 border-success-text/10 text-success-text",
  UPDATE: "bg-warning-bg/50 border-warning-text/10 text-warning-text",
  DELETE: "bg-danger-bg/50 border-danger-text/10 text-danger-text",
};

export default function LogsTable({
  logs,
  onViewDetails,
  getEntityLabel,
}: LogsTableProps) {
  return (
    <ErrorBoundary variant="embedded" title="Tabla de Auditoría">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="text-center w-40">
              Fecha / Hora
            </TableHead>
            <TableHead className="text-center w-48">
              Usuario
            </TableHead>
            <TableHead className="text-center w-32">Acción</TableHead>
            <TableHead className="text-center">
              Entidad / Registro
            </TableHead>
            <TableHead className="text-center w-28">
              Detalles
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {logs.map((log) => (
            <TableRow key={log.id}>
              {/* Fecha / Hora */}
              <TableCell
                suppressHydrationWarning
                className="font-mono text-[11px] text-text-secondary text-center select-all"
              >
                {formatDateTimeWithSeconds(log.createdAt)}
              </TableCell>

              {/* Usuario que ejecutó la acción */}
              <TableCell className="text-center font-medium text-text-primary text-xs">
                {log.user ? (
                  <div className="flex flex-col items-center">
                    <span className="font-semibold">
                      {log.user.name || "Sin nombre"}
                    </span>
                    <span className="text-[10px] text-text-tertiary">
                      @{log.user.username}
                    </span>
                  </div>
                ) : (
                  <span className="text-text-tertiary italic">
                    Sistema
                  </span>
                )}
              </TableCell>

              {/* Acción (Creación / Edición / Eliminación) con badges de color */}
              <TableCell className="text-center">
                <span
                  className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border select-none ${
                    actionColors[log.action] || "bg-bg-surface text-text-secondary border-border-default"
                  }`}
                >
                  {auditActionTranslations[log.action] || log.action}
                </span>
              </TableCell>

              {/* Entidad y su ID correspondiente */}
              <TableCell className="text-center font-medium text-text-secondary text-xs">
                <div className="flex items-center justify-center gap-1.5">
                  <span className="font-semibold text-text-primary bg-bg-surface border border-border-default px-2 py-0.5 rounded-md">
                    {getEntityLabel(log.entity)}
                  </span>
                  <span className="text-text-tertiary text-[11px]">
                    (ID: {log.entityId})
                  </span>
                </div>
              </TableCell>

              {/* Acciones (Ver detalles JSON) */}
              <TableCell className="text-center">
                <div className="flex justify-center">
                  <ButtonIcon
                    onClick={() => onViewDetails(log)}
                    variant="info"
                    icon={FiEye}
                    title="Ver Detalles del Registro"
                  />
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </ErrorBoundary>
  );
}

"use client";

import { FiEdit2, FiTrash2, FiPhone, FiMapPin, FiExternalLink } from "react-icons/fi";
import Link from "next/link";
import ErrorBoundary from "@/components/error/ErrorBoundary";
import CopyButton from "@/components/ui/CopyButton";
import RegenerateTokenButton from "@/components/ui/RegenerateTokenButton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/Table";
import { SerializedClient } from "@/types/client";

interface TableClientProps {
  clients: SerializedClient[];
  currentPage: number;
  itemsPerPage: number;
  canUpdate: boolean;
  canDelete: boolean;
  isAdmin: boolean;
  onEdit: (client: SerializedClient) => void;
  onDelete: (client: SerializedClient) => void;
}

// Helper to get initials for client avatar
function getInitials(name: string) {
  return name
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase();
}

// Predefined avatar colors
const avatarColors = [
  "bg-beauty-100 text-beauty-800 dark:bg-beauty-900/60 dark:text-beauty-200",
  "bg-info-bg text-info-text dark:bg-info-bg/20 dark:text-info-text",
  "bg-success-bg text-success-text dark:bg-success-bg/20 dark:text-success-text",
  "bg-warning-bg text-warning-text dark:bg-warning-bg/20 dark:text-warning-text",
  "bg-danger-bg text-danger-text dark:bg-danger-bg/20 dark:text-danger-text",
];

export default function TableClient({
  clients,
  currentPage,
  itemsPerPage,
  canUpdate,
  canDelete,
  isAdmin,
  onEdit,
  onDelete,
}: TableClientProps) {
  return (
    <ErrorBoundary variant="embedded" title="Tabla de Clientes">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="text-center w-16">N°</TableHead>
            <TableHead>Cliente</TableHead>
            <TableHead className="hidden md:table-cell">Dirección</TableHead>
            <TableHead>Estado de Cuenta</TableHead>
            <TableHead className="text-right w-32">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {clients.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={5}
                className="text-center py-10 text-text-tertiary"
              >
                No se encontraron clientes registrados.
              </TableCell>
            </TableRow>
          ) : (
            clients.map((client, index) => {
              const initials = getInitials(client.name);
              const colorClass = avatarColors[index % avatarColors.length];

              return (
                <TableRow key={client.id}>
                  {/* Número */}
                  <TableCell className="font-mono text-xs text-text-tertiary text-center">
                    {(currentPage - 1) * itemsPerPage + index + 1}
                  </TableCell>

                  {/* Cliente avatar, nombre y teléfono */}
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-semibold shrink-0 shadow-xs ${colorClass}`}
                      >
                        {initials}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-text-primary truncate leading-snug">
                          {client.name}
                        </p>
                        <p className="text-xs text-text-secondary flex items-center gap-1 mt-0.5">
                          <FiPhone className="w-3.5 h-3.5 shrink-0" />
                          <span>{client.phone || "Sin teléfono"}</span>
                        </p>
                      </div>
                    </div>
                  </TableCell>

                  {/* Dirección */}
                  <TableCell className="text-xs text-text-secondary hidden md:table-cell max-w-[220px] truncate">
                    <div className="flex items-center gap-1.5">
                      <FiMapPin className="w-3.5 h-3.5 shrink-0 text-text-tertiary" />
                      <span className="truncate" title={client.address || ""}>
                        {client.address || "Sin dirección registrada"}
                      </span>
                    </div>
                  </TableCell>

                  {/* Shared Link / Token */}
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <CopyButton
                        text={`/c/${client.shareToken}`}
                        isLink={true}
                        tooltip="Copiar enlace de estado de cuenta"
                      />
                      {isAdmin && (
                        <RegenerateTokenButton
                          clientId={client.id}
                          clientName={client.name}
                        />
                      )}
                      <Link
                        href={`/c/${client.shareToken}`}
                        target="_blank"
                        className="p-2 rounded-xl border border-border-default/60 bg-bg-card hover:bg-beauty-400/10 text-text-secondary hover:text-beauty-500 hover:border-beauty-400/20 hover:scale-[1.04] active:scale-[0.96] transition-all duration-200 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-beauty-400/20"
                        title="Ver estado de cuenta de cliente"
                      >
                        <FiExternalLink className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </TableCell>

                  {/* Acciones */}
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      {canUpdate && (
                        <button
                          onClick={() => onEdit(client)}
                          className="p-2 rounded-xl bg-warning-bg/40 border border-warning-text/15 text-warning-text hover:bg-warning-bg/80 hover:border-warning-text/30 hover:scale-[1.04] active:scale-[0.96] transition-all duration-200 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-warning-text/20"
                          title="Editar Cliente"
                        >
                          <FiEdit2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                      {canDelete && (
                        <button
                          onClick={() => onDelete(client)}
                          className="p-2 rounded-xl bg-danger-bg/40 border border-danger-text/15 text-danger-text hover:bg-danger-bg/80 hover:border-danger-text/30 hover:scale-[1.04] active:scale-[0.96] transition-all duration-200 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-danger-text/20"
                          title="Eliminar Cliente"
                        >
                          <FiTrash2 className="w-3.5 h-3.5" />
                        </button>
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

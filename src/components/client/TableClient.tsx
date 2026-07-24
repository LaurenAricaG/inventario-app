"use client";

import {
  FiEdit2,
  FiTrash2,
  FiPhone,
  FiMapPin,
  FiExternalLink,
} from "react-icons/fi";
import Link from "next/link";
import ErrorBoundary from "@/components/error/ErrorBoundary";
import CopyButton from "@/components/ui/CopyButton";
import RegenerateTokenButton from "@/components/ui/RegenerateTokenButton";
import ButtonIcon from "@/components/ui/ButtonIcon";
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
                        <Link
                          href={`/admin/movimientos/${client.id}?source=clientes`}
                          className="text-sm font-semibold text-text-primary hover:text-beauty-500 transition-colors focus-visible:outline-none focus-visible:text-beauty-500 truncate block leading-snug"
                        >
                          {client.name}
                        </Link>
                        <p className="text-xs text-text-secondary flex items-center gap-1 mt-0.5">
                          <FiPhone className="w-3.5 h-3.5 shrink-0" />
                          <span>{client.phone || "Sin teléfono"}</span>
                        </p>
                      </div>
                    </div>
                  </TableCell>

                  {/* Dirección */}
                  <TableCell className="text-xs text-text-secondary hidden md:table-cell max-w-55 truncate">
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
                      {canUpdate && (
                        <RegenerateTokenButton
                          clientId={client.id}
                          clientName={client.name}
                        />
                      )}
                      <ButtonIcon
                        href={`/c/${client.shareToken}`}
                        target="_blank"
                        variant="beauty"
                        icon={FiExternalLink}
                        title="Ver estado de cuenta de cliente"
                      />
                    </div>
                  </TableCell>

                  {/* Acciones */}
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      {canUpdate && (
                        <ButtonIcon
                          onClick={() => onEdit(client)}
                          variant="warning"
                          icon={FiEdit2}
                          title="Editar Cliente"
                        />
                      )}
                      {canDelete && (
                        <ButtonIcon
                          onClick={() => onDelete(client)}
                          variant="danger"
                          icon={FiTrash2}
                          title="Eliminar Cliente"
                        />
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

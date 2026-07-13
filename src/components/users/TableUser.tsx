"use client";

import { FiEdit2, FiUserX, FiUserCheck, FiMail, FiCalendar, FiShield } from "react-icons/fi";
import { formatDateLong } from "@/utils/date.utils";
import ErrorBoundary from "@/components/error/ErrorBoundary";
import CopyButton from "@/components/ui/CopyButton";
import ButtonIcon from "@/components/ui/ButtonIcon";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/Table";
import { SerializedUserWithRole } from "@/types/user";

interface TableUserProps {
  users: SerializedUserWithRole[];
  currentPage: number;
  itemsPerPage: number;
  canUpdate: boolean;
  canDelete: boolean;
  onEdit: (user: SerializedUserWithRole) => void;
  onDelete: (user: SerializedUserWithRole) => void;
  onReactivate?: (user: SerializedUserWithRole) => void;
}

// Helper to get initials for user avatar
function getInitials(name: string) {
  if (!name) return "U";
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

export default function TableUser({
  users,
  currentPage,
  itemsPerPage,
  canUpdate,
  canDelete,
  onEdit,
  onDelete,
  onReactivate,
}: TableUserProps) {
  return (
    <ErrorBoundary variant="embedded" title="Tabla de Usuarios">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="text-center w-16">N°</TableHead>
            <TableHead>Usuario</TableHead>
            <TableHead>Correo Electrónico</TableHead>
            <TableHead>Rol de Acceso</TableHead>
            <TableHead className="hidden md:table-cell">Fecha Registro</TableHead>
            <TableHead className="text-right w-32">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={6}
                className="text-center py-10 text-text-tertiary"
              >
                No se encontraron usuarios registrados.
              </TableCell>
            </TableRow>
          ) : (
            users.map((user, index) => {
              const name = user.name || "Sin nombre";
              const initials = getInitials(name);
              const colorClass = avatarColors[index % avatarColors.length];
              const isAdmin = user.role.name === "ADMIN";
              const isSuspended = !!user.deletedAt;

              return (
                <TableRow
                  key={user.id}
                  className={isSuspended ? "opacity-60 bg-bg-surface/30" : ""}
                >
                  {/* Número */}
                  <TableCell className="font-mono text-xs text-text-tertiary text-center">
                    {(currentPage - 1) * itemsPerPage + index + 1}
                  </TableCell>

                  {/* Perfil del usuario */}
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-semibold shrink-0 shadow-xs ${colorClass}`}
                      >
                        {initials}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <p className="text-sm font-semibold text-text-primary truncate leading-snug">
                            {name}
                          </p>
                          {isSuspended && (
                            <span className="inline-flex px-1.5 py-0.5 text-[9px] font-bold text-danger-text bg-danger-bg border border-danger-text/15 rounded-md select-none">
                              Suspendido
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-text-secondary truncate mt-0.5 font-mono">
                          @{user.username}
                        </p>
                      </div>
                    </div>
                  </TableCell>

                  {/* Correo */}
                  <TableCell className="text-sm">
                    <div className="flex items-center gap-2">
                      <FiMail className="w-3.5 h-3.5 text-text-tertiary shrink-0" />
                      <span
                        className="truncate max-w-40 sm:max-w-none"
                        title={user.email || ""}
                      >
                        {user.email}
                      </span>
                      {user.email && (
                        <CopyButton text={user.email} tooltip="Copiar correo" />
                      )}
                    </div>
                  </TableCell>

                  {/* Rol */}
                  <TableCell>
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase border shadow-sm ${
                        isAdmin
                          ? "bg-warning-bg border-warning-text/25 text-warning-text"
                          : "bg-info-bg border-info-text/20 text-info-text"
                      }`}
                    >
                      <FiShield className="w-3 h-3" />
                      {user.role.name}
                    </span>
                  </TableCell>

                  {/* Fecha de Registro */}
                  <TableCell className="text-xs text-text-secondary hidden md:table-cell">
                    <div className="flex items-center gap-1.5">
                      <FiCalendar className="w-3.5 h-3.5 text-text-tertiary" />
                      <span suppressHydrationWarning>
                        {formatDateLong(user.createdAt)}
                      </span>
                    </div>
                  </TableCell>

                  {/* Acciones */}
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      {canUpdate && !isSuspended && (
                        <ButtonIcon
                          onClick={() => onEdit(user)}
                          variant="warning"
                          icon={FiEdit2}
                          title="Editar Usuario"
                        />
                      )}
                      {canDelete && (
                        isSuspended ? (
                          <ButtonIcon
                            onClick={() => onReactivate && onReactivate(user)}
                            variant="success"
                            icon={FiUserCheck}
                            title="Reactivar Usuario"
                          />
                        ) : (
                          <ButtonIcon
                            onClick={() => onDelete(user)}
                            variant="danger"
                            icon={FiUserX}
                            title="Suspender Usuario"
                          />
                        )
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

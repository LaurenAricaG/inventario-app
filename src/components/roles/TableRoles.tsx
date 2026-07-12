"use client";

import { FiEdit2, FiTrash2, FiShield } from "react-icons/fi";
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
import { SerializedRoleWithPermissions } from "@/types/role";

interface TableRolesProps {
  roles: SerializedRoleWithPermissions[];
  currentPage: number;
  itemsPerPage: number;
  canUpdate: boolean;
  canDelete: boolean;
  onEdit: (role: SerializedRoleWithPermissions) => void;
  onDelete: (role: SerializedRoleWithPermissions) => void;
}

export default function TableRoles({
  roles,
  currentPage,
  itemsPerPage,
  canUpdate,
  canDelete,
  onEdit,
  onDelete,
}: TableRolesProps) {
  return (
    <ErrorBoundary variant="embedded" title="Tabla de Roles">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="text-center w-16">N°</TableHead>
            <TableHead>Rol</TableHead>
            <TableHead>Descripción</TableHead>
            <TableHead className="text-center w-40">Permisos Asignados</TableHead>
            <TableHead className="text-right w-32">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {roles.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={5}
                className="text-center py-10 text-text-tertiary"
              >
                No se encontraron roles registrados.
              </TableCell>
            </TableRow>
          ) : (
            roles.map((role, index) => {
              const name = role.name;
              const isCoreRole = ["ADMIN", "SELLER"].includes(name.toUpperCase());
              const permissionsCount = role.permissions?.length ?? 0;

              return (
                <TableRow key={role.id}>
                  {/* Número */}
                  <TableCell className="font-mono text-xs text-text-tertiary text-center">
                    {(currentPage - 1) * itemsPerPage + index + 1}
                  </TableCell>

                  {/* Rol */}
                  <TableCell className="font-medium text-text-primary">
                    <div className="flex items-center gap-2">
                      <FiShield className={`w-4 h-4 ${isCoreRole ? "text-warning-text" : "text-info-text"}`} />
                      <span>{name}</span>
                    </div>
                  </TableCell>

                  {/* Descripción */}
                  <TableCell className="text-sm text-text-secondary">
                    {role.description || <span className="text-text-tertiary/60 italic">Sin descripción</span>}
                  </TableCell>

                  {/* Cantidad de Permisos */}
                  <TableCell className="text-center">
                    <span className="inline-flex px-2.5 py-1 rounded-full text-xs font-bold bg-beauty-400/10 text-beauty-600 dark:bg-beauty-400/15 dark:text-beauty-400">
                      {permissionsCount} {permissionsCount === 1 ? "permiso" : "permisos"}
                    </span>
                  </TableCell>

                  {/* Acciones */}
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      {canUpdate && (
                        <ButtonIcon
                          onClick={() => onEdit(role)}
                          variant="warning"
                          icon={FiEdit2}
                          title="Editar Rol y Permisos"
                        />
                      )}
                      {canDelete && (
                        <ButtonIcon
                          onClick={() => onDelete(role)}
                          variant="danger"
                          icon={FiTrash2}
                          title="Eliminar Rol"
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

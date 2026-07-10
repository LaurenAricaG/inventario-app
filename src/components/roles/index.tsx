"use client";

import { useState } from "react";
import { toast } from "sonner";
import { FiPlus, FiShield } from "react-icons/fi";
import Button from "@/components/ui/Button";
import ConfirmModal from "@/components/ui/ConfirmModal";
import Pagination from "@/components/ui/Pagination";
import SearchInput from "@/components/ui/SearchInput";
import { deleteRoleAction } from "@/lib/role";
import { SerializedRoleWithPermissions } from "@/types/role";
import TableRoles from "./TableRoles";
import FormRole from "./FormRole";

interface RolesProps {
  initialRoles: SerializedRoleWithPermissions[];
  permissionsList: { id: number; code: string; name: string; description: string | null }[];
  overallCount: number;
  totalItems: number;
  totalPages: number;
  currentPage: number;
  itemsPerPage: number;
  search: string;
  permissions: string[];
}

export default function Roles({
  initialRoles,
  permissionsList,
  overallCount,
  totalItems,
  totalPages,
  currentPage,
  itemsPerPage,
  search,
  permissions,
}: RolesProps) {
  const canCreate = permissions.includes("roles:create");
  const canUpdate = permissions.includes("roles:update");
  const canDelete = permissions.includes("roles:delete");

  // Modals state
  const [isOpenFormModal, setIsOpenFormModal] = useState(false);
  const [isOpenDeleteModal, setIsOpenDeleteModal] = useState(false);
  const [selectedRole, setSelectedRole] = useState<SerializedRoleWithPermissions | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleOpenForm = (role: SerializedRoleWithPermissions | null = null) => {
    setSelectedRole(role);
    setIsOpenFormModal(true);
  };

  const handleOpenDelete = (role: SerializedRoleWithPermissions) => {
    setSelectedRole(role);
    setIsOpenDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedRole) return;
    setIsSubmitting(true);

    try {
      const res = await deleteRoleAction(selectedRole.id);
      if (res.success) {
        toast.success(res.message);
      } else {
        toast.warning(res.message);
      }
      setIsOpenDeleteModal(false);
    } catch (error) {
      toast.error("Ocurrió un error inesperado al eliminar el rol.");
      setIsOpenDeleteModal(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Cabecera del Módulo */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-text-primary">
            Roles y Permisos
          </h2>
          <p className="text-xs sm:text-sm text-text-secondary mt-0.5">
            Configuración de perfiles y asignación de accesos del sistema
          </p>
        </div>
        {overallCount > 0 && canCreate && (
          <Button
            variant="primary"
            onClick={() => handleOpenForm(null)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold self-start sm:self-auto shadow-sm shrink-0"
          >
            <FiPlus className="w-4 h-4" />
            Nuevo rol
          </Button>
        )}
      </div>

      {/* Contenido Principal */}
      {overallCount === 0 ? (
        /* Empty State */
        <div className="flex flex-col items-center justify-center py-16 px-6 bg-bg-card border border-border-default/50 rounded-2xl text-center shadow-sm max-w-lg mx-auto my-8 select-none">
          <div className="w-16 h-16 rounded-2xl bg-beauty-50 dark:bg-beauty-950 flex items-center justify-center text-beauty-600 mb-5 border border-beauty-100 dark:border-beauty-900 shadow-xs">
            <FiShield className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-text-primary mb-2">
            No hay roles registrados
          </h3>
          <p className="text-xs text-text-secondary mb-8 leading-relaxed max-w-sm">
            Para estructurar la seguridad de tu negocio, registra el primer rol y defínele sus permisos.
          </p>
          {canCreate && (
            <Button
              variant="primary"
              onClick={() => handleOpenForm(null)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold shadow-sm"
            >
              <FiPlus className="w-4 h-4 mr-2" />
              Nuevo rol
            </Button>
          )}
        </div>
      ) : (
        /* Listado de Registros */
        <div className="bg-bg-card border border-border-default/80 rounded-2xl shadow-xs overflow-hidden">
          {/* Barra de Filtros */}
          <div className="px-6 py-4 border-b border-border-soft flex flex-col sm:flex-row items-stretch sm:items-center gap-4 bg-bg-card">
            <div className="flex-1 max-w-md">
              <SearchInput placeholder="Buscar por nombre de rol..." />
            </div>
            <div className="text-xs text-text-secondary sm:ml-auto select-none font-medium">
              Total: {totalItems} roles
            </div>
          </div>

          {/* Sin resultados de búsqueda */}
          {totalItems === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 px-4 text-center select-none">
              <div className="w-12 h-12 rounded-full bg-bg-surface flex items-center justify-center text-text-tertiary mb-3">
                <FiShield className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-text-primary mb-1">
                No se encontraron roles
              </h3>
              <p className="text-xs text-text-secondary max-w-xs leading-relaxed">
                No hay resultados para "{search}". Intenta con otros términos de búsqueda.
              </p>
            </div>
          ) : (
            <>
              {/* Tabla de Roles */}
              <div className="overflow-x-auto">
                <TableRoles
                  roles={initialRoles}
                  currentPage={currentPage}
                  itemsPerPage={itemsPerPage}
                  canUpdate={canUpdate}
                  canDelete={canDelete}
                  onEdit={handleOpenForm}
                  onDelete={handleOpenDelete}
                />
              </div>

              {/* Paginación */}
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={totalItems}
                itemsPerPage={itemsPerPage}
              />
            </>
          )}
        </div>
      )}

      {/* Formulario Modal (Nuevo / Editar) */}
      <FormRole
        isOpen={isOpenFormModal}
        onClose={() => setIsOpenFormModal(false)}
        role={selectedRole}
        permissionsList={permissionsList}
      />

      {/* Modal de Confirmación de Eliminación */}
      <ConfirmModal
        isOpen={isOpenDeleteModal}
        onClose={() => setIsOpenDeleteModal(false)}
        onConfirm={handleDeleteConfirm}
        isLoading={isSubmitting}
        title="¿Eliminar este rol?"
        description={`Esta acción dará de baja el rol "${selectedRole?.name}" en el sistema. Los usuarios asignados a este rol perderán sus accesos si no se actualizan. ¿Deseas continuar?`}
        confirmText="Sí, eliminar"
        cancelText="Cancelar"
        variant="danger"
      />
    </div>
  );
}

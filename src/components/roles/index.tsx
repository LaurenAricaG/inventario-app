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
import PageHeader from "@/components/ui/PageHeader";

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
      <PageHeader
        title="Roles y Permisos"
        subtitle="Administración de roles y permisos del sistema."
        breadcrumbs={[
          { label: "admin", href: "/admin" },
          { label: "roles" },
        ]}
        action={
          canCreate ? (
            <Button
              variant="primary"
              onClick={() => handleOpenForm(null)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold shadow-sm shrink-0"
            >
              <FiPlus className="w-4 h-4" />
              <span>Nuevo rol</span>
            </Button>
          ) : undefined
        }
      />

      {/* Contenido Principal */}
      <div className="bg-bg-card border border-border-default/80 rounded-2xl shadow-xs overflow-hidden">
        {/* Barra de Filtros */}
        <div className="px-6 py-4 border-b border-border-soft flex flex-col sm:flex-row items-stretch sm:items-center gap-4 bg-bg-card">
          <div className="flex-1 max-w-md">
            <SearchInput placeholder="Buscar por nombre de rol..." />
          </div>
          <div className="text-xs text-text-secondary sm:ml-auto select-none font-medium">
            Total: {totalItems} {totalItems === 1 ? "rol encontrado" : "roles encontrados"}
          </div>
        </div>

        {/* Listado / Empty State */}
        {initialRoles.length === 0 ? (
          <div className="p-12 text-center select-none bg-bg-card">
            <FiShield className="w-10 h-10 text-text-tertiary mx-auto mb-3" />
            <h3 className="text-sm font-bold text-text-primary">
              {overallCount === 0 ? "No hay roles registrados" : "No se encontraron roles"}
            </h3>
            <p className="text-xs text-text-secondary mt-1 max-w-sm mx-auto">
              {overallCount === 0
                ? "Para estructurar la seguridad de tu negocio, registra el primer rol y defínele sus permisos."
                : search
                ? `No hay resultados para "${search}". Intenta con otros términos de búsqueda.`
                : "Intenta cambiar los términos de búsqueda o filtros aplicados."}
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

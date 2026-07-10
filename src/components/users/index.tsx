"use client";

import { useState } from "react";
import { toast } from "sonner";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { FiPlus, FiUser, FiFilter } from "react-icons/fi";
import Button from "@/components/ui/Button";
import ConfirmModal from "@/components/ui/ConfirmModal";
import Pagination from "@/components/ui/Pagination";
import SearchInput from "@/components/ui/SearchInput";
import Select from "@/components/ui/Select";
import { deleteUserAction, reactivateUserAction } from "@/lib/user";
import { SerializedUserWithRole } from "@/types/user";
import TableUser from "./TableUser";
import FormUser from "./FormUser";

interface UsersProps {
  initialUsers: SerializedUserWithRole[];
  roles: { id: number; name: string }[];
  overallCount: number;
  totalItems: number;
  totalPages: number;
  currentPage: number;
  itemsPerPage: number;
  search: string;
  statusFilter: string;
  permissions: string[];
}

export default function Users({
  initialUsers,
  roles,
  overallCount,
  totalItems,
  totalPages,
  currentPage,
  itemsPerPage,
  search,
  statusFilter,
  permissions,
}: UsersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const canCreate = permissions.includes("users:create");
  const canUpdate = permissions.includes("users:update");
  const canDelete = permissions.includes("users:delete") || permissions.includes("users:toggle-status");

  // Modals state
  const [isOpenFormModal, setIsOpenFormModal] = useState(false);
  const [isOpenDeleteModal, setIsOpenDeleteModal] = useState(false);
  const [isOpenReactivateModal, setIsOpenReactivateModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<SerializedUserWithRole | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleOpenForm = (user: SerializedUserWithRole | null = null) => {
    setSelectedUser(user);
    setIsOpenFormModal(true);
  };

  const handleOpenDelete = (user: SerializedUserWithRole) => {
    setSelectedUser(user);
    setIsOpenDeleteModal(true);
  };

  const handleOpenReactivate = (user: SerializedUserWithRole) => {
    setSelectedUser(user);
    setIsOpenReactivateModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedUser) return;
    setIsSubmitting(true);

    try {
      const res = await deleteUserAction(selectedUser.id);
      if (res.success) {
        toast.success(res.message);
        setIsOpenDeleteModal(false);
      } else {
        toast.error(res.message);
      }
    } catch (error) {
      toast.error("Ocurrió un error inesperado al suspender al usuario.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReactivateConfirm = async () => {
    if (!selectedUser) return;
    setIsSubmitting(true);

    try {
      const res = await reactivateUserAction(selectedUser.id);
      if (res.success) {
        toast.success(res.message);
        setIsOpenReactivateModal(false);
      } else {
        toast.error(res.message);
      }
    } catch (error) {
      toast.error("Ocurrió un error inesperado al reactivar al usuario.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    const params = new URLSearchParams(searchParams.toString());
    if (val) {
      params.set("status", val);
    } else {
      params.delete("status");
    }
    params.delete("page"); // Reset page to 1
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="space-y-6">
      {/* Cabecera del Módulo */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-text-primary">
            Usuarios
          </h2>
          <p className="text-xs sm:text-sm text-text-secondary mt-0.5">
            Listado y control de accesos al sistema
          </p>
        </div>
        {overallCount > 0 && canCreate && (
          <Button
            variant="primary"
            onClick={() => handleOpenForm(null)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold self-start sm:self-auto shadow-sm shrink-0"
          >
            <FiPlus className="w-4 h-4" />
            Nuevo usuario
          </Button>
        )}
      </div>

      {/* Contenido Principal */}
      {overallCount === 0 ? (
        /* Empty State */
        <div className="flex flex-col items-center justify-center py-16 px-6 bg-bg-card border border-border-default/50 rounded-2xl text-center shadow-sm max-w-lg mx-auto my-8 select-none">
          <div className="w-16 h-16 rounded-2xl bg-beauty-50 dark:bg-beauty-950 flex items-center justify-center text-beauty-600 mb-5 border border-beauty-100 dark:border-beauty-900 shadow-xs">
            <FiUser className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-text-primary mb-2">
            No hay usuarios registrados
          </h3>
          <p className="text-xs text-text-secondary mb-8 leading-relaxed max-w-sm">
            Para comenzar a gestionar los accesos, registra tu primer usuario del sistema.
          </p>
          {canCreate && (
            <Button
              variant="primary"
              onClick={() => handleOpenForm(null)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold shadow-sm"
            >
              <FiPlus className="w-4 h-4 mr-2" />
              Nuevo usuario
            </Button>
          )}
        </div>
      ) : (
        /* Listado de Registros */
        <div className="bg-bg-card border border-border-default/80 rounded-2xl shadow-xs overflow-hidden">
          {/* Barra de Filtros */}
          <div className="px-6 py-4 border-b border-border-soft flex flex-col md:flex-row items-stretch md:items-center gap-4 bg-bg-card">
            <div className="flex-1 max-w-md">
              <SearchInput placeholder="Buscar por nombre, usuario o email..." />
            </div>
            <div className="w-full md:w-52 shrink-0 select-none">
              <Select
                value={statusFilter}
                onChange={handleStatusChange}
                placeholder="Filtrar por estado"
                icon={<FiFilter className="w-4 h-4" />}
              >
                <option value="active">Activos</option>
                <option value="suspended">Suspendidos</option>
                <option value="all">Todos los estados</option>
              </Select>
            </div>
            <div className="text-xs text-text-secondary md:ml-auto select-none font-medium">
              Total: {totalItems} usuarios encontrados
            </div>
          </div>

          {/* Sin resultados de búsqueda */}
          {totalItems === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 px-4 text-center select-none">
              <div className="w-12 h-12 rounded-full bg-bg-surface flex items-center justify-center text-text-tertiary mb-3">
                <FiUser className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-text-primary mb-1">
                No se encontraron usuarios
              </h3>
              <p className="text-xs text-text-secondary max-w-xs leading-relaxed">
                No hay resultados para "{search}". Intenta con otros términos de búsqueda o filtros de estado.
              </p>
            </div>
          ) : (
            <>
              {/* Tabla de Usuarios */}
              <div className="overflow-x-auto">
                <TableUser
                  users={initialUsers}
                  currentPage={currentPage}
                  itemsPerPage={itemsPerPage}
                  canUpdate={canUpdate}
                  canDelete={canDelete}
                  onEdit={handleOpenForm}
                  onDelete={handleOpenDelete}
                  onReactivate={handleOpenReactivate}
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
      <FormUser
        isOpen={isOpenFormModal}
        onClose={() => setIsOpenFormModal(false)}
        user={selectedUser}
        roles={roles}
      />

      {/* Modal de Confirmación de Suspensión */}
      <ConfirmModal
        isOpen={isOpenDeleteModal}
        onClose={() => setIsOpenDeleteModal(false)}
        onConfirm={handleDeleteConfirm}
        isLoading={isSubmitting}
        title="¿Suspender este usuario?"
        description={`Esta acción dará de baja la cuenta del usuario "${selectedUser?.name}" impidiéndole iniciar sesión. ¿Deseas continuar?`}
        confirmText="Sí, suspender"
        cancelText="Cancelar"
        variant="danger"
      />

      {/* Modal de Confirmación de Reactivación */}
      <ConfirmModal
        isOpen={isOpenReactivateModal}
        onClose={() => setIsOpenReactivateModal(false)}
        onConfirm={handleReactivateConfirm}
        isLoading={isSubmitting}
        title="¿Reactivar este usuario?"
        description={`Esta acción restablecerá el acceso para el usuario "${selectedUser?.name}". ¿Deseas continuar?`}
        confirmText="Sí, reactivar"
        cancelText="Cancelar"
        variant="success"
      />
    </div>
  );
}

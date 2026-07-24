"use client";

import { useState } from "react";
import { toast } from "sonner";
import { FiPlus, FiUsers } from "react-icons/fi";
import Button from "@/components/ui/Button";
import ConfirmModal from "@/components/ui/ConfirmModal";
import Pagination from "@/components/ui/Pagination";
import SearchInput from "@/components/ui/SearchInput";
import { deleteClientAction } from "@/lib/client";
import { SerializedClient } from "@/types/client";
import TableClient from "./TableClient";
import FormClient from "./FormClient";
import PageHeader from "@/components/ui/PageHeader";

interface ClientsProps {
  initialClients: SerializedClient[];
  overallCount: number;
  totalItems: number;
  totalPages: number;
  currentPage: number;
  itemsPerPage: number;
  search: string;
  permissions: string[];
}

export default function Clients({
  initialClients,
  overallCount,
  totalItems,
  totalPages,
  currentPage,
  itemsPerPage,
  search,
  permissions,
}: ClientsProps) {
  const canCreate = permissions.includes("clients:create");
  const canUpdate = permissions.includes("clients:update");
  const canDelete = permissions.includes("clients:delete");

  // Modals state
  const [isOpenFormModal, setIsOpenFormModal] = useState(false);
  const [selectedClient, setSelectedClient] = useState<SerializedClient | null>(
    null,
  );
  const [isOpenDeleteModal, setIsOpenDeleteModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleOpenForm = (client: SerializedClient | null = null) => {
    setSelectedClient(client);
    setIsOpenFormModal(true);
  };

  const handleOpenDelete = (client: SerializedClient) => {
    setSelectedClient(client);
    setIsOpenDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedClient) return;
    setIsSubmitting(true);

    try {
      const res = await deleteClientAction(selectedClient.id);
      if (res.success) {
        toast.success(res.message);
        setIsOpenDeleteModal(false);
      } else {
        toast.error(res.message);
      }
    } catch (error) {
      toast.error("Ocurrió un error inesperado al eliminar al cliente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Clientes"
        subtitle="Listado y control de clientes"
        breadcrumbs={[
          { label: "admin", href: "/admin" },
          { label: "clientes" },
        ]}
        action={
          overallCount > 0 && canCreate ? (
            <Button
              variant="primary"
              onClick={() => handleOpenForm(null)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold shadow-sm shrink-0"
            >
              <FiPlus className="w-4 h-4" />
              Nuevo cliente
            </Button>
          ) : undefined
        }
      />

      {/* Contenido Principal */}
      {overallCount === 0 ? (
        /* Empty State */
        <div className="flex flex-col items-center justify-center py-16 px-6 bg-bg-card border border-border-default/50 rounded-2xl text-center shadow-sm max-w-lg mx-auto my-8 select-none">
          <div className="w-16 h-16 rounded-2xl bg-beauty-50 dark:bg-beauty-950 flex items-center justify-center text-beauty-600 mb-5 border border-beauty-100 dark:border-beauty-900 shadow-xs">
            <FiUsers className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-text-primary mb-2">
            No hay clientes registrados
          </h3>
          <p className="text-xs text-text-secondary mb-6 leading-relaxed max-w-sm">
            Comienza registrando a tus clientes para llevar el control de sus
            compras y pedidos.
          </p>
          {canCreate && (
            <Button
              variant="primary"
              onClick={() => handleOpenForm(null)}
              className="px-5 py-2.5"
            >
              <FiPlus className="w-4 h-4 mr-2" />
              Nuevo cliente
            </Button>
          )}
        </div>
      ) : (
        /* Tabla de registros */
        <div className="bg-bg-card border border-border-default/80 rounded-2xl shadow-xs overflow-hidden">
          {/* Barra de Filtros */}
          <div className="px-6 py-4 border-b border-border-soft flex flex-col md:flex-row items-stretch md:items-center gap-4 bg-bg-card">
            <div className="flex-1 max-w-md">
              <SearchInput placeholder="Buscar por nombre, teléfono o dirección..." />
            </div>
            <div className="text-xs text-text-secondary md:ml-auto select-none font-medium">
              Total: {overallCount} clientes registrados
            </div>
          </div>

          {/* Sin resultados de búsqueda */}
          {totalItems === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 px-4 text-center select-none">
              <div className="w-12 h-12 rounded-full bg-bg-surface flex items-center justify-center text-text-tertiary mb-3">
                <FiUsers className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-text-primary mb-1">
                No se encontraron clientes
              </h3>
              <p className="text-xs text-text-secondary max-w-xs leading-relaxed">
                No hay resultados para "{search}". Intenta con otros términos de
                búsqueda.
              </p>
            </div>
          ) : (
            <>
              {/* Tabla de Clientes */}
              <div className="overflow-x-auto">
                <TableClient
                  clients={initialClients}
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
      <FormClient
        isOpen={isOpenFormModal}
        onClose={() => setIsOpenFormModal(false)}
        client={selectedClient}
      />

      {/* Modal de Confirmación de Eliminación */}
      <ConfirmModal
        isOpen={isOpenDeleteModal}
        onClose={() => setIsOpenDeleteModal(false)}
        onConfirm={handleDeleteConfirm}
        isLoading={isSubmitting}
        title="¿Eliminar este cliente?"
        description={`Esta acción ocultará al cliente "${selectedClient?.name}" de la lista y del sistema. ¿Deseas continuar?`}
        confirmText="Sí, eliminar"
        cancelText="Cancelar"
        variant="danger"
      />
    </div>
  );
}

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
          canCreate ? (
            <Button
              variant="primary"
              onClick={() => handleOpenForm(null)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold shadow-sm shrink-0"
            >
              <FiPlus className="w-4 h-4" />
              <span>Nuevo cliente</span>
            </Button>
          ) : undefined
        }
      />

      {/* Caja Contenedora */}
      <div className="bg-bg-card border border-border-default/80 rounded-2xl shadow-xs overflow-hidden">
        {/* Barra de Filtros */}
        <div className="px-6 py-4 border-b border-border-soft flex flex-col md:flex-row items-stretch md:items-center gap-4 bg-bg-card">
          <div className="flex-1 max-w-md">
            <SearchInput placeholder="Buscar por nombre, teléfono o dirección..." />
          </div>
          <div className="text-xs text-text-secondary md:ml-auto select-none font-medium">
            Total: {totalItems} {totalItems === 1 ? "cliente encontrado" : "clientes encontrados"}
          </div>
        </div>

        {/* Listado de Clientes */}
        {initialClients.length === 0 ? (
          <div className="p-12 text-center select-none bg-bg-card">
            <FiUsers className="w-10 h-10 text-text-tertiary mx-auto mb-3" />
            <h3 className="text-sm font-bold text-text-primary">
              {overallCount === 0 ? "No hay clientes registrados" : "No se encontraron clientes"}
            </h3>
            <p className="text-xs text-text-secondary mt-1 max-w-sm mx-auto">
              {overallCount === 0
                ? "Comienza registrando a tus clientes para llevar el control de sus compras y pedidos."
                : search
                ? `No hay resultados para "${search}". Intenta con otros términos de búsqueda.`
                : "Intenta cambiar los términos de búsqueda o filtros aplicados."}
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

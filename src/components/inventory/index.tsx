"use client";

import { useState } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { FiPlus, FiPackage, FiFilter } from "react-icons/fi";
import Button from "@/components/ui/Button";
import Pagination from "@/components/ui/Pagination";
import SearchInput from "@/components/ui/SearchInput";
import Select from "@/components/ui/Select";
import { SerializedStockMovement } from "@/types/stockmovement";
import TableInventory from "./TableInventory";
import FormInventory from "./FormInventory";
import PageHeader from "@/components/ui/PageHeader";

interface ActiveProduct {
  id: number;
  name: string;
  code: string | null;
  stock: number;
  brand: {
    id: number;
    name: string;
  };
  images: {
    id: number;
    url: string;
    isMain: boolean;
    position: number;
  }[];
}

interface InventoryProps {
  initialMovements: SerializedStockMovement[];
  products: ActiveProduct[];
  overallCount: number;
  totalItems: number;
  totalPages: number;
  currentPage: number;
  itemsPerPage: number;
  search: string;
  typeFilter: string;
  permissions: string[];
}

export default function Inventory({
  initialMovements,
  products,
  overallCount,
  totalItems,
  totalPages,
  currentPage,
  itemsPerPage,
  search,
  typeFilter,
  permissions,
}: InventoryProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const canAdjust = permissions.includes("inventory:adjust");

  // Modals state
  const [isOpenFormModal, setIsOpenFormModal] = useState(false);

  const handleOpenForm = () => {
    setIsOpenFormModal(true);
  };

  const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    const params = new URLSearchParams(searchParams.toString());
    if (val) {
      params.set("type", val);
    } else {
      params.delete("type");
    }
    params.delete("page"); // Reset a página 1 al filtrar
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Inventario (Kardex)"
        subtitle="Consulta el historial detallado de movimientos de stock y realiza ajustes manuales de inventario."
        breadcrumbs={[
          { label: "admin", href: "/admin" },
          { label: "inventario" },
        ]}
        action={
          canAdjust ? (
            <Button
              variant="primary"
              onClick={handleOpenForm}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold shadow-sm shrink-0"
            >
              <FiPlus className="w-4 h-4" />
              <span>Ajustar Stock</span>
            </Button>
          ) : undefined
        }
      />

      {/* Contenido Principal */}
      <div className="bg-bg-card border border-border-default/80 rounded-2xl shadow-xs overflow-hidden">
        {/* Barra de Filtros */}
        <div className="px-6 py-4 border-b border-border-soft flex flex-col md:flex-row items-stretch md:items-center gap-4 bg-bg-card">
          <div className="flex-1 max-w-md">
            <SearchInput placeholder="Buscar por nombre o código de producto..." />
          </div>
          <div className="w-full md:w-56 shrink-0">
            <Select
              value={typeFilter}
              onChange={handleTypeChange}
              placeholder="Todos los tipos"
              icon={<FiFilter className="w-4 h-4" />}
            >
              <option value="">Todos los tipos</option>
              <option value="INPUT">Entradas (+)</option>
              <option value="OUTPUT">Salidas (-)</option>
            </Select>
          </div>
          <div className="text-xs text-text-secondary md:ml-auto select-none font-medium">
            Total: {totalItems} {totalItems === 1 ? "movimiento encontrado" : "movimientos encontrados"}
          </div>
        </div>

        {/* Listado / Empty State */}
        {initialMovements.length === 0 ? (
          <div className="p-12 text-center select-none bg-bg-card">
            <FiPackage className="w-10 h-10 text-text-tertiary mx-auto mb-3" />
            <h3 className="text-sm font-bold text-text-primary">
              {overallCount === 0 ? "Kardex de Inventario Vacío" : "No se encontraron movimientos"}
            </h3>
            <p className="text-xs text-text-secondary mt-1 max-w-sm mx-auto">
              {overallCount === 0
                ? "Los movimientos de stock se generan automáticamente al crear productos, registrar ventas directas o recibir pedidos de catálogo. También puedes ingresar ajustes manuales."
                : search || typeFilter
                ? `No hay resultados para los términos o filtros aplicados.`
                : "Intenta cambiar los términos de búsqueda o filtros aplicados."}
            </p>
          </div>
        ) : (
          <>
            {/* Tabla de Movimientos */}
            <div className="overflow-x-auto">
              <TableInventory
                movements={initialMovements}
                currentPage={currentPage}
                itemsPerPage={itemsPerPage}
              />
            </div>

            {/* Paginación */}
            <Pagination
              totalPages={totalPages}
              currentPage={currentPage}
              totalItems={totalItems}
              itemsPerPage={itemsPerPage}
            />
          </>
        )}
      </div>

      {/* Formulario/Modal de Ajuste */}
      <FormInventory
        isOpen={isOpenFormModal}
        onClose={() => setIsOpenFormModal(false)}
        products={products}
      />
    </div>
  );
}

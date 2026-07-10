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
      {/* Encabezado de Página */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-text-primary">
            Inventario (Kardex)
          </h2>
          <p className="text-xs sm:text-sm text-text-secondary mt-0.5">
            Consulta el historial detallado de movimientos de stock y realiza ajustes manuales de inventario.
          </p>
        </div>
        {overallCount > 0 && canAdjust && (
          <Button
            variant="primary"
            onClick={handleOpenForm}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold self-start sm:self-auto shadow-sm shrink-0"
          >
            <FiPlus className="w-4 h-4" />
            Ajustar Stock
          </Button>
        )}
      </div>

      {/* Contenido Principal */}
      {overallCount === 0 ? (
        /* Empty State General (No hay ningún movimiento registrado aún) */
        <div className="flex flex-col items-center justify-center py-16 px-6 bg-bg-card border border-border-default/50 rounded-2xl text-center shadow-xs max-w-lg mx-auto my-8 select-none">
          <div className="w-16 h-16 rounded-2xl bg-beauty-50 dark:bg-beauty-950 flex items-center justify-center text-beauty-600 mb-5 border border-beauty-100 dark:border-beauty-500/10 shadow-xs">
            <FiPackage className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-text-primary mb-2">
            Kardex de Inventario Vacío
          </h3>
          <p className="text-xs text-text-secondary mb-8 leading-relaxed max-w-sm">
            Los movimientos de stock se generan automáticamente al crear productos, registrar ventas directas o recibir pedidos de catálogo. También puedes ingresar ajustes manuales.
          </p>
          {canAdjust && (
            <Button
              variant="primary"
              onClick={handleOpenForm}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold shadow-sm"
            >
              <FiPlus className="w-4 h-4" />
              Ajustar Stock
            </Button>
          )}
        </div>
      ) : (
        /* Listado de Registros con Filtros */
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
              Total: {totalItems} movimientos encontrados
            </div>
          </div>

          {/* Sin Resultados de Búsqueda */}
          {totalItems === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 px-4 text-center select-none">
              <div className="w-12 h-12 rounded-full bg-bg-surface flex items-center justify-center text-text-tertiary mb-3">
                <FiPackage className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-text-primary mb-1">
                No se encontraron movimientos
              </h3>
              <p className="text-xs text-text-secondary max-w-xs leading-relaxed">
                Prueba cambiando los términos de búsqueda o removiendo los filtros de tipo de movimiento.
              </p>
            </div>
          ) : (
            /* Tabla de Movimientos */
            <div className="overflow-x-auto">
              <TableInventory
                movements={initialMovements}
                currentPage={currentPage}
                itemsPerPage={itemsPerPage}
              />
            </div>
          )}

          {/* Paginación */}
          <Pagination
            totalPages={totalPages}
            currentPage={currentPage}
            totalItems={totalItems}
            itemsPerPage={itemsPerPage}
          />
        </div>
      )}

      {/* Formulario/Modal de Ajuste */}
      <FormInventory
        isOpen={isOpenFormModal}
        onClose={() => setIsOpenFormModal(false)}
        products={products}
      />
    </div>
  );
}

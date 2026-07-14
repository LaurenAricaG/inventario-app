"use client";

import { FiUsers, FiDollarSign, FiTrendingUp } from "react-icons/fi";
import ErrorBoundary from "@/components/error/ErrorBoundary";
import SearchInput from "@/components/ui/SearchInput";
import Pagination from "@/components/ui/Pagination";
import TableMovements, { SerializedClientBalance } from "./TableMovements";
import PageHeader from "@/components/ui/PageHeader";

interface MovementsProps {
  clients: SerializedClientBalance[];
  overallCount: number;
  totalItems: number;
  totalPages: number;
  currentPage: number;
  itemsPerPage: number;
  search: string;
  summary: {
    totalOutstanding: number;
    totalCollected: number;
    debtorsCount: number;
  };
}

export default function Movements({
  clients,
  overallCount,
  totalItems,
  totalPages,
  currentPage,
  itemsPerPage,
  search,
  summary,
}: MovementsProps) {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Movimientos de Clientes"
        subtitle="Historial de compras, abonos y estado de deudas de los clientes"
        breadcrumbs={[
          { label: "admin", href: "/admin" },
          { label: "movimientos" },
        ]}
      />

      {/* Tarjetas de Resumen Consolidado */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 select-none">
        {/* Card: Total por Cobrar */}
        <div className="p-5 bg-bg-card border border-border-default/70 rounded-3xl shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-danger-bg text-danger-text flex items-center justify-center shrink-0 border border-danger-text/10">
            <FiTrendingUp className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <p className="text-[10px] text-text-tertiary uppercase tracking-wider font-bold">
              Total por Cobrar
            </p>
            <h4 className="text-xl font-bold font-mono text-danger-text mt-0.5">
              S/ {summary.totalOutstanding.toFixed(2)}
            </h4>
          </div>
        </div>

        {/* Card: Total Recaudado */}
        <div className="p-5 bg-bg-card border border-border-default/70 rounded-3xl shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-success-bg text-success-text flex items-center justify-center shrink-0 border border-success-text/10">
            <FiDollarSign className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] text-text-tertiary uppercase tracking-wider font-bold">
              Total Cobrado (Historial)
            </p>
            <h4 className="text-xl font-bold font-mono text-success-text mt-0.5">
              S/ {summary.totalCollected.toFixed(2)}
            </h4>
          </div>
        </div>

        {/* Card: Clientes Deudores */}
        <div className="p-5 bg-bg-card border border-border-default/70 rounded-3xl shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-beauty-400/10 text-beauty-500 flex items-center justify-center shrink-0 border border-beauty-400/20">
            <FiUsers className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] text-text-tertiary uppercase tracking-wider font-bold">
              Clientes con Saldo Deudor
            </p>
            <h4 className="text-xl font-bold font-mono text-text-primary mt-0.5">
              {summary.debtorsCount} deudores
            </h4>
          </div>
        </div>
      </div>

      {/* Contenedor Único Premium de Tabla de Saldos */}
      <div className="bg-bg-card border border-border-default/80 rounded-2xl shadow-xs overflow-hidden">
        {/* Barra de Filtros */}
        <div className="px-6 py-4 border-b border-border-soft flex flex-col md:flex-row items-stretch md:items-center gap-4 bg-bg-card">
          <div className="flex-1 max-w-md">
            <SearchInput placeholder="Buscar por nombre de cliente..." />
          </div>
          <div className="text-xs text-text-secondary md:ml-auto select-none font-medium">
            Mostrando {totalItems} de {overallCount} clientes
          </div>
        </div>

        {totalItems === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-4 text-center select-none bg-bg-card">
            <div className="w-12 h-12 rounded-full bg-bg-surface flex items-center justify-center text-text-tertiary mb-3">
              <FiUsers className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-text-primary mb-1">
              No se encontraron clientes
            </h3>
            <p className="text-xs text-text-secondary max-w-xs leading-relaxed">
              No hay clientes que coincidan con la búsqueda "{search}".
            </p>
          </div>
        ) : (
          <ErrorBoundary variant="embedded" title="Tabla de Saldos de Clientes">
            <TableMovements
              clients={clients}
              currentPage={currentPage}
              itemsPerPage={itemsPerPage}
            />

            {/* Paginación */}
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={totalItems}
              itemsPerPage={itemsPerPage}
            />
          </ErrorBoundary>
        )}
      </div>
    </div>
  );
}

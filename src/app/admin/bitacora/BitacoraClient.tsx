"use client";

import { useState } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { FiEye, FiClock, FiSearch, FiCopy, FiCheck, FiFilter } from "react-icons/fi";
import { toast } from "sonner";
import { formatDateTimeWithSeconds } from "@/utils/date.utils";
import { LuHistory } from "react-icons/lu";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/Table";
import Pagination from "@/components/ui/Pagination";
import SearchInput from "@/components/ui/SearchInput";
import Select from "@/components/ui/Select";
import Modal from "@/components/ui/Modal";
import ButtonIcon from "@/components/ui/ButtonIcon";
import ErrorBoundary from "@/components/error/ErrorBoundary";
import PageHeader from "@/components/ui/PageHeader";

interface SerializedUser {
  id: number;
  name: string | null;
  username: string;
  email: string | null;
}

interface SerializedAuditLog {
  id: number;
  userId: number | null;
  action: string;
  entity: string;
  entityId: number;
  details: any;
  createdAt: string;
  user: SerializedUser | null;
}

interface BitacoraClientProps {
  initialLogs: SerializedAuditLog[];
  entityOptions: string[];
  overallCount: number;
  totalItems: number;
  totalPages: number;
  currentPage: number;
  itemsPerPage: number;
  search: string;
  actionFilter: string;
  entityFilter: string;
}

// Mapeador de nombres de entidades a términos legibles en español
const entityTranslations: Record<string, string> = {
  Company: "Empresa",
  Brand: "Marca",
  GenderSegment: "Género",
  User: "Usuario",
  Client: "Cliente",
  Product: "Producto",
  DirectSale: "Venta Directa",
  Order: "Pedido Catálogo",
  Payment: "Pago/Abono",
  Debt: "Deuda",
  Campaign: "Campaña",
};

export default function BitacoraClient({
  initialLogs,
  entityOptions,
  overallCount,
  totalItems,
  totalPages,
  currentPage,
  itemsPerPage,
  search,
  actionFilter,
  entityFilter,
}: BitacoraClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Estado del modal de detalles
  const [selectedLog, setSelectedLog] = useState<SerializedAuditLog | null>(
    null,
  );
  const [isOpenDetailsModal, setIsOpenDetailsModal] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success("JSON copiado al portapapeles.");
    setTimeout(() => setCopied(false), 2000);
  };

  // Manejar cambio en filtro de acción
  const handleActionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const params = new URLSearchParams(searchParams.toString());
    const val = e.target.value;
    if (val && val !== "ALL") {
      params.set("action", val);
    } else {
      params.delete("action");
    }
    params.delete("page"); // Reiniciar a página 1
    router.push(`${pathname}?${params.toString()}`);
  };

  // Manejar cambio en filtro de entidad
  const handleEntityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const params = new URLSearchParams(searchParams.toString());
    const val = e.target.value;
    if (val && val !== "ALL") {
      params.set("entity", val);
    } else {
      params.delete("entity");
    }
    params.delete("page"); // Reiniciar a página 1
    router.push(`${pathname}?${params.toString()}`);
  };

  // Abrir modal de detalles
  const handleOpenDetails = (log: SerializedAuditLog) => {
    setSelectedLog(log);
    setIsOpenDetailsModal(true);
  };

  // Obtener traducción de entidad
  const getEntityLabel = (entityName: string) => {
    return entityTranslations[entityName] || entityName;
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Bitácora de Auditoría"
        subtitle="Historial detallado de acciones y modificaciones del sistema."
        breadcrumbs={[
          { label: "admin", href: "/admin" },
          { label: "bitacora" },
        ]}
      />

      {/* Contenido Principal */}
      {overallCount === 0 ? (
        /* Vista de estado vacío */
        <div className="flex flex-col items-center justify-center py-16 px-6 bg-bg-card border border-border-default/50 rounded-2xl text-center shadow-xs max-w-lg mx-auto my-8 select-none">
          <div className="w-16 h-16 rounded-2xl bg-beauty-50 dark:bg-beauty-950 flex items-center justify-center text-beauty-600 mb-5 border border-beauty-100 dark:border-beauty-500 shadow-xs">
            <LuHistory className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-text-primary mb-2">
            Bitácora vacía
          </h3>
          <p className="text-xs text-text-secondary leading-relaxed max-w-sm">
            Aún no se han registrado acciones de auditoría en la base de datos.
            Las creaciones, modificaciones y eliminaciones aparecerán aquí.
          </p>
        </div>
      ) : (
        /* Tabla e interface de registros */
        <div className="bg-bg-card border border-border-default/80 rounded-2xl shadow-xs overflow-hidden">
          {/* Barra de Filtros */}
          <div className="px-6 py-4 border-b border-border-soft flex flex-col lg:flex-row items-stretch lg:items-center gap-4 bg-bg-card">
            {/* Buscador */}
            <div className="flex-1 max-w-md">
              <SearchInput placeholder="Buscar por usuario o entidad..." />
            </div>

            {/* Selectores de Filtros al costado del buscador */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto">
              {/* Filtro Acción */}
              <div className="w-full sm:w-44 select-none">
                <Select
                  value={actionFilter}
                  onChange={handleActionChange}
                  placeholder="Acción (Todas)"
                  icon={<FiFilter className="w-4 h-4" />}
                >
                  <option value="ALL">Acción (Todas)</option>
                  <option value="CREATE">CREATE</option>
                  <option value="UPDATE">UPDATE</option>
                  <option value="DELETE">DELETE</option>
                </Select>
              </div>

              {/* Filtro Entidad */}
              <div className="w-full sm:w-48 select-none">
                <Select
                  value={entityFilter}
                  onChange={handleEntityChange}
                  placeholder="Entidad (Todas)"
                >
                  <option value="ALL">Entidad (Todas)</option>
                  {entityOptions.map((opt) => (
                    <option key={opt} value={opt}>
                      {getEntityLabel(opt)}
                    </option>
                  ))}
                </Select>
              </div>
            </div>

            <div className="text-xs text-text-secondary lg:ml-auto select-none font-medium">
              Total: {totalItems} registros encontrados
            </div>
          </div>

          {/* Estado de Búsqueda sin Resultados */}
          {totalItems === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 px-4 text-center select-none">
              <div className="w-12 h-12 rounded-full bg-bg-surface flex items-center justify-center text-text-tertiary mb-3">
                <FiSearch className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-text-primary mb-1">
                No se encontraron logs
              </h3>
              <p className="text-xs text-text-secondary max-w-xs leading-relaxed">
                Ningún registro coincide con tus filtros o términos de búsqueda.
              </p>
            </div>
          ) : (
            <>
              {/* Tabla responsiva */}
              <ErrorBoundary variant="embedded" title="Tabla de Auditoría">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-center w-40">
                        Fecha / Hora
                      </TableHead>
                      <TableHead className="text-center w-48">
                        Usuario
                      </TableHead>
                      <TableHead className="text-center w-32">Acción</TableHead>
                      <TableHead className="text-center">
                        Entidad / Registro
                      </TableHead>
                      <TableHead className="text-center w-28">
                        Detalles
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {initialLogs.map((log) => (
                      <TableRow key={log.id}>
                        {/* Fecha / Hora */}
                        <TableCell
                          suppressHydrationWarning
                          className="font-mono text-[11px] text-text-secondary text-center select-all"
                        >
                          {formatDateTimeWithSeconds(log.createdAt)}
                        </TableCell>

                        {/* Usuario que ejecutó la acción */}
                        <TableCell className="text-center font-medium text-text-primary text-xs">
                          {log.user ? (
                            <div className="flex flex-col items-center">
                              <span className="font-semibold">
                                {log.user.name || "Sin nombre"}
                              </span>
                              <span className="text-[10px] text-text-tertiary">
                                @{log.user.username}
                              </span>
                            </div>
                          ) : (
                            <span className="text-text-tertiary italic">
                              Sistema
                            </span>
                          )}
                        </TableCell>

                        {/* Acción (CREATE / UPDATE / DELETE) con badges de color */}
                        <TableCell className="text-center">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border select-none ${log.action === "CREATE"
                                ? "bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-900/30"
                                : log.action === "UPDATE"
                                  ? "bg-amber-50 text-amber-700 border-amber-100 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-900/30"
                                  : "bg-rose-50 text-rose-700 border-rose-100 dark:bg-rose-950/30 dark:text-rose-400 dark:border-rose-900/30"
                              }`}
                          >
                            {log.action}
                          </span>
                        </TableCell>

                        {/* Entidad y su ID correspondiente */}
                        <TableCell className="text-center font-medium text-text-secondary text-xs">
                          <div className="flex items-center justify-center gap-1.5">
                            <span className="font-semibold text-text-primary bg-bg-surface border border-border-default px-2 py-0.5 rounded-md">
                              {getEntityLabel(log.entity)}
                            </span>
                            <span className="text-text-tertiary text-[11px]">
                              (ID: {log.entityId})
                            </span>
                          </div>
                        </TableCell>

                        {/* Acciones (Ver detalles JSON) */}
                        <TableCell className="text-center">
                          <div className="flex justify-center">
                            <ButtonIcon
                              onClick={() => handleOpenDetails(log)}
                              variant="info"
                              icon={FiEye}
                              title="Ver Detalles del Registro"
                            />
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </ErrorBoundary>

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

      {/* Modal de Detalles del Log */}
      <Modal
        isOpen={isOpenDetailsModal}
        onClose={() => setIsOpenDetailsModal(false)}
        title={
          selectedLog ? `Detalle de Auditoría #${selectedLog.id}` : "Detalles"
        }
        size="xl"
        footer={<div></div>}
      >
        {selectedLog && (
          <div className="space-y-5">
            {/* Ficha técnica rápida */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 rounded-2xl bg-bg-surface border border-border-default/80 text-xs">
              <div className="space-y-1.5">
                <div className="flex items-center gap-1.5 text-text-tertiary">
                  <FiClock className="w-3.5 h-3.5" />
                  <span>Fecha y Hora:</span>
                </div>
                <p className="font-mono font-semibold text-text-primary text-left">
                  {formatDateTimeWithSeconds(selectedLog.createdAt)}
                </p>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center gap-1.5 text-text-tertiary">
                  <span className="font-bold">@</span>
                  <span>Usuario Ejecutor:</span>
                </div>
                <p className="font-semibold text-text-primary text-left">
                  {selectedLog.user
                    ? `${selectedLog.user.name || "Sin nombre"} (@${selectedLog.user.username})`
                    : "Sistema (Servicio Automático)"}
                </p>
              </div>

              <div className="space-y-1.5">
                <div className="text-text-tertiary">Acción:</div>
                <div className="text-left">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border ${selectedLog.action === "CREATE"
                        ? "bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-900/30"
                        : selectedLog.action === "UPDATE"
                          ? "bg-amber-50 text-amber-700 border-amber-100 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-900/30"
                          : "bg-rose-50 text-rose-700 border-rose-100 dark:bg-rose-950/30 dark:text-rose-400 dark:border-rose-900/30"
                      }`}
                  >
                    {selectedLog.action}
                  </span>
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="text-text-tertiary">Entidad Afectada:</div>
                <p className="font-semibold text-text-primary text-left">
                  {getEntityLabel(selectedLog.entity)} (ID:{" "}
                  {selectedLog.entityId})
                </p>
              </div>
            </div>

            {/* Bloque visor de JSON de cambios */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-text-primary">
                  Datos / Diferencias del Registro
                </h4>
                {selectedLog.details &&
                  Object.keys(selectedLog.details).length > 0 && (
                    <button
                      onClick={() => {
                        const antes =
                          selectedLog.details.antes ||
                          selectedLog.details.before;
                        const despues =
                          selectedLog.details.despues ||
                          selectedLog.details.after;
                        const payload =
                          antes || despues
                            ? { antes, despues }
                            : selectedLog.details;
                        handleCopy(JSON.stringify(payload, null, 2));
                      }}
                      className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-border-default/60 bg-bg-surface text-xs text-text-secondary hover:text-beauty-600 hover:border-beauty-200 dark:hover:bg-beauty-950/20 dark:hover:border-beauty-800 dark:hover:text-beauty-400 transition-all duration-200 cursor-pointer select-none font-medium"
                      title="Copiar JSON al portapapeles"
                    >
                      {copied ? (
                        <>
                          <FiCheck className="w-3.5 h-3.5 text-emerald-500" />
                          <span className="text-emerald-500 font-semibold">
                            Copiado
                          </span>
                        </>
                      ) : (
                        <>
                          <FiCopy className="w-3.5 h-3.5" />
                          <span>Copiar JSON</span>
                        </>
                      )}
                    </button>
                  )}
              </div>
              {selectedLog.details &&
                Object.keys(selectedLog.details).length > 0 ? (
                (() => {
                  const antesVal =
                    selectedLog.details.antes || selectedLog.details.before;
                  const despuesVal =
                    selectedLog.details.despues || selectedLog.details.after;

                  if (antesVal || despuesVal) {
                    return (
                      <div className="flex flex-col gap-4">
                        {/* Panel Antes (Rojo) */}
                        <div className="flex-1 space-y-1.5">
                          <div className="flex items-center gap-1.5 text-xs font-bold text-rose-600 dark:text-rose-400 select-none">
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                            <span>Antes (Estado Anterior)</span>
                          </div>
                          <pre className="p-3 bg-rose-500/5 text-rose-600 dark:text-rose-400 rounded-xl overflow-x-auto text-xs font-mono border border-rose-500/10 dark:border-rose-500/20 max-h-72 scrollbar-thin scrollbar-thumb-stone-300 dark:scrollbar-thumb-zinc-700 select-all">
                            {JSON.stringify(antesVal || {}, null, 2)}
                          </pre>
                        </div>

                        {/* Panel Después (Verde) */}
                        <div className="flex-1 space-y-1.5">
                          <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 select-none">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            <span>Después (Estado Nuevo)</span>
                          </div>
                          <pre className="p-3 bg-emerald-500/5 text-emerald-600 dark:text-emerald-400 rounded-xl overflow-x-auto text-xs font-mono border border-emerald-500/10 dark:border-emerald-500/20 max-h-72 scrollbar-thin scrollbar-thumb-stone-300 dark:scrollbar-thumb-zinc-700 select-all">
                            {JSON.stringify(despuesVal || {}, null, 2)}
                          </pre>
                        </div>
                      </div>
                    );
                  }

                  // Caso base (sin antes/despues)
                  return (
                    <div className="relative group">
                      <pre className="p-4 bg-zinc-950 text-emerald-400 rounded-xl overflow-x-auto text-xs font-mono border border-border-default/60 max-h-80 scrollbar-thin scrollbar-thumb-stone-300 dark:scrollbar-thumb-zinc-700 select-all">
                        {JSON.stringify(selectedLog.details, null, 2)}
                      </pre>
                      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-[10px] text-zinc-500 font-mono select-none">
                        JSON formateado
                      </div>
                    </div>
                  );
                })()
              ) : (
                <p className="text-xs text-text-tertiary italic p-4 bg-bg-surface border border-border-default/60 rounded-xl">
                  Sin información o cambios detallados registrados para esta
                  acción.
                </p>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

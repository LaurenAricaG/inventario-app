"use client";

import { useState } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { FiClock, FiSearch, FiCopy, FiCheck, FiFilter } from "react-icons/fi";
import { toast } from "sonner";
import { formatDateTimeWithSeconds } from "@/utils/date.utils";
import { LuHistory } from "react-icons/lu";
import Pagination from "@/components/ui/Pagination";
import SearchInput from "@/components/ui/SearchInput";
import Select from "@/components/ui/Select";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import PageHeader from "@/components/ui/PageHeader";
import LogsTable from "./LogsTable";

export interface SerializedUser {
  id: number;
  name: string | null;
  username: string;
  email: string | null;
}

export interface SerializedAuditLog {
  id: number;
  userId: number | null;
  action: string;
  entity: string;
  entityId: number;
  details: any;
  createdAt: string;
  user: SerializedUser | null;
}

export interface LogsProps {
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

import {
  auditEntityTranslations as entityTranslations,
  auditActionTranslations,
  formatAuditDetails,
} from "@/utils/translations.utils";

const actionColors: Record<string, string> = {
  CREATE: "bg-success-bg/50 border-success-text/10 text-success-text",
  UPDATE: "bg-warning-bg/50 border-warning-text/10 text-warning-text",
  DELETE: "bg-danger-bg/50 border-danger-text/10 text-danger-text",
};

export default function Logs({
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
}: LogsProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

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

  const handleActionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const params = new URLSearchParams(searchParams.toString());
    const val = e.target.value;
    if (val && val !== "ALL") {
      params.set("action", val);
    } else {
      params.delete("action");
    }
    params.delete("page");
    router.push(`${pathname}?${params.toString()}`);
  };

  const handleEntityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const params = new URLSearchParams(searchParams.toString());
    const val = e.target.value;
    if (val && val !== "ALL") {
      params.set("entity", val);
    } else {
      params.delete("entity");
    }
    params.delete("page");
    router.push(`${pathname}?${params.toString()}`);
  };

  const handleOpenDetails = (log: SerializedAuditLog) => {
    setSelectedLog(log);
    setIsOpenDetailsModal(true);
  };

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

      {/* Caja Contenedora */}
      <div className="bg-bg-card border border-border-default/80 rounded-2xl shadow-xs overflow-hidden">
        {/* Barra de Filtros */}
        <div className="px-6 py-4 border-b border-border-soft flex flex-col lg:flex-row items-stretch lg:items-center gap-4 bg-bg-card">
          <div className="flex-1 max-w-md">
            <SearchInput placeholder="Buscar por usuario o entidad..." />
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto">
            <div className="w-full sm:w-44 select-none">
              <Select
                value={actionFilter}
                onChange={handleActionChange}
                placeholder="Acción (Todas)"
                icon={<FiFilter className="w-4 h-4" />}
              >
                <option value="ALL">Acción (Todas)</option>
                <option value="CREATE">Creación</option>
                <option value="UPDATE">Edición</option>
                <option value="DELETE">Eliminación</option>
              </Select>
            </div>

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
            Total: {totalItems} {totalItems === 1 ? "registro encontrado" : "registros encontrados"}
          </div>
        </div>

        {/* Listado / Empty State */}
        {initialLogs.length === 0 ? (
          <div className="p-12 text-center select-none bg-bg-card">
            <LuHistory className="w-10 h-10 text-text-tertiary mx-auto mb-3" />
            <h3 className="text-sm font-bold text-text-primary">
              {overallCount === 0 ? "Bitácora vacía" : "No se encontraron logs"}
            </h3>
            <p className="text-xs text-text-secondary mt-1 max-w-sm mx-auto">
              {overallCount === 0
                ? "Aún no se han registrado acciones de auditoría en la base de datos. Las creaciones, modificaciones y eliminaciones aparecerán aquí."
                : search || actionFilter !== "ALL" || entityFilter !== "ALL"
                ? "Ningún registro coincide con tus filtros o términos de búsqueda."
                : "Intenta cambiar los términos de búsqueda o filtros aplicados."}
            </p>
          </div>
        ) : (
          <>
            <LogsTable
              logs={initialLogs}
              onViewDetails={handleOpenDetails}
              getEntityLabel={getEntityLabel}
            />

            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={totalItems}
              itemsPerPage={itemsPerPage}
            />
          </>
        )}
      </div>

      {/* Modal de Detalles del Log */}
      <Modal
        isOpen={isOpenDetailsModal}
        onClose={() => setIsOpenDetailsModal(false)}
        title={
          selectedLog ? `Detalle de Auditoría #${selectedLog.id}` : "Detalles"
        }
        size="xl"
        footer={
          <Button
            variant="outline"
            onClick={() => setIsOpenDetailsModal(false)}
            className="border-border-strong text-text-primary hover:bg-bg-surface"
          >
            Cerrar
          </Button>
        }
      >
        {selectedLog && (
          <div className="space-y-5">
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
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border ${
                      actionColors[selectedLog.action] ||
                      "bg-bg-surface text-text-secondary border-border-default"
                    }`}
                  >
                    {auditActionTranslations[selectedLog.action] || selectedLog.action}
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

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-text-primary">
                  Datos / Diferencias del Registro
                </h4>
                {selectedLog.details &&
                  Object.keys(selectedLog.details).length > 0 && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        const antes =
                          selectedLog.details.antes ||
                          selectedLog.details.before;
                        const despues =
                          selectedLog.details.despues ||
                          selectedLog.details.after;
                        const payload =
                          antes || despues
                            ? { antes: formatAuditDetails(antes), despues: formatAuditDetails(despues) }
                            : formatAuditDetails(selectedLog.details);
                        handleCopy(JSON.stringify(payload, null, 2));
                      }}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold gap-1.5 border-border-strong text-text-primary hover:bg-bg-surface"
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
                    </Button>
                  )}
              </div>
              {selectedLog.details &&
              Object.keys(selectedLog.details).length > 0 ? (
                (() => {
                  const antesVal = formatAuditDetails(
                    selectedLog.details.antes || selectedLog.details.before
                  );
                  const despuesVal = formatAuditDetails(
                    selectedLog.details.despues || selectedLog.details.after
                  );

                  if (antesVal || despuesVal) {
                    return (
                      <div className="flex flex-col gap-4">
                        <div className="flex-1 space-y-1.5">
                          <div className="flex items-center gap-1.5 text-xs font-bold text-rose-600 dark:text-rose-400 select-none">
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                            <span>Antes (Estado Anterior)</span>
                          </div>
                          <pre className="p-3 bg-rose-500/5 text-rose-600 dark:text-rose-400 rounded-xl overflow-x-auto text-xs font-mono border border-rose-500/10 dark:border-rose-500/20 max-h-72 scrollbar-thin scrollbar-thumb-stone-300 dark:scrollbar-thumb-zinc-700 select-all outline-none focus:outline-none focus-visible:outline-none">
                            {JSON.stringify(antesVal || {}, null, 2)}
                          </pre>
                        </div>

                        <div className="flex-1 space-y-1.5">
                          <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 select-none">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            <span>Después (Estado Nuevo)</span>
                          </div>
                          <pre className="p-3 bg-emerald-500/5 text-emerald-600 dark:text-emerald-400 rounded-xl overflow-x-auto text-xs font-mono border border-emerald-500/10 dark:border-emerald-500/20 max-h-72 scrollbar-thin scrollbar-thumb-stone-300 dark:scrollbar-thumb-zinc-700 select-all outline-none focus:outline-none focus-visible:outline-none">
                            {JSON.stringify(despuesVal || {}, null, 2)}
                          </pre>
                        </div>
                      </div>
                    );
                  }

                  return (
                    <div className="relative group">
                      <pre className="p-4 bg-zinc-950 text-emerald-400 rounded-xl overflow-x-auto text-xs font-mono border border-border-default/60 max-h-80 scrollbar-thin scrollbar-thumb-stone-300 dark:scrollbar-thumb-zinc-700 select-all outline-none focus:outline-none focus-visible:outline-none">
                        {JSON.stringify(formatAuditDetails(selectedLog.details), null, 2)}
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

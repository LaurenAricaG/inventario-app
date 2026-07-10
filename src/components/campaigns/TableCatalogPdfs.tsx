"use client";

import { FiEdit2, FiTrash2, FiFileText, FiExternalLink } from "react-icons/fi";
import ErrorBoundary from "@/components/error/ErrorBoundary";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/Table";
import { SerializedCatalogPdf } from "@/types/catalogs";

interface TableCatalogPdfsProps {
  catalogs: SerializedCatalogPdf[];
  currentPage: number;
  itemsPerPage: number;
  canUpdate: boolean;
  canDelete: boolean;
  onEdit: (catalog: SerializedCatalogPdf) => void;
  onDelete: (catalog: SerializedCatalogPdf) => void;
}

export default function TableCatalogPdfs({
  catalogs,
  currentPage,
  itemsPerPage,
  canUpdate,
  canDelete,
  onEdit,
  onDelete,
}: TableCatalogPdfsProps) {
  return (
    <ErrorBoundary variant="embedded" title="Tabla de Catálogos PDF">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="text-center w-20">#</TableHead>
            <TableHead className="text-left">Campaña / Empresa</TableHead>
            <TableHead className="text-left">Marca</TableHead>
            <TableHead className="text-left">Título / Nombre</TableHead>
            <TableHead className="text-center w-40">Documento</TableHead>
            {(canUpdate || canDelete) && (
              <TableHead className="text-center w-28">Acciones</TableHead>
            )}
          </TableRow>
        </TableHeader>
        <TableBody>
          {catalogs.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={canUpdate || canDelete ? 6 : 5}
                className="text-center py-10 text-text-tertiary"
              >
                No se encontraron catálogos PDF registrados.
              </TableCell>
            </TableRow>
          ) : (
            catalogs.map((catalog, index) => {
              const rowIndex = (currentPage - 1) * itemsPerPage + index + 1;
              const campaignText = catalog.campaign
                ? `${catalog.campaign.number} - ${catalog.campaign.company.name}`
                : "Sin campaña";
              const brandText = catalog.brand?.name || "Sin marca";

              return (
                <TableRow key={catalog.id}>
                  <TableCell className="text-center font-medium text-text-secondary">
                    {rowIndex}
                  </TableCell>
                  <TableCell className="text-left">
                    <span className="font-semibold text-text-primary">
                      {campaignText}
                    </span>
                  </TableCell>
                  <TableCell className="text-left">
                    <div className="flex items-center gap-2">
                      {catalog.brand?.logoUrl ? (
                        <img
                          src={catalog.brand.logoUrl}
                          alt={brandText}
                          className="w-6 h-6 object-contain rounded bg-bg-surface p-0.5 border border-border-soft"
                        />
                      ) : (
                        <div className="w-6 h-6 rounded bg-beauty-50 flex items-center justify-center text-[10px] font-bold text-beauty-600 border border-beauty-100">
                          {brandText.substring(0, 2).toUpperCase()}
                        </div>
                      )}
                      <span className="text-sm text-text-primary">
                        {brandText}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-left">
                    <span className="text-sm text-text-secondary font-medium">
                      {catalog.title || <span className="italic text-text-tertiary">Sin título especificado</span>}
                    </span>
                  </TableCell>
                  <TableCell className="text-center">
                    {catalog.pdfUrl ? (
                      <a
                        href={catalog.pdfUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-beauty-400/10 hover:bg-beauty-400/20 text-beauty-600 dark:text-beauty-400 text-xs font-semibold transition-all border border-beauty-400/20 cursor-pointer"
                      >
                        <FiFileText className="w-3.5 h-3.5" />
                        <span>PDF</span>
                        <FiExternalLink className="w-3 h-3" />
                      </a>
                    ) : (
                      <span className="text-xs text-text-tertiary">Sin archivo</span>
                    )}
                  </TableCell>
                  {(canUpdate || canDelete) && (
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-2">
                        {canUpdate && (
                          <button
                            type="button"
                            onClick={() => onEdit(catalog)}
                            className="p-2 rounded-xl bg-warning-bg/40 border border-warning-text/15 text-warning-text hover:bg-warning-bg/80 hover:border-warning-text/30 hover:scale-[1.04] active:scale-[0.96] transition-all duration-200 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-warning-text/20"
                            title="Editar catálogo"
                          >
                            <FiEdit2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                        {canDelete && (
                          <button
                            type="button"
                            onClick={() => onDelete(catalog)}
                            className="p-2 rounded-xl bg-danger-bg/40 border border-danger-text/15 text-danger-text hover:bg-danger-bg/80 hover:border-danger-text/30 hover:scale-[1.04] active:scale-[0.96] transition-all duration-200 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-danger-text/20"
                            title="Eliminar catálogo"
                          >
                            <FiTrash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </TableCell>
                  )}
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </ErrorBoundary>
  );
}

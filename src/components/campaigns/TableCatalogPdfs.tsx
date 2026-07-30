"use client";

import { FiEdit2, FiTrash2, FiFileText } from "react-icons/fi";
import ErrorBoundary from "@/components/error/ErrorBoundary";
import ButtonIcon from "@/components/ui/ButtonIcon";
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
            <TableHead className="text-center w-36">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {catalogs.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={5}
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
                      {catalog.title || (
                        <span className="italic text-text-tertiary">
                          Sin título especificado
                        </span>
                      )}
                    </span>
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex items-center justify-center gap-2">
                      {catalog.pdfUrl && (
                        <ButtonIcon
                          href={catalog.pdfUrl}
                          target="_blank"
                          variant="secondary"
                          icon={FiFileText}
                          title="Ver documento"
                        />
                      )}
                      {canUpdate && (
                        <ButtonIcon
                          onClick={() => onEdit(catalog)}
                          variant="warning"
                          icon={FiEdit2}
                          title="Editar catálogo"
                        />
                      )}
                      {canDelete && (
                        <ButtonIcon
                          onClick={() => onDelete(catalog)}
                          variant="danger"
                          icon={FiTrash2}
                          title="Eliminar catálogo"
                        />
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </ErrorBoundary>
  );
}

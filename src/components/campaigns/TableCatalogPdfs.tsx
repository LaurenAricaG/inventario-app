"use client";

import { FiEdit2, FiTrash2, FiFile } from "react-icons/fi";
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
import { cn } from "@/utils/cn.utils";
import { getBrandBadgeStyle, getCompanyBadgeStyle } from "@/utils/brand.utils";

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
                    {catalog.campaign ? (
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-text-primary text-xs">
                          Campaña {catalog.campaign.number}
                        </span>
                        <span className={cn("px-2 py-0.5 rounded-full text-xs font-semibold border", getCompanyBadgeStyle(catalog.campaign.company.name))}>
                          {catalog.campaign.company.name}
                        </span>
                      </div>
                    ) : (
                      <span className="text-xs text-text-tertiary">Sin campaña</span>
                    )}
                  </TableCell>
                  <TableCell className="text-left">
                    <span className={cn("inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold border", getBrandBadgeStyle(catalog.brand?.name))}>
                      {brandText}
                    </span>
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
                          icon={FiFile}
                          title="Ver catálogo PDF"
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

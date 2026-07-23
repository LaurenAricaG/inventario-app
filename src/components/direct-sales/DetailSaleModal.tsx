"use client";

import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import { SerializedDirectSaleWithRelations } from "@/types/direct-sale";
import { printDirectSale } from "@/utils/print-direct-sale";

import { useSystemConfig } from "@/context/SystemConfigContext";
import { formatDateUTC } from "@/utils/date.utils";
import BrandLogo from "@/components/ui/BrandLogo";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/Table";

interface DetailSaleModalProps {
  isOpen: boolean;
  onClose: () => void;
  sale: SerializedDirectSaleWithRelations | null;
  isPublic?: boolean;
}

export default function DetailSaleModal({
  isOpen,
  onClose,
  sale,
  isPublic = false,
}: DetailSaleModalProps) {
  const systemConfig = useSystemConfig();
  if (!sale) return null;

  const calculatedSubtotal = sale.items.reduce(
    (sum, item) => sum + item.quantity * item.unitPrice,
    0,
  );

  // VISTA PÚBLICA DEL TICKET
  if (isPublic) {
    return (
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title="Detalle de Venta"
        size="md"
        footer={
          <Button
            variant="outline"
            onClick={onClose}
            className="border-border-strong text-text-primary hover:bg-bg-surface"
          >
            Cerrar
          </Button>
        }
      >
        <div className="max-w-md mx-auto font-sans text-sm text-text-primary space-y-4 p-2 md:p-4 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-xs outline-none focus:outline-none focus-visible:outline-none">
          {/* Header */}
          <div className="text-center pb-3 border-b border-dashed border-beauty-500/20 flex flex-col items-center">
            <BrandLogo size="xl" className="flex-col gap-2 text-center">
              <p className="text-[10px] text-text-secondary font-bold uppercase tracking-widest mt-2 text-center">
                Venta Directa
              </p>
            </BrandLogo>
            <div className="text-center mt-2 text-xs text-text-secondary">
              <span className="font-bold text-text-primary">F. Registro:</span>{" "}
              {formatDateUTC(sale.createdAt)}
            </div>
          </div>

          {/* Items Table */}
          <div className="py-2">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>PROD.</TableHead>
                  <TableHead className="text-center w-12">CANT.</TableHead>
                  <TableHead className="text-right w-20">P. UNIT</TableHead>
                  <TableHead className="text-right w-20">SUBTOTAL</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sale.items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <span className="font-bold text-text-primary block leading-tight">
                        {item.product.name}
                      </span>
                      <span className="text-[10px] text-text-tertiary mt-0.5 block">
                        {item.product.brand.name}
                      </span>
                    </TableCell>
                    <TableCell className="text-center font-mono font-bold text-text-secondary">
                      {item.quantity}
                    </TableCell>
                    <TableCell className="text-right font-mono text-text-secondary">
                      {item.unitPrice.toFixed(2)}
                    </TableCell>
                    <TableCell className="text-right font-mono font-bold text-text-primary">
                      {(item.quantity * item.unitPrice).toFixed(2)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Totales */}
          <div className="pt-3 border-t border-dashed border-beauty-500/20 flex flex-col items-end gap-1.5 text-xs">
            <div className="flex justify-between w-full max-w-50 text-text-secondary text-right">
              <span>Subtotal:</span>
              <span className="font-mono">
                S/ {calculatedSubtotal.toFixed(2)}
              </span>
            </div>
            {sale.discount > 0 && (
              <div className="flex justify-between w-full max-w-50 text-danger-text font-semibold text-right">
                <span>Descuento:</span>
                <span className="font-mono">
                  -S/ {sale.discount.toFixed(2)}
                </span>
              </div>
            )}
            <div className="flex justify-between w-full max-w-50 text-sm font-black text-beauty-600 dark:text-beauty-400 text-right">
              <span>Total Neto:</span>
              <span className="font-mono text-base">
                S/ {sale.total.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Nota - arriba del gracias */}
          {sale.notes && (
            <div className="pt-3 border-t border-dashed border-beauty-500/20">
              <div className="p-3 border border-dashed border-beauty-500/30 bg-beauty-500/5 rounded-2xl text-[11px] text-text-secondary">
                <span className="font-bold uppercase tracking-wider block text-[9px] mb-1">
                  Nota:
                </span>
                {sale.notes}
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="text-center pt-4 border-t border-dashed border-beauty-500/20 mt-2 select-none">
            <p className="text-xs font-black text-beauty-500 dark:text-beauty-400 tracking-wider">
              ¡GRACIAS POR TU PREFERENCIA!
            </p>
          </div>
        </div>
      </Modal>
    );
  }

  // VISTA ADMINISTRATIVA NORMAL
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Venta Directa"
      size="xl"
      footer={
        <div className="flex items-center gap-3">
          <Button
            variant="primary"
            onClick={() =>
              printDirectSale(
                sale,
                systemConfig?.systemName ?? "Mi empresa",
                systemConfig?.systemLogoUrl,
              )
            }
          >
            Imprimir
          </Button>
          <Button
            variant="outline"
            onClick={onClose}
            className="border-border-strong text-text-primary hover:bg-bg-surface"
          >
            Cancelar
          </Button>
        </div>
      }
    >
      {/* Wrapper Estilo Boleta de Venta */}
      <div className="p-4 md:p-6 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-xs font-sans text-zinc-900 dark:text-zinc-100 space-y-6 outline-none focus:outline-none focus-visible:outline-none">
        {/* Cabecera Boleta */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b-2 border-dashed border-zinc-200 dark:border-zinc-800 pb-5 select-none">
          <BrandLogo size="xl" className="gap-3">
            <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest mt-1">
              CONTROL DE VENTAS
            </p>
          </BrandLogo>
          <div className="border-2 border-beauty-400 rounded-xl p-3 text-center min-w-45 self-stretch sm:self-auto">
            <span className="text-[10px] font-extrabold text-beauty-600 dark:text-beauty-400 uppercase tracking-widest">
              Venta Directa
            </span>
            <div className="text-base font-mono font-black text-beauty-600 dark:text-beauty-400 mt-1">
              N° DS-{sale.id.toString().padStart(6, "0")}
            </div>
          </div>
        </div>

        {/* Datos Cliente & Emisión */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          {/* Col 1 */}
          <div className="space-y-2.5">
            <div className="flex items-start">
              <span className="w-24 text-zinc-400 font-bold uppercase tracking-wider shrink-0 select-none">
                Cliente:
              </span>
              <span className="font-bold text-zinc-900 dark:text-zinc-100">
                {sale.client.name}
              </span>
            </div>
            <div className="flex items-start">
              <span className="w-24 text-zinc-400 font-bold uppercase tracking-wider shrink-0 select-none">
                Teléfono:
              </span>
              <span className="text-zinc-600 dark:text-zinc-300">
                {sale.client.phone || "No especificado"}
              </span>
            </div>
          </div>
          {/* Col 2 */}
          <div className="space-y-2.5">
            <div className="flex items-start">
              <span className="w-24 text-zinc-400 font-bold uppercase tracking-wider shrink-0 select-none">
                F. Emisión:
              </span>
              <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                {formatDateUTC(sale.createdAt)}
              </span>
            </div>
          </div>
        </div>

        {/* Separador Delineado */}
        <hr className="border-t border-dashed border-zinc-200 dark:border-zinc-800" />

        {/* Productos Table */}
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-28">Cód.</TableHead>
              <TableHead>Prod.</TableHead>
              <TableHead className="text-center w-20">Cant.</TableHead>
              <TableHead className="text-right w-28">P. Unit</TableHead>
              <TableHead className="text-right w-28">Subtotal</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sale.items.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="font-mono text-text-tertiary text-xs">
                  {item.product.code || "-"}
                </TableCell>
                <TableCell>
                  <div className="flex flex-col">
                    <span className="font-semibold text-text-primary">
                      {item.product.name}
                    </span>
                    <span className="text-[10px] text-text-tertiary mt-0.5">
                      {item.product.brand.name} • {item.product.category.name}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="text-center font-mono font-medium text-text-primary">
                  {item.quantity}
                </TableCell>
                <TableCell className="text-right font-mono text-text-secondary">
                  {item.unitPrice.toFixed(2)}
                </TableCell>
                <TableCell className="text-right font-mono font-bold text-text-primary">
                  {(item.quantity * item.unitPrice).toFixed(2)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {/* Separador Delineado */}
        <hr className="border-t border-dashed border-zinc-200 dark:border-zinc-800" />

        {/* Resumen Final */}
        <div className="flex flex-col gap-4">
          {/* Totales - alineados a la derecha */}
          <div className="flex justify-end">
            <div className="w-full md:w-64 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 bg-zinc-50/50 dark:bg-zinc-900/30 space-y-2.5">
              <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400 select-none">
                <span>SUBTOTAL:</span>
                <span className="font-mono font-bold">
                  S/ {calculatedSubtotal.toFixed(2)}
                </span>
              </div>
              {sale.discount > 0 && (
                <div className="flex items-center justify-between text-xs text-danger-text font-medium select-none">
                  <span>DESCUENTO:</span>
                  <span className="font-mono font-bold">
                    -S/ {sale.discount.toFixed(2)}
                  </span>
                </div>
              )}
              <hr className="border-t border-dashed border-zinc-200 dark:border-zinc-800" />
              <div className="flex items-center justify-between text-sm font-black text-beauty-500 dark:text-beauty-400 select-none">
                <span>TOTAL NETO:</span>
                <span className="font-mono text-base">
                  S/ {sale.total.toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          {/* Nota - ancho completo, debajo de los montos */}
          {sale.notes && (
            <div className="mt-4 p-3 border border-dashed border-beauty-500/30 bg-beauty-500/5 rounded-2xl text-[11px] text-text-secondary">
              <span className="font-bold uppercase tracking-wider block text-[9px] mb-1">
                Nota:
              </span>
              {sale.notes}
            </div>
          )}
        </div>

        {/* Pie de Firma/Agradecimiento */}
        <div className="text-center uppercase tracking-widest border-t border-dashed border-zinc-200 dark:border-zinc-800 pt-5 select-none">
          <p className="text-xs font-black text-beauty-500 dark:text-beauty-400">
            ¡GRACIAS POR TU PREFERENCIA!
          </p>
        </div>
      </div>
    </Modal>
  );
}

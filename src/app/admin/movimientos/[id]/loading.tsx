import Skeleton from "@/components/ui/Skeleton";
import { PageHeaderSkeleton } from "@/components/ui/PageHeader";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/Table";

export default function MovimientosDetalleLoading() {
  const skeletonRows = Array.from({ length: 5 });

  return (
    <div className="space-y-6 animate-pulse">
      {/* Page Header Skeleton */}
      <PageHeaderSkeleton hasAction={true} />

      {/* Top Grid: Datos de Cliente + Saldo Pendiente */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Card 1: Datos del Cliente (lg:col-span-2) */}
        <div className="lg:col-span-2 bg-bg-card border border-border-default/70 p-6 rounded-3xl shadow-xs flex flex-col justify-between select-none">
          <div className="space-y-3">
            <Skeleton className="h-7 w-56 rounded-lg" />
            <div className="space-y-2 pt-1">
              <Skeleton className="h-4 w-40 rounded-md" />
              <Skeleton className="h-4 w-60 rounded-md" />
              <Skeleton className="h-4 w-48 rounded-md" />
            </div>
          </div>

          <div className="flex items-center justify-between border-t border-border-soft pt-4 mt-6">
            <Skeleton className="h-4 w-28 rounded-md" />
            <div className="flex items-center gap-2">
              <Skeleton className="w-9 h-9 rounded-xl" />
              <Skeleton className="w-9 h-9 rounded-xl" />
            </div>
          </div>
        </div>

        {/* Card 2: Saldo Pendiente (lg:col-span-1) */}
        <div className="lg:col-span-1 bg-bg-card border border-border-default/70 p-6 rounded-3xl shadow-xs flex flex-col justify-between select-none min-h-[190px]">
          <div>
            <Skeleton className="h-3 w-28 rounded-md mb-4" />
            <Skeleton className="h-9 w-36 rounded-xl" />
          </div>
          <div className="mt-4">
            <Skeleton className="h-6 w-32 rounded-full" />
          </div>
        </div>
      </div>

      {/* Contenedor de Tabla de Movimientos */}
      <div className="bg-bg-card border border-border-default/80 rounded-2xl shadow-xs overflow-hidden">
        {/* Cabecera de la tabla */}
        <div className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border-soft bg-bg-card">
          <Skeleton className="h-6 w-48 rounded-lg" />
          <div className="flex items-center gap-3">
            <Skeleton className="h-9 w-32 rounded-xl" />
            <Skeleton className="h-9 w-32 rounded-xl" />
          </div>
        </div>

        {/* Tabla Skeleton */}
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-32">Fecha</TableHead>
              <TableHead className="w-36">Tipo Movimiento</TableHead>
              <TableHead className="hidden md:table-cell">Detalle</TableHead>
              <TableHead className="text-right w-32">Monto</TableHead>
              <TableHead className="text-center w-24">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {skeletonRows.map((_, index) => (
              <TableRow key={index}>
                <TableCell>
                  <Skeleton className="h-4 w-24 rounded-md" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-5 w-28 rounded-full" />
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  <Skeleton className="h-4 w-48 rounded-md" />
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end">
                    <Skeleton className="h-4 w-20 rounded-md" />
                  </div>
                </TableCell>
                <TableCell className="text-center">
                  <div className="flex items-center justify-center">
                    <Skeleton className="w-8 h-8 rounded-xl" />
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

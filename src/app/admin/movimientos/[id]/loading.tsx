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
    <div className="space-y-6">
      {/* Page Header Skeleton */}
      <PageHeaderSkeleton hasAction={true} />

      {/* Top Grid: Datos del Cliente + Resumen Consolidado */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Datos Cliente */}
        <div className="bg-bg-card border border-border-default/70 p-6 rounded-3xl shadow-xs flex flex-col justify-between">
          <div className="space-y-2">
            <Skeleton className="h-6 w-44 font-black" />
            <Skeleton className="h-4 w-32" />
          </div>
          <div className="border-t border-border-soft pt-4 mt-4 flex items-center justify-between">
            <Skeleton className="h-4 w-28" />
            <div className="flex gap-2">
              <Skeleton className="w-8 h-8 rounded-xl" />
              <Skeleton className="w-8 h-8 rounded-xl" />
            </div>
          </div>
        </div>

        {/* Resumen Financiero Cards */}
        <div className="lg:col-span-2 grid grid-cols-2 sm:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, idx) => (
            <div key={idx} className="bg-bg-card border border-border-default/70 p-5 rounded-3xl shadow-xs flex flex-col justify-between">
              <Skeleton className="h-3 w-20" />
              <div className="mt-4">
                <Skeleton className="h-5 w-24 font-mono" />
                <Skeleton className="h-3 w-20 mt-1" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Título de Tabla y Botones */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border-soft pb-4 mt-8">
        <Skeleton className="h-6 w-44" />
        <div className="flex items-center gap-3">
          <Skeleton className="h-8 w-32 rounded-xl" />
          <Skeleton className="h-8 w-32 rounded-xl" />
        </div>
      </div>

      {/* Tabla de Movimientos Skeleton */}
      <div className="bg-bg-card border border-border-default/80 rounded-2xl shadow-xs overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-32">Tipo</TableHead>
              <TableHead className="w-32">Fecha</TableHead>
              <TableHead className="text-right w-36">Cargo (Debe)</TableHead>
              <TableHead className="text-right w-36">Abono (Haber)</TableHead>
              <TableHead className="text-right w-36">Saldo Acumulado</TableHead>
              <TableHead>Detalle / Glosa</TableHead>
              <TableHead className="text-center w-28">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {skeletonRows.map((_, index) => (
              <TableRow key={index}>
                <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                <TableCell className="text-right"><div className="flex justify-end"><Skeleton className="h-4 w-16" /></div></TableCell>
                <TableCell className="text-right"><div className="flex justify-end"><Skeleton className="h-4 w-16" /></div></TableCell>
                <TableCell className="text-right"><div className="flex justify-end"><Skeleton className="h-4 w-20" /></div></TableCell>
                <TableCell><Skeleton className="h-4 w-44" /></TableCell>
                <TableCell className="text-center">
                  <div className="flex items-center justify-center gap-2">
                    <Skeleton className="w-8 h-8 rounded-xl" />
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

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

export default function InventarioLoading() {
  const skeletonRows = Array.from({ length: 6 });

  return (
    <div className="space-y-6">
      {/* Page Header Skeleton */}
      <PageHeaderSkeleton hasAction={true} />

      {/* Skeleton de la tarjeta de contenido principal */}
      <div className="bg-bg-card border border-border-default/80 rounded-2xl shadow-xs overflow-hidden">
        {/* Skeleton de la barra de filtros */}
        <div className="px-6 py-4 border-b border-border-soft flex flex-col md:flex-row items-stretch md:items-center gap-4 bg-bg-card">
          <Skeleton className="h-10 w-full max-w-md rounded-xl" />
          <Skeleton className="h-10 w-44 rounded-xl" />
          <Skeleton className="h-4 w-44 md:ml-auto" />
        </div>

        {/* Skeleton de la tabla de movimientos (9 columnas) */}
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-center w-16">N°</TableHead>
              <TableHead className="text-left w-28">Código</TableHead>
              <TableHead className="text-left">Producto</TableHead>
              <TableHead className="text-center w-24">Cantidad</TableHead>
              <TableHead className="text-left w-36">Motivo</TableHead>
              <TableHead className="text-left">Detalles / Notas</TableHead>
              <TableHead className="text-left w-44">Fecha</TableHead>
              <TableHead className="text-left w-32">Usuario</TableHead>
              <TableHead className="text-center w-20">Detalle</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {skeletonRows.map((_, index) => (
              <TableRow key={index}>
                {/* Número */}
                <TableCell className="text-center">
                  <Skeleton className="h-4 w-6 mx-auto font-mono" />
                </TableCell>

                {/* Código */}
                <TableCell className="text-left">
                  <Skeleton className="h-4 w-20 font-mono" />
                </TableCell>

                {/* Producto */}
                <TableCell className="text-left">
                  <div className="space-y-1.5">
                    <Skeleton className="h-4 w-48" />
                    <Skeleton className="h-3 w-32" />
                  </div>
                </TableCell>

                {/* Cantidad (Badge Skeleton) */}
                <TableCell className="text-center">
                  <Skeleton className="h-5 w-12 rounded-full mx-auto" />
                </TableCell>

                {/* Motivo */}
                <TableCell className="text-left">
                  <Skeleton className="h-4 w-24" />
                </TableCell>

                {/* Notas */}
                <TableCell className="text-left">
                  <Skeleton className="h-4 w-52" />
                </TableCell>

                {/* Fecha */}
                <TableCell className="text-left">
                  <Skeleton className="h-4 w-32" />
                </TableCell>

                {/* Usuario */}
                <TableCell className="text-left">
                  <Skeleton className="h-4 w-24" />
                </TableCell>

                {/* Detalle */}
                <TableCell className="text-center">
                  <Skeleton className="h-7 w-7 rounded-lg mx-auto" />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {/* Skeleton de la paginación */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-4 px-6 border-t border-border-soft w-full">
          <Skeleton className="h-4 w-48" />
          <div className="flex items-center gap-1.5">
            <Skeleton className="w-8 h-8 rounded-xl" />
            <Skeleton className="w-8 h-8 rounded-xl" />
            <Skeleton className="w-8 h-8 rounded-xl" />
            <Skeleton className="w-8 h-8 rounded-xl" />
            <Skeleton className="w-8 h-8 rounded-xl" />
          </div>
        </div>
      </div>
    </div>
  );
}

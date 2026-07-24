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

export default function BitacoraLoading() {
  const skeletonRows = Array.from({ length: 10 });

  return (
    <div className="space-y-6">
      {/* Page Header Skeleton */}
      <PageHeaderSkeleton hasAction={false} />

      {/* Skeleton de la tarjeta principal */}
      <div className="bg-bg-card border border-border-default/80 rounded-2xl shadow-xs overflow-hidden">
        {/* Skeleton de filtros */}
        <div className="px-6 py-4 border-b border-border-soft flex flex-col lg:flex-row items-stretch lg:items-center gap-4 bg-bg-card">
          <Skeleton className="h-10 w-full max-w-md rounded-xl" />
          <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto lg:ml-auto">
            <Skeleton className="h-10 w-36 rounded-xl" />
            <Skeleton className="h-10 w-44 rounded-xl" />
          </div>
        </div>

        {/* Skeleton de la tabla (5 columnas) */}
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-center w-40">Fecha / Hora</TableHead>
              <TableHead className="text-center w-48">Usuario</TableHead>
              <TableHead className="text-center w-32">Acción</TableHead>
              <TableHead className="text-center">Entidad / Registro</TableHead>
              <TableHead className="text-center w-28">Detalles</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {skeletonRows.map((_, index) => (
              <TableRow key={index}>
                {/* Fecha / Hora */}
                <TableCell className="text-center">
                  <div className="flex justify-center">
                    <Skeleton className="h-4 w-28 font-mono" />
                  </div>
                </TableCell>

                {/* Usuario */}
                <TableCell className="text-center">
                  <div className="flex justify-center">
                    <Skeleton className="h-4 w-32" />
                  </div>
                </TableCell>

                {/* Acción (Badge skeleton) */}
                <TableCell className="text-center">
                  <div className="flex justify-center">
                    <Skeleton className="h-6 w-20 rounded-full" />
                  </div>
                </TableCell>

                {/* Entidad / Registro */}
                <TableCell className="text-center">
                  <div className="flex justify-center">
                    <Skeleton className="h-4 w-40" />
                  </div>
                </TableCell>

                {/* Detalles (Ver botón skeleton) */}
                <TableCell className="text-center">
                  <div className="flex justify-center">
                    <Skeleton className="w-8 h-8 rounded-xl" />
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {/* Skeleton de paginación */}
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

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

export default function MarcasLoading() {
  const skeletonRows = Array.from({ length: 5 });

  return (
    <div className="space-y-6">
      {/* Page Header Skeleton */}
      <PageHeaderSkeleton hasAction={true} />

      {/* Skeleton de la tarjeta de contenido principal */}
      <div className="bg-bg-card border border-border-default/80 rounded-2xl shadow-xs overflow-hidden">
        {/* Skeleton de la barra de filtros */}
        <div className="px-6 py-4 border-b border-border-soft flex flex-col md:flex-row items-stretch md:items-center gap-4 bg-bg-card">
          <Skeleton className="h-10 w-full max-w-md rounded-xl" />
          <Skeleton className="h-4 w-44 md:ml-auto" />
        </div>

        {/* Skeleton de la tabla de marcas (4 columnas) */}
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-center w-20">Número</TableHead>
              <TableHead className="text-center">Marca</TableHead>
              <TableHead className="text-center">Empresa</TableHead>
              <TableHead className="text-center w-36">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {skeletonRows.map((_, index) => (
              <TableRow key={index}>
                {/* Número */}
                <TableCell className="text-center">
                  <div className="flex justify-center">
                    <Skeleton className="h-4 w-8 font-mono" />
                  </div>
                </TableCell>

                {/* Marca (Logo + Nombre Skeletons) */}
                <TableCell className="text-center">
                  <div className="flex items-center justify-center gap-3">
                    <Skeleton className="w-10 h-10 rounded-xl shrink-0" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                </TableCell>

                {/* Empresa (Badge skeleton) */}
                <TableCell className="text-center">
                  <div className="flex justify-center">
                    <Skeleton className="h-6 w-20 rounded-full" />
                  </div>
                </TableCell>

                {/* Acciones */}
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

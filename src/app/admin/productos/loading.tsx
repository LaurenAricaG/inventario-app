import Skeleton from "@/components/ui/Skeleton";
import { PageHeaderSkeleton } from "@/components/ui/PageHeader";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/Table";

export default function ProductosLoading() {
  // Crear un array de 5 elementos para renderizar las filas de carga (skeleton rows)
  const skeletonRows = Array.from({ length: 5 });

  return (
    <div className="space-y-6">
      {/* Page Header Skeleton */}
      <PageHeaderSkeleton hasAction={true} />

      {/* Contenedor Principal de la Tabla */}
      <div className="bg-bg-card border border-border-default/80 rounded-2xl shadow-xs overflow-hidden">
        {/* Barra de Filtros / Búsqueda Skeleton */}
        <div className="px-6 py-4 border-b border-border-soft flex flex-col md:flex-row items-stretch md:items-center gap-4 bg-bg-card">
          <div className="flex-1 max-w-md">
            <Skeleton className="h-10 w-full rounded-2xl" />
          </div>
          <div className="md:ml-auto select-none">
            <Skeleton className="h-4 w-40" />
          </div>
        </div>

        {/* Tabla Skeleton */}
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-center w-16">N°</TableHead>
              <TableHead className="text-left w-28">Código</TableHead>
              <TableHead className="text-left">Producto</TableHead>
              <TableHead className="text-left">Catálogo / Categoría</TableHead>
              <TableHead className="text-center w-24">Stock</TableHead>
              <TableHead className="text-right w-28">P. Catálogo</TableHead>
              <TableHead className="text-right w-28">P. Venta</TableHead>
              <TableHead className="text-center w-28">Estado</TableHead>
              <TableHead className="text-center w-32">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {skeletonRows.map((_, index) => (
              <TableRow key={index}>
                {/* Número */}
                <TableCell className="text-center py-4">
                  <Skeleton className="h-4 w-4 mx-auto rounded" />
                </TableCell>

                {/* Código */}
                <TableCell className="py-4">
                  <Skeleton className="h-3 w-16 rounded" />
                </TableCell>

                {/* Info Principal del Producto */}
                <TableCell className="py-4 text-left">
                  <Skeleton className="h-4 w-40 rounded" />
                </TableCell>

                {/* Catálogo / Categoría */}
                <TableCell className="py-4 text-left">
                  <div className="flex items-center gap-1.5 mb-1">
                    <Skeleton className="h-5 w-16 rounded-md" />
                    <Skeleton className="h-5 w-14 rounded-md" />
                  </div>
                  <Skeleton className="h-4 w-24 rounded" />
                </TableCell>

                {/* Stock */}
                <TableCell className="py-4 text-center">
                  <Skeleton className="h-5 w-8 mx-auto rounded-full" />
                </TableCell>

                {/* P. Catálogo */}
                <TableCell className="py-4 text-right">
                  <Skeleton className="h-4 w-16 ml-auto rounded" />
                </TableCell>

                {/* P. Venta */}
                <TableCell className="py-4 text-right">
                  <Skeleton className="h-4 w-16 ml-auto rounded" />
                </TableCell>

                {/* Estado */}
                <TableCell className="py-4 text-center">
                  <Skeleton className="h-5 w-16 mx-auto rounded-md" />
                </TableCell>

                {/* Acciones */}
                <TableCell className="py-4 text-center">
                  <div className="flex items-center justify-center gap-2">
                    <Skeleton className="w-8 h-8 rounded-xl" />
                    <Skeleton className="w-8 h-8 rounded-xl" />
                    <Skeleton className="w-8 h-8 rounded-xl" />
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {/* Paginación Skeleton */}
        <div className="px-6 py-4 border-t border-border-soft flex items-center justify-between">
          <Skeleton className="h-4 w-48" />
          <div className="flex items-center gap-2">
            <Skeleton className="h-9 w-9 rounded-xl" />
            <Skeleton className="h-9 w-9 rounded-xl" />
            <Skeleton className="h-9 w-9 rounded-xl" />
          </div>
        </div>
      </div>
    </div>
  );
}
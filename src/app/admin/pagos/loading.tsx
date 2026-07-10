import Skeleton from "@/components/ui/Skeleton";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/Table";

export default function PagosLoading() {
  const skeletonRows = Array.from({ length: 5 });

  return (
    <div className="space-y-6">
      {/* Skeleton del encabezado de página */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Skeleton className="h-8 w-44" />
          <Skeleton className="h-4 w-72 mt-2" />
        </div>
        <Skeleton className="h-10 w-36 rounded-xl self-start sm:self-auto" />
      </div>

      {/* Skeleton de la tarjeta de contenido principal */}
      <div className="bg-bg-card border border-border-default/80 rounded-2xl shadow-xs overflow-hidden">
        {/* Skeleton de la barra de filtros */}
        <div className="px-6 py-4 border-b border-border-soft flex flex-col md:flex-row items-stretch md:items-center gap-4 bg-bg-card">
          <Skeleton className="h-10 w-full max-w-md rounded-xl" />
          <div className="flex gap-3 md:ml-auto items-center">
            <Skeleton className="h-10 w-48 rounded-xl" />
            <Skeleton className="h-4 w-24 shrink-0" />
          </div>
        </div>

        {/* Skeleton de la tabla de pagos (5 columnas) */}
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-left w-[200px]">Cliente</TableHead>
              <TableHead className="text-right w-[110px]">Monto</TableHead>
              <TableHead className="text-center w-[120px]">Método</TableHead>
              <TableHead className="text-center w-[180px]">Fecha de Pago</TableHead>
              <TableHead className="text-left min-w-[200px]">Notas / Observaciones</TableHead>
              <TableHead className="text-center w-[80px]">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {skeletonRows.map((_, index) => (
              <TableRow key={index}>
                {/* Cliente */}
                <TableCell className="text-left">
                  <Skeleton className="h-4 w-32 font-bold" />
                  <Skeleton className="h-3 w-16 mt-1" />
                </TableCell>

                {/* Monto */}
                <TableCell className="text-right">
                  <div className="flex justify-end">
                    <Skeleton className="h-4 w-20" />
                  </div>
                </TableCell>

                {/* Método */}
                <TableCell className="text-center">
                  <div className="flex justify-center">
                    <Skeleton className="h-5 w-16 rounded-full" />
                  </div>
                </TableCell>

                {/* Fecha */}
                <TableCell className="text-center">
                  <div className="flex justify-center">
                    <Skeleton className="h-4 w-28" />
                  </div>
                </TableCell>

                {/* Notas */}
                <TableCell className="text-left">
                  <Skeleton className="h-4 w-48" />
                </TableCell>

                {/* Acciones */}
                <TableCell className="text-center">
                  <div className="flex justify-center">
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
          </div>
        </div>
      </div>
    </div>
  );
}

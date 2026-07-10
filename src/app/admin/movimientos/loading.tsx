import Skeleton from "@/components/ui/Skeleton";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/Table";

export default function MovimientosLoading() {
  const skeletonRows = Array.from({ length: 5 });

  return (
    <div className="space-y-6">
      {/* Skeleton del encabezado de página */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Skeleton className="h-8 w-60" />
          <Skeleton className="h-4 w-80 mt-2" />
        </div>
      </div>

      {/* Skeleton de las Tarjetas de Resumen Consolidado */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        {Array.from({ length: 3 }).map((_, idx) => (
          <div key={idx} className="p-5 bg-bg-card border border-border-default/70 rounded-3xl shadow-xs flex items-center gap-4">
            <Skeleton className="w-12 h-12 rounded-2xl shrink-0" />
            <div className="space-y-2">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-5 w-32 font-bold" />
            </div>
          </div>
        ))}
      </div>

      {/* Skeleton de la tarjeta de contenido principal */}
      <div className="bg-bg-card border border-border-default/80 rounded-2xl shadow-xs overflow-hidden">
        {/* Skeleton de la barra de filtros */}
        <div className="px-6 py-4 border-b border-border-soft flex flex-col md:flex-row items-stretch md:items-center gap-4 bg-bg-card">
          <Skeleton className="h-10 w-full max-w-md rounded-xl" />
          <Skeleton className="h-4 w-32 md:ml-auto" />
        </div>

        {/* Skeleton de la tabla de movimientos (6 columnas) */}
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-left w-[200px]">Cliente</TableHead>
              <TableHead className="text-right">Compras Catálogo</TableHead>
              <TableHead className="text-right">Ventas Directas</TableHead>
              <TableHead className="text-right">Deudas Adicionales</TableHead>
              <TableHead className="text-right">Abonos / Pagos</TableHead>
              <TableHead className="text-right w-[150px]">Saldo Pendiente</TableHead>
              <TableHead className="text-center w-[80px]">Detalle</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {skeletonRows.map((_, index) => (
              <TableRow key={index}>
                {/* Cliente */}
                <TableCell className="text-left">
                  <Skeleton className="h-4 w-36 font-bold" />
                  <Skeleton className="h-3 w-20 mt-1" />
                </TableCell>

                {/* Compras Catálogo */}
                <TableCell className="text-right">
                  <div className="flex justify-end">
                    <Skeleton className="h-4 w-16" />
                  </div>
                </TableCell>

                {/* Ventas Directas */}
                <TableCell className="text-right">
                  <div className="flex justify-end">
                    <Skeleton className="h-4 w-16" />
                  </div>
                </TableCell>

                {/* Deudas Adicionales */}
                <TableCell className="text-right">
                  <div className="flex justify-end">
                    <Skeleton className="h-4 w-16" />
                  </div>
                </TableCell>

                {/* Abonos / Pagos */}
                <TableCell className="text-right">
                  <div className="flex justify-end">
                    <Skeleton className="h-4 w-16" />
                  </div>
                </TableCell>

                {/* Saldo Pendiente */}
                <TableCell className="text-right">
                  <div className="flex justify-end">
                    <Skeleton className="h-4 w-20" />
                  </div>
                </TableCell>

                {/* Detalle */}
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

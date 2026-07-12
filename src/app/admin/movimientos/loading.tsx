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

        {/* Skeleton de la tabla de movimientos (8 columnas alineadas a TableMovements) */}
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-center w-16">N°</TableHead>
              <TableHead>Cliente</TableHead>
              <TableHead className="text-right">Compras Totales</TableHead>
              <TableHead className="text-right">Deudas Ext.</TableHead>
              <TableHead className="text-right">Total Pagado</TableHead>
              <TableHead className="text-right">Saldo Pendiente</TableHead>
              <TableHead className="text-center w-32">Estado</TableHead>
              <TableHead className="text-center w-20">Ficha</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {skeletonRows.map((_, index) => (
              <TableRow key={index}>
                {/* N° Correlativo */}
                <TableCell className="font-mono text-xs text-center">
                  <Skeleton className="h-4 w-6 mx-auto" />
                </TableCell>

                {/* Cliente */}
                <TableCell>
                  <Skeleton className="h-4 w-36 font-bold" />
                  <Skeleton className="h-3 w-20 mt-1" />
                </TableCell>

                {/* Compras Totales */}
                <TableCell className="text-right">
                  <div className="flex justify-end">
                    <Skeleton className="h-4 w-16" />
                  </div>
                </TableCell>

                {/* Deudas Ext. */}
                <TableCell className="text-right">
                  <div className="flex justify-end">
                    <Skeleton className="h-4 w-16" />
                  </div>
                </TableCell>

                {/* Total Pagado */}
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

                {/* Estado */}
                <TableCell className="text-center">
                  <div className="flex justify-center">
                    <Skeleton className="h-5 w-24 rounded-full" />
                  </div>
                </TableCell>

                {/* Ficha */}
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

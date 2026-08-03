import Skeleton from "@/components/ui/Skeleton";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/Table";

export default function ClientPublicPortalLoading() {
  const skeletonRows = Array.from({ length: 5 });

  return (
    <div className="min-h-screen bg-bg-page text-text-primary p-4 sm:p-6 md:p-8 transition-colors duration-300">
      <div className="max-w-6xl mx-auto space-y-6 animate-pulse">
        {/* Encabezado del Portal Público Skeleton */}
        <div className="flex justify-between items-center pb-4 border-b border-border-soft select-none">
          <div className="flex items-center gap-3">
            <Skeleton className="w-10 h-10 rounded-2xl" />
            <Skeleton className="h-6 w-32 rounded-lg" />
          </div>
          <Skeleton className="w-9 h-9 rounded-2xl" />
        </div>

        {/* Top Grid: Bienvenida + Saldo Pendiente */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Tarjeta de Bienvenida (lg:col-span-2) */}
          <div className="lg:col-span-2 bg-bg-card border border-border-default/70 p-6 rounded-3xl shadow-xs flex items-center gap-4 select-none min-h-[160px]">
            <Skeleton className="w-12 h-12 rounded-2xl shrink-0" />
            <div className="space-y-2 flex-1">
              <Skeleton className="h-3 w-36 rounded-md" />
              <Skeleton className="h-6 w-44 rounded-lg" />
              <Skeleton className="h-4 w-full max-w-sm rounded-md" />
            </div>
          </div>

          {/* Tarjeta de Saldo Pendiente (lg:col-span-1) */}
          <div className="lg:col-span-1 bg-bg-card border border-border-default/70 p-6 rounded-3xl shadow-xs flex flex-col justify-between select-none min-h-[160px]">
            <div>
              <Skeleton className="h-3 w-28 rounded-md mb-3" />
              <Skeleton className="h-9 w-36 rounded-xl" />
            </div>
            <div className="mt-4">
              <Skeleton className="h-6 w-32 rounded-full" />
            </div>
          </div>
        </div>

        {/* Historial de Movimientos Skeleton */}
        <div className="bg-bg-card border border-border-default/80 rounded-2xl shadow-xs overflow-hidden">
          <div className="p-6 border-b border-border-soft bg-bg-card">
            <Skeleton className="h-6 w-48 rounded-lg" />
          </div>
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
    </div>
  );
}

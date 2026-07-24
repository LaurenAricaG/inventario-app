import Skeleton from "@/components/ui/Skeleton";
import { PageHeaderSkeleton } from "@/components/ui/PageHeader";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/Table";

export default function VentasLoading() {
  const skeletonRows = Array.from({ length: 5 });

  return (
    <div className="space-y-6">
      {/* Page Header Skeleton */}
      <PageHeaderSkeleton hasAction={true} />

      {/* Main Content Card Skeleton */}
      <div className="bg-bg-card border border-border-default/80 rounded-2xl shadow-xs overflow-hidden">
        {/* Filters Bar Skeleton */}
        <div className="px-6 py-4 sm:py-5 border-b border-border-soft flex flex-col md:flex-row items-stretch md:items-center gap-4 bg-bg-card">
          <Skeleton className="h-10 w-full max-w-sm rounded-xl" />
          <Skeleton className="h-4 w-44 md:ml-auto" />
        </div>

        {/* Table Skeleton */}
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-center w-16">N°</TableHead>
              <TableHead className="text-center w-24">Venta ID</TableHead>
              <TableHead className="hidden md:table-cell">Fecha</TableHead>
              <TableHead>Cliente</TableHead>
              <TableHead className="text-right">Subtotal</TableHead>
              <TableHead className="text-right">Descuento</TableHead>
              <TableHead className="text-right">Total</TableHead>
              <TableHead className="text-center w-24">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {skeletonRows.map((_, index) => (
              <TableRow key={index}>
                {/* Number */}
                <TableCell className="text-center">
                  <Skeleton className="h-4 w-6 mx-auto rounded-md" />
                </TableCell>

                {/* Venta ID */}
                <TableCell className="text-center">
                  <Skeleton className="h-4 w-12 mx-auto rounded-md" />
                </TableCell>

                {/* Fecha */}
                <TableCell className="hidden md:table-cell">
                  <div className="flex items-center gap-1.5">
                    <Skeleton className="w-3.5 h-3.5 shrink-0" />
                    <Skeleton className="h-4 w-28" />
                  </div>
                </TableCell>

                {/* Cliente */}
                <TableCell>
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <Skeleton className="w-3.5 h-3.5 shrink-0" />
                      <Skeleton className="h-4 w-32" />
                    </div>
                  </div>
                </TableCell>

                {/* Subtotal */}
                <TableCell className="text-right">
                  <Skeleton className="h-4 w-16 ml-auto rounded-md" />
                </TableCell>

                {/* Descuento */}
                <TableCell className="text-right">
                  <Skeleton className="h-4 w-16 ml-auto rounded-md" />
                </TableCell>

                {/* Total */}
                <TableCell className="text-right">
                  <Skeleton className="h-4.5 w-20 ml-auto rounded-md" />
                </TableCell>

                {/* Acciones */}
                <TableCell className="text-center">
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

        {/* Pagination Skeleton */}
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

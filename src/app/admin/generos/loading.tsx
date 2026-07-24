import Skeleton from "@/components/ui/Skeleton";
import { PageHeaderSkeleton } from "@/components/ui/PageHeader";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/Table";

export default function GenerosLoading() {
  // Generate 5 mock rows for table skeletons
  const skeletonRows = Array.from({ length: 5 });

  return (
    <div className="space-y-6">
      {/* Page Header Skeleton */}
      <PageHeaderSkeleton hasAction={true} />

      {/* Main Content Card Skeleton */}
      <div className="bg-bg-card border border-border-default/80 rounded-2xl shadow-xs overflow-hidden">
        {/* Filters Bar Skeleton */}
        <div className="px-6 py-4 border-b border-border-soft flex flex-col md:flex-row items-stretch md:items-center gap-4 bg-bg-card">
          <Skeleton className="h-10 w-full max-w-md rounded-xl" />
          <Skeleton className="h-4 w-44 md:ml-auto" />
        </div>

        {/* Table Skeleton */}
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Número</TableHead>
              <TableHead>Nombre</TableHead>
              <TableHead className="hidden sm:table-cell">Fecha Registro</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {skeletonRows.map((_, index) => (
              <TableRow key={index}>
                {/* Número */}
                <TableCell>
                  <Skeleton className="h-4 w-8 font-mono" />
                </TableCell>

                {/* Nombre */}
                <TableCell>
                  <Skeleton className="h-4 w-32" />
                </TableCell>

                {/* Fecha Registro */}
                <TableCell className="hidden sm:table-cell">
                  <div className="flex items-center gap-1.5">
                    <Skeleton className="w-3.5 h-3.5 shrink-0" />
                    <Skeleton className="h-3.5 w-28" />
                  </div>
                </TableCell>

                {/* Acciones */}
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
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
            <Skeleton className="w-8 h-8 rounded-xl" />
            <Skeleton className="w-8 h-8 rounded-xl" />
          </div>
        </div>
      </div>
    </div>
  );
}

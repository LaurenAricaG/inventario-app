import Skeleton from "@/components/ui/Skeleton";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/Table";

export default function RolesLoading() {
  const skeletonRows = Array.from({ length: 5 });

  return (
    <div className="space-y-6">
      {/* Page Header Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Skeleton className="h-8 w-44" />
          <Skeleton className="h-4 w-72 mt-2" />
        </div>
        <Skeleton className="h-10 w-32 rounded-xl self-start sm:self-auto" />
      </div>

      {/* Main Content Card Skeleton */}
      <div className="bg-bg-card border border-border-default/80 rounded-2xl shadow-xs overflow-hidden">
        {/* Filters Bar Skeleton */}
        <div className="px-6 py-4 border-b border-border-soft flex flex-col sm:flex-row items-stretch sm:items-center gap-4 bg-bg-card">
          <div className="flex-1 max-w-md w-full">
            <Skeleton className="h-10 w-full rounded-xl" />
          </div>
          <div className="sm:ml-auto">
            <Skeleton className="h-4 w-24 rounded-md" />
          </div>
        </div>

        {/* Table Skeleton */}
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-center w-16">N°</TableHead>
              <TableHead>Rol</TableHead>
              <TableHead>Descripción</TableHead>
              <TableHead className="text-center w-40">Permisos Asignados</TableHead>
              <TableHead className="text-right w-32">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {skeletonRows.map((_, index) => (
              <TableRow key={index}>
                {/* Number */}
                <TableCell className="text-center">
                  <Skeleton className="h-4 w-6 mx-auto rounded-md" />
                </TableCell>

                {/* Role Name */}
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Skeleton className="w-4 h-4 rounded-full shrink-0" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                </TableCell>

                {/* Description */}
                <TableCell>
                  <Skeleton className="h-4 w-56" />
                </TableCell>

                {/* Permissions Count */}
                <TableCell className="text-center">
                  <Skeleton className="h-6 w-20 mx-auto rounded-full" />
                </TableCell>

                {/* Actions */}
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

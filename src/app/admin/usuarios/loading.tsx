import Skeleton from "@/components/ui/Skeleton";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/Table";

export default function UsuariosLoading() {
  // Generate 5 mock rows for table skeletons
  const skeletonRows = Array.from({ length: 5 });

  return (
    <div className="space-y-6">
      {/* Page Header Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Skeleton className="h-8 w-36" />
          <Skeleton className="h-4 w-64 mt-2" />
        </div>
        <Skeleton className="h-10 w-36 rounded-xl self-start sm:self-auto" />
      </div>

      {/* Main Content Card Skeleton */}
      <div className="bg-bg-card border border-border-default/80 rounded-2xl shadow-xs overflow-hidden">
        {/* Filters Bar Skeleton */}
        <div className="px-6 py-4 border-b border-border-soft flex flex-col md:flex-row items-stretch md:items-center gap-4 bg-bg-card">
          <div className="flex-1 max-w-md w-full">
            <Skeleton className="h-10 w-full rounded-xl" />
          </div>
          <div className="w-full md:w-52 shrink-0">
            <Skeleton className="h-10 w-full rounded-xl" />
          </div>
          <div className="md:ml-auto">
            <Skeleton className="h-4 w-36 rounded-md" />
          </div>
        </div>

        {/* Table Skeleton */}
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-center w-16">N°</TableHead>
              <TableHead>Usuario</TableHead>
              <TableHead>Correo Electrónico</TableHead>
              <TableHead>Rol de Acceso</TableHead>
              <TableHead className="hidden md:table-cell">Fecha Registro</TableHead>
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

                {/* User Profile */}
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Skeleton className="w-9 h-9 rounded-full shrink-0" />
                    <div className="space-y-1.5 min-w-0">
                      <Skeleton className="h-4 w-28" />
                      <Skeleton className="h-3.5 w-16" />
                    </div>
                  </div>
                </TableCell>

                {/* Email */}
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Skeleton className="w-3.5 h-3.5 shrink-0" />
                    <Skeleton className="h-3.5 w-40" />
                  </div>
                </TableCell>

                {/* Role Badge */}
                <TableCell>
                  <Skeleton className="h-5 w-16 rounded-full" />
                </TableCell>

                {/* Date Registered */}
                <TableCell className="hidden md:table-cell">
                  <div className="flex items-center gap-1.5">
                    <Skeleton className="w-3.5 h-3.5 shrink-0" />
                    <Skeleton className="h-3.5 w-24" />
                  </div>
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

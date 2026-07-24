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

export default function CampaniasLoading() {
  const skeletonRows = Array.from({ length: 5 });

  return (
    <div className="space-y-6">
      {/* Page Header Skeleton */}
      <PageHeaderSkeleton hasAction={true} />

      {/* Selector de Pestañas (Tabs) Skeleton */}
      <div className="flex items-center p-1 rounded-xl bg-bg-surface border border-border-default/50 self-start select-none w-full sm:w-auto gap-1">
        <Skeleton className="h-8 w-28 rounded-lg" />
        <Skeleton className="h-8 w-32 rounded-lg" />
      </div>

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
              <TableHead className="text-center w-20">Número</TableHead>
              <TableHead className="text-center">Empresa</TableHead>
              <TableHead className="text-center">Campaña</TableHead>
              <TableHead className="text-center">Fecha Inicio</TableHead>
              <TableHead className="text-center">Fecha Fin</TableHead>
              <TableHead className="text-center">Estado</TableHead>
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

                {/* Empresa */}
                <TableCell className="text-center">
                  <div className="flex justify-center">
                    <Skeleton className="h-6 w-24 rounded-full" />
                  </div>
                </TableCell>

                {/* Campaña */}
                <TableCell className="text-center">
                  <div className="flex justify-center">
                    <Skeleton className="h-4 w-12" />
                  </div>
                </TableCell>

                {/* Fecha Inicio */}
                <TableCell className="text-center">
                  <div className="flex justify-center">
                    <Skeleton className="h-4 w-24" />
                  </div>
                </TableCell>

                {/* Fecha Fin */}
                <TableCell className="text-center">
                  <div className="flex justify-center">
                    <Skeleton className="h-4 w-24" />
                  </div>
                </TableCell>

                {/* Estado */}
                <TableCell className="text-center">
                  <div className="flex justify-center">
                    <Skeleton className="h-5 w-16 rounded-full" />
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

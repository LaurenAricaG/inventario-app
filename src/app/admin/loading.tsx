import Skeleton from "@/components/ui/Skeleton";
import { PageHeaderSkeleton } from "@/components/ui/PageHeader";

export default function AdminDashboardLoading() {
  const metricSkeletons = Array.from({ length: 4 });

  return (
    <div className="space-y-6 animate-pulse select-none">
      {/* Page Header Skeleton */}
      <PageHeaderSkeleton hasAction={true} />

      {/* Tarjetas de métricas (4 cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {metricSkeletons.map((_, idx) => (
          <div
            key={idx}
            className="bg-bg-card border border-border-default/80 rounded-2xl p-5 flex items-start justify-between shadow-xs"
          >
            <div className="space-y-2 flex-1">
              <Skeleton className="h-3 w-24 rounded-md" />
              <Skeleton className="h-6 w-32 rounded-lg" />
              <Skeleton className="h-3 w-28 rounded-md" />
            </div>
            <Skeleton className="w-10 h-10 rounded-xl shrink-0 ml-3" />
          </div>
        ))}
      </div>

      {/* Grid de Contenido Principal (Gráficos / Listas) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Columna Izquierda (lg:col-span-2) */}
        <div className="lg:col-span-2 bg-bg-card border border-border-default/80 rounded-2xl p-6 shadow-xs space-y-4">
          <Skeleton className="h-6 w-44 rounded-lg" />
          <Skeleton className="h-64 w-full rounded-xl" />
        </div>

        {/* Columna Derecha (lg:col-span-1) */}
        <div className="lg:col-span-1 bg-bg-card border border-border-default/80 rounded-2xl p-6 shadow-xs space-y-4">
          <Skeleton className="h-6 w-36 rounded-lg" />
          <div className="space-y-3 pt-2">
            <Skeleton className="h-12 w-full rounded-xl" />
            <Skeleton className="h-12 w-full rounded-xl" />
            <Skeleton className="h-12 w-full rounded-xl" />
          </div>
        </div>
      </div>
    </div>
  );
}

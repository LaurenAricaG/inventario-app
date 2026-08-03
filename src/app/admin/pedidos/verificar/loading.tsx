import Skeleton from "@/components/ui/Skeleton";
import { PageHeaderSkeleton } from "@/components/ui/PageHeader";

export default function VerificarLoading() {
  const tableRowSkeletons = Array.from({ length: 6 });

  return (
    <div className="space-y-6 animate-pulse select-none">
      {/* Page Header Skeleton */}
      <PageHeaderSkeleton
        action={<Skeleton className="h-10 w-24 rounded-xl shrink-0" />}
      />

      {/* Barra de Progreso de Verificación */}
      <div className="p-5 bg-bg-card border border-border-default/70 rounded-3xl shadow-xs space-y-3">
        <div className="flex items-center justify-between text-xs font-bold text-text-secondary">
          <Skeleton className="h-4 w-44 rounded-md" />
          <Skeleton className="h-4 w-36 rounded-md" />
        </div>
        <div className="w-full bg-bg-surface border border-border-default/50 rounded-full h-3.5 p-0.5 overflow-hidden">
          <Skeleton className="h-full w-1/3 rounded-full" />
        </div>
      </div>

      {/* Listado Consolidado de Productos Skeleton */}
      <div className="bg-bg-card border border-border-default/80 rounded-3xl shadow-xs overflow-hidden">
        <div className="px-6 py-4 bg-bg-surface/50 border-b border-border-soft flex items-center justify-between">
          <Skeleton className="h-5 w-64 rounded-md" />
        </div>
        <div className="p-6 space-y-4">
          {tableRowSkeletons.map((_, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between py-3 border-b border-border-soft last:border-b-0 gap-4"
            >
              <Skeleton className="w-5 h-5 rounded-md shrink-0" />
              <Skeleton className="h-4 w-16 rounded-md shrink-0" />
              <Skeleton className="h-4 w-20 rounded-md shrink-0" />
              <Skeleton className="h-4 w-48 rounded-md flex-1" />
              <Skeleton className="h-4 w-16 rounded-md shrink-0" />
              <Skeleton className="h-4 w-12 rounded-md shrink-0" />
              <Skeleton className="h-6 w-20 rounded-full shrink-0" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

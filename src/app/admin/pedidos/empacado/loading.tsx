import Skeleton from "@/components/ui/Skeleton";
import { PageHeaderSkeleton } from "@/components/ui/PageHeader";

export default function EmpacadoLoading() {
  const pendingCardSkeletons = Array.from({ length: 2 });
  const itemSkeletons = Array.from({ length: 3 });
  const packedCardSkeletons = Array.from({ length: 3 });

  return (
    <div className="space-y-6 animate-pulse select-none">
      {/* Page Header Skeleton */}
      <PageHeaderSkeleton
        action={<Skeleton className="h-10 w-24 rounded-xl shrink-0" />}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Panel Izquierdo/Centro: Bolsas Pendientes de Armado (2 cols) */}
        <div className="lg:col-span-2 space-y-5">
          <div className="flex items-center gap-2 px-1">
            <Skeleton className="w-4.5 h-4.5 rounded-full shrink-0" />
            <Skeleton className="h-5 w-60 rounded-md" />
          </div>

          {pendingCardSkeletons.map((_, idx) => (
            <div
              key={idx}
              className="bg-bg-card border border-border-default/80 rounded-2xl shadow-xs overflow-hidden"
            >
              {/* Encabezado Ficha Cliente Skeleton */}
              <div className="px-6 py-4 bg-bg-surface/50 border-b border-border-soft flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <Skeleton className="w-4 h-4 rounded-md" />
                  <Skeleton className="h-5 w-40 rounded-md" />
                  <Skeleton className="h-5 w-24 rounded-full" />
                </div>
                <Skeleton className="h-9 w-36 rounded-xl" />
              </div>

              {/* Items Lista Skeleton */}
              <div className="p-6 space-y-3">
                {itemSkeletons.map((_, itemIdx) => (
                  <div
                    key={itemIdx}
                    className="flex items-center justify-between py-2 border-b border-border-soft last:border-b-0 gap-4"
                  >
                    <div className="flex items-center gap-3 flex-1">
                      <Skeleton className="w-4 h-4 rounded-md shrink-0" />
                      <Skeleton className="h-4 w-48 rounded-md" />
                    </div>
                    <div className="flex items-center gap-4 shrink-0">
                      <Skeleton className="h-6 w-20 rounded-lg" />
                      <Skeleton className="h-4 w-14 rounded-md" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Panel Derecho: Bolsas Listas para Entrega (1 col) */}
        <div className="space-y-5">
          <div className="flex items-center gap-2 px-1">
            <Skeleton className="w-4.5 h-4.5 rounded-full shrink-0" />
            <Skeleton className="h-5 w-52 rounded-md" />
          </div>

          <div className="space-y-3">
            {packedCardSkeletons.map((_, idx) => (
              <div
                key={idx}
                className="p-4 bg-bg-card border border-border-default/80 rounded-2xl shadow-xs space-y-3"
              >
                <div className="flex items-center gap-2">
                  <Skeleton className="w-4 h-4 rounded-full shrink-0" />
                  <Skeleton className="h-4 w-32 rounded-md" />
                </div>
                <div className="p-3 bg-bg-surface border border-border-soft/60 rounded-xl space-y-2">
                  <div className="flex justify-between items-center">
                    <Skeleton className="h-3 w-32 rounded-md" />
                    <Skeleton className="h-3 w-8 rounded-md" />
                  </div>
                  <div className="flex justify-between items-center">
                    <Skeleton className="h-3 w-28 rounded-md" />
                    <Skeleton className="h-3 w-8 rounded-md" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

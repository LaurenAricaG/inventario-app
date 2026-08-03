import Skeleton from "@/components/ui/Skeleton";
import { PageHeaderSkeleton } from "@/components/ui/PageHeader";

export default function EntregarLoading() {
  const pendingCardSkeletons = Array.from({ length: 2 });
  const deliveredCardSkeletons = Array.from({ length: 3 });

  return (
    <div className="space-y-6 animate-pulse select-none">
      {/* Page Header Skeleton */}
      <PageHeaderSkeleton
        action={<Skeleton className="h-10 w-24 rounded-xl shrink-0" />}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Panel Izquierdo/Centro: Pedidos Pendientes de Entrega (2 cols) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center gap-2 px-1">
            <Skeleton className="w-4.5 h-4.5 rounded-full shrink-0" />
            <Skeleton className="h-5 w-60 rounded-md" />
          </div>

          <div className="space-y-3">
            {pendingCardSkeletons.map((_, idx) => (
              <div
                key={idx}
                className="p-5 bg-bg-card border border-border-default/80 rounded-2xl shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-2 flex-1 min-w-0">
                  <div className="flex items-center gap-2.5">
                    <Skeleton className="w-8 h-8 rounded-lg shrink-0" />
                    <div className="space-y-1">
                      <Skeleton className="h-4 w-36 rounded-md" />
                      <Skeleton className="h-3 w-28 rounded-md" />
                    </div>
                  </div>
                  <Skeleton className="h-4 w-44 rounded-md" />
                </div>
                <div className="flex items-center justify-between sm:justify-end gap-5 pt-3 sm:pt-0 border-t sm:border-t-0 border-border-soft shrink-0">
                  <div className="space-y-1">
                    <Skeleton className="h-3 w-16 rounded-md" />
                    <Skeleton className="h-5 w-20 rounded-md" />
                  </div>
                  <Skeleton className="h-9 w-28 rounded-xl shrink-0" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Panel Derecho: Entregados Recientemente (1 col) */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 px-1">
            <Skeleton className="w-4.5 h-4.5 rounded-full shrink-0" />
            <Skeleton className="h-5 w-52 rounded-md" />
          </div>

          <div className="space-y-3">
            {deliveredCardSkeletons.map((_, idx) => (
              <div
                key={idx}
                className="p-4 bg-bg-card border border-border-default/80 rounded-2xl shadow-xs space-y-2"
              >
                <div className="flex items-center gap-2">
                  <Skeleton className="w-4 h-4 rounded-full shrink-0" />
                  <Skeleton className="h-4 w-32 rounded-md" />
                </div>
                <div className="space-y-1.5 pt-1">
                  <div className="flex justify-between items-center p-2 bg-bg-surface border border-border-soft/60 rounded-xl">
                    <Skeleton className="h-3 w-16 rounded-md" />
                    <Skeleton className="h-3 w-16 rounded-md" />
                  </div>
                  <div className="flex justify-between items-center p-2 bg-bg-surface border border-border-soft/60 rounded-xl">
                    <Skeleton className="h-3 w-14 rounded-md" />
                    <Skeleton className="h-3 w-20 rounded-md" />
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

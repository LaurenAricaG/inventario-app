import { PageHeaderSkeleton } from "@/components/ui/PageHeader";

export default function PedidosLoading() {
  return (
    <div className="space-y-6">
      {/* Page Header Skeleton */}
      <PageHeaderSkeleton hasAction={true} />

      {/* Botones de Flujo de Campaña */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="h-10 w-36 bg-border-strong/20 rounded-2xl animate-pulse" />
        <div className="h-10 w-28 bg-border-strong/20 rounded-2xl animate-pulse" />
        <div className="h-10 w-28 bg-border-strong/20 rounded-2xl animate-pulse" />
        <div className="h-10 w-28 bg-border-strong/20 rounded-2xl animate-pulse" />
      </div>

      {/* Grid de Estadísticas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="p-6 bg-bg-card border border-border-default/80 rounded-3xl shadow-xs"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-border-strong/25 animate-pulse shrink-0" />
              <div className="space-y-2 flex-1">
                <div className="h-3 w-20 bg-border-strong/20 rounded-lg animate-pulse" />
                <div className="h-6 w-32 bg-border-strong/40 rounded-lg animate-pulse" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Barra de Acciones */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 bg-bg-card border border-border-default/80 rounded-2xl shadow-xs">
        <div className="h-10 w-full max-w-md bg-border-strong/20 rounded-2xl animate-pulse" />
        <div className="flex gap-2">
          <div className="h-10 w-32 bg-border-strong/20 rounded-2xl animate-pulse" />
          <div className="h-10 w-32 bg-border-strong/20 rounded-2xl animate-pulse" />
        </div>
      </div>

      {/* Tabla Skeleton */}
      <div className="bg-bg-card border border-border-default/80 rounded-2xl shadow-xs overflow-hidden">
        <div className="px-6 py-4 bg-bg-surface border-b border-border-soft">
          <div className="h-4 w-40 bg-border-strong/30 rounded animate-pulse" />
        </div>
        <div className="p-6 space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="flex justify-between items-center py-3 border-b border-border-soft last:border-b-0"
            >
              <div className="space-y-2 flex-1">
                <div className="h-4 w-44 bg-border-strong/30 rounded animate-pulse" />
                <div className="h-3 w-28 bg-border-soft/60 rounded animate-pulse" />
              </div>
              <div className="h-6 w-16 bg-border-strong/25 rounded-full animate-pulse mr-4" />
              <div className="h-4 w-24 bg-border-strong/30 rounded animate-pulse mr-4" />
              <div className="h-8 w-8 bg-border-strong/20 rounded-lg animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

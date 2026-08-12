import Skeleton from "@/components/ui/Skeleton";

export default function AdminDashboardLoading() {
  const metricSkeletons = Array.from({ length: 4 });
  const tableRowSkeletons = Array.from({ length: 4 });
  const activitySkeletons = Array.from({ length: 5 });

  return (
    <div className="space-y-6 animate-pulse select-none">
      {/* Encabezado Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <Skeleton className="h-7 w-56 rounded-xl" />
          <Skeleton className="h-4 w-72 rounded-lg" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-10 w-32 rounded-xl" />
          <Skeleton className="h-10 w-32 rounded-xl" />
        </div>
      </div>

      {/* 1. Tarjetas de métricas (4 KPI cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {metricSkeletons.map((_, idx) => (
          <div
            key={idx}
            className="bg-bg-card border border-border-default rounded-2xl p-5 flex items-start justify-between shadow-xs"
          >
            <div className="space-y-2 flex-1">
              <Skeleton className="h-3 w-24 rounded-md" />
              <Skeleton className="h-6 w-32 rounded-lg" />
              <Skeleton className="h-3.5 w-36 rounded-md" />
            </div>
            <Skeleton className="w-10 h-10 rounded-xl shrink-0 ml-3" />
          </div>
        ))}
      </div>

      {/* 2. Sección de Gráficos (4 Charts Grid) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Gráfico 1: Deuda Acumulada vs Cobros (col-span-2) */}
        <div className="lg:col-span-2 bg-bg-card border border-border-default rounded-2xl p-5 shadow-xs flex flex-col justify-between space-y-4">
          <div className="space-y-1.5">
            <Skeleton className="h-5 w-48 rounded-lg" />
            <Skeleton className="h-3 w-80 rounded-md" />
          </div>
          <div className="h-64 w-full flex items-end gap-3 pt-6 px-2">
            <Skeleton className="h-16 flex-1 rounded-t-lg" />
            <Skeleton className="h-24 flex-1 rounded-t-lg" />
            <Skeleton className="h-32 flex-1 rounded-t-lg" />
            <Skeleton className="h-48 flex-1 rounded-t-lg" />
            <Skeleton className="h-40 flex-1 rounded-t-lg" />
            <Skeleton className="h-56 flex-1 rounded-t-lg" />
          </div>
          <div className="flex items-center justify-center gap-6 pt-3 border-t border-border-soft">
            <div className="flex items-center gap-2">
              <Skeleton className="w-3 h-3 rounded-full" />
              <Skeleton className="h-3 w-24 rounded-md" />
            </div>
            <div className="flex items-center gap-2">
              <Skeleton className="w-3 h-3 rounded-full" />
              <Skeleton className="h-3 w-24 rounded-md" />
            </div>
          </div>
        </div>

        {/* Gráfico 2: Pedidos por Empresa Campaña Activa (col-span-1) */}
        <div className="bg-bg-card border border-border-default rounded-2xl p-5 shadow-xs flex flex-col justify-between space-y-4">
          <div className="space-y-1.5">
            <Skeleton className="h-5 w-44 rounded-lg" />
            <Skeleton className="h-3 w-56 rounded-md" />
          </div>
          <div className="h-56 w-full flex items-end justify-center gap-6 px-4">
            <Skeleton className="h-36 w-12 rounded-t-xl" />
            <Skeleton className="h-44 w-12 rounded-t-xl" />
            <Skeleton className="h-28 w-12 rounded-t-xl" />
          </div>
          <div className="flex justify-around pt-2 border-t border-border-soft">
            <Skeleton className="h-3 w-12 rounded-md" />
            <Skeleton className="h-3 w-12 rounded-md" />
            <Skeleton className="h-3 w-12 rounded-md" />
          </div>
        </div>

        {/* Gráfico 3: Stock por Empresa Donut (col-span-1) */}
        <div className="bg-bg-card border border-border-default rounded-2xl p-5 shadow-xs flex flex-col justify-between space-y-4">
          <div className="space-y-1.5">
            <Skeleton className="h-5 w-36 rounded-lg" />
            <Skeleton className="h-3 w-48 rounded-md" />
          </div>
          <div className="h-56 w-full flex items-center justify-center">
            <Skeleton className="w-40 h-40 rounded-full border-8 border-bg-surface" />
          </div>
          <div className="flex items-center justify-center gap-4 pt-2 border-t border-border-soft">
            <Skeleton className="h-3 w-16 rounded-md" />
            <Skeleton className="h-3 w-16 rounded-md" />
            <Skeleton className="h-3 w-16 rounded-md" />
          </div>
        </div>

        {/* Gráfico 4: Stock por Categoría Principal (col-span-2) */}
        <div className="lg:col-span-2 bg-bg-card border border-border-default rounded-2xl p-5 shadow-xs flex flex-col justify-between space-y-4">
          <div className="space-y-1.5">
            <Skeleton className="h-5 w-52 rounded-lg" />
            <Skeleton className="h-3 w-64 rounded-md" />
          </div>
          <div className="h-56 w-full space-y-3 pt-2">
            <div className="flex items-center gap-3">
              <Skeleton className="h-3.5 w-24 rounded-md" />
              <Skeleton className="h-4 w-3/4 rounded-r-lg" />
            </div>
            <div className="flex items-center gap-3">
              <Skeleton className="h-3.5 w-24 rounded-md" />
              <Skeleton className="h-4 w-1/2 rounded-r-lg" />
            </div>
            <div className="flex items-center gap-3">
              <Skeleton className="h-3.5 w-24 rounded-md" />
              <Skeleton className="h-4 w-2/3 rounded-r-lg" />
            </div>
            <div className="flex items-center gap-3">
              <Skeleton className="h-3.5 w-24 rounded-md" />
              <Skeleton className="h-4 w-1/3 rounded-r-lg" />
            </div>
          </div>
        </div>
      </div>

      {/* 3. Grid Inferior (Tabla de Deudores & Actividad Reciente) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Columna Izquierda (lg:col-span-2) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Tabla de Clientes con Deuda */}
          <div className="bg-bg-card border border-border-default rounded-2xl p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1.5">
                <Skeleton className="h-5 w-44 rounded-lg" />
                <Skeleton className="h-3 w-56 rounded-md" />
              </div>
              <Skeleton className="h-8 w-24 rounded-xl" />
            </div>
            <div className="space-y-2.5 pt-2">
              {tableRowSkeletons.map((_, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-3 rounded-xl bg-bg-surface/60"
                >
                  <div className="flex items-center gap-3">
                    <Skeleton className="w-8 h-8 rounded-full" />
                    <div className="space-y-1">
                      <Skeleton className="h-3.5 w-32 rounded-md" />
                      <Skeleton className="h-2.5 w-20 rounded-md" />
                    </div>
                  </div>
                  <Skeleton className="h-4 w-20 rounded-md" />
                </div>
              ))}
            </div>
          </div>

          {/* Campañas Activas */}
          <div className="space-y-3">
            <Skeleton className="h-5 w-40 rounded-lg" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-bg-card border border-border-default rounded-2xl p-5 space-y-3">
                <Skeleton className="h-4 w-28 rounded-md" />
                <Skeleton className="h-6 w-36 rounded-lg" />
                <Skeleton className="h-3 w-full rounded-md" />
              </div>
              <div className="bg-bg-card border border-border-default rounded-2xl p-5 space-y-3">
                <Skeleton className="h-4 w-28 rounded-md" />
                <Skeleton className="h-6 w-36 rounded-lg" />
                <Skeleton className="h-3 w-full rounded-md" />
              </div>
            </div>
          </div>
        </div>

        {/* Columna Derecha (lg:col-span-1) - Actividad Reciente */}
        <div className="lg:col-span-1 bg-bg-card border border-border-default rounded-2xl p-5 shadow-xs space-y-4">
          <div className="space-y-1">
            <Skeleton className="h-5 w-36 rounded-lg" />
            <Skeleton className="h-3 w-48 rounded-md" />
          </div>
          <div className="space-y-3.5 pt-2">
            {activitySkeletons.map((_, i) => (
              <div key={i} className="flex items-start gap-3">
                <Skeleton className="w-8 h-8 rounded-full shrink-0 mt-0.5" />
                <div className="flex-1 space-y-1.5">
                  <Skeleton className="h-3.5 w-full rounded-md" />
                  <Skeleton className="h-2.5 w-24 rounded-md" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

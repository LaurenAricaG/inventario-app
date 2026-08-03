import Skeleton from "@/components/ui/Skeleton";
import { PageHeaderSkeleton } from "@/components/ui/PageHeader";

export default function NuevaPedidoLoading() {
  const itemRowSkeletons = Array.from({ length: 2 });

  return (
    <div className="space-y-6 animate-pulse select-none">
      {/* Page Header Skeleton */}
      <PageHeaderSkeleton
        action={<Skeleton className="h-10 w-24 rounded-xl shrink-0" />}
      />

      {/* Configuración de Campaña / Empresa Skeleton */}
      <div className="p-6 bg-linear-to-br from-bg-card to-bg-surface border border-border-default/80 rounded-3xl shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="w-full md:w-80 space-y-2">
          <Skeleton className="h-3.5 w-36 rounded-md" />
          <Skeleton className="h-10 w-full rounded-2xl" />
        </div>

        <div className="flex-1 flex flex-col sm:flex-row sm:items-center gap-4 bg-bg-surface border border-border-soft p-4 rounded-2xl">
          <div className="flex items-center gap-3">
            <Skeleton className="w-10 h-10 rounded-xl shrink-0" />
            <div className="space-y-1.5">
              <Skeleton className="h-3 w-24 rounded-md" />
              <Skeleton className="h-5 w-28 rounded-md" />
            </div>
          </div>
          <div className="sm:ml-auto flex items-center gap-3">
            <Skeleton className="h-6 w-20 rounded-full" />
            <Skeleton className="h-4 w-28 rounded-md" />
          </div>
        </div>
      </div>

      {/* Consola de Entrada Rápida (Formulario) Skeleton */}
      <div className="p-6 bg-bg-card border border-border-default/80 rounded-2xl shadow-xs space-y-4">
        <div className="border-b border-border-soft pb-3 mb-5">
          <Skeleton className="h-5 w-44 rounded-md" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Cliente */}
          <div className="md:col-span-2 space-y-2">
            <Skeleton className="h-3 w-20 rounded-md" />
            <div className="flex gap-2">
              <Skeleton className="h-11 flex-1 rounded-2xl" />
              <Skeleton className="h-11 w-11 rounded-2xl shrink-0" />
            </div>
          </div>
          {/* Marca */}
          <div className="space-y-2">
            <Skeleton className="h-3 w-16 rounded-md" />
            <Skeleton className="h-11 w-full rounded-2xl" />
          </div>
          {/* Código */}
          <div className="space-y-2">
            <Skeleton className="h-3 w-28 rounded-md" />
            <Skeleton className="h-11 w-full rounded-2xl" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-2">
          {/* Nombre Producto */}
          <div className="md:col-span-2 space-y-2">
            <Skeleton className="h-3 w-32 rounded-md" />
            <Skeleton className="h-11 w-full rounded-2xl" />
          </div>
          {/* Precio Catálogo */}
          <div className="space-y-2">
            <Skeleton className="h-3 w-32 rounded-md" />
            <Skeleton className="h-11 w-full rounded-2xl" />
          </div>
          {/* Cantidad y Botón */}
          <div className="flex items-start gap-2 pt-5">
            <Skeleton className="h-11 flex-1 rounded-2xl" />
            <Skeleton className="h-11 w-24 rounded-2xl shrink-0" />
          </div>
        </div>
      </div>

      {/* Listado de Pedidos Temporales Skeleton */}
      <div className="space-y-4">
        <Skeleton className="h-5 w-60 rounded-md" />

        <div className="bg-bg-card border border-border-default/80 rounded-2xl shadow-xs overflow-hidden">
          {/* Header Ficha Cliente */}
          <div className="px-6 py-4 bg-bg-surface border-b border-border-soft flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Skeleton className="w-4 h-4 rounded-md" />
              <Skeleton className="h-5 w-36 rounded-md" />
              <Skeleton className="h-4 w-24 rounded-md" />
            </div>
            <div className="flex items-center gap-3">
              <Skeleton className="h-4 w-28 rounded-md" />
              <Skeleton className="w-8 h-8 rounded-lg" />
            </div>
          </div>

          {/* Tabla de ítems */}
          <div className="p-6 space-y-3">
            {itemRowSkeletons.map((_, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between py-2 border-b border-border-soft last:border-b-0 gap-4"
              >
                <Skeleton className="h-4 w-16 rounded-md shrink-0" />
                <Skeleton className="h-4 w-24 rounded-md shrink-0" />
                <Skeleton className="h-4 w-48 rounded-md flex-1" />
                <Skeleton className="h-4 w-16 rounded-md shrink-0" />
                <Skeleton className="h-4 w-12 rounded-md shrink-0" />
                <Skeleton className="h-4 w-20 rounded-md shrink-0" />
                <Skeleton className="w-8 h-8 rounded-lg shrink-0" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Barra de Acciones Finales Skeleton */}
      <div className="p-5 bg-bg-card border border-border-default/80 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xs">
        <div className="space-y-1">
          <Skeleton className="h-3 w-40 rounded-md" />
          <Skeleton className="h-7 w-28 rounded-md" />
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Skeleton className="h-10 w-full sm:w-24 rounded-xl" />
          <Skeleton className="h-10 w-full sm:w-28 rounded-xl" />
        </div>
      </div>
    </div>
  );
}

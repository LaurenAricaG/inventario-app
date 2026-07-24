import Skeleton from "@/components/ui/Skeleton";
import { PageHeaderSkeleton } from "@/components/ui/PageHeader";

export default function ConfiguracionLoading() {
  return (
    <div className="space-y-6">
      {/* Cabecera del Módulo */}
      <PageHeaderSkeleton hasAction={true} />

      <div className="space-y-6">
        {/* Sección: Datos de la Empresa Skeleton */}
        <div className="bg-bg-card border border-border-default/80 rounded-2xl shadow-xs p-6 space-y-4">
          <div className="border-b border-border-soft pb-3 mb-2">
            <Skeleton className="h-5 w-40" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              {/* Nombre de la Empresa */}
              <div className="space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-10 w-full rounded-xl" />
              </div>

              {/* Número de WhatsApp */}
              <div className="space-y-2">
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-10 w-full rounded-xl" />
              </div>
            </div>

            {/* Logo */}
            <div className="space-y-2">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-32 w-full rounded-xl" />
            </div>
          </div>
        </div>

        {/* Sección: Opciones de Visualización Pública Skeleton */}
        <div className="bg-bg-card border border-border-default/80 rounded-2xl shadow-xs p-6 space-y-5">
          <div className="border-b border-border-soft pb-3 mb-2">
            <Skeleton className="h-5 w-48" />
          </div>

          {/* Tres filas de Checkbox */}
          <div className="space-y-5">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex gap-3">
                <Skeleton className="w-5 h-5 rounded-md shrink-0 mt-0.5" />
                <div className="space-y-1.5 flex-1">
                  <Skeleton className="h-4 w-48" />
                  <Skeleton className="h-3.5 w-full max-w-lg" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Botón de Guardar Skeleton */}
        <div className="flex justify-end pt-2">
          <Skeleton className="h-10 w-44 rounded-xl" />
        </div>
      </div>
    </div>
  );
}

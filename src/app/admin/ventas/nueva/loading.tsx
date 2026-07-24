import Skeleton from "@/components/ui/Skeleton";
import { PageHeaderSkeleton } from "@/components/ui/PageHeader";

export default function NuevaVentaLoading() {
  return (
    <div className="space-y-6">
      {/* Header Skeleton */}
      <PageHeaderSkeleton hasAction={false} />

      {/* Two Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Card: Buscador de Productos */}
          <div className="bg-bg-card border border-border-default/80 rounded-2xl p-6 shadow-xs space-y-4">
            <Skeleton className="h-4 w-40 rounded-md" />
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="md:col-span-2">
                <Skeleton className="h-4 w-32 mb-1.5 rounded-md" />
                <Skeleton className="h-11 w-full rounded-2xl" />
              </div>
              <div>
                <Skeleton className="h-4 w-16 mb-1.5 rounded-md" />
                <Skeleton className="h-11 w-full rounded-2xl" />
              </div>
              <div>
                <Skeleton className="h-4 w-24 mb-1.5 rounded-md" />
                <Skeleton className="h-11 w-full rounded-2xl" />
              </div>
            </div>
            <div className="flex justify-end pt-2">
              <Skeleton className="h-11 w-32 rounded-xl" />
            </div>
          </div>

          {/* Card: Items Table skeleton */}
          <div className="bg-bg-card border border-border-default/80 rounded-2xl p-6 shadow-xs space-y-4">
            <Skeleton className="h-4 w-32 rounded-md" />
            <div className="space-y-3">
              <Skeleton className="h-10 w-full rounded-xl" />
              <Skeleton className="h-10 w-full rounded-xl" />
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="lg:col-span-1 space-y-6">
          {/* Card: Cliente */}
          <div className="bg-bg-card border border-border-default/80 rounded-2xl p-6 shadow-xs space-y-4">
            <Skeleton className="h-4 w-32 rounded-md" />
            <div>
              <Skeleton className="h-4 w-16 mb-1.5 rounded-md" />
              <Skeleton className="h-11 w-full rounded-2xl" />
            </div>
            <div>
              <Skeleton className="h-4 w-28 mb-1.5 rounded-md" />
              <Skeleton className="h-24 w-full rounded-2xl" />
            </div>
          </div>

          {/* Card: Resumen */}
          <div className="bg-bg-card border border-border-default/80 rounded-2xl p-6 shadow-xs space-y-4">
            <Skeleton className="h-4 w-24 rounded-md" />
            <div className="space-y-2 pt-2">
              <div className="flex justify-between">
                <Skeleton className="h-4 w-16 rounded-md" />
                <Skeleton className="h-4 w-12 rounded-md" />
              </div>
              <div className="flex justify-between">
                <Skeleton className="h-4 w-20 rounded-md" />
                <Skeleton className="h-4 w-12 rounded-md" />
              </div>
              <div className="border-t border-border-soft my-2"></div>
              <div className="flex justify-between">
                <Skeleton className="h-5 w-12 rounded-md" />
                <Skeleton className="h-5 w-20 rounded-md" />
              </div>
            </div>
            <Skeleton className="h-12 w-full rounded-xl mt-4" />
          </div>
        </div>
      </div>
    </div>
  );
}

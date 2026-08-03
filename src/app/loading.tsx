import Skeleton from "@/components/ui/Skeleton";

export default function PublicCatalogLoading() {
  const cardSkeletons = Array.from({ length: 6 });

  return (
    <div className="min-h-screen bg-bg-page text-text-primary flex flex-col font-sans transition-colors duration-300">
      {/* 1. Header / Navbar Público Skeleton */}
      <header className="sticky top-0 z-40 w-full h-16 bg-bg-page/85 backdrop-blur-md border-b border-border-default transition-all duration-300">
        <div className="w-full max-w-7xl mx-auto h-full px-4 sm:px-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Skeleton className="w-10 h-10 rounded-2xl" />
            <Skeleton className="h-6 w-32 rounded-lg" />
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="h-9 w-24 sm:w-28 rounded-full" />
            <Skeleton className="w-9 h-9 rounded-2xl" />
          </div>
        </div>
      </header>

      {/* 2. Hero Section Skeleton */}
      <section className="relative border-b border-border-soft py-16 px-6 sm:px-12 flex flex-col items-center text-center overflow-hidden bg-linear-to-b from-beauty-50/50 via-bg-card to-bg-card dark:from-beauty-950/30 dark:via-bg-card dark:to-bg-card animate-pulse">
        <div className="relative max-w-3xl flex flex-col items-center w-full">
          <Skeleton className="h-7 w-52 rounded-full" />
          <Skeleton className="h-10 w-72 sm:w-96 rounded-xl mt-6 mb-4" />
          <Skeleton className="h-4 w-full max-w-md rounded-md mb-8" />
          <Skeleton className="h-11 w-36 rounded-full" />
        </div>
      </section>

      {/* 3. Panel de Búsqueda Rápida e Información de Filtros en Móvil (md:hidden) */}
      <div className="bg-bg-card border-b border-border-soft px-4 py-3 sm:px-8 flex items-center justify-between gap-3 sticky top-16 z-30 shadow-xs md:hidden animate-pulse">
        <Skeleton className="h-9 flex-1 rounded-2xl" />
        <Skeleton className="h-9 w-24 rounded-2xl shrink-0" />
      </div>

      {/* 4. Contenido Principal Skeleton */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-8 py-6 sm:py-8 flex flex-col md:flex-row items-start gap-8 min-w-0 animate-pulse">
        {/* FILTROS LATERALES - DESKTOP */}
        <aside className="hidden md:block w-64 shrink-0 bg-bg-card border border-border-default rounded-2xl p-6 sticky top-20 shadow-xs">
          <div className="flex items-center justify-between pb-4 mb-4 border-b border-border-soft">
            <Skeleton className="h-5 w-24 rounded-md" />
            <Skeleton className="h-4 w-12 rounded-md" />
          </div>

          {/* Filtro: Búsqueda */}
          <div className="mb-5">
            <Skeleton className="h-3 w-20 rounded-md mb-2" />
            <Skeleton className="h-9 w-full rounded-xl" />
          </div>

          {/* Filtro: Marcas */}
          <div className="mb-5 space-y-2">
            <Skeleton className="h-3 w-16 rounded-md mb-3" />
            <Skeleton className="h-4 w-28 rounded-md" />
            <Skeleton className="h-4 w-36 rounded-md" />
            <Skeleton className="h-4 w-32 rounded-md" />
          </div>

          {/* Filtro: Categorías */}
          <div className="mb-5 space-y-2">
            <Skeleton className="h-3 w-20 rounded-md mb-3" />
            <Skeleton className="h-7 w-full rounded-xl" />
            <Skeleton className="h-7 w-full rounded-xl" />
            <Skeleton className="h-7 w-full rounded-xl" />
          </div>
        </aside>

        {/* GRID DE PRODUCTOS SKELETON */}
        <div className="flex-1 flex flex-col min-w-0 w-full">
          {/* Categorías horizontales rápidas en Móvil y Tablet Skeleton (md:hidden) */}
          <div className="flex md:hidden items-center gap-2 overflow-x-auto w-full max-w-full pb-4 mb-4 scrollbar-none">
            <Skeleton className="h-8 w-20 rounded-full shrink-0" />
            <Skeleton className="h-8 w-24 rounded-full shrink-0" />
            <Skeleton className="h-8 w-24 rounded-full shrink-0" />
            <Skeleton className="h-8 w-28 rounded-full shrink-0" />
          </div>

          {/* Título de Resultados Skeleton */}
          <div className="flex items-center justify-between gap-3 mb-6">
            <div>
              <Skeleton className="h-6 w-44 rounded-lg" />
              <Skeleton className="h-3.5 w-56 rounded-md mt-1.5" />
            </div>
          </div>

          {/* Grid de Tarjetas de Producto */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {cardSkeletons.map((_, idx) => (
              <div
                key={idx}
                className="bg-bg-card border border-border-default/80 rounded-2xl overflow-hidden shadow-xs flex flex-col"
              >
                {/* Img Container */}
                <div className="aspect-square bg-border-strong/15 rounded-t-2xl animate-pulse" />
                {/* Detalle */}
                <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Skeleton className="h-4 w-20 rounded-md" />
                      <Skeleton className="h-4 w-12 rounded-md" />
                    </div>
                    <Skeleton className="h-5 w-4/5 rounded-md" />
                    <Skeleton className="h-3.5 w-1/2 rounded-md" />
                  </div>
                  <div className="flex items-center justify-between pt-3 border-t border-border-soft">
                    <Skeleton className="h-6 w-20 rounded-md" />
                    <Skeleton className="h-9 w-28 rounded-full" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}

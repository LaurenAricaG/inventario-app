import Skeleton from "@/components/ui/Skeleton";
import { PageHeaderSkeleton } from "@/components/ui/PageHeader";

export default function PdfLoading() {
  const cardSkeletons = Array.from({ length: 3 });

  return (
    <div className="min-h-screen bg-bg-page text-text-primary flex flex-col font-sans transition-colors duration-300">
      {/* Navbar Skeleton */}
      <header className="sticky top-0 z-40 w-full h-16 bg-bg-page/85 backdrop-blur-md border-b border-border-default transition-all duration-300">
        <div className="w-full max-w-5xl mx-auto h-full px-4 sm:px-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Skeleton className="w-10 h-10 rounded-2xl" />
            <Skeleton className="h-6 w-32 rounded-lg" />
          </div>
          <Skeleton className="w-9 h-9 rounded-2xl" />
        </div>
      </header>

      {/* Main Content Skeleton */}
      <main className="flex-1 w-full max-w-5xl mx-auto px-4 sm:px-8 py-6 space-y-8 animate-pulse">
        <PageHeaderSkeleton hasAction={false} />

        <div className="bg-bg-card border border-border-default/80 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xs">
          <div className="flex items-center gap-4">
            <Skeleton className="w-14 h-14 rounded-2xl" />
            <div className="space-y-2">
              <Skeleton className="h-6 w-44 rounded-lg" />
              <Skeleton className="h-4 w-32 rounded-md" />
            </div>
          </div>

          <div className="grid grid-cols-1 min-[480px]:grid-cols-2 md:grid-cols-3 gap-5 sm:gap-6">
            {cardSkeletons.map((_, idx) => (
              <div
                key={idx}
                className="bg-bg-surface border border-border-soft rounded-2xl p-4 space-y-4 shadow-xs"
              >
                <Skeleton className="w-full aspect-[3/4] rounded-xl" />
                <Skeleton className="h-5 w-3/4 rounded-md" />
                <Skeleton className="h-9 w-full rounded-xl" />
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}

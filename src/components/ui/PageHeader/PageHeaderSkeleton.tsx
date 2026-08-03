import Skeleton from "@/components/ui/Skeleton";
import { cn } from "@/utils/cn.utils";

interface PageHeaderSkeletonProps {
  hasAction?: boolean;
  action?: React.ReactNode;
  className?: string;
}

export default function PageHeaderSkeleton({
  hasAction = true,
  action,
  className,
}: PageHeaderSkeletonProps) {
  return (
    <div
      className={cn(
        "flex flex-col md:flex-row md:items-center justify-between gap-4 select-none",
        className,
      )}
    >
      <div className="space-y-1 min-w-0 flex-1">
        {/* Breadcrumb Skeleton */}
        <div className="flex items-center gap-1.5 mb-2">
          <Skeleton className="h-3 w-10 rounded-md" />
          <span className="text-[9px] text-text-tertiary/40">/</span>
          <Skeleton className="h-3 w-16 rounded-md" />
        </div>
        {/* Title & Subtitle Skeleton */}
        <Skeleton className="h-7 w-44 rounded-lg" />
        <Skeleton className="h-4 w-64 rounded-md mt-1.5" />
      </div>
      {action ? (
        <div className="flex items-center gap-3 shrink-0 self-start md:self-auto w-full md:w-auto">
          {action}
        </div>
      ) : (
        hasAction && (
          <Skeleton className="h-10 w-36 rounded-xl shrink-0 self-start md:self-auto" />
        )
      )}
    </div>
  );
}

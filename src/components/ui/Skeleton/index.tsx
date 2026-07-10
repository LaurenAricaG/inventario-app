import { cn } from "@/utils/cn.utils";

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {}

export default function Skeleton({ className, ...props }: SkeletonProps) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-xl bg-border-default/80 dark:bg-border-strong/80",
        className
      )}
      {...props}
    />
  );
}

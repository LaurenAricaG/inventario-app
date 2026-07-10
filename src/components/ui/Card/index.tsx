import { HTMLAttributes } from "react";
import { cn } from "@/utils/cn.utils";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  glass?: boolean;
}

export default function Card({
  children,
  className,
  glass = false,
  ...props
}: CardProps) {
  return (
    <div
      className={cn(
        "rounded-3xl border transition-all duration-300",
        glass
          ? "bg-bg-card/75 backdrop-blur-xl border-border-soft/60 shadow-xl dark:shadow-black/20"
          : "bg-bg-card border-border-soft shadow-md",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

import React from "react";
import Link from "next/link";
import { cn } from "@/utils/cn.utils";

export { default as PageHeaderSkeleton } from "./PageHeaderSkeleton";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  breadcrumbs?: BreadcrumbItem[];
  action?: React.ReactNode;
  className?: string;
}

export default function PageHeader({
  title,
  subtitle,
  breadcrumbs,
  action,
  className,
}: PageHeaderProps) {
  return (
    <div
      className={cn(
        "flex flex-col md:flex-row md:items-center justify-between gap-4 select-none",
        className,
      )}
    >
      <div className="space-y-1 min-w-0 flex-1">
        {breadcrumbs && breadcrumbs.length > 0 && (
          <nav className="flex items-center gap-1.5 text-[10px] font-bold text-text-tertiary uppercase tracking-wider mb-3 flex-wrap">
            {breadcrumbs.map((item, idx) => (
              <React.Fragment key={idx}>
                {idx > 0 && (
                  <span className="text-[9px] text-text-tertiary/40">/</span>
                )}
                {item.href ? (
                  <Link
                    href={item.href}
                    className="px-1 py-0.5 rounded-md hover:text-beauty-500 transition-colors outline-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-beauty-400 focus-visible:text-beauty-400"
                  >
                    {item.label}
                  </Link>
                ) : (
                  <span className="text-text-secondary font-semibold">
                    {item.label}
                  </span>
                )}
              </React.Fragment>
            ))}
          </nav>
        )}
        <h1 className="text-xl sm:text-2xl font-black text-text-primary tracking-tight leading-tight">
          {title}
        </h1>
        {subtitle && (
          <p className="text-xs sm:text-sm text-text-secondary leading-normal">
            {subtitle}
          </p>
        )}
      </div>
      {action && (
        <div className="flex items-center gap-3 shrink-0 self-start md:self-auto w-full md:w-auto">
          {action}
        </div>
      )}
    </div>
  );
}

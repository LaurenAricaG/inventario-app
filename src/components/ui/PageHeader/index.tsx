import React from "react";
import Link from "next/link";
import { cn } from "@/utils/cn.utils";

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
    <div className={cn("flex flex-col sm:flex-row sm:items-center justify-between gap-4 select-none", className)}>
      <div className="space-y-1">
        {breadcrumbs && breadcrumbs.length > 0 && (
          <nav className="flex items-center gap-1.5 text-[10px] font-bold text-text-tertiary uppercase tracking-wider mb-3">
            {breadcrumbs.map((item, idx) => (
              <React.Fragment key={idx}>
                {idx > 0 && <span className="text-[9px] text-text-tertiary/40">/</span>}
                {item.href ? (
                  <Link
                    href={item.href}
                    className="hover:text-beauty-500 transition-colors"
                  >
                    {item.label}
                  </Link>
                ) : (
                  <span className="text-text-secondary font-semibold">{item.label}</span>
                )}
              </React.Fragment>
            ))}
          </nav>
        )}
        <h1 className="text-2xl font-black text-text-primary tracking-tight leading-none">
          {title}
        </h1>
        {subtitle && (
          <p className="text-xs sm:text-sm text-text-secondary">
            {subtitle}
          </p>
        )}
      </div>
      {action && (
        <div className="flex items-center gap-3 shrink-0 self-start sm:self-auto">
          {action}
        </div>
      )}
    </div>
  );
}

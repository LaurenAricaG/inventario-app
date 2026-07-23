import React from "react";
import Link from "next/link";
import { cn } from "@/utils/cn.utils";

export type ButtonIconVariant =
  | "beauty"
  | "secondary"
  | "success"
  | "warning"
  | "danger"
  | "info";

interface ButtonIconProps {
  icon: React.ComponentType<{ className?: string }>;
  iconClassName?: string;
  variant?: ButtonIconVariant;
  href?: string;
  onClick?: React.MouseEventHandler<HTMLButtonElement | HTMLAnchorElement>;
  title?: string;
  className?: string;
  disabled?: boolean;
  loading?: boolean;
  target?: string;
  rel?: string;
}

const variantStyles: Record<ButtonIconVariant, string> = {
  beauty:
    "border-beauty-400/30 bg-beauty-400/5 hover:bg-beauty-400/10 text-beauty-400 hover:border-beauty-400/45 focus-visible:ring-beauty-400/35",
  secondary:
    "border-text-secondary/30 dark:border-white/15 bg-bg-card dark:bg-white/10 hover:bg-bg-surface dark:hover:bg-white/20 text-text-secondary dark:text-text-primary hover:text-text-primary focus-visible:ring-text-secondary/30 dark:focus-visible:ring-white/30",
  success:
    "bg-success-bg/45 border-success-text/15 text-success-text hover:bg-success-bg/85 hover:border-success-text/30 focus-visible:ring-success-text/35",
  warning:
    "bg-warning-bg/40 border-warning-text/15 text-warning-text hover:bg-warning-bg/80 hover:border-warning-text/30 focus-visible:ring-warning-text/35",
  danger:
    "bg-danger-bg/40 border-danger-text/15 text-danger-text hover:bg-danger-bg/80 hover:border-danger-text/30 focus-visible:ring-danger-text/35",
  info:
    "bg-info-bg/45 border-info-text/15 text-info-text hover:bg-info-bg/85 hover:border-info-text/30 focus-visible:ring-info-text/35",
};

export default function ButtonIcon({
  icon: Icon,
  iconClassName,
  variant = "beauty",
  href,
  onClick,
  title,
  className,
  disabled = false,
  loading = false,
  target,
  rel,
}: ButtonIconProps) {
  const commonClasses = cn(
    "p-2 rounded-xl border hover:scale-[1.04] active:scale-[0.96] transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2",
    variantStyles[variant],
    className,
  );

  const iconElement = (
    <Icon
      className={cn("w-3.5 h-3.5", loading && "animate-spin", iconClassName)}
    />
  );

  if (href) {
    // If it's a Link, cast the onClick to the Anchor event handler
    const anchorOnClick = onClick as
      | React.MouseEventHandler<HTMLAnchorElement>
      | undefined;

    return (
      <Link
        href={href}
        className={commonClasses}
        onClick={anchorOnClick}
        title={title}
        aria-label={title}
        target={target}
        rel={target === "_blank" && !rel ? "noopener noreferrer" : rel}
      >
        {iconElement}
      </Link>
    );
  }

  // Otherwise it's a standard button
  const buttonOnClick = onClick as
    | React.MouseEventHandler<HTMLButtonElement>
    | undefined;

  return (
    <button
      type="button"
      onClick={buttonOnClick}
      disabled={disabled || loading}
      className={commonClasses}
      title={title}
      aria-label={title}
    >
      {iconElement}
    </button>
  );
}

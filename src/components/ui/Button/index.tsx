import { ButtonHTMLAttributes } from "react";
import { cn } from "@/utils/cn.utils";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "glass";
  loading?: boolean;
}

export default function Button({
  children,
  className,
  variant = "primary",
  loading,
  disabled,
  ...props
}: ButtonProps) {
  const baseStyles =
    "flex items-center justify-center px-6 py-2 rounded-2xl text-sm font-semibold whitespace-nowrap transition-all duration-200 cursor-pointer select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ring-offset-bg-page disabled:opacity-50 disabled:cursor-not-allowed";

  const variants = {
    primary:
      "bg-beauty-400 hover:bg-beauty-600 text-white shadow-md shadow-beauty-400/10 focus-visible:ring-beauty-400",
    secondary:
      "bg-bg-accent hover:bg-beauty-50 text-beauty-800 focus-visible:ring-beauty-200",
    outline:
      "border border-border-strong bg-clip-padding hover:bg-bg-surface text-text-primary focus-visible:ring-beauty-400",
    glass:
      "bg-white/10 dark:bg-black/10 backdrop-blur-md border border-white/20 dark:border-white/10 hover:bg-white/20 dark:hover:bg-black/20 text-text-primary focus-visible:ring-white/20",
  };

  return (
    <button
      className={cn(baseStyles, variants[variant], className)}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <svg
          className="animate-spin -ml-1 mr-2 h-4 w-4 text-current"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      ) : null}
      {children}
    </button>
  );
}

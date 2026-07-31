import { InputHTMLAttributes, forwardRef, ReactNode } from "react";
import { cn } from "@/utils/cn.utils";

export interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  label?: ReactNode;
  subLabel?: ReactNode;
  error?: string;
}

const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, label, subLabel, error, ...props }, ref) => {
    return (
      <div className="w-full">
        <label className="flex items-start gap-3 cursor-pointer select-none group">
          <div className="relative flex items-center mt-0.5">
            <input
              ref={ref}
              type="checkbox"
              className={cn(
                "peer sr-only"
              )}
              {...props}
            />
            <div
              className={cn(
                "w-5 h-5 rounded-lg border border-border-strong/60 bg-bg-card flex items-center justify-center transition-all duration-200",
                "peer-checked:bg-beauty-600 peer-checked:border-beauty-600 peer-checked:shadow-xs",
                "peer-checked:[&_svg]:scale-100",
                "peer-focus-visible:ring-2 peer-focus-visible:ring-beauty-500 dark:peer-focus-visible:ring-beauty-400 peer-focus-visible:ring-offset-2 ring-offset-bg-card",
                "peer-disabled:opacity-50 peer-disabled:cursor-not-allowed",
                error && "border-danger-text peer-focus-visible:ring-danger-text/20",
                "group-hover:border-beauty-400/50 peer-checked:group-hover:border-beauty-700"
              )}
            >
              <svg
                className="w-3 h-3 text-white scale-0 transition-transform duration-200"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="4"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
          </div>
          {(label || subLabel) && (
            <div className="flex flex-col select-none">
              {label && (
                <span className="text-sm font-medium text-text-secondary group-hover:text-text-primary transition-colors leading-tight">
                  {label}
                </span>
              )}
              {subLabel && (
                <span className="text-xs text-text-tertiary mt-0.5 leading-normal">
                  {subLabel}
                </span>
              )}
            </div>
          )}
        </label>
        {error && (
          <p className="mt-1.5 text-xs font-medium text-danger-text select-none animate-fade-in">
            {error}
          </p>
        )}
      </div>
    );
  }
);

Checkbox.displayName = "Checkbox";

export default Checkbox;

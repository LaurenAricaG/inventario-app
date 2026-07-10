import { ReactNode, InputHTMLAttributes, forwardRef } from "react";
import { cn } from "@/utils/cn.utils";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: string;
  icon?: ReactNode;
  endIcon?: ReactNode;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = "text", error, icon, endIcon, ...props }, ref) => {
    return (
      <div className="w-full">
        <div className="relative flex items-center">
          {icon && (
            <div className="absolute left-4 text-text-tertiary select-none pointer-events-none flex items-center justify-center">
              {icon}
            </div>
          )}
          <input
            ref={ref}
            type={type}
            className={cn(
              "w-full px-4 py-3 rounded-2xl border text-sm bg-bg-card text-text-primary transition-all duration-200 outline-none",
              "border-border-strong/40 focus:border-beauty-400 focus:ring-4 focus:ring-beauty-400/10",
              "placeholder:text-text-tertiary/70",
              "disabled:opacity-50 disabled:bg-bg-surface disabled:cursor-not-allowed",
              icon && "pl-11",
              endIcon && "pr-11",
              error &&
                "border-danger-text focus:border-danger-text focus:ring-danger-text/10",
              className,
            )}
            {...props}
          />
          {endIcon && (
            <div className="absolute right-4 text-text-tertiary flex items-center justify-center">
              {endIcon}
            </div>
          )}
        </div>
        {error && (
          <p className="mt-1.5 text-xs font-medium text-danger-text select-none animate-fade-in">
            {error}
          </p>
        )}
      </div>
    );
  },
);

Input.displayName = "Input";

export default Input;

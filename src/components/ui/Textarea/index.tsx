import { TextareaHTMLAttributes, forwardRef } from "react";
import { cn } from "@/utils/cn.utils";

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: string;
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, error, ...props }, ref) => {
    return (
      <div className="w-full">
        <textarea
          ref={ref}
          className={cn(
            "w-full px-4 py-3 rounded-2xl border text-sm bg-bg-card text-text-primary transition-all duration-200 outline-none resize-y min-h-25",
            "border-border-strong/40 focus:border-beauty-400 focus:ring-4 focus:ring-beauty-400/10",
            "placeholder:text-text-tertiary/70",
            "disabled:opacity-50 disabled:bg-bg-surface disabled:cursor-not-allowed",
            error &&
              "border-danger-text focus:border-danger-text focus:ring-danger-text/10",
            className,
          )}
          {...props}
        />
        {error && (
          <p className="mt-1.5 text-xs font-medium text-danger-text select-none animate-fade-in">
            {error}
          </p>
        )}
      </div>
    );
  },
);

Textarea.displayName = "Textarea";

export default Textarea;

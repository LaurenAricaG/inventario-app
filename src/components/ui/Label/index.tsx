import { LabelHTMLAttributes, ReactNode } from "react";
import { cn } from "@/utils/cn.utils";

interface LabelProps extends LabelHTMLAttributes<HTMLLabelElement> {
  children: ReactNode;
  required?: boolean;
}

export default function Label({ children, required, className, ...props }: LabelProps) {
  return (
    <label
      className={cn(
        "block text-sm font-medium text-text-primary/95 mb-1.5 transition-colors select-none",
        className
      )}
      {...props}
    >
      {children}
      {required && <span className="text-danger-text ml-1" title="Requerido">*</span>}
    </label>
  );
}

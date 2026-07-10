import { FormHTMLAttributes, ReactNode, forwardRef } from "react";
import { cn } from "@/utils/cn.utils";
import Label from "../Label";

export interface FormProps extends FormHTMLAttributes<HTMLFormElement> {
  children: ReactNode;
}

/**
 * Reusable Form component to wrap any input group with a standard layout and theme settings.
 */
const Form = forwardRef<HTMLFormElement, FormProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <form
        ref={ref}
        className={cn("space-y-5 w-full text-left", className)}
        {...props}
      >
        {children}
      </form>
    );
  }
);

Form.displayName = "Form";

interface FormFieldProps {
  label?: string;
  required?: boolean;
  error?: string;
  className?: string;
  children: ReactNode;
}

/**
 * Reusable wrapper that standardizes the alignment of Label, Input control and Error messages.
 */
export function FormField({
  label,
  required,
  error,
  className,
  children,
}: FormFieldProps) {
  return (
    <div className={cn("flex flex-col w-full", className)}>
      {label && (
        <Label required={required}>
          {label}
        </Label>
      )}
      <div className="relative w-full">
        {children}
      </div>
      {error && (
        <p className="mt-1.5 text-xs font-medium text-danger-text select-none animate-fade-in">
          {error}
        </p>
      )}
    </div>
  );
}

export default Form;

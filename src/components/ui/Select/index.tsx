"use client";

import React, {
  ReactNode,
  useState,
  useEffect,
  useRef,
  forwardRef,
  useImperativeHandle,
} from "react";
import { cn } from "@/utils/cn.utils";
import { FiChevronDown, FiCheck } from "react-icons/fi";

export interface SelectOption {
  value: string;
  label: string;
  icon?: ReactNode;
  disabled?: boolean;
}

export interface SelectProps {
  value?: string;
  defaultValue?: string;
  onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  placeholder?: string;
  error?: string;
  icon?: ReactNode;
  className?: string;
  disabled?: boolean;
  name?: string;
  id?: string;
  children?: ReactNode;
  size?: "sm" | "md";
}

/**
 * Extract options from React children to support standard <option> tags dynamically.
 */
const extractOptions = (children: ReactNode): SelectOption[] => {
  const options: SelectOption[] = [];
  React.Children.forEach(children, (child) => {
    if (React.isValidElement(child) && child.type === "option") {
      const props = child.props as any;
      options.push({
        value: String(props.value || ""),
        label: String(props.children || ""),
        icon: props.icon,
        disabled: props.disabled === true,
      });
    }
  });
  return options;
};

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      value: controlledValue,
      defaultValue,
      onChange,
      placeholder = "Seleccione una opción",
      error,
      icon,
      className,
      disabled,
      name,
      id,
      children,
      size = "md",
    },
    ref,
  ) => {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedValue, setSelectedValue] = useState(
      controlledValue !== undefined ? controlledValue : defaultValue || "",
    );

    const containerRef = useRef<HTMLDivElement>(null);
    const nativeSelectRef = useRef<HTMLSelectElement>(null);

    // Expose the native select ref to parents using forwardRef
    useImperativeHandle(
      ref,
      () => nativeSelectRef.current as HTMLSelectElement,
    );

    const options = extractOptions(children);

    // Sync state when controlled value changes
    useEffect(() => {
      if (controlledValue !== undefined) {
        setSelectedValue(controlledValue);
      }
    }, [controlledValue]);

    // Close dropdown when clicking outside
    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (
          containerRef.current &&
          !containerRef.current.contains(event.target as Node)
        ) {
          setIsOpen(false);
        }
      };
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleOptionClick = (val: string) => {
      if (disabled) return;
      const opt = options.find((o) => o.value === val);
      if (opt?.disabled) return;

      setSelectedValue(val);
      setIsOpen(false);

      if (onChange && nativeSelectRef.current) {
        // Temporarily assign the value to native select and dispatch event
        nativeSelectRef.current.value = val;

        // Create a synthetic-like ChangeEvent
        const event = {
          target: nativeSelectRef.current,
          currentTarget: nativeSelectRef.current,
          preventDefault: () => {},
          stopPropagation: () => {},
          nativeEvent: new Event("change", { bubbles: true }),
        } as unknown as React.ChangeEvent<HTMLSelectElement>;

        onChange(event);
      }
    };

    const selectedOption = options.find((opt) => opt.value === selectedValue);

    return (
      <div ref={containerRef} className="w-full relative ">
        {/* Hidden native select for standard form submissions & standard accessibility */}
        <select
          ref={nativeSelectRef}
          name={name}
          id={id}
          value={selectedValue}
          onChange={(e) => handleOptionClick(e.target.value)}
          className="sr-only"
          tabIndex={-1}
          aria-hidden="true"
          disabled={disabled}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        {/* Custom trigger button */}
        <button
          type="button"
          disabled={disabled}
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            "w-full rounded-2xl border bg-bg-card text-text-primary transition-all duration-200 outline-none flex items-center justify-between text-left cursor-pointer select-none",
            size === "sm"
              ? "px-3 py-1.5 text-xs rounded-xl"
              : "px-4 py-3 text-sm rounded-2xl",
            "border-border-strong/40 focus:border-beauty-400 focus:ring-4 focus:ring-beauty-400/10",
            "disabled:opacity-50 disabled:bg-bg-surface disabled:cursor-not-allowed",
            isOpen && "border-beauty-400 ring-4 ring-beauty-400/10",
            error &&
              "border-danger-text focus:border-danger-text focus:ring-danger-text/10",
            className,
          )}
        >
          <div className="flex items-center gap-3 min-w-0 ">
            {icon && (
              <span className="text-text-tertiary select-none">{icon}</span>
            )}
            {selectedOption ? (
              <span className="flex items-center gap-2 min-w-0 truncate">
                {selectedOption.icon && (
                  <span className="text-text-secondary select-none">
                    {selectedOption.icon}
                  </span>
                )}
                <span className="truncate">{selectedOption.label}</span>
              </span>
            ) : (
              <span className="text-text-tertiary/70 truncate">
                {placeholder}
              </span>
            )}
          </div>
          <FiChevronDown
            className={cn(
              "w-4 h-4 text-text-tertiary transition-transform duration-250 shrink-0",
              isOpen && "rotate-180",
            )}
          />
        </button>

        {/* Custom Premium Dropdown Menu List overlay */}
        {isOpen && (
          <div className="absolute left-0 right-0 z-40 mt-2 bg-bg-card border border-border-default rounded-2xl shadow-xl shadow-black/5 dark:shadow-black/20 overflow-hidden animate-in fade-in zoom-in-95 duration-150 max-h-60 overflow-y-auto ">
            <div className="p-1.5 space-y-0.5">
              {options.length === 0 ? (
                <div className="px-4 py-3 text-xs text-text-tertiary text-center select-none">
                  No hay opciones
                </div>
              ) : (
                options.map((opt) => {
                  const isSelected = opt.value === selectedValue;
                  const isOptDisabled = opt.disabled;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      disabled={isOptDisabled}
                      onClick={() => handleOptionClick(opt.value)}
                      className={cn(
                        "w-full text-left flex items-center justify-between cursor-pointer transition-colors duration-150 select-none",
                        size === "sm"
                          ? "px-2.5 py-2 text-xs rounded-lg"
                          : "px-3 py-2.5 rounded-xl text-xs sm:text-sm",
                        isOptDisabled
                          ? "opacity-40 cursor-not-allowed bg-transparent text-text-tertiary"
                          : isSelected
                            ? "bg-beauty-400/10 text-beauty-600 dark:bg-beauty-400/15 dark:text-beauty-400 font-semibold"
                            : "text-text-secondary dark:text-text-primary/85 hover:bg-beauty-400/10 hover:text-beauty-600 dark:hover:bg-beauty-400/15 dark:hover:text-beauty-400",
                      )}
                    >
                      <span className="flex items-center gap-2.5">
                        {opt.icon && (
                          <span className="text-text-tertiary dark:text-text-tertiary/90 select-none">
                            {opt.icon}
                          </span>
                        )}
                        <span>{opt.label}</span>
                      </span>
                      {isSelected && (
                        <FiCheck className="w-4 h-4 text-beauty-400 dark:text-beauty-400 shrink-0" />
                      )}
                    </button>
                  );
                })
              )}
            </div>
          </div>
        )}
      </div>
    );
  },
);

Select.displayName = "Select";

export default Select;

"use client";

import { useEffect, ReactNode } from "react";
import { FiX } from "react-icons/fi";
import { cn } from "@/utils/cn.utils";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  footer?: ReactNode;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

export default function Modal({
  isOpen,
  onClose,
  title,
  children,
  footer,
  size = "md",
  className,
}: ModalProps) {
  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const sizes = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl",
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/45 backdrop-blur-xs transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Modal Card */}
      <div
        className={cn(
          "relative w-full bg-bg-card border border-border-default/80 rounded-3xl shadow-xl z-10 flex flex-col max-h-[90vh] scale-100 opacity-100 transition-all duration-300 animate-in fade-in zoom-in-95",
          sizes[size],
          className,
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-border-soft dark:border-border-default bg-bg-surface/15 dark:bg-bg-surface/30 rounded-t-3xl select-none">
          {title ? (
            <h3 className="text-base font-bold text-text-primary">{title}</h3>
          ) : (
            <div />
          )}
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-bg-surface text-text-secondary hover:text-text-primary transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-beauty-400"
            aria-label="Cerrar modal"
          >
            <FiX className="w-4.5 h-4.5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto min-h-0 flex-1 text-sm text-text-secondary leading-relaxed scrollbar-thin scrollbar-thumb-stone-300 dark:scrollbar-thumb-zinc-700">
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="flex items-center justify-end gap-3 px-6 py-5 border-t border-border-soft dark:border-border-default bg-bg-surface/15 dark:bg-bg-surface/30 rounded-b-3xl shrink-0">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

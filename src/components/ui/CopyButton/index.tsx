"use client";

import { useState } from "react";
import { FiCopy, FiCheck } from "react-icons/fi";
import { toast } from "sonner";
import { cn } from "@/utils/cn.utils";

interface CopyButtonProps {
  text: string;
  className?: string;
  tooltip?: string;
  isLink?: boolean;
}

export default function CopyButton({
  text,
  className,
  tooltip = "Copiar",
  isLink = false,
}: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      const textToCopy = isLink ? `${window.location.origin}${text}` : text;
      await navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      toast.success(
        isLink ? "Enlace copiado al portapapeles." : "Copiado al portapapeles.",
      );
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error("No se pudo copiar.");
    }
  };

  return (
    <button
      onClick={handleCopy}
      className={cn(
        "p-1.5 rounded-lg border border-border-default/40 bg-bg-card hover:bg-bg-surface text-text-secondary hover:text-text-primary transition-all duration-200 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-beauty-400",
        className,
      )}
      title={tooltip}
      aria-label={tooltip}
    >
      {copied ? (
        <FiCheck className="w-3.5 h-3.5 text-success-text" />
      ) : (
        <FiCopy className="w-3.5 h-3.5" />
      )}
    </button>
  );
}

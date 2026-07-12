"use client";

import { useState } from "react";
import { FiCopy, FiCheck } from "react-icons/fi";
import { toast } from "sonner";
import ButtonIcon from "../ButtonIcon";

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
    <ButtonIcon
      onClick={handleCopy}
      variant="secondary"
      icon={copied ? FiCheck : FiCopy}
      iconClassName={copied ? "text-success-text" : undefined}
      title={tooltip}
      className={className}
    />
  );
}

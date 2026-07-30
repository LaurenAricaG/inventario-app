"use client";

import Modal from "../Modal";
import Button from "../Button";
import { cn } from "@/utils/cn.utils";

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "danger" | "warning" | "info" | "success";
  isLoading?: boolean;
}

const variantStyles: Record<
  "danger" | "warning" | "info" | "success",
  string
> = {
  danger:
    "bg-danger-bg text-danger-text border border-danger-text/20 hover:bg-danger-bg/80 hover:border-danger-text/40",
  warning:
    "bg-warning-bg text-warning-text border border-warning-text/20 hover:bg-warning-bg/80 hover:border-warning-text/40",
  info:
    "bg-info-bg text-info-text border border-info-text/20 hover:bg-info-bg/80 hover:border-info-text/40",
  success:
    "bg-success-bg text-success-text border border-success-text/20 hover:bg-success-bg/80 hover:border-success-text/40",
};

export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = "Confirmar",
  cancelText = "Cancelar",
  variant = "danger",
  isLoading = false,
}: ConfirmModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size="md"
      footer={
        <>
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2 text-xs font-semibold rounded-xl"
          >
            {cancelText}
          </Button>
          <Button
            variant="primary"
            onClick={onConfirm}
            loading={isLoading}
            disabled={isLoading}
            className={cn(
              "px-4 py-2 text-xs font-semibold rounded-xl",
              variantStyles[variant],
            )}
          >
            {confirmText}
          </Button>
        </>
      }
    >
      <p className="text-text-secondary text-xs sm:text-sm leading-relaxed whitespace-pre-line">
        {description}
      </p>
    </Modal>
  );
}

"use client";

import Modal from "../Modal";
import Button from "../Button";

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
            className="px-4 py-2 text-xs font-semibold rounded-xl bg-beauty-400 hover:bg-beauty-600 text-white"
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

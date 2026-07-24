"use client";

import { useState } from "react";
import { FiRefreshCw } from "react-icons/fi";
import { toast } from "sonner";
import { regenerateClientShareToken } from "@/lib/client";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import ButtonIcon from "../ButtonIcon";

interface RegenerateTokenButtonProps {
  clientId: number;
  clientName: string;
  className?: string;
}

export default function RegenerateTokenButton({
  clientId,
  clientName,
  className,
}: RegenerateTokenButtonProps) {
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleOpenModal = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsModalOpen(true);
  };

  const handleConfirm = async () => {
    setIsModalOpen(false);
    setLoading(true);
    const promise = regenerateClientShareToken(clientId);

    toast.promise(promise, {
      loading: "Regenerando enlace...",
      success: (res) => {
        if (res.success) {
          return res.message;
        } else {
          throw new Error(res.message);
        }
      },
      error: (err) => err.message || "Error al regenerar enlace.",
    });

    try {
      await promise;
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <ButtonIcon
        onClick={handleOpenModal}
        disabled={loading}
        loading={loading}
        variant="info"
        icon={FiRefreshCw}
        title="Regenerar enlace de estado de cuenta"
        className={className}
      />

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Confirmar Regeneración"
        size="md"
        footer={
          <>
            <Button
              variant="outline"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold rounded-xl"
            >
              Cancelar
            </Button>
            <Button
              variant="primary"
              onClick={handleConfirm}
              className="px-4 py-2 text-xs font-semibold rounded-xl"
            >
              Confirmar
            </Button>
          </>
        }
      >
        <div className="space-y-3">
          <p className="text-text-secondary text-xs sm:text-sm leading-relaxed">
            ¿Estás seguro de que deseas regenerar el enlace del estado de cuenta para <strong className="text-text-primary">"{clientName}"</strong>?
          </p>
          <p className="text-text-secondary text-xs sm:text-sm leading-relaxed">
            El enlace anterior quedará <strong className="text-danger-text">inhabilitado inmediatamente</strong> y deberás enviarle el nuevo enlace al cliente para que pueda acceder.
          </p>
        </div>
      </Modal>
    </>
  );
}

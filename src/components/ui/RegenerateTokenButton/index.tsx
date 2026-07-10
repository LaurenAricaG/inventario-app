"use client";

import { useState } from "react";
import { FiRefreshCw } from "react-icons/fi";
import { toast } from "sonner";
import { cn } from "@/utils/cn.utils";
import { regenerateClientShareToken } from "@/app/admin/actions";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";

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
      <button
        onClick={handleOpenModal}
        disabled={loading}
        className={cn(
          "p-2 rounded-xl bg-info-bg/45 border border-info-text/15 text-info-text hover:bg-info-bg/85 hover:border-info-text/30 hover:scale-[1.04] active:scale-[0.96] transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-info-text/20",
          className
        )}
        title="Regenerar enlace de estado de cuenta"
        aria-label="Regenerar enlace de estado de cuenta"
      >
        <FiRefreshCw className={cn("w-3.5 h-3.5", loading && "animate-spin")} />
      </button>

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

"use client";

import { useState } from "react";
import { FiDatabase, FiPlus } from "react-icons/fi";
import { toast } from "sonner";
import { seedMockDataAction } from "@/app/admin/actions";
import Button from "@/components/ui/Button";

interface SeedEmptyStateProps {
  title: string;
  description: string;
  buttonText: string;
  onActionComplete?: () => void;
  addNewLink?: string;
  addNewText?: string;
}

export default function SeedEmptyState({
  title,
  description,
  buttonText,
  addNewText,
  onActionComplete,
}: SeedEmptyStateProps) {
  const [loading, setLoading] = useState(false);

  const handleSeed = async () => {
    setLoading(true);
    const promise = seedMockDataAction();

    toast.promise(promise, {
      loading: "Generando datos de prueba...",
      success: (res) => {
        if (res.success) {
          if (onActionComplete) onActionComplete();
          return res.message;
        } else {
          throw new Error(res.message);
        }
      },
      error: (err) => err.message || "Error al generar datos de prueba.",
    });

    try {
      await promise;
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 bg-bg-card border border-border-default/50 rounded-2xl text-center shadow-sm max-w-lg mx-auto my-8">
      <div className="w-16 h-16 rounded-2xl bg-beauty-50 dark:bg-beauty-950 flex items-center justify-center text-beauty-600 mb-5 border border-beauty-100 dark:border-beauty-900 shadow-xs">
        <FiDatabase className="w-8 h-8" />
      </div>
      <h3 className="text-lg font-bold text-text-primary mb-2 select-none">
        {title}
      </h3>
      <p className="text-xs text-text-secondary mb-8 leading-relaxed max-w-sm select-none">
        {description}
      </p>
      <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
        <Button
          onClick={handleSeed}
          loading={loading}
          variant="primary"
          className="w-full sm:w-auto"
        >
          {buttonText}
        </Button>
        {addNewText && (
          <Button
            variant="outline"
            className="w-full sm:w-auto border-border-strong hover:bg-bg-surface text-text-primary"
            onClick={() => toast.info("Funcionalidad de creación en desarrollo.")}
          >
            <FiPlus className="w-4 h-4 mr-2" />
            {addNewText}
          </Button>
        )}
      </div>
    </div>
  );
}

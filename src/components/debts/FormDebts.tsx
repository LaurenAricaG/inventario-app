"use client";

import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import Button from "@/components/ui/Button";
import Form, { FormField } from "@/components/ui/Form";
import Input from "@/components/ui/Input";
import Textarea from "@/components/ui/Textarea";
import Modal from "@/components/ui/Modal";
import { createExternalDebtAction } from "@/lib/external-debt";
import { FiSearch, FiChevronDown, FiUser } from "react-icons/fi";
import { cn } from "@/utils/cn.utils";

interface FormDebtsProps {
  isOpen: boolean;
  onClose: () => void;
  clientId?: number;
  clients?: { id: number; name: string }[];
  onSuccess: () => void;
}

export default function FormDebts({
  isOpen,
  onClose,
  clientId,
  clients,
  onSuccess,
}: FormDebtsProps) {
  const [selectedClientId, setSelectedClientId] = useState(
    clientId ? String(clientId) : "",
  );
  const [amount, setAmount] = useState("");
  const [reason, setReason] = useState("");
  const [notes, setNotes] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{
    amount?: string;
    reason?: string;
    clientId?: string;
  }>({});

  // Buscador de Cliente searchable dropdown
  const [clientSearchQuery, setClientSearchQuery] = useState("");
  const [isClientDropdownOpen, setIsClientDropdownOpen] = useState(false);
  const clientDropdownRef = useRef<HTMLDivElement>(null);

  // Compute selected client object
  const selectedClient =
    clients?.find((c) => c.id === Number(selectedClientId)) || null;

  // Filter clients based on client search query inside the dropdown
  const filteredClients = clients
    ? clients.filter((c) =>
        c.name.toLowerCase().includes(clientSearchQuery.toLowerCase().trim()),
      )
    : [];

  // Sincronizar estado cuando se abre o cambia de cliente
  useEffect(() => {
    if (isOpen) {
      setSelectedClientId(clientId ? String(clientId) : "");
      setAmount("");
      setReason("");
      setNotes("");
      setErrors({});
      setClientSearchQuery("");
      setIsClientDropdownOpen(false);
    }
  }, [isOpen, clientId]);

  // Click outside listener for dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        clientDropdownRef.current &&
        !clientDropdownRef.current.contains(e.target as Node)
      ) {
        setIsClientDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    let hasErrors = false;
    const newErrors: typeof errors = {};

    const numericClientId = parseInt(selectedClientId);
    if (isNaN(numericClientId)) {
      newErrors.clientId = "Debes seleccionar un cliente.";
      hasErrors = true;
    }

    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      newErrors.amount = "El monto debe ser un número positivo mayor a 0.";
      hasErrors = true;
    }

    if (!reason.trim()) {
      newErrors.reason = "El motivo es requerido (ej. 'Saldo Inicial').";
      hasErrors = true;
    }

    if (hasErrors) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await createExternalDebtAction({
        clientId: numericClientId,
        amount: numericAmount,
        reason: reason.trim(),
        notes: notes.trim() || undefined,
      });

      if (res.success) {
        toast.success(res.message);
        onSuccess();
      } else {
        toast.error(res.message);
      }
    } catch (error: any) {
      toast.error(
        error.message ||
          "Ocurrió un error inesperado al registrar la deuda externa.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Registrar Deuda Externa / Saldo Adicional"
      size="md"
      footer={
        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isSubmitting}
            className="border-border-strong text-text-primary hover:bg-bg-surface"
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            variant="primary"
            form="external-debt-form"
            loading={isSubmitting}
          >
            Registrar Deuda
          </Button>
        </div>
      }
    >
      <Form
        id="external-debt-form"
        onSubmit={handleSubmit}
        noValidate
        className="space-y-4"
      >
        {/* Seleccionar Cliente (Buscador Autocompletable) */}
        {clients && (
          <FormField label="Cliente" error={errors.clientId}>
            <div ref={clientDropdownRef} className="w-full relative">
              <button
                type="button"
                onClick={() => setIsClientDropdownOpen(!isClientDropdownOpen)}
                className={cn(
                  "w-full px-4 py-3 rounded-2xl border text-sm bg-bg-card text-text-primary transition-all duration-200 outline-none flex items-center justify-between text-left cursor-pointer select-none",
                  "border-border-strong/40 focus:border-beauty-400 focus:ring-4 focus:ring-beauty-400/10",
                  isClientDropdownOpen &&
                    "border-beauty-400 ring-4 ring-beauty-400/10",
                  errors.clientId &&
                    "border-danger-text focus:border-danger-text focus:ring-danger-text/10",
                )}
              >
                <div className="flex items-center gap-2 truncate min-w-0">
                  {selectedClient ? (
                    <>
                      <FiUser className="w-4 h-4 text-beauty-500 shrink-0" />
                      <span className="font-semibold text-text-primary truncate">
                        {selectedClient.name}
                      </span>
                    </>
                  ) : (
                    <span className="text-text-tertiary">
                      Selecciona un cliente...
                    </span>
                  )}
                </div>
                <FiChevronDown
                  className={cn(
                    "w-4 h-4 text-text-tertiary transition-transform duration-250 shrink-0 ml-2",
                    isClientDropdownOpen && "rotate-180",
                  )}
                />
              </button>

              {isClientDropdownOpen && (
                <div className="absolute left-0 right-0 top-full mt-2 z-50 bg-bg-card border border-border-default rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-60 animate-in fade-in zoom-in-95 duration-150">
                  {/* Buscador de Cliente Interno */}
                  <div className="p-2 border-b border-border-soft">
                    <div className="relative flex items-center">
                      <FiSearch className="absolute left-3 text-text-tertiary w-3.5 h-3.5" />
                      <input
                        type="text"
                        placeholder="Buscar por nombre..."
                        value={clientSearchQuery}
                        onChange={(e) => setClientSearchQuery(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-border-strong/40 bg-bg-surface text-text-primary focus:border-beauty-400 outline-none transition-all"
                        autoFocus
                      />
                    </div>
                  </div>

                  {/* Lista de clientes */}
                  <div className="overflow-y-auto p-1.5 space-y-0.5 scrollbar-thin scrollbar-thumb-stone-300 dark:scrollbar-thumb-zinc-700">
                    {filteredClients.length === 0 ? (
                      <div className="px-4 py-3 text-xs text-text-tertiary text-center select-none">
                        No se encontraron clientes
                      </div>
                    ) : (
                      filteredClients.map((c) => {
                        const isSelected = selectedClient?.id === c.id;
                        return (
                          <button
                            key={c.id}
                            type="button"
                            onClick={() => {
                              setSelectedClientId(c.id.toString());
                              setIsClientDropdownOpen(false);
                              setClientSearchQuery("");
                              setErrors((prev) => ({
                                ...prev,
                                clientId: undefined,
                              }));
                            }}
                            className={cn(
                              "w-full px-3 py-2.5 rounded-xl text-xs sm:text-sm text-left flex items-center cursor-pointer transition-colors duration-150 select-none",
                              isSelected
                                ? "bg-beauty-400/10 text-beauty-600 dark:bg-beauty-400/15 dark:text-beauty-400 font-semibold"
                                : "text-text-secondary dark:text-text-primary/85 hover:bg-beauty-400/10 hover:text-beauty-600 dark:hover:bg-beauty-400/15 dark:hover:text-beauty-400",
                            )}
                          >
                            {c.name}
                          </button>
                        );
                      })
                    )}
                  </div>
                </div>
              )}
            </div>
          </FormField>
        )}

        {/* Monto */}
        <FormField label="Monto de la Deuda (S/)" error={errors.amount}>
          <Input
            type="number"
            step="0.01"
            placeholder="Ej. 100.00"
            value={amount}
            onChange={(e) => {
              setAmount(e.target.value);
              if (errors.amount)
                setErrors((prev) => ({ ...prev, amount: undefined }));
            }}
            error={errors.amount}
            disabled={isSubmitting}
            autoFocus={!clients}
          />
        </FormField>

        {/* Motivo */}
        <FormField label="Motivo de la Deuda" error={errors.reason}>
          <Input
            type="text"
            placeholder="Ej. Saldo inicial, Producto de otra consultora, etc."
            value={reason}
            onChange={(e) => {
              setReason(e.target.value);
              if (errors.reason)
                setErrors((prev) => ({ ...prev, reason: undefined }));
            }}
            error={errors.reason}
            disabled={isSubmitting}
          />
        </FormField>

        {/* Notas adicionales */}
        <FormField label="Observaciones (Opcional)">
          <Textarea
            placeholder="Ej. Deuda transferida del cuaderno anterior, etc."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            disabled={isSubmitting}
            rows={3}
          />
        </FormField>
      </Form>
    </Modal>
  );
}

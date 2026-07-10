"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import Button from "@/components/ui/Button";
import Form, { FormField } from "@/components/ui/Form";
import Input from "@/components/ui/Input";
import Modal from "@/components/ui/Modal";
import Textarea from "@/components/ui/Textarea";
import { createClientAction, updateClientAction } from "@/lib/client";
import { clientSchema } from "@/lib/client/schema";
import { SerializedClient } from "@/types/client";

interface FormClientProps {
  isOpen: boolean;
  onClose: () => void;
  client: SerializedClient | null;
}

export default function FormClient({ isOpen, onClose, client }: FormClientProps) {
  const [nameInput, setNameInput] = useState("");
  const [phoneInput, setPhoneInput] = useState("");
  const [addressInput, setAddressInput] = useState("");
  const [notesInput, setNotesInput] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{
    name?: string;
    phone?: string;
    address?: string;
    notes?: string;
  }>({});

  // Sync inputs when modal opens or client changes
  useEffect(() => {
    if (isOpen) {
      setNameInput(client ? client.name : "");
      setPhoneInput(client?.phone || "");
      setAddressInput(client?.address || "");
      setNotesInput(client?.notes || "");
      setErrors({});
    }
  }, [isOpen, client]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validation = clientSchema.safeParse({
      name: nameInput,
      phone: phoneInput,
      address: addressInput,
      notes: notesInput,
    });

    if (!validation.success) {
      const fieldErrors: typeof errors = {};
      validation.error.issues.forEach((issue) => {
        const path = issue.path[0] as keyof typeof errors;
        fieldErrors[path] = issue.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setErrors({});
    setIsSubmitting(true);

    try {
      let res;
      if (client) {
        res = await updateClientAction(client.id, validation.data);
      } else {
        res = await createClientAction(validation.data);
      }

      if (res.success) {
        toast.success(res.message);
        onClose();
      } else {
        toast.error(res.message);
        if (res.message.toLowerCase().includes("nombre")) {
          setErrors((prev) => ({ ...prev, name: res.message }));
        }
      }
    } catch (error: any) {
      toast.error(error.message || "Ocurrió un error al procesar la solicitud.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={client ? "Editar Cliente" : "Registrar Cliente"}
      size="md"
      footer={
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isSubmitting}
            className="border-border-strong text-text-primary hover:bg-bg-surface"
          >
            Cancelar
          </Button>
          <Button
            variant="primary"
            form="client-form"
            type="submit"
            loading={isSubmitting}
          >
            Guardar
          </Button>
        </div>
      }
    >
      <Form id="client-form" onSubmit={handleSubmit} noValidate>
        {/* Nombre completo */}
        <FormField label="Nombre Completo">
          <Input
            type="text"
            placeholder="Ej. Alexandra Guerrero..."
            value={nameInput}
            onChange={(e) => {
              setNameInput(e.target.value);
              if (errors.name) setErrors((prev) => ({ ...prev, name: undefined }));
            }}
            error={errors.name}
            disabled={isSubmitting}
            autoFocus={true}
          />
        </FormField>

        {/* Teléfono */}
        <FormField label="Teléfono / Celular (Opcional)">
          <Input
            type="tel"
            placeholder="Ej. 987654321"
            value={phoneInput}
            onChange={(e) => {
              setPhoneInput(e.target.value);
              if (errors.phone) setErrors((prev) => ({ ...prev, phone: undefined }));
            }}
            error={errors.phone}
            disabled={isSubmitting}
          />
        </FormField>

        {/* Dirección */}
        <FormField label="Dirección de Entrega (Opcional)">
          <Input
            type="text"
            placeholder="Ej. Av. Larco 123, Miraflores..."
            value={addressInput}
            onChange={(e) => {
              setAddressInput(e.target.value);
              if (errors.address) setErrors((prev) => ({ ...prev, address: undefined }));
            }}
            error={errors.address}
            disabled={isSubmitting}
          />
        </FormField>

        {/* Notas adicionales */}
        <FormField label="Notas / Preferencias (Opcional)">
          <Textarea
            placeholder="Ej. Prefiere fragancias Avon, paga siempre por Yape, etc."
            value={notesInput}
            onChange={(e) => {
              setNotesInput(e.target.value);
              if (errors.notes) setErrors((prev) => ({ ...prev, notes: undefined }));
            }}
            error={errors.notes}
            disabled={isSubmitting}
            rows={3}
          />
        </FormField>
      </Form>
    </Modal>
  );
}

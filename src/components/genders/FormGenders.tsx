"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import Button from "@/components/ui/Button";
import Form, { FormField } from "@/components/ui/Form";
import Input from "@/components/ui/Input";
import Modal from "@/components/ui/Modal";
import { createGenderAction, updateGenderAction } from "@/lib/gender";
import { genderSchema } from "@/lib/gender/schema";
import { SerializedGenderSegment } from "@/types/gender";

interface FormGendersProps {
  isOpen: boolean;
  onClose: () => void;
  gender: SerializedGenderSegment | null;
}

export default function FormGenders({
  isOpen,
  onClose,
  gender,
}: FormGendersProps) {
  const [nameInput, setNameInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  // Sync inputs with selected gender when modal opens or changes
  useEffect(() => {
    if (isOpen) {
      setNameInput(gender ? gender.name : "");
      setFormError("");
    }
  }, [isOpen, gender]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validation = genderSchema.safeParse({ name: nameInput });
    if (!validation.success) {
      setFormError(
        validation.error.issues[0]?.message ||
          "El nombre del género es obligatorio.",
      );
      return;
    }

    setFormError("");
    setIsSubmitting(true);

    try {
      let res;
      const validName = validation.data.name;
      if (gender) {
        res = await updateGenderAction(gender.id, validName);
      } else {
        res = await createGenderAction(validName);
      }

      if (res.success) {
        toast.success(res.message);
        onClose();
      } else {
        setFormError(res.message);
        toast.error(res.message);
      }
    } catch (error) {
      toast.error("Ocurrió un error inesperado al procesar la solicitud.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={gender ? "Editar Género" : "Crear Género"}
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
            form="gender-form"
            type="submit"
            loading={isSubmitting}
          >
            Guardar
          </Button>
        </div>
      }
    >
      <Form id="gender-form" onSubmit={handleSubmit}>
        <FormField label="Nombre del Género / Segmento">
          <Input
            type="text"
            placeholder="Ej. Damas, Caballeros, Infantil, Unisex..."
            value={nameInput}
            onChange={(e) => {
              setNameInput(e.target.value);
              if (e.target.value.trim()) setFormError("");
            }}
            error={formError}
            disabled={isSubmitting}
            autoFocus={true}
          />
        </FormField>
      </Form>
    </Modal>
  );
}

"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import Button from "@/components/ui/Button";
import Form, { FormField } from "@/components/ui/Form";
import Input from "@/components/ui/Input";
import Modal from "@/components/ui/Modal";
import { createCategoryAction, updateCategoryAction } from "@/lib/category";
import { categorySchema } from "@/lib/category/schema";
import { SerializedCategory } from "@/types/categories";

interface FormCategoriesProps {
  isOpen: boolean;
  onClose: () => void;
  category: SerializedCategory | null;
}

export default function FormCategories({
  isOpen,
  onClose,
  category,
}: FormCategoriesProps) {
  const [nameInput, setNameInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  // Sync inputs with selected category when the modal opens or changes
  useEffect(() => {
    if (isOpen) {
      setNameInput(category ? category.name : "");
      setFormError("");
    }
  }, [isOpen, category]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validation = categorySchema.safeParse({
      name: nameInput,
    });
    if (!validation.success) {
      setFormError(
        validation.error.issues[0]?.message ||
        "El nombre de la categoría no es válido."
      );
      return;
    }

    setFormError("");
    setIsSubmitting(true);

    try {
      let res;
      const validName = validation.data.name;
      if (category) {
        res = await updateCategoryAction(category.id, validName);
      } else {
        res = await createCategoryAction(validName);
      }

      if (res.success) {
        toast.success(res.message);
        onClose();
      } else {
        setFormError(res.message);
        toast.error(res.message);
      }
    } catch (error: any) {
      setFormError(error.message || "Ocurrió un error inesperado al procesar la solicitud.");
      toast.error(error.message || "Ocurrió un error inesperado al procesar la solicitud.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={category ? "Editar Categoría" : "Crear Categoría"}
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
            form="category-form"
            type="submit"
            loading={isSubmitting}
          >
            Guardar
          </Button>
        </div>
      }
    >
      <Form id="category-form" onSubmit={handleSubmit}>
        <FormField label="Nombre de la Categoría">
          <Input
            type="text"
            placeholder="Ej. Perfumes, Maquillaje, Accesorios..."
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

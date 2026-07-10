"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import Button from "@/components/ui/Button";
import Form, { FormField } from "@/components/ui/Form";
import Input from "@/components/ui/Input";
import Modal from "@/components/ui/Modal";
import ImageUpload from "@/components/ui/ImageUpload";
import { createCompanyAction, updateCompanyAction } from "@/lib/company";
import { companySchema } from "@/lib/company/schema";
import { SerializedCompany } from "@/types/companies";

interface FormCompaniesProps {
  isOpen: boolean;
  onClose: () => void;
  company: SerializedCompany | null;
}

export default function FormCompanies({
  isOpen,
  onClose,
  company,
}: FormCompaniesProps) {
  const [nameInput, setNameInput] = useState("");
  const [logoUrlInput, setLogoUrlInput] = useState("");
  const [localFile, setLocalFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  // Sync inputs with selected company when the modal opens or changes
  useEffect(() => {
    if (isOpen) {
      setNameInput(company ? company.name : "");
      setLogoUrlInput(company && company.logoUrl ? company.logoUrl : "");
      setLocalFile(null);
      setFormError("");
    }
  }, [isOpen, company]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validation = companySchema.safeParse({
      name: nameInput,
      logoUrl: logoUrlInput || null,
    });
    if (!validation.success) {
      setFormError(
        validation.error.issues[0]?.message ||
          "El nombre de la empresa o el logo no son válidos.",
      );
      return;
    }

    setFormError("");
    setIsSubmitting(true);

    try {
      let finalLogoUrl = validation.data.logoUrl;

      if (logoUrlInput === "pending-local-file" && localFile) {
        const formData = new FormData();
        formData.append("file", localFile);
        formData.append("type", "company-logo");

        const uploadResponse = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        if (!uploadResponse.ok) {
          const uploadData = await uploadResponse.json();
          throw new Error(
            uploadData.error || "Error al subir el logo de la empresa.",
          );
        }

        const uploadData = await uploadResponse.json();
        finalLogoUrl = uploadData.url;
      }

      let res;
      const validName = validation.data.name;
      if (company) {
        res = await updateCompanyAction(company.id, validName, finalLogoUrl);
      } else {
        res = await createCompanyAction(validName, finalLogoUrl);
      }

      if (res.success) {
        toast.success(res.message);
        onClose();
      } else {
        setFormError(res.message);
        toast.error(res.message);
      }
    } catch (error: any) {
      setFormError(
        error.message ||
          "Ocurrió un error inesperado al procesar la solicitud.",
      );
      toast.error(
        error.message ||
          "Ocurrió un error inesperado al procesar la solicitud.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={company ? "Editar Empresa" : "Crear Empresa"}
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
            form="company-form"
            type="submit"
            loading={isSubmitting}
          >
            Guardar
          </Button>
        </div>
      }
    >
      <Form id="company-form" onSubmit={handleSubmit}>
        <FormField label="Nombre de la Empresa">
          <Input
            type="text"
            placeholder="Ej. Esika, Avon, Unique..."
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
        <FormField label="Logo de la Empresa (Opcional)">
          <ImageUpload
            value={logoUrlInput}
            onChange={(logoUrlInput, file) => {
              setLogoUrlInput(logoUrlInput);
              setLocalFile(file || null);
            }}
            disabled={isSubmitting}
            previewAlt="Logo de la empresa"
          />
        </FormField>
      </Form>
    </Modal>
  );
}

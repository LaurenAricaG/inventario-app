"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import Button from "@/components/ui/Button";
import Form, { FormField } from "@/components/ui/Form";
import Input from "@/components/ui/Input";
import Modal from "@/components/ui/Modal";
import Select from "@/components/ui/Select";
import ImageUpload from "@/components/ui/ImageUpload";
import { createBrandAction, updateBrandAction } from "@/lib/brand";
import { brandSchema } from "@/lib/brand/schema";
import { SerializedBrand } from "@/types/brands";

interface FormBrandsProps {
  isOpen: boolean;
  onClose: () => void;
  brand: SerializedBrand | null;
  companies: { id: number; name: string }[];
}

export default function FormBrands({
  isOpen,
  onClose,
  brand,
  companies,
}: FormBrandsProps) {
  const [nameInput, setNameInput] = useState("");
  const [companyIdInput, setCompanyIdInput] = useState("");
  const [logoUrlInput, setLogoUrlInput] = useState("");
  const [localFile, setLocalFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{
    name?: string;
    companyId?: string;
    logoUrl?: string;
  }>({});

  // Sync inputs with selected brand when modal opens or changes
  useEffect(() => {
    if (isOpen) {
      setNameInput(brand ? brand.name : "");
      setCompanyIdInput(brand && brand.company ? String(brand.company.id) : "");
      setLogoUrlInput(brand && brand.logoUrl ? brand.logoUrl : "");
      setLocalFile(null);
      setErrors({});
    }
  }, [isOpen, brand]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const parsedCompanyId = parseInt(companyIdInput, 10);

    const validation = brandSchema.safeParse({
      name: nameInput,
      companyId: parsedCompanyId,
      logoUrl: logoUrlInput || null,
    });

    if (!validation.success) {
      const fieldErrors: {
        name?: string;
        companyId?: string;
        logoUrl?: string;
      } = {};
      validation.error.issues.forEach((issue) => {
        const path = issue.path[0];
        if (path === "name") fieldErrors.name = issue.message;
        if (path === "companyId") fieldErrors.companyId = issue.message;
        if (path === "logoUrl") fieldErrors.logoUrl = issue.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setErrors({});
    setIsSubmitting(true);

    try {
      let finalLogoUrl = validation.data.logoUrl;

      if (logoUrlInput === "pending-local-file" && localFile) {
        const formData = new FormData();
        formData.append("file", localFile);
        formData.append("type", "brand-logo");

        const uploadResponse = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        if (!uploadResponse.ok) {
          const uploadData = await uploadResponse.json();
          throw new Error(
            uploadData.error || "Error al subir el logo de la marca.",
          );
        }

        const uploadData = await uploadResponse.json();
        finalLogoUrl = uploadData.url;
      }

      let res;
      const validName = validation.data.name;
      const validCompanyId = validation.data.companyId;

      if (brand) {
        res = await updateBrandAction(
          brand.id,
          validName,
          validCompanyId,
          finalLogoUrl,
        );
      } else {
        res = await createBrandAction(validName, validCompanyId, finalLogoUrl);
      }

      if (res.success) {
        toast.success(res.message);
        onClose();
      } else {
        if (res.message.toLowerCase().includes("nombre")) {
          setErrors({ name: res.message });
        } else if (res.message.toLowerCase().includes("empresa")) {
          setErrors({ companyId: res.message });
        } else {
          toast.error(res.message);
        }
      }
    } catch (error: any) {
      setErrors((prev) => ({
        ...prev,
        logoUrl:
          error.message ||
          "Ocurrió un error inesperado al procesar la solicitud.",
      }));
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
      title={brand ? "Editar Marca" : "Crear Marca"}
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
            form="brand-form"
            type="submit"
            loading={isSubmitting}
          >
            Guardar
          </Button>
        </div>
      }
    >
      <Form id="brand-form" onSubmit={handleSubmit}>
        {/* Selector de Empresa */}
        <FormField label="Empresa Asociada" error={errors.companyId}>
          <Select
            value={companyIdInput}
            onChange={(e) => {
              setCompanyIdInput(e.target.value);
              if (e.target.value) {
                setErrors((prev) => ({ ...prev, companyId: undefined }));
              }
            }}
            placeholder="Selecciona la empresa perteneciente..."
            disabled={isSubmitting}
            error={errors.companyId}
          >
            {companies.map((company) => (
              <option key={company.id} value={String(company.id)}>
                {company.name}
              </option>
            ))}
          </Select>
        </FormField>

        {/* Nombre de la Marca */}
        <FormField label="Nombre de la Marca">
          <Input
            type="text"
            placeholder="Ej. Cyzone, L'Bel, Esika..."
            value={nameInput}
            onChange={(e) => {
              setNameInput(e.target.value);
              if (e.target.value.trim()) {
                setErrors((prev) => ({ ...prev, name: undefined }));
              }
            }}
            error={errors.name}
            disabled={isSubmitting}
          />
        </FormField>

        {/* Logo de la Marca */}
        <FormField label="Logo de la Marca (Opcional)">
          <ImageUpload
            value={logoUrlInput}
            onChange={(val, file) => {
              setLogoUrlInput(val);
              setLocalFile(file || null);
              setErrors((prev) => ({ ...prev, logoUrl: undefined }));
            }}
            disabled={isSubmitting}
            error={errors.logoUrl}
            previewAlt="Logo de la marca"
          />
        </FormField>
      </Form>
    </Modal>
  );
}

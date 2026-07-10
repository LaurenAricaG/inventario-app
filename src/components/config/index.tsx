"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { FiSettings, FiGlobe, FiBriefcase } from "react-icons/fi";
import Button from "@/components/ui/Button";
import Form, { FormField } from "@/components/ui/Form";
import Input from "@/components/ui/Input";
import Checkbox from "@/components/ui/Checkbox";
import ImageUpload from "@/components/ui/ImageUpload";
import { updateSystemConfigAction } from "@/lib/config";
import { systemConfigSchema } from "@/lib/config/schema";
import { cn } from "@/utils/cn.utils";

interface SystemConfigProps {
  initialConfig: {
    id: number;
    systemName: string;
    systemLogoUrl: string | null;
    whatsappNumber: string;
    showPricePublic: boolean;
    showStockPublic: boolean;
    showCatalogsPublic: boolean;
  };
  permissions: string[];
}

export default function SystemConfig({
  initialConfig,
  permissions,
}: SystemConfigProps) {
  const canEdit = permissions.includes("config:edit");
  const canShow = permissions.includes("config:show");
  const canSave = canEdit || canShow;

  const [isEditing, setIsEditing] = useState(false);

  const [systemNameInput, setSystemNameInput] = useState("");
  const [whatsappNumberInput, setWhatsappNumberInput] = useState("");
  const [logoUrlInput, setLogoUrlInput] = useState("");
  const [localFile, setLocalFile] = useState<File | null>(null);

  const [showPricePublicInput, setShowPricePublicInput] = useState(true);
  const [showStockPublicInput, setShowStockPublicInput] = useState(true);
  const [showCatalogsPublicInput, setShowCatalogsPublicInput] = useState(true);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (initialConfig) {
      setSystemNameInput(initialConfig.systemName);
      setWhatsappNumberInput(initialConfig.whatsappNumber);
      setLogoUrlInput(initialConfig.systemLogoUrl || "");
      setShowPricePublicInput(initialConfig.showPricePublic);
      setShowStockPublicInput(initialConfig.showStockPublic);
      setShowCatalogsPublicInput(initialConfig.showCatalogsPublic);
      setErrors({});
    }
  }, [initialConfig]);

  const handleCancel = () => {
    if (initialConfig) {
      setSystemNameInput(initialConfig.systemName);
      setWhatsappNumberInput(initialConfig.whatsappNumber);
      setLogoUrlInput(initialConfig.systemLogoUrl || "");
      setLocalFile(null);
      setShowPricePublicInput(initialConfig.showPricePublic);
      setShowStockPublicInput(initialConfig.showStockPublic);
      setShowCatalogsPublicInput(initialConfig.showCatalogsPublic);
      setErrors({});
    }
    setIsEditing(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload = {
      systemName: systemNameInput,
      systemLogoUrl: logoUrlInput || null,
      whatsappNumber: whatsappNumberInput,
      showPricePublic: showPricePublicInput,
      showStockPublic: showStockPublicInput,
      showCatalogsPublic: showCatalogsPublicInput,
    };

    const validation = systemConfigSchema.safeParse(payload);
    if (!validation.success) {
      const fieldErrors: Record<string, string> = {};
      validation.error.issues.forEach((issue) => {
        const path = issue.path[0] as string;
        fieldErrors[path] = issue.message;
      });
      setErrors(fieldErrors);
      toast.error("Por favor completa los datos de configuración correctamente.");
      return;
    }

    setErrors({});
    setIsSubmitting(true);

    try {
      let finalLogoUrl = validation.data.systemLogoUrl;

      // Subir archivo de logo local si se ha seleccionado uno
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
          throw new Error(uploadData.error || "Error al subir el logo del sistema.");
        }

        const uploadData = await uploadResponse.json();
        finalLogoUrl = uploadData.url;
      }

      const res = await updateSystemConfigAction(initialConfig.id, {
        ...validation.data,
        systemLogoUrl: finalLogoUrl,
      });

      if (res.success) {
        toast.success(res.message);
        setIsEditing(false);
      } else {
        toast.error(res.message);
      }
    } catch (error: any) {
      toast.error(error.message || "Ocurrió un error inesperado al guardar la configuración.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Cabecera del Módulo */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-text-primary flex items-center gap-2">
            <FiSettings className="w-6 h-6 text-beauty-500" />
            Configuración General
          </h2>
          <p className="text-xs sm:text-sm text-text-secondary mt-0.5">
            Administración de los datos de la empresa y opciones de visibilidad del catálogo público.
          </p>
        </div>

        {/* Toggle Switch para Modo Edición */}
        {canSave && (
          <div className="flex items-center gap-3 select-none bg-bg-surface border border-border-default/60 rounded-2xl py-2 px-4 shadow-2xs self-start sm:self-auto shrink-0">
            <span className="text-sm font-semibold text-text-secondary">
              Modo Edición
            </span>
            <button
              type="button"
              onClick={() => {
                if (isEditing) {
                  handleCancel();
                } else {
                  setIsEditing(true);
                }
              }}
              className={cn(
                "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-beauty-500/25",
                isEditing ? "bg-beauty-500" : "bg-border-strong/60"
              )}
            >
              <span
                className={cn(
                  "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out",
                  isEditing ? "translate-x-5" : "translate-x-0"
                )}
              />
            </button>
          </div>
        )}
      </div>

      <Form onSubmit={handleSubmit} noValidate className="space-y-6">
        {/* Sección: Datos de la Empresa */}
        <div className="bg-bg-card border border-border-default/80 rounded-2xl shadow-xs overflow-hidden p-6 space-y-4">
          <div className="flex items-center gap-2 border-b border-border-soft pb-3 mb-2">
            <FiBriefcase className="w-5 h-5 text-beauty-500" />
            <h3 className="text-sm font-bold text-text-primary uppercase tracking-wide">
              Datos de la Empresa
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              {/* Nombre de la Empresa */}
              <FormField label="Nombre de la Empresa">
                <Input
                  type="text"
                  placeholder="Ej. Lauren Arica, Natura Shop, etc."
                  value={systemNameInput}
                  onChange={(e) => {
                    setSystemNameInput(e.target.value);
                    if (e.target.value.trim()) setErrors((prev) => ({ ...prev, systemName: "" }));
                  }}
                  error={errors.systemName}
                  disabled={isSubmitting || !isEditing || !canEdit}
                />
              </FormField>

              {/* Número de WhatsApp */}
              <FormField label="Número de WhatsApp (con código de país)">
                <Input
                  type="text"
                  placeholder="Ej. 51987654321"
                  value={whatsappNumberInput}
                  onChange={(e) => {
                    setWhatsappNumberInput(e.target.value);
                    if (e.target.value.trim()) setErrors((prev) => ({ ...prev, whatsappNumber: "" }));
                  }}
                  error={errors.whatsappNumber}
                  disabled={isSubmitting || !isEditing || !canEdit}
                />
              </FormField>
            </div>

            {/* Logo del Sistema */}
            <FormField label="Logo de la Empresa / Marca">
              <ImageUpload
                value={logoUrlInput}
                onChange={(val, file) => {
                  setLogoUrlInput(val);
                  setLocalFile(file || null);
                  setErrors((prev) => ({ ...prev, systemLogoUrl: "" }));
                }}
                disabled={isSubmitting || !isEditing || !canEdit}
                error={errors.systemLogoUrl}
                previewAlt="Logo del sistema"
              />
            </FormField>
          </div>
        </div>

        {/* Sección: Opciones de Visualización Pública */}
        <div className="bg-bg-card border border-border-default/80 rounded-2xl shadow-xs overflow-hidden p-6 space-y-4">
          <div className="flex items-center gap-2 border-b border-border-soft pb-3 mb-2">
            <FiGlobe className="w-5 h-5 text-beauty-500" />
            <h3 className="text-sm font-bold text-text-primary uppercase tracking-wide">
              Portal Público / Catálogo
            </h3>
          </div>

          <div className="space-y-5">
            {/* Mostrar precios públicamente */}
            <Checkbox
              id="showPricePublic"
              checked={showPricePublicInput}
              onChange={(e) => setShowPricePublicInput(e.target.checked)}
              disabled={isSubmitting || !isEditing || !canShow}
              label="Mostrar precios públicamente"
            />

            {/* Mostrar stock públicamente */}
            <Checkbox
              id="showStockPublic"
              checked={showStockPublicInput}
              onChange={(e) => setShowStockPublicInput(e.target.checked)}
              disabled={isSubmitting || !isEditing || !canShow}
              label="Mostrar disponibilidad / stock"
            />

            {/* Mostrar catálogos PDFs públicamente */}
            <Checkbox
              id="showCatalogsPublic"
              checked={showCatalogsPublicInput}
              onChange={(e) => setShowCatalogsPublicInput(e.target.checked)}
              disabled={isSubmitting || !isEditing || !canShow}
              label="Habilitar descarga de Catálogos PDFs"
            />
          </div>
        </div>

        {/* Botones de Acción */}
        {isEditing && (
          <div className="flex justify-end items-center gap-3 pt-2">
            <Button
              variant="outline"
              type="button"
              onClick={handleCancel}
              disabled={isSubmitting}
              className="border-border-strong text-text-primary hover:bg-bg-surface px-5 py-2.5 rounded-xl font-semibold shadow-sm"
            >
              Cancelar
            </Button>
            <Button
              variant="primary"
              type="submit"
              loading={isSubmitting}
              className="px-6 py-2.5 rounded-xl font-semibold shadow-sm"
            >
              Guardar Configuración
            </Button>
          </div>
        )}
      </Form>
    </div>
  );
}

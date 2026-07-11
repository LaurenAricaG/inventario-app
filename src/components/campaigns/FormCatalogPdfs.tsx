"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import Button from "@/components/ui/Button";
import Form, { FormField } from "@/components/ui/Form";
import Input from "@/components/ui/Input";
import Modal from "@/components/ui/Modal";
import Select from "@/components/ui/Select";
import PdfUpload from "@/components/ui/PdfUpload";
import { createCatalogPdfAction, updateCatalogPdfAction } from "@/lib/catalog";
import { catalogPdfSchema } from "@/lib/catalog/schema";
import { SerializedCatalogPdf } from "@/types/catalogs";

interface FormCatalogPdfsProps {
  isOpen: boolean;
  onClose: () => void;
  catalog: SerializedCatalogPdf | null;
  companies: { id: number; name: string }[];
  campaigns: {
    id: number;
    number: string;
    companyId: number;
    isActive: boolean;
    startDate: Date | string;
    endDate: Date | string;
    company: {
      id: number;
      name: string;
    };
  }[];
  brands: { id: number; name: string; companyId: number }[];
  existingCatalogPdfs: { campaignId: number; brandId: number }[];
}

export default function FormCatalogPdfs({
  isOpen,
  onClose,
  catalog,
  companies,
  campaigns,
  brands,
  existingCatalogPdfs,
}: FormCatalogPdfsProps) {
  const [companyIdInput, setCompanyIdInput] = useState("");
  const [brandIdInput, setBrandIdInput] = useState("");
  const [titleInput, setTitleInput] = useState("");
  const [pdfUrlInput, setPdfUrlInput] = useState("");
  const [localFile, setLocalFile] = useState<File | null>(null);

  const [errors, setErrors] = useState<{
    companyId?: string;
    campaignId?: string;
    brandId?: string;
    title?: string;
    pdfUrl?: string;
  }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Encontrar la campaña activa según la empresa seleccionada (modo creación)
  const activeCampaign =
    !catalog && companyIdInput
      ? campaigns.find(
          (c) => c.companyId === Number(companyIdInput) && c.isActive,
        )
      : null;

  // Encontrar la campaña registrada (modo edición)
  const editingCampaign =
    catalog && catalog.campaignId
      ? campaigns.find((c) => c.id === catalog.campaignId)
      : null;

  // Campaña actual seleccionada/autodetectada
  const currentCampaign = catalog ? editingCampaign : activeCampaign;

  // Todas las marcas asociadas a la empresa seleccionada (sin filtrar por catálogo)
  const companyBrands = companyIdInput
    ? brands.filter((b) => b.companyId === Number(companyIdInput))
    : [];

  // Filtrar marcas según la empresa seleccionada y excluir las que ya tienen catálogo registrado para la campaña actual
  const filteredBrands = companyIdInput
    ? companyBrands.filter((b) => {
        // Si estamos editando y esta es la marca original del catálogo, la permitimos siempre
        if (catalog && catalog.brandId === b.id) return true;

        // Si no, excluimos si ya hay un catálogo para esta campaña y marca
        const hasCatalog = existingCatalogPdfs.some(
          (c) => c.campaignId === currentCampaign?.id && c.brandId === b.id,
        );
        return !hasCatalog;
      })
    : [];

  // True cuando la empresa tiene marcas pero todas ya tienen PDF registrado
  const allBrandsHaveCatalog =
    !catalog &&
    companyIdInput &&
    currentCampaign &&
    companyBrands.length > 0 &&
    filteredBrands.length === 0;

  // Sincronizar inputs al abrir el modal o cambiar el catálogo seleccionado
  useEffect(() => {
    if (isOpen) {
      if (catalog) {
        // Modo Edición
        const selectedCamp = campaigns.find((c) => c.id === catalog.campaignId);
        const compId = selectedCamp?.companyId
          ? String(selectedCamp.companyId)
          : "";
        setCompanyIdInput(compId);
        setBrandIdInput(String(catalog.brandId));
        setTitleInput(catalog.title || "");
        setPdfUrlInput(catalog.pdfUrl || "");
      } else {
        // Modo Creación
        setCompanyIdInput("");
        setBrandIdInput("");
        setTitleInput("");
        setPdfUrlInput("");
      }
      setLocalFile(null);
      setErrors({});
    }
  }, [isOpen, catalog, campaigns]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const campaignId = currentCampaign?.id;

    const fieldErrors: typeof errors = {};
    if (!companyIdInput) {
      fieldErrors.companyId = "La empresa asociada es obligatoria.";
    }

    const validation = catalogPdfSchema.safeParse({
      campaignId: campaignId || 0, // Cero para que falle si no hay campaña
      brandId: parseInt(brandIdInput, 10),
      title: titleInput || null,
      pdfUrl: pdfUrlInput,
    });

    if (!validation.success) {
      validation.error.issues.forEach((issue) => {
        const path = issue.path[0];
        if (path === "campaignId") {
          if (companyIdInput && !fieldErrors.companyId) {
            fieldErrors.campaignId =
              "No se encontró una campaña activa para esta empresa.";
          }
        }
        if (path === "brandId") fieldErrors.brandId = issue.message;
        if (path === "title") fieldErrors.title = issue.message;
        if (path === "pdfUrl") fieldErrors.pdfUrl = issue.message;
      });
    }

    if (Object.keys(fieldErrors).length > 0) {
      setErrors(fieldErrors);
      return;
    }

    setErrors({});
    setIsSubmitting(true);

    let finalPdfUrl = pdfUrlInput;

    // Subir el archivo físico al servidor únicamente durante la confirmación de Guardar
    if (pdfUrlInput === "pending-local-file" && localFile) {
      try {
        const formData = new FormData();
        formData.append("file", localFile);
        formData.append("type", "pdf");

        const uploadResponse = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        if (!uploadResponse.ok) {
          const uploadData = await uploadResponse.json();
          throw new Error(
            uploadData.error || "Error al subir el archivo físico al servidor.",
          );
        }

        const uploadData = await uploadResponse.json();
        finalPdfUrl = uploadData.url;
      } catch (uploadError: any) {
        setErrors((prev) => ({
          ...prev,
          pdfUrl: uploadError.message || "Error al subir el archivo PDF.",
        }));
        setIsSubmitting(false);
        return;
      }
    }

    try {
      let res;
      const { brandId, title } = validation.data!;
      const finalCampaignId = campaignId!;

      if (catalog) {
        res = await updateCatalogPdfAction(
          catalog.id,
          finalCampaignId,
          brandId,
          title,
          finalPdfUrl,
        );
      } else {
        res = await createCatalogPdfAction(
          finalCampaignId,
          brandId,
          title,
          finalPdfUrl,
        );
      }

      if (res.success) {
        toast.success(res.message);
        onClose();
      } else {
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
      title={catalog ? "Editar Catálogo PDF" : "Subir Catálogo PDF"}
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
            form="catalog-form"
            type="submit"
            loading={isSubmitting}
          >
            Guardar
          </Button>
        </div>
      }
    >
      <Form id="catalog-form" onSubmit={handleSubmit}>
        {/* Empresa Asociada */}
        <FormField label="Empresa Asociada" error={errors.companyId}>
          <Select
            value={companyIdInput}
            onChange={(e) => {
              setCompanyIdInput(e.target.value);
              setBrandIdInput(""); // Resetear marca al cambiar empresa
              setErrors((prev) => ({
                ...prev,
                companyId: undefined,
                campaignId: undefined,
              }));
            }}
            disabled={isSubmitting || !!catalog}
          >
            <option value="">Selecciona la empresa...</option>
            {companies.map((comp) => (
              <option key={comp.id} value={String(comp.id)}>
                {comp.name}
              </option>
            ))}
          </Select>
        </FormField>

        {/* Campaña Asociada (Autocalculada basada en la campaña activa) */}
        <FormField label="Campaña Activa" error={errors.campaignId}>
          {companyIdInput ? (
            currentCampaign ? (
              <div className="px-4 py-2.5 rounded-2xl border border-success-text/20 bg-success-bg/30 text-sm text-success-text select-none flex flex-col justify-center gap-0.5 min-h-13">
                <div className="font-bold flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-success-text animate-pulse" />
                  Campaña {currentCampaign.number}
                </div>
                {currentCampaign.startDate && currentCampaign.endDate && (
                  <div className="text-[10px] text-success-text/80 font-medium font-sans">
                    Vigencia:{" "}
                    {new Date(currentCampaign.startDate).toLocaleDateString(
                      "es-PE",
                    )}{" "}
                    al{" "}
                    {new Date(currentCampaign.endDate).toLocaleDateString(
                      "es-PE",
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="px-4 py-3 rounded-2xl border border-warning-text/30 bg-warning-bg/10 text-sm font-semibold text-warning-text select-none h-11.5 flex items-center">
                Sin campaña activa registrada. Crea una campaña primero.
              </div>
            )
          ) : (
            <div className="px-4 py-3 rounded-2xl border border-border-soft bg-bg-surface/50 text-sm italic text-text-tertiary select-none h-11.5 flex items-center">
              Selecciona una empresa para ver su campaña activa.
            </div>
          )}
        </FormField>

        {/* Marca Asociada (Filtrada por Empresa) */}
        <FormField label="Marca" error={errors.brandId}>
          <Select
            value={brandIdInput}
            onChange={(e) => {
              setBrandIdInput(e.target.value);
              setErrors((prev) => ({ ...prev, brandId: undefined }));
            }}
            disabled={
              isSubmitting ||
              !companyIdInput ||
              !!catalog ||
              filteredBrands.length === 0
            }
          >
            <option value="">
              {companyIdInput
                ? companyBrands.length === 0
                  ? "No hay marcas registradas"
                  : filteredBrands.length === 0
                    ? "Sin marcas disponibles para registrar"
                    : "Selecciona la marca..."
                : "Selecciona la marca..."}
            </option>
            {filteredBrands.map((brand) => (
              <option key={brand.id} value={String(brand.id)}>
                {brand.name}
              </option>
            ))}
          </Select>
          {companyIdInput && currentCampaign && (
            <>
              {companyBrands.length === 0 ? (
                <p className="mt-1.5 text-xs text-amber-600 dark:text-amber-400 font-semibold leading-relaxed">
                  No hay marcas registradas para esta empresa. Por favor,
                  registra una marca asociada a esta empresa primero.
                </p>
              ) : filteredBrands.length === 0 ? (
                <p className="mt-1.5 text-xs text-amber-600 dark:text-amber-400 font-semibold leading-relaxed">
                  Todas las marcas de esta empresa ya cuentan con un catálogo
                  PDF registrado en la campaña {currentCampaign.number}. Puedes
                  editarlos desde el listado principal.
                </p>
              ) : null}
            </>
          )}
        </FormField>

        {/* Título / Nombre del Catálogo */}
        <FormField label="Título del Catálogo (Opcional)" error={errors.title}>
          <Input
            type="text"
            placeholder="Ej. Catálogo Cyzone Campaña 01"
            value={titleInput}
            onChange={(e) => {
              setTitleInput(e.target.value);
              if (errors.title) {
                setErrors((prev) => ({ ...prev, title: undefined }));
              }
            }}
            disabled={isSubmitting || !!allBrandsHaveCatalog}
          />
        </FormField>

        {/* Carga del documento PDF */}
        <FormField label="Archivo PDF del Catálogo" error={errors.pdfUrl}>
          <PdfUpload
            value={pdfUrlInput}
            onChange={(val, file) => {
              setPdfUrlInput(val);
              setLocalFile(file || null);
              setErrors((prev) => ({ ...prev, pdfUrl: undefined }));
            }}
            disabled={isSubmitting || !!allBrandsHaveCatalog || (!catalog && !brandIdInput)}
            error={errors.pdfUrl}
          />
        </FormField>
      </Form>
    </Modal>
  );
}

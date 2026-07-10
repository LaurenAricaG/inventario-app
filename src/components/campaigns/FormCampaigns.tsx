"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import Button from "@/components/ui/Button";
import Form, { FormField } from "@/components/ui/Form";
import Input from "@/components/ui/Input";
import Modal from "@/components/ui/Modal";
import Select from "@/components/ui/Select";
import Checkbox from "@/components/ui/Checkbox";
import { createCampaignAction, updateCampaignAction } from "@/lib/campaign";
import { campaignSchema } from "@/lib/campaign/schema";
import { SerializedCampaign } from "@/types/campaigns";
import { cn } from "@/utils/cn.utils";

interface FormCampaignsProps {
  isOpen: boolean;
  onClose: () => void;
  campaign: SerializedCampaign | null;
  companies: { id: number; name: string }[];
}

export default function FormCampaigns({
  isOpen,
  onClose,
  campaign,
  companies,
}: FormCampaignsProps) {
  const [companyIdInput, setCompanyIdInput] = useState("");
  const [numberInput, setNumberInput] = useState("");
  const [campaignYear, setCampaignYear] = useState(() =>
    String(new Date().getFullYear()),
  );
  const [startDateInput, setStartDateInput] = useState("");
  const [endDateInput, setEndDateInput] = useState("");
  const [isActiveInput, setIsActiveInput] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [errors, setErrors] = useState<{
    companyId?: string;
    number?: string;
    startDate?: string;
    endDate?: string;
    isActive?: string;
  }>({});

  const toDateInputString = (isoStr: string | undefined | null) => {
    if (!isoStr) return "";
    // Obtener la fecha en formato YYYY-MM-DD segura en UTC
    return isoStr.split("T")[0];
  };

  // Sincronizar inputs al abrir el modal o cambiar la campaña seleccionada
  useEffect(() => {
    if (isOpen) {
      setCompanyIdInput(
        campaign && campaign.companyId ? String(campaign.companyId) : "",
      );

      let parsedNumber = "";
      let parsedYear = String(new Date().getFullYear());

      if (campaign && campaign.number) {
        const match = campaign.number.match(/^C-(\d{4})-(.+)$/);
        if (match) {
          parsedYear = match[1];
          // Solo extraemos los dígitos del número de campaña
          parsedNumber = match[2].replace(/\D/g, "");
        } else {
          parsedNumber = campaign.number.replace(/\D/g, "");
        }
      }

      setNumberInput(parsedNumber);
      setCampaignYear(parsedYear);
      setStartDateInput(campaign ? toDateInputString(campaign.startDate) : "");
      setEndDateInput(campaign ? toDateInputString(campaign.endDate) : "");
      setIsActiveInput(campaign ? campaign.isActive : false);
      setErrors({});
    }
  }, [isOpen, campaign]);

  // Actualizar dinámicamente el año de la campaña según la fecha de inicio seleccionada
  useEffect(() => {
    if (startDateInput) {
      const year = startDateInput.split("-")[0];
      if (year && year.length === 4) {
        setCampaignYear(year);
      }
    }
  }, [startDateInput]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const trimmedInput = numberInput.trim();
    let finalNumber = "";
    if (/^\d+$/.test(trimmedInput)) {
      const numVal = parseInt(trimmedInput, 10);
      finalNumber = `C-${campaignYear}-${String(numVal).padStart(2, "0")}`;
    } else {
      finalNumber = `C-${campaignYear}-${trimmedInput}`;
    }
    const parsedCompanyId = parseInt(companyIdInput, 10);
    // Convertimos las cadenas YYYY-MM-DD a objetos Date en UTC para evitar desfases
    const parseDateUTC = (dateStr: string) => {
      if (!dateStr) return new Date("");
      const [year, month, day] = dateStr.split("-").map(Number);
      return new Date(Date.UTC(year, month - 1, day));
    };

    const parsedStartDate = parseDateUTC(startDateInput);
    const parsedEndDate = parseDateUTC(endDateInput);

    const validation = campaignSchema.safeParse({
      companyId: parsedCompanyId,
      number: finalNumber,
      startDate: parsedStartDate,
      endDate: parsedEndDate,
      isActive: isActiveInput,
    });

    const fieldErrors: typeof errors = {};

    // Si el campo de código de campaña está vacío, agregamos explícitamente su error
    if (!trimmedInput) {
      fieldErrors.number = "El número de campaña es obligatorio.";
    }

    if (!validation.success) {
      validation.error.issues.forEach((issue) => {
        const path = issue.path[0];
        if (path === "companyId") fieldErrors.companyId = issue.message;
        if (path === "number" && !fieldErrors.number) {
          fieldErrors.number = issue.message;
        }
        if (path === "startDate") fieldErrors.startDate = issue.message;
        if (path === "endDate") fieldErrors.endDate = issue.message;
        if (path === "isActive") fieldErrors.isActive = issue.message;
      });
    }

    if (Object.keys(fieldErrors).length > 0) {
      setErrors(fieldErrors);
      return;
    }

    setErrors({});
    setIsSubmitting(true);

    try {
      let res;
      const { companyId, number, startDate, endDate, isActive } =
        validation.data!;

      if (campaign) {
        res = await updateCampaignAction(
          campaign.id,
          companyId,
          number,
          startDate,
          endDate,
          isActive,
        );
      } else {
        res = await createCampaignAction(
          companyId,
          number,
          startDate,
          endDate,
          isActive,
        );
      }

      if (res.success) {
        toast.success(res.message);
        onClose();
      } else {
        if (
          res.message.toLowerCase().includes("número") ||
          res.message.toLowerCase().includes("numero")
        ) {
          setErrors({ number: res.message });
        } else if (res.message.toLowerCase().includes("empresa")) {
          setErrors({ companyId: res.message });
        } else {
          toast.error(res.message);
        }
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
      title={campaign ? "Editar Campaña" : "Crear Campaña"}
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
            form="campaign-form"
            type="submit"
            loading={isSubmitting}
          >
            Guardar
          </Button>
        </div>
      }
    >
      <Form id="campaign-form" onSubmit={handleSubmit}>
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
            placeholder="Selecciona la empresa..."
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

        {/* Número de la Campaña */}
        <FormField label="Número o Código de Campaña">
          <div
            className={cn(
              "flex items-center w-full rounded-2xl border bg-bg-card transition-all duration-200 focus-within:border-beauty-400 focus-within:ring-4 focus-within:ring-beauty-400/10",
              errors.number
                ? "border-danger-text focus-within:border-danger-text focus-within:ring-danger-text/10"
                : "border-border-strong/40",
              isSubmitting && "opacity-50 bg-bg-surface cursor-not-allowed",
            )}
          >
            {/* Prefijo integrado en el input */}
            <div className="pl-4 py-3 text-sm font-semibold text-text-secondary select-none shrink-0 border-r border-border-strong/20 dark:border-border-default/50 pr-3 flex items-center justify-center h-full">
              C-{campaignYear}-
            </div>
            {/* Input integrado transparente */}
            <input
              type="text"
              placeholder="Ej. 01, 02..."
              value={numberInput}
              onChange={(e) => {
                setNumberInput(e.target.value);
                if (e.target.value.trim()) {
                  setErrors((prev) => ({ ...prev, number: undefined }));
                }
              }}
              disabled={isSubmitting}
              className="w-full px-3 py-3 text-sm bg-transparent text-text-primary outline-none placeholder:text-text-tertiary/70 disabled:cursor-not-allowed"
            />
          </div>
          {errors.number && (
            <p className="mt-1.5 text-xs font-medium text-danger-text select-none animate-fade-in">
              {errors.number}
            </p>
          )}
        </FormField>

        {/* Rango de Fechas */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField label="Fecha de Inicio">
            <Input
              type="date"
              value={startDateInput}
              onChange={(e) => {
                setStartDateInput(e.target.value);
                if (e.target.value) {
                  setErrors((prev) => ({ ...prev, startDate: undefined }));
                }
              }}
              error={errors.startDate}
              disabled={isSubmitting}
            />
          </FormField>

          <FormField label="Fecha Fin">
            <Input
              type="date"
              value={endDateInput}
              onChange={(e) => {
                setEndDateInput(e.target.value);
                if (e.target.value) {
                  setErrors((prev) => ({ ...prev, endDate: undefined }));
                }
              }}
              error={errors.endDate}
              disabled={isSubmitting}
            />
          </FormField>
        </div>

        {/* Campaña Activa */}
        <div className="pt-2 select-none">
          <Checkbox
            label="Marcar como campaña activa"
            checked={isActiveInput}
            onChange={(e) => setIsActiveInput(e.target.checked)}
            disabled={isSubmitting}
            error={errors.isActive}
          />
          <p className="text-[11px] text-text-tertiary mt-1.5 leading-relaxed">
            Al activar esta campaña, se desactivarán automáticamente las demás
            campañas asociadas a la misma empresa.
          </p>
        </div>
      </Form>
    </Modal>
  );
}

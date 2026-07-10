import { z } from "zod";

export const campaignSchema = z.object({
  companyId: z.coerce
    .number({ message: "La empresa seleccionada no es válida." })
    .int("El identificador de la empresa debe ser un número entero.")
    .positive("Debes seleccionar una empresa válida de la lista."),

  number: z
    .string({ message: "El número de campaña es obligatorio." })
    .trim()
    .regex(
      /^C-\d{4}-(0?[1-9]|1[0-9]|20)$/,
      "El número de campaña debe ser un número del 1 al 20 (ej: 01, 02... 20).",
    ),

  startDate: z.coerce.date({
    message: "La fecha de inicio es obligatoria y debe ser válida.",
  }),

  endDate: z.coerce.date({
    message: "La fecha de fin es obligatoria y debe ser válida.",
  }),

  isActive: z.boolean({ message: "El estado activo es obligatorio." }).default(false),

  paymentDate: z.preprocess(
    (val) => (val === "" || val === undefined || val === null ? null : new Date(val as string)),
    z.date().nullable().optional()
  ),
}).refine((data) => data.endDate >= data.startDate, {
  message: "La fecha de fin debe ser posterior o igual a la fecha de inicio.",
  path: ["endDate"],
});

export type CampaignInput = z.infer<typeof campaignSchema>;

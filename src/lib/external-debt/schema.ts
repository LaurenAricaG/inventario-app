import { z } from "zod";

export const externalDebtSchema = z.object({
  amount: z
    .number({ message: "El monto debe ser un número." })
    .positive("El monto debe ser mayor a 0."),
  reason: z
    .string()
    .min(1, "El motivo es requerido (ej. 'Saldo inicial', 'Venta externa')."),
  notes: z.string().optional(),
  clientId: z.number({ message: "El cliente es requerido." }),
});

export type ExternalDebtInput = z.infer<typeof externalDebtSchema>;

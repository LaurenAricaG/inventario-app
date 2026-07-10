import { z } from "zod";
import { PaymentMethod } from "@/generated/prisma";

export const paymentSchema = z.object({
  amount: z
    .number({ message: "El monto debe ser un número." })
    .positive("El monto debe ser mayor a 0."),
  method: z.nativeEnum(PaymentMethod, {
    message: "Método de pago no válido.",
  }),
  note: z.string().optional(),
  campaignId: z.number().nullable().optional(),
  clientId: z.number({ message: "El cliente es requerido." }),
});

export type PaymentInput = z.infer<typeof paymentSchema>;

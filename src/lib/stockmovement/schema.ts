import { z } from "zod";

export const stockMovementSchema = z.object({
  productId: z.coerce
    .number({ message: "El producto seleccionado no es válido." })
    .int("El identificador del producto debe ser un número entero.")
    .positive("Debes seleccionar un producto válido."),
  quantity: z.coerce
    .number({ message: "La cantidad es obligatoria." })
    .int("La cantidad debe ser un número entero.")
    .positive("La cantidad debe ser mayor a 0."),
  type: z.enum(["INPUT", "OUTPUT"], {
    message: "El tipo de movimiento debe ser Entrada (INPUT) o Salida (OUTPUT).",
  }),
  reason: z.enum(
    [
      "PURCHASE",
      "SALE",
      "GIFT",
      "PERSONAL_USE",
      "LOSS_OR_DAMAGE",
      "ADJUSTMENT",
      "RETURN",
      "LOAN",
    ],
    {
      message: "El motivo seleccionado no es válido.",
    }
  ),
  notes: z
    .string()
    .trim()
    .max(250, "Las notas no pueden exceder los 250 caracteres.")
    .optional()
    .or(z.literal(""))
    .nullable(),
});

export type StockMovementInput = z.infer<typeof stockMovementSchema>;

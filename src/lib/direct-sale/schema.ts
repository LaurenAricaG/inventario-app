import { z } from "zod";

export const directSaleSchema = z.object({
  clientId: z.coerce
    .number({ message: "El cliente seleccionado no es válido." })
    .int("El identificador del cliente debe ser un número entero.")
    .positive("Debes seleccionar un cliente válido."),
  discount: z.coerce
    .number({ message: "El descuento debe ser un número válido." })
    .min(0, "El descuento no puede ser negativo.")
    .default(0),
  notes: z
    .string()
    .trim()
    .max(250, "Las notas no pueden exceder los 250 caracteres.")
    .optional()
    .or(z.literal(""))
    .nullable(),
  items: z
    .array(
      z.object({
        productId: z.coerce
          .number({ message: "El producto seleccionado no es válido." })
          .int()
          .positive("Producto no válido."),
        quantity: z.coerce
          .number({ message: "La cantidad es requerida." })
          .int("La cantidad debe ser un entero.")
          .positive("La cantidad debe ser mayor a 0."),
        unitPrice: z.coerce
          .number({ message: "El precio unitario es requerido." })
          .min(0, "El precio unitario no puede ser negativo."),
      })
    )
    .min(1, "Debes agregar al menos un producto a la venta."),
});

export type DirectSaleInput = z.infer<typeof directSaleSchema>;

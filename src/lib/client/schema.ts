import { z } from "zod";

export const clientSchema = z.object({
  name: z
    .string({ message: "El nombre del cliente es obligatorio." })
    .trim()
    .min(2, "El nombre del cliente debe tener al menos 2 caracteres.")
    .max(100, "El nombre del cliente no puede exceder los 100 caracteres.")
    .regex(
      /^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s\-\.\/]+$/,
      "El nombre solo puede contener letras, números, espacios, guiones, puntos y barras diagonales."
    ),
  phone: z
    .string()
    .trim()
    .max(20, "El teléfono no puede exceder los 20 caracteres.")
    .regex(/^[0-9\+\-\s]*$/, "El teléfono solo puede contener números, espacios y guiones (-).")
    .optional()
    .or(z.literal("")),
  address: z
    .string()
    .trim()
    .max(200, "La dirección no puede exceder los 200 caracteres.")
    .optional()
    .or(z.literal("")),
  notes: z
    .string()
    .trim()
    .max(500, "Las notas no pueden exceder los 500 caracteres.")
    .optional()
    .or(z.literal("")),
});

export type ClientInput = z.infer<typeof clientSchema>;

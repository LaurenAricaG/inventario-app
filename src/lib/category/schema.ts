import { z } from "zod";

export const categorySchema = z.object({
  name: z
    .string({ message: "El nombre de la categoría es obligatorio." })
    .trim()
    .min(2, "El nombre de la categoría debe tener al menos 2 caracteres.")
    .max(30, "El nombre de la categoría no puede exceder los 30 caracteres.")
    .regex(
      /^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s\-\.\/]+$/,
      "El nombre solo puede contener letras, números, espacios, guiones, puntos y barras diagonales.",
    ),
});

export type CategoryInput = z.infer<typeof categorySchema>;

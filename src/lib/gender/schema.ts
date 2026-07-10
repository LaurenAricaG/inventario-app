import { z } from "zod";

export const genderSchema = z.object({
  name: z
    .string({ message: "El nombre es obligatorio." })
    .trim()
    .min(2, "El nombre del género debe tener al menos 2 caracteres.")
    .max(30, "El nombre del género no puede exceder los 30 caracteres.")
    .regex(/^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s]+$/, "El nombre solo puede contener letras, números y espacios."),
});

export type GenderInput = z.infer<typeof genderSchema>;

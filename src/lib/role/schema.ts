import { z } from "zod";

export const roleSchema = z.object({
  name: z
    .string({ message: "El nombre del rol es obligatorio." })
    .min(2, "El nombre del rol debe tener al menos 2 caracteres.")
    .max(50, "El nombre del rol no puede superar los 50 caracteres.")
    .trim(),
  description: z
    .string()
    .max(200, "La descripción no puede superar los 200 caracteres.")
    .optional()
    .or(z.literal("")),
  permissionIds: z
    .array(z.number().int().positive())
    .min(1, "Debe seleccionar al menos un permiso para este rol."),
});

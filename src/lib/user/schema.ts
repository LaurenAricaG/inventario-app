import { z } from "zod";

export const userSchema = z.object({
  name: z
    .string({ message: "El nombre completo es obligatorio." })
    .trim()
    .min(2, "El nombre completo debe tener al menos 2 caracteres.")
    .max(100, "El nombre completo no puede exceder los 100 caracteres.")
    .regex(
      /^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s\-\.\/]+$/,
      "El nombre solo puede contener letras, números, espacios, guiones, puntos y barras diagonales."
    ),
  username: z
    .string({ message: "El nombre de usuario es obligatorio." })
    .trim()
    .min(3, "El nombre de usuario debe tener al menos 3 caracteres.")
    .max(30, "El nombre de usuario no puede exceder los 30 caracteres.")
    .regex(
      /^[a-zA-Z0-9\._\-]+$/,
      "El nombre de usuario solo puede contener letras, números, puntos (.), guiones (-) y guiones bajos (_)."
    ),
  email: z
    .string({ message: "El correo electrónico es obligatorio." })
    .trim()
    .email("Por favor ingresa un correo electrónico válido.")
    .max(100, "El correo electrónico no puede exceder los 100 caracteres."),
  password: z
    .string()
    .min(6, "La contraseña debe tener al menos 6 caracteres.")
    .max(50, "La contraseña no puede exceder los 50 caracteres.")
    .optional()
    .or(z.literal("")),
  roleId: z.preprocess(
    (val) => Number(val),
    z
      .number({
        message: "El rol de acceso es obligatorio.",
      })
      .int()
      .positive("El rol de acceso es obligatorio.")
  ),
});

export type UserInput = z.infer<typeof userSchema>;

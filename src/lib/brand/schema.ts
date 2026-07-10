import { z } from "zod";

export const brandSchema = z.object({
  name: z
    .string({ message: "El nombre de la marca es obligatorio." })
    .trim()
    .min(2, "El nombre de la marca debe tener al menos 2 caracteres.")
    .max(30, "El nombre de la marca no puede exceder los 30 caracteres.")
    .regex(
      /^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s\-\.]+$/,
      "El nombre solo puede contener letras, números, espacios, guiones y puntos.",
    ),

  // Validamos que companyId sea un número entero positivo (no vacío y válido)
  companyId: z.coerce
    .number({ message: "La empresa seleccionada no es válida." })
    .int("El identificador de la empresa debe ser un número entero.")
    .positive("Debes seleccionar una empresa válida de la lista."),

  logoUrl: z
    .string()
    .trim()
    .refine(
      (val) => {
        if (!val) return true;
        // Permite URLs HTTP/HTTPS, rutas relativas locales, cadenas en base64 de imagen o archivo pendiente
        const isUrl = /^https?:\/\/[^\s$.?#].[^\s]*$/i.test(val);
        const isLocalPath = /^\/uploads\/[^\s]+$/i.test(val);
        const isBase64 =
          /^data:image\/(png|jpeg|jpg|webp|gif|svg\+xml);base64,/.test(val);
        const isPendingLocal = val === "pending-local-file";
        return isUrl || isLocalPath || isBase64 || isPendingLocal;
      },
      {
        message:
          "Debe ser una URL válida, una ruta local, una imagen cargada o un archivo pendiente.",
      },
    )
    .optional()
    .nullable(),
});

export type BrandInput = z.infer<typeof brandSchema>;

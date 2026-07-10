import { z } from "zod";
export const companySchema = z.object({
  name: z
    .string({ message: "El nombre es obligatorio." })
    .trim()
    .min(2, "El nombre de la empresa debe tener al menos 2 caracteres.")
    .max(30, "El nombre de la empresa no puede exceder los 30 caracteres.")
    .regex(
      /^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s]+$/,
      "El nombre solo puede contener letras, números y espacios.",
    ),
  logoUrl: z
    .string()
    .trim()
    .refine(
      (val) => {
        if (!val) return true;
        // Permite URLs HTTP/HTTPS, rutas relativas locales, cadenas en base64 o archivo local pendiente
        const isUrl = /^https?:\/\/[^\s$.?#].[^\s]*$/i.test(val);
        const isLocalPath = /^\/uploads\/companies\/[^\s]+$/i.test(val);
        const isBase64 = /^data:image\/(png|jpeg|jpg|webp|gif|svg\+xml);base64,/.test(val);
        const isPendingLocal = val === "pending-local-file";
        return isUrl || isLocalPath || isBase64 || isPendingLocal;
      },
      { message: "Debe ser una URL válida, una ruta local, una imagen cargada o un archivo pendiente." }
    )
    .optional()
    .nullable(),
});
export type CompanyInput = z.infer<typeof companySchema>;

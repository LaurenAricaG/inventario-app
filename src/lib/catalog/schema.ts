import { z } from "zod";

export const catalogPdfSchema = z.object({
  campaignId: z.coerce
    .number({ message: "La campaña seleccionada no es válida." })
    .int("El identificador de la campaña debe ser un número entero.")
    .positive("Debes seleccionar una campaña válida de la lista."),

  brandId: z.coerce
    .number({ message: "La marca seleccionada no es válida." })
    .int("El identificador de la marca debe ser un número entero.")
    .positive("Debes seleccionar una marca válida de la lista."),

  title: z
    .string()
    .trim()
    .max(100, "El título del catálogo no puede exceder los 100 caracteres.")
    .optional()
    .nullable(),

  pdfUrl: z
    .string({ message: "El catálogo PDF es obligatorio." })
    .trim()
    .min(1, "El catálogo PDF es obligatorio.")
    .refine(
      (val) => {
        if (!val) return false;
        const isUrl = /^https?:\/\/[^\s$.?#].[^\s]*$/i.test(val);
        const isLocalPath = /^\/uploads\/[^\s]+$/i.test(val);
        const isBase64 = /^data:application\/pdf;base64,/.test(val);
        const isPendingLocal = val === "pending-local-file";
        return isUrl || isLocalPath || isBase64 || isPendingLocal;
      },
      {
        message: "Debe ser una URL válida, una ruta local o un archivo PDF cargado.",
      }
    ),
});

export type CatalogPdfInput = z.infer<typeof catalogPdfSchema>;

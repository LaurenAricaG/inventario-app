import { z } from "zod";

export const systemConfigSchema = z.object({
  systemName: z
    .string({ message: "El nombre de la empresa es obligatorio." })
    .trim()
    .min(2, "El nombre de la empresa debe tener al menos 2 caracteres.")
    .max(50, "El nombre no puede exceder los 50 caracteres."),
  
  systemLogoUrl: z
    .string()
    .trim()
    .refine(
      (val) => {
        if (!val) return true;
        const isUrl = /^https?:\/\/[^\s$.?#].[^\s]*$/i.test(val);
        const isLocalPath = /^\/uploads\/[^\s]+$/i.test(val);
        const isBase64 =
          /^data:image\/(png|jpeg|jpg|webp|gif|svg\+xml);base64,/.test(val);
        const isPendingLocal = val === "pending-local-file";
        return isUrl || isLocalPath || isBase64 || isPendingLocal;
      },
      {
        message: "Debe ser una URL válida, ruta local, imagen cargada o archivo pendiente.",
      }
    )
    .optional()
    .nullable(),

  whatsappNumber: z
    .string({ message: "El número de WhatsApp es obligatorio." })
    .trim()
    .regex(/^\d+$/, "El número de WhatsApp solo debe contener dígitos numéricos.")
    .min(9, "El número de WhatsApp debe tener al menos 9 dígitos.")
    .max(15, "El número de WhatsApp no puede exceder los 15 dígitos."),

  showPricePublic: z.boolean().default(true),
  showStockPublic: z.boolean().default(true),
  showCatalogsPublic: z.boolean().default(true),
});

export type SystemConfigInput = z.infer<typeof systemConfigSchema>;

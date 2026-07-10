import { z } from "zod";

export const productImageSchema = z.object({
  url: z
    .string()
    .trim()
    .refine(
      (val) => {
        if (!val) return false;
        const isUrl = /^https?:\/\/[^\s$.?#].[^\s]*$/i.test(val);
        const isLocalPath = /^\/uploads\/[^\s]+$/i.test(val);
        const isBase64 =
          /^data:image\/(png|jpeg|jpg|webp|gif|svg\+xml);base64,/.test(val);
        const isPendingLocal = val === "pending-local-file";
        return isUrl || isLocalPath || isBase64 || isPendingLocal;
      },
      {
        message: "URL de imagen no válida.",
      }
    ),
  isMain: z.boolean().default(false),
  position: z.number().int().default(0),
});

export const productSchema = z.object({
  name: z
    .string({ message: "El nombre del producto es obligatorio." })
    .trim()
    .min(2, "El nombre del producto debe tener al menos 2 caracteres.")
    .max(100, "El nombre del producto no puede exceder los 100 caracteres."),
  
  brandId: z.coerce
    .number({ message: "La marca seleccionada no es válida." })
    .int()
    .positive("Debes seleccionar una marca de la lista."),
  
  categoryId: z.coerce
    .number({ message: "La categoría seleccionada no es válida." })
    .int()
    .positive("Debes seleccionar una categoría de la lista."),

  genderSegmentId: z.coerce
    .number()
    .int()
    .positive()
    .optional()
    .nullable(),

  code: z
    .string()
    .trim()
    .max(50, "El código no puede exceder los 50 caracteres.")
    .regex(/^[a-zA-Z0-9\-\.]+$/, "El código solo puede contener letras, números, guiones y puntos.")
    .optional()
    .nullable()
    .or(z.literal("")),

  description: z
    .string()
    .trim()
    .max(500, "La descripción no puede exceder los 500 caracteres.")
    .optional()
    .nullable()
    .or(z.literal("")),

  price: z.coerce
    .number({ message: "El precio de venta debe ser un número." })
    .min(0, "El precio de venta no puede ser menor a 0."),

  costPrice: z.coerce
    .number()
    .min(0, "El precio de costo no puede ser menor a 0.")
    .optional()
    .nullable(),

  stock: z.coerce
    .number({ message: "El stock debe ser un número." })
    .int("El stock debe ser un número entero.")
    .min(0, "El stock no puede ser menor a 0.")
    .default(0),

  isAvailable: z.boolean().default(true),

  images: z.array(productImageSchema).default([]),
});

export type ProductInput = z.infer<typeof productSchema>;

import { z } from "zod";

export interface SubstituteInput {
  productCode: string;
  productName: string;
  catalogPrice: number;
}

export const bulkOrderItemSchema = z.object({
  brandId: z.number({ message: "La marca es obligatoria." }),
  productCode: z.string().optional().or(z.literal("")),
  productName: z.string().min(1, "El nombre del producto no puede estar vacío."),
  catalogPrice: z.number({ message: "El precio es obligatorio." }).min(0, "El precio no puede ser negativo."),
  quantity: z.number({ message: "La cantidad es obligatoria." }).min(1, "La cantidad debe ser al menos 1."),
});

export const bulkOrderSchema = z.object({
  clientId: z.number({ message: "El cliente es obligatorio." }),
  discount: z.number().default(0),
  notes: z.string().optional().nullable(),
  items: z.array(bulkOrderItemSchema).min(1, "El pedido del cliente debe contener al menos un producto."),
});

export type BulkOrderItemInput = z.infer<typeof bulkOrderItemSchema>;
export type BulkOrderInput = z.infer<typeof bulkOrderSchema>;

import { DirectSale, DirectSaleItem, Client, Product } from "./models";

export type SerializedDirectSale = Omit<
  DirectSale,
  "createdAt" | "updatedAt" | "deletedAt" | "deliveredAt"
> & {
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  deliveredAt: string | null;
};

export type SerializedDirectSaleWithRelations = SerializedDirectSale & {
  client: Omit<Client, "createdAt" | "updatedAt" | "deletedAt">;
  items: (DirectSaleItem & {
    product: Omit<Product, "createdAt" | "updatedAt" | "deletedAt"> & {
      brand: { name: string };
      category: { name: string };
    };
  })[];
};

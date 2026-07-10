import { Brand, Category, GenderSegment, Product } from "./models";

export type ProductWithRelations = Product & {
  brands: Brand;
  categories: Category;
  genders: GenderSegment;
  // Espacio para relaciones futuras (ej. Products)
};

export type SerializedProduct = Omit<
  Product,
  "createdAt" | "updatedAt" | "deletedAt"
> & {
  createdAt: string;
  updatedAt?: string;
  deletedAt?: string | null;
  brands?: {
    id: number;
    name: string;
  };
  categories?: {
    id: number;
    name: string;
  };
  genders?: {
    id: number;
    name: string;
  };
};

import { Brand, Company } from "./models";

export type BrandWithRelations = Brand & {
  company: Company;
  // Espacio para relaciones futuras (ej. Products)
};

export type SerializedBrand = Omit<
  Brand,
  "createdAt" | "updatedAt" | "deletedAt"
> & {
  createdAt: string;
  updatedAt?: string;
  deletedAt?: string | null;
  company?: {
    id: number;
    name: string;
  };
};

import { Company } from "./models";

export type CompanyWithRelations = Company & {
  // Espacio para relaciones futuras (ej. Products)
};

export type SerializedCompany = Omit<
  Company,
  "createdAt" | "updatedAt" | "deletedAt"
> & {
  createdAt: string;
  updatedAt?: string;
  deletedAt?: string | null;
};

import { CatalogPdf, Campaign, Brand } from "./models";

export type SerializedCatalogPdf = Omit<
  CatalogPdf,
  "createdAt" | "updatedAt" | "deletedAt"
> & {
  createdAt: string;
  updatedAt?: string;
  deletedAt?: string | null;
  campaign?: {
    id: number;
    number: string;
    company: {
      id: number;
      name: string;
    };
  };
  brand?: {
    id: number;
    name: string;
    logoUrl?: string | null;
  };
};

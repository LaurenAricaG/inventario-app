import { Campaign, Company } from "./models";

export type CampaignWithRelations = Campaign & {
  company: Company;
};

export type SerializedCampaign = Omit<
  Campaign,
  "startDate" | "endDate" | "paymentDate" | "createdAt" | "updatedAt" | "deletedAt"
> & {
  startDate: string;
  endDate: string;
  paymentDate?: string | null;
  createdAt: string;
  updatedAt?: string;
  deletedAt?: string | null;
  company?: {
    id: number;
    name: string;
  };
};

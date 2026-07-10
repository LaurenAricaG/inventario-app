import { Category } from "./models";

export type SerializedCategory = Omit<
  Category,
  "createdAt" | "updatedAt" | "deletedAt"
> & {
  createdAt: string;
  updatedAt?: string;
  deletedAt?: string | null;
};

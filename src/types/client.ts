import { Client } from "./models";

export type SerializedClient = Omit<
  Client,
  "createdAt" | "updatedAt" | "deletedAt"
> & {
  createdAt: string;
  updatedAt?: string;
  deletedAt?: string | null;
};

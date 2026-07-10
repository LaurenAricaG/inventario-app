import { User, Role } from "./models";

export type SerializedUserWithRole = Omit<
  User,
  "createdAt" | "updatedAt" | "deletedAt" | "passwordHash"
> & {
  createdAt: string;
  updatedAt?: string;
  deletedAt?: string | null;
  role: Omit<Role, "createdAt" | "updatedAt" | "deletedAt">;
};

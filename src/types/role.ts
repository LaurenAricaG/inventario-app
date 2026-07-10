import { Role, Permission } from "./models";

export type SerializedRole = Omit<
  Role,
  "createdAt" | "updatedAt" | "deletedAt"
> & {
  createdAt: string;
  updatedAt?: string;
  deletedAt?: string | null;
};

export type SerializedRoleWithPermissions = SerializedRole & {
  permissions: {
    permission: Omit<Permission, "createdAt" | "updatedAt">;
  }[];
};

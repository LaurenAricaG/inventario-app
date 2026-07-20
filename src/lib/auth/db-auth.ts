import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { createHash } from "crypto";

export async function verifyUserCredentials(usernameOrEmail: string, passwordField: string) {
  if (!usernameOrEmail || !passwordField) {
    return null;
  }

  try {
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: usernameOrEmail },
          { username: usernameOrEmail },
        ],
        deletedAt: null,
      },
      include: {
        role: {
          include: {
            permissions: {
              include: {
                permission: true,
              },
            },
          },
        },
      },
    });

    if (!user) {
      return null;
    }

    const passwordsMatch = await bcrypt.compare(passwordField, user.passwordHash);

    if (!passwordsMatch) {
      return null;
    }

    const permissions = user.role.permissions.map(
      (rp) => rp.permission.code
    );

    const passwordVersion = createHash("sha256").update(user.passwordHash).digest("hex");

    return {
      id: user.id.toString(),
      name: user.name,
      email: user.email,
      username: user.username,
      role: user.role.name,
      permissions,
      passwordVersion,
    };
  } catch (error) {
    console.error("Error in verifyUserCredentials:", error);
    return null;
  }
}

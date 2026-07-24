"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { logActivity } from "@/lib/audit";
import bcrypt from "bcryptjs";
import { userSchema, UserInput } from "./schema";

export async function createUserAction(data: UserInput) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return {
        success: false,
        message: "No autenticado. Por favor inicia sesión.",
      };
    }
    const permissions = session.user.permissions ?? [];

    if (!permissions.includes("users:create")) {
      return {
        success: false,
        message: "No autorizado. No tienes permiso para crear usuarios.",
      };
    }

    const validation = userSchema.safeParse(data);
    if (!validation.success) {
      const errorMsg =
        validation.error.issues[0]?.message || "Datos del usuario inválidos.";
      return { success: false, message: errorMsg };
    }

    const validatedData = validation.data;

    // La contraseña es obligatoria al crear un nuevo usuario
    if (!validatedData.password || validatedData.password.trim() === "") {
      return {
        success: false,
        message: "La contraseña es obligatoria para nuevos usuarios.",
      };
    }

    // Verificar si el correo o usuario ya existe
    const existing = await prisma.user.findFirst({
      where: {
        OR: [
          { email: { equals: validatedData.email, mode: "insensitive" } },
          { username: { equals: validatedData.username, mode: "insensitive" } },
        ],
      },
    });

    if (existing) {
      if (existing.deletedAt) {
        // Encriptar la contraseña para el usuario reactivado
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(validatedData.password, salt);

        const restored = await prisma.user.update({
          where: { id: existing.id },
          data: {
            name: validatedData.name,
            username: validatedData.username.toLowerCase(),
            email: validatedData.email.toLowerCase(),
            passwordHash,
            roleId: validatedData.roleId,
            deletedAt: null,
            deletedById: null,
            updatedById: Number(session.user.id),
          },
          include: {
            role: true,
          },
        });

        await logActivity({
          userId: Number(session.user.id),
          action: "UPDATE",
          entity: "User",
          entityId: restored.id,
          details: {
            nombre: restored.name,
            usuario: restored.username,
            restored: true,
          },
        });

        revalidatePath("/admin/usuarios");
        return {
          success: true,
          message: "El usuario ya existía (suspendido) y ha sido reactivado con éxito.",
        };
      }

      if (existing.email.toLowerCase() === validatedData.email.toLowerCase()) {
        return {
          success: false,
          message: "El correo electrónico ya está registrado.",
        };
      }
      return {
        success: false,
        message: "El nombre de usuario ya está registrado.",
      };
    }

    // Encriptar la contraseña
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(validatedData.password, salt);

    const user = await prisma.user.create({
      data: {
        name: validatedData.name,
        username: validatedData.username.toLowerCase(),
        email: validatedData.email.toLowerCase(),
        passwordHash,
        roleId: validatedData.roleId,
        createdById: Number(session.user.id),
      },
      include: {
        role: true,
      },
    });

    await logActivity({
      userId: Number(session.user.id),
      action: "CREATE",
      entity: "User",
      entityId: user.id,
      details: {
        nombre: user.name,
        usuario: user.username,
        email: user.email,
        rol: user.role.name,
      },
    });

    revalidatePath("/admin/usuarios");
    return { success: true, message: "Usuario creado con éxito." };
  } catch (error: any) {
    console.error("Error al crear usuario:", error);
    return {
      success: false,
      message: `Error interno al crear usuario: ${error.message || error}`,
    };
  }
}

export async function updateUserAction(id: number, data: UserInput) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return {
        success: false,
        message: "No autenticado. Por favor inicia sesión.",
      };
    }
    const permissions = session.user.permissions ?? [];

    if (!permissions.includes("users:update")) {
      return {
        success: false,
        message: "No autorizado. No tienes permiso para editar usuarios.",
      };
    }

    const validation = userSchema.safeParse(data);
    if (!validation.success) {
      const errorMsg =
        validation.error.issues[0]?.message || "Datos del usuario inválidos.";
      return { success: false, message: errorMsg };
    }

    const validatedData = validation.data;

    // Verificar si el correo o usuario ya existe para otro usuario
    const duplicate = await prisma.user.findFirst({
      where: {
        id: { not: id },
        OR: [
          { email: { equals: validatedData.email, mode: "insensitive" } },
          { username: { equals: validatedData.username, mode: "insensitive" } },
        ],
      },
    });

    if (duplicate) {
      if (duplicate.email.toLowerCase() === validatedData.email.toLowerCase()) {
        return {
          success: false,
          message: "El correo electrónico ya está en uso por otro usuario.",
        };
      }
      return {
        success: false,
        message: "El nombre de usuario ya está en uso por otro usuario.",
      };
    }

    const existingUser = await prisma.user.findUnique({
      where: { id },
      include: { role: true },
    });

    if (!existingUser) {
      return {
        success: false,
        message: "El usuario solicitado no existe.",
      };
    }

    const updateData: any = {
      name: validatedData.name,
      username: validatedData.username.toLowerCase(),
      email: validatedData.email.toLowerCase(),
      roleId: validatedData.roleId,
      updatedById: Number(session.user.id),
    };

    // Si se proporciona contraseña, se encripta y se actualiza
    if (validatedData.password && validatedData.password.trim() !== "") {
      const salt = await bcrypt.genSalt(10);
      updateData.passwordHash = await bcrypt.hash(validatedData.password, salt);
    }

    const updated = await prisma.user.update({
      where: { id },
      data: updateData,
      include: { role: true },
    });

    await logActivity({
      userId: Number(session.user.id),
      action: "UPDATE",
      entity: "User",
      entityId: id,
      details: {
        antes: {
          nombre: existingUser.name,
          usuario: existingUser.username,
          email: existingUser.email,
          rol: existingUser.role.name,
        },
        despues: {
          nombre: updated.name,
          usuario: updated.username,
          email: updated.email,
          rol: updated.role.name,
          contraseñaModificada: !!updateData.passwordHash,
        },
      },
    });

    revalidatePath("/admin/usuarios");
    return { success: true, message: "Usuario actualizado con éxito." };
  } catch (error: any) {
    console.error("Error al actualizar usuario:", error);
    return {
      success: false,
      message: `Error interno al actualizar usuario: ${error.message || error}`,
    };
  }
}

export async function deleteUserAction(id: number) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return {
        success: false,
        message: "No autenticado. Por favor inicia sesión.",
      };
    }
    const permissions = session.user.permissions ?? [];

    if (!permissions.includes("users:delete")) {
      return {
        success: false,
        message: "No autorizado. No tienes permiso para suspender usuarios.",
      };
    }

    // Impedir auto-suspensión
    if (id === Number(session.user.id)) {
      return {
        success: false,
        message: "No puedes suspender tu propia cuenta de usuario.",
      };
    }

    // Borrado lógico
    const deleted = await prisma.user.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        deletedById: Number(session.user.id),
      },
    });

    await logActivity({
      userId: Number(session.user.id),
      action: "DELETE",
      entity: "User",
      entityId: id,
      details: {
        nombre: deleted.name,
        usuario: deleted.username,
      },
    });

    revalidatePath("/admin/usuarios");
    return { success: true, message: "Usuario suspendido con éxito." };
  } catch (error: any) {
    console.error("Error al suspender usuario:", error);
    return {
      success: false,
      message: `Error interno al suspender usuario: ${error.message || error}`,
    };
  }
}

export async function reactivateUserAction(id: number) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return {
        success: false,
        message: "No autenticado. Por favor inicia sesión.",
      };
    }
    const permissions = session.user.permissions ?? [];

    if (!permissions.includes("users:restore")) {
      return {
        success: false,
        message: "No autorizado. No tienes permiso para reactivar usuarios.",
      };
    }

    // Restaurar usuario
    const restored = await prisma.user.update({
      where: { id },
      data: {
        deletedAt: null,
        deletedById: null,
        updatedById: Number(session.user.id),
      },
    });

    await logActivity({
      userId: Number(session.user.id),
      action: "UPDATE",
      entity: "User",
      entityId: id,
      details: {
        nombre: restored.name,
        usuario: restored.username,
        restored: true,
      },
    });

    revalidatePath("/admin/usuarios");
    return { success: true, message: "Usuario reactivado con éxito." };
  } catch (error: any) {
    console.error("Error al reactivar usuario:", error);
    return {
      success: false,
      message: `Error interno al reactivar usuario: ${error.message || error}`,
    };
  }
}

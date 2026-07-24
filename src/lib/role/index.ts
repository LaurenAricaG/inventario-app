"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { logActivity } from "@/lib/audit";
import { roleSchema } from "./schema";

export async function createRoleAction(formData: {
  name: string;
  description?: string;
  permissionIds: number[];
}) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return {
        success: false,
        message: "No autenticado. Por favor inicia sesión.",
      };
    }
    const permissions = session.user.permissions ?? [];
    if (!permissions.includes("roles:create")) {
      return {
        success: false,
        message: "No autorizado. No tienes permiso para crear roles.",
      };
    }

    // Validar esquema
    const validation = roleSchema.safeParse(formData);
    if (!validation.success) {
      const errorMsg =
        validation.error.issues[0]?.message || "Datos del rol inválidos.";
      return { success: false, message: errorMsg };
    }

    const validatedData = validation.data;

    // Verificar nombre duplicado
    const existing = await prisma.role.findFirst({
      where: {
        name: { equals: validatedData.name, mode: "insensitive" },
        deletedAt: null,
      },
    });

    if (existing) {
      return {
        success: false,
        message: `Ya existe un rol activo con el nombre "${validatedData.name}".`,
      };
    }

    // Transacción para crear rol y asignar permisos
    const newRole = await prisma.$transaction(async (tx) => {
      const role = await tx.role.create({
        data: {
          name: validatedData.name.trim(),
          description: validatedData.description?.trim() || null,
          createdById: Number(session.user.id),
        },
      });

      // Crear relaciones de permisos
      if (validatedData.permissionIds.length > 0) {
        await tx.rolePermission.createMany({
          data: validatedData.permissionIds.map((pId) => ({
            roleId: role.id,
            permissionId: pId,
          })),
        });
      }

      return role;
    });

    // Registrar actividad en bitácora
    await logActivity({
      userId: Number(session.user.id),
      action: "CREATE",
      entity: "Role",
      entityId: newRole.id,
      details: {
        nombre: newRole.name,
        descripcion: newRole.description,
        permisosAsignados: validatedData.permissionIds.length,
      },
    });

    revalidatePath("/admin/roles");
    revalidatePath("/admin/usuarios"); // Por si se listan roles ahí
    return { success: true, message: "Rol creado con éxito." };
  } catch (error: any) {
    console.error("Error al crear rol:", error);
    return {
      success: false,
      message: `Error interno al crear rol: ${error.message || error}`,
    };
  }
}

export async function updateRoleAction(
  id: number,
  formData: {
    name: string;
    description?: string;
    permissionIds: number[];
  }
) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return {
        success: false,
        message: "No autenticado. Por favor inicia sesión.",
      };
    }
    const permissions = session.user.permissions ?? [];
    if (!permissions.includes("roles:update")) {
      return {
        success: false,
        message: "No autorizado. No tienes permiso para editar roles.",
      };
    }

    // Validar esquema
    const validation = roleSchema.safeParse(formData);
    if (!validation.success) {
      const errorMsg =
        validation.error.issues[0]?.message || "Datos del rol inválidos.";
      return { success: false, message: errorMsg };
    }

    const validatedData = validation.data;

    // Buscar rol actual
    const existingRole = await prisma.role.findFirst({
      where: { id, deletedAt: null },
      include: {
        permissions: {
          include: { permission: true },
        },
      },
    });

    if (!existingRole) {
      return { success: false, message: "El rol no existe o fue eliminado." };
    }

    // Restricción para roles core del sistema (ADMIN no se puede renombrar)
    const isCoreRole = existingRole.name.toUpperCase() === "ADMIN";
    if (isCoreRole && existingRole.name.toUpperCase() !== validatedData.name.toUpperCase()) {
      return {
        success: false,
        message: `No se puede renombrar el rol base del sistema "${existingRole.name}".`,
      };
    }

    // Verificar nombre duplicado en otros roles
    const duplicate = await prisma.role.findFirst({
      where: {
        id: { not: id },
        name: { equals: validatedData.name, mode: "insensitive" },
        deletedAt: null,
      },
    });

    if (duplicate) {
      return {
        success: false,
        message: `Ya existe otro rol activo con el nombre "${validatedData.name}".`,
      };
    }

    // Transacción para actualizar rol y sincronizar permisos
    const updated = await prisma.$transaction(async (tx) => {
      const role = await tx.role.update({
        where: { id },
        data: {
          name: validatedData.name.trim(),
          description: validatedData.description?.trim() || null,
          updatedById: Number(session.user.id),
        },
        include: {
          permissions: {
            include: { permission: true },
          },
        },
      });

      // Eliminar relaciones previas
      await tx.rolePermission.deleteMany({
        where: { roleId: id },
      });

      // Crear relaciones nuevas
      if (validatedData.permissionIds.length > 0) {
        await tx.rolePermission.createMany({
          data: validatedData.permissionIds.map((pId) => ({
            roleId: id,
            permissionId: pId,
          })),
        });
      }

      return role;
    });

    // Obtener nombres de los permisos anteriores y nuevos para auditoría
    const oldCodes = existingRole.permissions.map((p) => p.permission.code);
    const newPermissions = await prisma.permission.findMany({
      where: { id: { in: validatedData.permissionIds } },
    });
    const newCodes = newPermissions.map((p) => p.code);

    // Registrar actividad en bitácora
    await logActivity({
      userId: Number(session.user.id),
      action: "UPDATE",
      entity: "Role",
      entityId: id,
      details: {
        antes: {
          nombre: existingRole.name,
          descripcion: existingRole.description,
          permisos: oldCodes,
        },
        despues: {
          nombre: updated.name,
          descripcion: updated.description,
          permisos: newCodes,
        },
      },
    });

    revalidatePath("/admin/roles");
    revalidatePath("/admin/usuarios");
    return { success: true, message: "Rol actualizado con éxito." };
  } catch (error: any) {
    console.error("Error al actualizar rol:", error);
    return {
      success: false,
      message: `Error interno al actualizar rol: ${error.message || error}`,
    };
  }
}

export async function deleteRoleAction(id: number) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return {
        success: false,
        message: "No autenticado. Por favor inicia sesión.",
      };
    }
    const permissions = session.user.permissions ?? [];
    if (!permissions.includes("roles:delete")) {
      return {
        success: false,
        message: "No autorizado. No tienes permiso para eliminar roles.",
      };
    }

    // Buscar rol
    const role = await prisma.role.findFirst({
      where: { id },
    });

    if (!role) {
      return { success: false, message: "El rol no existe o ya fue eliminado." };
    }

    if (role.name.toUpperCase() === "ADMIN") {
      return {
        success: false,
        message: "No se puede eliminar el rol principal del sistema ADMIN.",
      };
    }

    // Impedir eliminación si hay usuarios asociados
    const assignedUsers = await prisma.user.count({
      where: {
        roleId: id,
      },
    });

    if (assignedUsers > 0) {
      return {
        success: false,
        message: `No se puede eliminar el rol porque está asignado a ${assignedUsers} usuario(s). Primero debes cambiar el rol de estos usuarios.`,
      };
    }

    // Borrado físico
    const deleted = await prisma.role.delete({
      where: { id },
    });

    // Registrar en bitácora
    await logActivity({
      userId: Number(session.user.id),
      action: "DELETE",
      entity: "Role",
      entityId: id,
      details: {
        nombre: deleted.name,
        descripcion: deleted.description,
      },
    });

    revalidatePath("/admin/roles");
    revalidatePath("/admin/usuarios");
    return { success: true, message: "Rol eliminado con éxito." };
  } catch (error: any) {
    console.error("Error al eliminar rol:", error);
    return {
      success: false,
      message: `Error interno al eliminar rol: ${error.message || error}`,
    };
  }
}

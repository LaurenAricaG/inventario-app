"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { logActivity } from "@/lib/audit";
import { genderSchema } from "./schema";

/**
 * Crea un nuevo género (GenderSegment) en el sistema.
 * Valida el permiso genders:create.
 */
export async function createGenderAction(name: string) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return {
        success: false,
        message: "No autenticado. Por favor inicia sesión.",
      };
    }
    const permissions = session.user.permissions ?? [];

    if (!permissions.includes("genders:create")) {
      return {
        success: false,
        message: "No autorizado. No tienes permiso para crear géneros.",
      };
    }

    const validation = genderSchema.safeParse({ name });
    if (!validation.success) {
      const errorMsg =
        validation.error.issues[0]?.message || "Nombre inválido.";
      return { success: false, message: errorMsg };
    }

    const trimmedName = validation.data.name;

    // Verificar si ya existe (incluyendo borrados lógicos para reactivarlos o evitar duplicados)
    const existing = await prisma.genderSegment.findFirst({
      where: {
        name: { equals: trimmedName, mode: "insensitive" },
      },
    });

    if (existing) {
      if (existing.deletedAt) {
        // Si estaba eliminado lógicamente, lo restauramos
        const restored = await prisma.genderSegment.update({
          where: { id: existing.id },
          data: {
            deletedAt: null,
            deletedById: null,
            updatedById: Number(session.user.id),
          },
        });

        await logActivity({
          userId: Number(session.user.id),
          action: "UPDATE",
          entity: "GenderSegment",
          entityId: restored.id,
          details: { name: restored.name, restored: true },
        });

        revalidatePath("/admin/generos");
        return {
          success: true,
          message: "El género ya existía y ha sido restaurado.",
        };
      }
      return { success: false, message: "Ya existe un género con ese nombre." };
    }

    const gender = await prisma.genderSegment.create({
      data: {
        name: trimmedName,
        createdById: Number(session.user.id),
      },
    });

    await logActivity({
      userId: Number(session.user.id),
      action: "CREATE",
      entity: "GenderSegment",
      entityId: gender.id,
      details: { name: trimmedName },
    });

    revalidatePath("/admin/generos");
    return { success: true, message: "Género creado con éxito." };
  } catch (error: any) {
    console.error("Error al crear género:", error);
    if (error.code === "P2002") {
      return { success: false, message: "Ya existe un género con ese nombre." };
    }
    return {
      success: false,
      message: "Error interno del servidor al crear el género.",
    };
  }
}

/**
 * Actualiza un género (GenderSegment) existente.
 * Valida el permiso genders:update.
 */
export async function updateGenderAction(id: number, name: string) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return {
        success: false,
        message: "No autenticado. Por favor inicia sesión.",
      };
    }
    const permissions = session.user.permissions ?? [];

    if (!permissions.includes("genders:update")) {
      return {
        success: false,
        message: "No autorizado. No tienes permiso para editar géneros.",
      };
    }
    const validation = genderSchema.safeParse({ name });
    if (!validation.success) {
      const errorMsg =
        validation.error.issues[0]?.message || "Nombre inválido.";
      return { success: false, message: errorMsg };
    }

    const trimmedName = validation.data.name;

    // Verificar si existe otro con el mismo nombre
    const duplicate = await prisma.genderSegment.findFirst({
      where: {
        id: { not: id },
        name: { equals: trimmedName, mode: "insensitive" },
        deletedAt: null,
      },
    });

    if (duplicate) {
      return {
        success: false,
        message: "Ya existe otro género con ese nombre.",
      };
    }

    const existingGender = await prisma.genderSegment.findUnique({
      where: { id },
      select: { name: true },
    });

    await prisma.genderSegment.update({
      where: { id },
      data: {
        name: trimmedName,
        updatedById: Number(session.user.id),
      },
    });

    await logActivity({
      userId: Number(session.user.id),
      action: "UPDATE",
      entity: "GenderSegment",
      entityId: id,
      details: {
        antes: { name: existingGender?.name },
        despues: { name: trimmedName },
      },
    });

    revalidatePath("/admin/generos");
    return { success: true, message: "Género actualizado con éxito." };
  } catch (error: any) {
    console.error("Error al actualizar género:", error);
    if (error.code === "P2002") {
      return {
        success: false,
        message: "Ya existe otro género con ese nombre.",
      };
    }
    return {
      success: false,
      message: "Error interno del servidor al actualizar el género.",
    };
  }
}

/**
 * Realiza la eliminación lógica de un género (GenderSegment).
 * Valida el permiso genders:delete.
 */
export async function deleteGenderAction(id: number) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return {
        success: false,
        message: "No autenticado. Por favor inicia sesión.",
      };
    }
    const permissions = session.user.permissions ?? [];

    if (!permissions.includes("genders:delete")) {
      return {
        success: false,
        message: "No autorizado. No tienes permiso para eliminar géneros.",
      };
    }

    // Verificar si el género está siendo usado por algún producto activo
    const productCount = await prisma.product.count({
      where: {
        genderSegmentId: id,
        deletedAt: null,
      },
    });

    if (productCount > 0) {
      return {
        success: false,
        message: `No se puede eliminar. Este género está asociado a ${productCount} producto(s) activo(s).`,
      };
    }

    // Borrado lógico
    const deleted = await prisma.genderSegment.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        deletedById: Number(session.user.id),
      },
    });

    await logActivity({
      userId: Number(session.user.id),
      action: "DELETE",
      entity: "GenderSegment",
      entityId: id,
      details: { name: deleted.name },
    });

    revalidatePath("/admin/generos");
    return { success: true, message: "Género eliminado con éxito." };
  } catch (error: any) {
    console.error("Error al eliminar género:", error);
    return {
      success: false,
      message: "Error interno del servidor al eliminar el género.",
    };
  }
}

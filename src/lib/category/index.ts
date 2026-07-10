"use server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { logActivity } from "@/lib/audit";
import { categorySchema } from "./schema";

export async function createCategoryAction(name: string) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return {
        success: false,
        message: "No autenticado. Por favor inicia sesión.",
      };
    }
    const permissions = session.user.permissions ?? [];

    if (!permissions.includes("categories:create")) {
      return {
        success: false,
        message: "No autorizado. No tienes permiso para crear categorías.",
      };
    }

    const validation = categorySchema.safeParse({ name });
    if (!validation.success) {
      const errorMsg =
        validation.error.issues[0]?.message || "Nombre inválido.";
      return { success: false, message: errorMsg };
    }

    const trimmedName = validation.data.name;

    // Verificar si ya existe en la base de datos (incluyendo eliminados lógicos para reactivarlos)
    const existing = await prisma.category.findFirst({
      where: {
        name: { equals: trimmedName, mode: "insensitive" },
      },
    });

    if (existing) {
      if (existing.deletedAt) {
        // Si estaba eliminado lógicamente, lo restauramos
        const restored = await prisma.category.update({
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
          entity: "Category",
          entityId: restored.id,
          details: { name: restored.name, restored: true },
        });

        revalidatePath("/admin/categorias");
        return {
          success: true,
          message: "La categoría ya existía y ha sido restaurada con éxito.",
        };
      }
      return {
        success: false,
        message: "Ya existe una categoría con ese nombre.",
      };
    }

    const category = await prisma.category.create({
      data: {
        name: trimmedName,
        createdById: Number(session.user.id),
      },
    });

    await logActivity({
      userId: Number(session.user.id),
      action: "CREATE",
      entity: "Category",
      entityId: category.id,
      details: { nombre: trimmedName },
    });

    revalidatePath("/admin/categorias");
    return { success: true, message: "Categoría creada con éxito." };
  } catch (error: any) {
    console.error("Error al crear categoría:", error);
    if (error.code === "P2002") {
      return {
        success: false,
        message: "Ya existe una categoría con ese nombre.",
      };
    }
    return {
      success: false,
      message: `Error interno al crear la categoría: ${error.message || error}`,
    };
  }
}

export async function updateCategoryAction(id: number, name: string) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return {
        success: false,
        message: "No autenticado. Por favor inicia sesión.",
      };
    }
    const permissions = session.user.permissions ?? [];

    if (!permissions.includes("categories:update")) {
      return {
        success: false,
        message: "No autorizado. No tienes permiso para editar categorías.",
      };
    }

    const validation = categorySchema.safeParse({ name });
    if (!validation.success) {
      const errorMsg =
        validation.error.issues[0]?.message || "Nombre inválido.";
      return { success: false, message: errorMsg };
    }

    const trimmedName = validation.data.name;

    // Verificar si existe otra con el mismo nombre
    const duplicate = await prisma.category.findFirst({
      where: {
        id: { not: id },
        name: { equals: trimmedName, mode: "insensitive" },
        deletedAt: null,
      },
    });

    if (duplicate) {
      return {
        success: false,
        message: "Ya existe otra categoría con ese nombre.",
      };
    }

    const existingCategory = await prisma.category.findUnique({
      where: { id },
      select: { name: true },
    });

    const updated = await prisma.category.update({
      where: { id },
      data: {
        name: trimmedName,
        updatedById: Number(session.user.id),
      },
    });

    await logActivity({
      userId: Number(session.user.id),
      action: "UPDATE",
      entity: "Category",
      entityId: id,
      details: {
        antes: { nombre: existingCategory?.name },
        despues: { nombre: trimmedName },
      },
    });

    revalidatePath("/admin/categorias");
    return { success: true, message: "Categoría actualizada con éxito." };
  } catch (error: any) {
    console.error("Error al actualizar categoría:", error);
    if (error.code === "P2002") {
      return {
        success: false,
        message: "Ya existe otra categoría con ese nombre.",
      };
    }
    return {
      success: false,
      message: `Error interno al actualizar la categoría: ${error.message || error}`,
    };
  }
}

export async function deleteCategoryAction(id: number) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return {
        success: false,
        message: "No autenticado. Por favor inicia sesión.",
      };
    }
    const permissions = session.user.permissions ?? [];

    if (!permissions.includes("categories:delete")) {
      return {
        success: false,
        message: "No autorizado. No tienes permiso para eliminar categorías.",
      };
    }

    // Verificar si la categoría está siendo usada por algún producto activo
    const productCount = await prisma.product.count({
      where: {
        categoryId: id,
        deletedAt: null,
      },
    });

    if (productCount > 0) {
      return {
        success: false,
        message: `No se puede eliminar. Esta categoría está asociada a ${productCount} producto(s) activo(s).`,
      };
    }

    // Borrado lógico
    const deleted = await prisma.category.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        deletedById: Number(session.user.id),
      },
    });

    await logActivity({
      userId: Number(session.user.id),
      action: "DELETE",
      entity: "Category",
      entityId: id,
      details: { name: deleted.name },
    });

    revalidatePath("/admin/categorias");
    return { success: true, message: "Categoría eliminada con éxito." };
  } catch (error: any) {
    console.error("Error al eliminar categoría:", error);
    return {
      success: false,
      message: `Error interno al eliminar la categoría: ${error?.message || error}`,
    };
  }
}

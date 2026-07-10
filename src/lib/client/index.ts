"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { logActivity } from "@/lib/audit";
import { clientSchema, ClientInput } from "./schema";

export async function createClientAction(data: ClientInput) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return {
        success: false,
        message: "No autenticado. Por favor inicia sesión.",
      };
    }
    const permissions = session.user.permissions ?? [];

    if (!permissions.includes("clients:create")) {
      return {
        success: false,
        message: "No autorizado. No tienes permiso para registrar clientes.",
      };
    }

    const validation = clientSchema.safeParse(data);
    if (!validation.success) {
      const errorMsg =
        validation.error.issues[0]?.message || "Datos del cliente inválidos.";
      return { success: false, message: errorMsg };
    }

    const validatedData = validation.data;
    const trimmedName = validatedData.name;

    // Verificar si ya existe en la base de datos (activo o inactivo)
    const existing = await prisma.client.findFirst({
      where: {
        name: { equals: trimmedName, mode: "insensitive" },
      },
    });

    if (existing) {
      if (existing.deletedAt) {
        // Si estaba eliminado lógicamente, lo restauramos
        const restored = await prisma.client.update({
          where: { id: existing.id },
          data: {
            phone: validatedData.phone || null,
            address: validatedData.address || null,
            notes: validatedData.notes || null,
            deletedAt: null,
            deletedById: null,
            updatedById: Number(session.user.id),
          },
        });

        await logActivity({
          userId: Number(session.user.id),
          action: "UPDATE",
          entity: "Client",
          entityId: restored.id,
          details: { name: restored.name, restored: true },
        });

        revalidatePath("/admin/clientes");
        return {
          success: true,
          message: "El cliente ya existía (desactivado) y ha sido restaurado con éxito.",
        };
      }
      return {
        success: false,
        message: "Ya existe un cliente activo con ese nombre.",
      };
    }

    const client = await prisma.client.create({
      data: {
        name: trimmedName,
        phone: validatedData.phone || null,
        address: validatedData.address || null,
        notes: validatedData.notes || null,
        createdById: Number(session.user.id),
      },
    });

    await logActivity({
      userId: Number(session.user.id),
      action: "CREATE",
      entity: "Client",
      entityId: client.id,
      details: {
        nombre: client.name,
        telefono: client.phone,
        direccion: client.address,
        notas: client.notes,
      },
    });

    revalidatePath("/admin/clientes");
    return { success: true, message: "Cliente registrado con éxito.", data: client };
  } catch (error: any) {
    console.error("Error al registrar cliente:", error);
    return {
      success: false,
      message: `Error interno al registrar cliente: ${error.message || error}`,
    };
  }
}

export async function updateClientAction(id: number, data: ClientInput) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return {
        success: false,
        message: "No autenticado. Por favor inicia sesión.",
      };
    }
    const permissions = session.user.permissions ?? [];

    if (!permissions.includes("clients:update")) {
      return {
        success: false,
        message: "No autorizado. No tienes permiso para editar clientes.",
      };
    }

    const validation = clientSchema.safeParse(data);
    if (!validation.success) {
      const errorMsg =
        validation.error.issues[0]?.message || "Datos del cliente inválidos.";
      return { success: false, message: errorMsg };
    }

    const validatedData = validation.data;
    const trimmedName = validatedData.name;

    // Verificar si otro cliente activo tiene el mismo nombre
    const duplicate = await prisma.client.findFirst({
      where: {
        id: { not: id },
        name: { equals: trimmedName, mode: "insensitive" },
        deletedAt: null,
      },
    });

    if (duplicate) {
      return {
        success: false,
        message: "Ya existe otro cliente activo con ese nombre.",
      };
    }

    const existingClient = await prisma.client.findUnique({
      where: { id },
    });

    if (!existingClient) {
      return {
        success: false,
        message: "El cliente solicitado no existe.",
      };
    }

    const updated = await prisma.client.update({
      where: { id },
      data: {
        name: trimmedName,
        phone: validatedData.phone || null,
        address: validatedData.address || null,
        notes: validatedData.notes || null,
        updatedById: Number(session.user.id),
      },
    });

    await logActivity({
      userId: Number(session.user.id),
      action: "UPDATE",
      entity: "Client",
      entityId: id,
      details: {
        antes: {
          nombre: existingClient.name,
          telefono: existingClient.phone,
          direccion: existingClient.address,
          notas: existingClient.notes,
        },
        despues: {
          nombre: updated.name,
          telefono: updated.phone,
          direccion: updated.address,
          notas: updated.notes,
        },
      },
    });

    revalidatePath("/admin/clientes");
    return { success: true, message: "Cliente actualizado con éxito." };
  } catch (error: any) {
    console.error("Error al actualizar cliente:", error);
    return {
      success: false,
      message: `Error interno al actualizar cliente: ${error.message || error}`,
    };
  }
}

export async function deleteClientAction(id: number) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return {
        success: false,
        message: "No autenticado. Por favor inicia sesión.",
      };
    }
    const permissions = session.user.permissions ?? [];

    if (!permissions.includes("clients:delete")) {
      return {
        success: false,
        message: "No autorizado. No tienes permiso para eliminar clientes.",
      };
    }

    // Borrado lógico
    const deleted = await prisma.client.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        deletedById: Number(session.user.id),
      },
    });

    await logActivity({
      userId: Number(session.user.id),
      action: "DELETE",
      entity: "Client",
      entityId: id,
      details: { name: deleted.name },
    });

    revalidatePath("/admin/clientes");
    return { success: true, message: "Cliente eliminado con éxito." };
  } catch (error: any) {
    console.error("Error al eliminar cliente:", error);
    return {
      success: false,
      message: `Error interno al eliminar cliente: ${error.message || error}`,
    };
  }
}

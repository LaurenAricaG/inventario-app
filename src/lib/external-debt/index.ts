"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { logActivity } from "@/lib/audit";
import { externalDebtSchema, ExternalDebtInput } from "./schema";

export async function createExternalDebtAction(data: ExternalDebtInput) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return {
        success: false,
        message: "No autenticado. Por favor inicia sesión.",
      };
    }
    const permissions = session.user.permissions ?? [];

    if (!permissions.includes("debts:create")) {
      return {
        success: false,
        message: "No autorizado. No tienes permiso para registrar deudas externas.",
      };
    }

    const validation = externalDebtSchema.safeParse(data);
    if (!validation.success) {
      const errorMsg =
        validation.error.issues[0]?.message || "Datos de deuda inválidos.";
      return { success: false, message: errorMsg };
    }

    const { amount, reason, notes, clientId } = validation.data;

    // Verificar que el cliente existe
    const client = await prisma.client.findFirst({
      where: { id: clientId, deletedAt: null },
    });

    if (!client) {
      return {
        success: false,
        message: "El cliente seleccionado no existe o fue eliminado.",
      };
    }

    // Crear la deuda externa
    const debt = await prisma.externalDebt.create({
      data: {
        clientId,
        amount,
        reason,
        notes: notes || null,
        createdById: Number(session.user.id),
      },
    });

    // Registrar en la bitácora de auditoría
    await logActivity({
      userId: Number(session.user.id),
      action: "CREATE",
      entity: "ExternalDebt",
      entityId: debt.id,
      details: {
        cliente: `${client.name} (ID: ${client.id})`,
        monto: amount,
        motivo: reason,
        notas: notes,
      },
    });

    revalidatePath("/admin/movimientos");
    revalidatePath(`/admin/movimientos/${clientId}`);
    revalidatePath("/admin/deudas");

    return {
      success: true,
      message: "Deuda externa registrada con éxito.",
    };
  } catch (error: any) {
    console.error("Error al registrar deuda externa:", error);
    return {
      success: false,
      message: `Error interno al registrar deuda externa: ${error.message || error}`,
    };
  }
}

export async function deleteExternalDebtAction(id: number) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return {
        success: false,
        message: "No autenticado. Por favor inicia sesión.",
      };
    }

    const permissions = session.user.permissions ?? [];

    if (!permissions.includes("debts:create")) {
      return {
        success: false,
        message: "No autorizado. No tienes permiso para anular deudas externas.",
      };
    }

    const existingDebt = await prisma.externalDebt.findUnique({
      where: { id },
      include: { client: true },
    });

    if (!existingDebt) {
      return {
        success: false,
        message: "La deuda externa solicitada no existe.",
      };
    }

    // Verificar si han pasado más de 48 horas desde createdAt
    const diffInMs = Date.now() - existingDebt.createdAt.getTime();
    const diffInHours = diffInMs / (1000 * 60 * 60);

    if (diffInHours > 48) {
      return {
        success: false,
        message: "No se puede eliminar, deuda procesada",
      };
    }

    // Eliminar físicamente la deuda externa
    await prisma.externalDebt.delete({
      where: { id },
    });

    // Registrar en la bitácora de auditoría
    await logActivity({
      userId: Number(session.user.id),
      action: "DELETE",
      entity: "ExternalDebt",
      entityId: id,
      details: {
        cliente: `${existingDebt.client.name} (ID: ${existingDebt.clientId})`,
        monto: existingDebt.amount,
        motivo: existingDebt.reason,
        notas: existingDebt.notes,
      },
    });

    revalidatePath("/admin/movimientos");
    revalidatePath(`/admin/movimientos/${existingDebt.clientId}`);
    revalidatePath("/admin/deudas");

    return {
      success: true,
      message: "Deuda externa anulada con éxito.",
    };
  } catch (error: any) {
    console.error("Error al anular deuda externa:", error);
    return {
      success: false,
      message: `Error interno al anular deuda externa: ${error.message || error}`,
    };
  }
}

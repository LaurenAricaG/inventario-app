"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { logActivity } from "@/lib/audit";
import { paymentSchema, PaymentInput } from "./schema";

export async function createPaymentAction(data: PaymentInput) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return {
        success: false,
        message: "No autenticado. Por favor inicia sesión.",
      };
    }
    const permissions = session.user.permissions ?? [];

    if (!permissions.includes("payments:create")) {
      return {
        success: false,
        message: "No autorizado. No tienes permiso para registrar pagos.",
      };
    }

    const validation = paymentSchema.safeParse(data);
    if (!validation.success) {
      const errorMsg =
        validation.error.issues[0]?.message || "Datos del pago inválidos.";
      return { success: false, message: errorMsg };
    }

    const { amount, method, note, campaignId, clientId } = validation.data;

    // Verificar que el cliente existe y no esté eliminado
    const client = await prisma.client.findFirst({
      where: { id: clientId, deletedAt: null },
    });

    if (!client) {
      return {
        success: false,
        message: "El cliente seleccionado no existe o fue eliminado.",
      };
    }

    // Si se especificó una campaña, verificar que exista
    if (campaignId) {
      const campaign = await prisma.campaign.findUnique({
        where: { id: campaignId },
      });
      if (!campaign) {
        return {
          success: false,
          message: "La campaña seleccionada no existe.",
        };
      }
    }

    // Crear el pago
    const payment = await prisma.payment.create({
      data: {
        clientId,
        campaignId: campaignId || null,
        amount,
        method,
        note: note || null,
        createdById: Number(session.user.id),
      },
    });

    // Registrar en la bitácora de auditoría
    await logActivity({
      userId: Number(session.user.id),
      action: "CREATE",
      entity: "Payment",
      entityId: payment.id,
      details: {
        cliente: `${client.name} (ID: ${client.id})`,
        monto: amount,
        metodo: method,
        nota: note,
        campaniaId: campaignId,
      },
    });

    revalidatePath("/admin/movimientos");
    revalidatePath(`/admin/movimientos/${clientId}`);
    revalidatePath("/admin/pagos");
    
    return {
      success: true,
      message: "Pago registrado con éxito.",
    };
  } catch (error: any) {
    console.error("Error al registrar pago:", error);
    return {
      success: false,
      message: `Error interno al registrar pago: ${error.message || error}`,
    };
  }
}

export async function deletePaymentAction(id: number) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return {
        success: false,
        message: "No autenticado. Por favor inicia sesión.",
      };
    }

    const permissions = session.user.permissions ?? [];

    if (!permissions.includes("payments:create")) {
      return {
        success: false,
        message: "No autorizado. No tienes permiso para anular pagos.",
      };
    }

    const existingPayment = await prisma.payment.findUnique({
      where: { id },
      include: { client: true },
    });

    if (!existingPayment) {
      return {
        success: false,
        message: "El pago solicitado no existe.",
      };
    }

    // Verificar si han pasado más de 48 horas desde paidAt
    const diffInMs = Date.now() - existingPayment.paidAt.getTime();
    const diffInHours = diffInMs / (1000 * 60 * 60);

    if (diffInHours > 48) {
      return {
        success: false,
        message: "No se puede eliminar, pago procesado",
      };
    }

    // Eliminar físicamente el pago
    await prisma.payment.delete({
      where: { id },
    });

    // Registrar en la bitácora de auditoría
    await logActivity({
      userId: Number(session.user.id),
      action: "DELETE",
      entity: "Payment",
      entityId: id,
      details: {
        cliente: `${existingPayment.client.name} (ID: ${existingPayment.clientId})`,
        monto: existingPayment.amount,
        metodo: existingPayment.method,
        nota: existingPayment.note,
      },
    });

    revalidatePath("/admin/movimientos");
    revalidatePath(`/admin/movimientos/${existingPayment.clientId}`);
    revalidatePath("/admin/pagos");

    return {
      success: true,
      message: "Pago anulado con éxito.",
    };
  } catch (error: any) {
    console.error("Error al anular pago:", error);
    return {
      success: false,
      message: `Error interno al anular pago: ${error.message || error}`,
    };
  }
}

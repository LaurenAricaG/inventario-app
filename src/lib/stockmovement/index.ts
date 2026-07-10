"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { logActivity } from "@/lib/audit";
import { stockMovementSchema } from "./schema";

export async function createStockMovementAction(data: any) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return {
        success: false,
        message: "No autenticado. Por favor inicia sesión.",
      };
    }
    const permissions = session.user.permissions ?? [];

    if (!permissions.includes("inventory:adjust")) {
      return {
        success: false,
        message: "No autorizado. No tienes permiso para realizar ajustes de stock.",
      };
    }

    const validation = stockMovementSchema.safeParse(data);
    if (!validation.success) {
      const errorMsg =
        validation.error.issues[0]?.message || "Datos de movimiento inválidos.";
      return { success: false, message: errorMsg };
    }

    const { productId, quantity, type, reason, notes } = validation.data;

    const result = await prisma.$transaction(async (tx) => {
      // Obtener producto actual para validar
      const product = await tx.product.findUnique({
        where: { id: productId },
      });

      if (!product || product.deletedAt) {
        throw new Error("El producto seleccionado no existe o está inactivo.");
      }

      let newStock = product.stock;
      if (type === "INPUT") {
        newStock += quantity;
      } else {
        newStock -= quantity;
      }

      if (newStock < 0) {
        throw new Error(
          `Stock insuficiente. El stock actual de '${product.name}' es ${product.stock} unidades e intentas retirar ${quantity} unidades.`
        );
      }

      // Crear el registro de movimiento
      const movement = await tx.stockMovement.create({
        data: {
          productId,
          quantity,
          type,
          reason,
          notes: notes || null,
          createdById: Number(session.user.id),
        },
      });

      // Actualizar el stock del producto
      await tx.product.update({
        where: { id: productId },
        data: { stock: newStock },
      });

      return {
        movementId: movement.id,
        productName: product.name,
        oldStock: product.stock,
        newStock,
      };
    });

    // Registrar actividad en bitácora
    await logActivity({
      userId: Number(session.user.id),
      action: "CREATE",
      entity: "StockMovement",
      entityId: result.movementId,
      details: {
        producto: result.productName,
        cantidad: quantity,
        tipo: type === "INPUT" ? "Entrada (+)" : "Salida (-)",
        motivo: reason,
        notas: notes || "Sin observaciones",
        stockAnterior: result.oldStock,
        stockNuevo: result.newStock,
      },
    });

    revalidatePath("/admin/inventario");
    revalidatePath("/admin/productos");

    return {
      success: true,
      message: "Movimiento de stock registrado con éxito.",
    };
  } catch (error: any) {
    console.error("Error al registrar movimiento de stock:", error);
    return {
      success: false,
      message: error.message || "Error interno del servidor al procesar el ajuste de stock.",
    };
  }
}

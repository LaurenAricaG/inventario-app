"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { logActivity } from "@/lib/audit";
import { directSaleSchema, DirectSaleInput } from "./schema";

export async function createDirectSaleAction(data: DirectSaleInput) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return {
        success: false,
        message: "No autenticado. Por favor inicia sesión.",
      };
    }
    const permissions = session.user.permissions ?? [];

    if (!permissions.includes("sales:create")) {
      return {
        success: false,
        message: "No autorizado. No tienes permiso para registrar ventas.",
      };
    }

    const validation = directSaleSchema.safeParse(data);
    if (!validation.success) {
      const errorMsg =
        validation.error.issues[0]?.message || "Datos de venta inválidos.";
      return { success: false, message: errorMsg };
    }

    const { clientId, discount, notes, items } = validation.data;

    const result = await prisma.$transaction(async (tx) => {
      // 1. Validar cliente
      const client = await tx.client.findUnique({
        where: { id: clientId, deletedAt: null },
      });
      if (!client) {
        throw new Error("El cliente seleccionado no existe o está inactivo.");
      }

      // 2. Validar productos y stock
      let subtotal = 0;
      const validatedItems = [];

      for (const item of items) {
        const product = await tx.product.findUnique({
          where: { id: item.productId, deletedAt: null },
          include: { brand: true },
        });

        if (!product) {
          throw new Error(`El producto con ID ${item.productId} no existe o está inactivo.`);
        }

        if (product.stock < item.quantity) {
          throw new Error(
            `Stock insuficiente para '${product.name}'. Stock actual: ${product.stock}, solicitado: ${item.quantity}.`
          );
        }

        subtotal += item.quantity * item.unitPrice;
        validatedItems.push({
          ...item,
          product,
        });
      }

      const total = Math.max(0, subtotal - discount);

      // 3. Crear DirectSale y sus items
      const directSale = await tx.directSale.create({
        data: {
          clientId,
          discount,
          total,
          notes: notes || null,
          createdById: Number(session.user.id),
          items: {
            create: items.map((item) => ({
              productId: item.productId,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
            })),
          },
        },
        include: {
          client: true,
          items: {
            include: {
              product: {
                include: { brand: true, category: true },
              },
            },
          },
        },
      });

      // 4. Actualizar stock de productos y registrar movimientos en el Kardex
      for (const item of validatedItems) {
        // Disminuir stock
        await tx.product.update({
          where: { id: item.productId },
          data: {
            stock: {
              decrement: item.quantity,
            },
          },
        });

        // Crear registro en StockMovement
        await tx.stockMovement.create({
          data: {
            productId: item.productId,
            quantity: item.quantity,
            type: "OUTPUT",
            reason: "SALE",
            notes: `Venta Directa Nro: ${directSale.id}`,
            createdById: Number(session.user.id),
          },
        });
      }

      return directSale;
    });

    // 5. Registrar actividad detallada en la bitácora
    await logActivity({
      userId: Number(session.user.id),
      action: "CREATE",
      entity: "DirectSale",
      entityId: result.id,
      details: {
        cliente: { id: result.client.id, nombre: result.client.name },
        descuento: result.discount,
        total: result.total,
        notas: result.notes || "Sin observaciones",
        items: result.items.map((item) => ({
          producto: { id: item.product.id, nombre: item.product.name, codigo: item.product.code },
          cantidad: item.quantity,
          precioUnitario: item.unitPrice,
          subtotal: item.quantity * item.unitPrice,
        })),
      },
    });

    revalidatePath("/admin/ventas");
    revalidatePath("/admin/inventario");
    return { success: true, message: "Venta directa registrada con éxito." };
  } catch (error: any) {
    console.error("Error al registrar venta directa:", error);
    return {
      success: false,
      message: error.message || "Error interno al registrar la venta directa.",
    };
  }
}

export async function deleteDirectSaleAction(id: number) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return {
        success: false,
        message: "No autenticado. Por favor inicia sesión.",
      };
    }
    const permissions = session.user.permissions ?? [];

    if (!permissions.includes("sales:delete")) {
      return {
        success: false,
        message: "No autorizado. No tienes permiso para anular ventas.",
      };
    }

    const sale = await prisma.directSale.findUnique({
      where: { id, deletedAt: null },
      include: {
        client: true,
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!sale) {
      return {
        success: false,
        message: "La venta seleccionada no existe o ya fue anulada.",
      };
    }

    await prisma.$transaction(async (tx) => {
      // 1. Marcar como eliminada lógicamente
      await tx.directSale.update({
        where: { id },
        data: {
          deletedAt: new Date(),
          deletedById: Number(session.user.id),
        },
      });

      // 2. Devolver stock de productos y registrar movimientos en el Kardex
      for (const item of sale.items) {
        // Incrementar stock
        await tx.product.update({
          where: { id: item.productId },
          data: {
            stock: {
              increment: item.quantity,
            },
          },
        });

        // Crear registro en StockMovement (INPUT / RETURN)
        await tx.stockMovement.create({
          data: {
            productId: item.productId,
            quantity: item.quantity,
            type: "INPUT",
            reason: "RETURN",
            notes: `Devolución por anulación de Venta Directa Nro: ${sale.id}`,
            createdById: Number(session.user.id),
          },
        });
      }
    });

    // 3. Registrar actividad en la bitácora
    await logActivity({
      userId: Number(session.user.id),
      action: "DELETE",
      entity: "DirectSale",
      entityId: sale.id,
      details: {
        cliente: { id: sale.client.id, nombre: sale.client.name },
        total: sale.total,
        motivo: "Anulación de venta directa",
        items: sale.items.map((item) => ({
          producto: { id: item.product.id, nombre: item.product.name },
          cantidad: item.quantity,
        })),
      },
    });

    revalidatePath("/admin/ventas");
    revalidatePath("/admin/inventario");
    return { success: true, message: "Venta directa anulada con éxito." };
  } catch (error: any) {
    console.error("Error al anular venta directa:", error);
    return {
      success: false,
      message: error.message || "Error interno al anular la venta directa.",
    };
  }
}

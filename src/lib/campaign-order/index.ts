"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { logActivity } from "@/lib/audit";
import { CampaignOrderStatus, ItemArrivalStatus } from "@/generated/prisma";
import { bulkOrderSchema, BulkOrderInput } from "./schema";

export type { BulkOrderInput, BulkOrderItemInput } from "./schema";

// Estado del pedido del cliente
const orderStatusTranslations: Record<string, string> = {
  PENDING: "Pendiente",
  VERIFIED: "Verificado",
  PACKED: "Empacado",
  DELIVERED: "Entregado",
  CANCELLED: "Cancelado",
};

// Estado del producto de cada pedido
const itemArrivalStatusTranslations: Record<string, string> = {
  PENDING: "Pendiente",
  RECEIVED: "Recibido",
  MISSING: "Faltante",
  SUBSTITUTED: "Sustituido",
};

/**
 * Guarda de forma masiva pedidos para una campaña.
 * Si ya existe un pedido para el cliente en esta campaña, lo actualiza limpiando sus ítems anteriores.
 */
export async function saveCampaignOrdersAction(campaignId: number, orders: BulkOrderInput[]) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return { success: false, message: "No autenticado. Por favor inicia sesión." };
    }

    const userId = Number(session.user.id);
    const permissions = session.user.permissions ?? [];

    if (!permissions.includes("orders:create") && !permissions.includes("orders:update")) {
      return { success: false, message: "No autorizado. No tienes permisos para registrar pedidos de campaña." };
    }

    // Validar todas las órdenes recibidas contra el esquema Zod
    for (const rawOrder of orders) {
      const validation = bulkOrderSchema.safeParse(rawOrder);
      if (!validation.success) {
        const errorMsg = validation.error.issues[0]?.message || "Datos de pedido de campaña inválidos.";
        return { success: false, message: errorMsg };
      }
    }

    // Verificar campaña
    const campaign = await prisma.campaign.findUnique({
      where: { id: campaignId },
      include: { company: true },
    });

    if (!campaign) {
      return { success: false, message: "La campaña seleccionada no existe." };
    }

    const auditLogsToCreate: Array<Parameters<typeof logActivity>[0]> = [];

    const results = await prisma.$transaction(
      async (tx) => {
        const savedOrders = [];

        for (const input of orders) {
          // Verificar cliente
          const client = await tx.client.findFirst({
            where: { id: input.clientId, deletedAt: null },
          });

          if (!client) {
            throw new Error(`El cliente con ID ${input.clientId} no existe o fue eliminado.`);
          }

          // Buscar si ya existe la orden
          let order = await tx.campaignOrder.findFirst({
            where: {
              clientId: input.clientId,
              campaignId,
              deletedAt: null,
            },
          });

          const isNew = !order;

          if (order) {
            // Actualizar cabecera
            order = await tx.campaignOrder.update({
              where: { id: order.id },
              data: {
                discount: input.discount,
                notes: input.notes || null,
                updatedById: userId,
              },
            });
            // Eliminar ítems antiguos
            await tx.campaignOrderItem.deleteMany({
              where: { campaignOrderId: order.id },
            });
          } else {
            // Crear nueva orden
            order = await tx.campaignOrder.create({
              data: {
                clientId: input.clientId,
                campaignId,
                discount: input.discount,
                notes: input.notes || null,
                status: CampaignOrderStatus.PENDING,
                createdById: userId,
              },
            });
          }

          // Crear nuevos ítems
          if (input.items.length > 0) {
            await tx.campaignOrderItem.createMany({
              data: input.items.map((item) => ({
                campaignOrderId: order!.id,
                brandId: item.brandId,
                productCode: item.productCode || null,
                productName: item.productName.trim(),
                catalogPrice: item.catalogPrice,
                quantity: item.quantity,
                arrivalStatus: ItemArrivalStatus.PENDING,
              })),
            });
          }

          // Calcular total temporal
          const orderTotal = input.items.reduce((sum, item) => sum + item.quantity * item.catalogPrice, 0) - input.discount;

          // Cargar marcas asociadas para detalles de log
          const brandIds = Array.from(new Set(input.items.map((i) => i.brandId)));
          const brands = await tx.brand.findMany({
            where: { id: { in: brandIds } },
            select: { id: true, name: true },
          });
          const brandMap = new Map(brands.map((b) => [b.id, b.name]));

          // Acumular información de auditoría para registrarla tras confirmar la transacción
          auditLogsToCreate.push({
            userId,
            action: isNew ? "CREATE" : "UPDATE",
            entity: "CampaignOrder",
            entityId: order.id,
            details: {
              cliente: `${client.name} (ID: ${client.id})`,
              campaña: `${campaign.company.name} - ${campaign.number}`,
              items: input.items.map(
                (i) =>
                  `${i.productName} [Marca: ${brandMap.get(i.brandId) || "N/A"}] (Cant: ${i.quantity
                  }, Código: ${i.productCode || "S/C"}, Precio Catálogo: S/ ${i.catalogPrice.toFixed(2)})`
              ),
              total: orderTotal,
            },
          });

          savedOrders.push(order);
        }

        return savedOrders;
      },
      {
        maxWait: 10000,
        timeout: 30000,
      }
    );

    // Registrar auditoría de forma asíncrona tras finalizar la transacción sin bloquear la DB
    Promise.allSettled(auditLogsToCreate.map((log) => logActivity(log)));

    revalidatePath("/admin/pedidos");
    revalidatePath("/admin/movimientos");

    return {
      success: true,
      message: "Pedidos guardados exitosamente.",
      data: results,
    };
  } catch (error: any) {
    console.error("Error al guardar pedidos de campaña:", error);
    return {
      success: false,
      message: error.message || "Error interno al guardar pedidos.",
    };
  }
}

/**
 * Consulta sugerencias de autocompletado en el historial de pedidos de catálogo e inventario general.
 */
export async function getAutocompleteSuggestionsAction(query: string, companyId?: number) {
  try {
    if (!query || query.trim().length < 2) {
      return { success: true, suggestions: [] };
    }
    const cleanQuery = query.trim();

    // 1. Buscar en ítems de pedidos anteriores
    const pastItems = await prisma.campaignOrderItem.findMany({
      where: {
        productName: {
          contains: cleanQuery,
          mode: "insensitive",
        },
        brand: companyId ? {
          companyId: companyId,
        } : undefined,
      },
      select: {
        productName: true,
        brandId: true,
        catalogPrice: true,
      },
      distinct: ["productName"],
      take: 10,
    });

    // 2. Buscar en catálogo general de productos (stock)
    const stockItems = await prisma.product.findMany({
      where: {
        name: {
          contains: cleanQuery,
          mode: "insensitive",
        },
        brand: companyId ? {
          companyId: companyId,
        } : undefined,
        deletedAt: null,
      },
      select: {
        name: true,
        brandId: true,
        price: true,
      },
      distinct: ["name"],
      take: 10,
    });

    // Combinar y normalizar resultados eliminando duplicados insensibles a mayúsculas
    const map = new Map<string, { name: string; brandId: number; price: number }>();

    pastItems.forEach((item) => {
      map.set(item.productName.toLowerCase(), {
        name: item.productName,
        brandId: item.brandId,
        price: item.catalogPrice,
      });
    });

    stockItems.forEach((item) => {
      const key = item.name.toLowerCase();
      if (!map.has(key)) {
        map.set(key, {
          name: item.name,
          brandId: item.brandId,
          price: item.price,
        });
      }
    });

    return {
      success: true,
      suggestions: Array.from(map.values()),
    };
  } catch (error: any) {
    console.error("Error en getAutocompleteSuggestionsAction:", error);
    return { success: false, suggestions: [] };
  }
}

/**
 * Actualiza el estado de arribo de un ítem (Llegó, Faltó, Sustituido).
 */
export async function updateItemArrivalStatusAction(
  itemId: number,
  arrivalStatus: ItemArrivalStatus,
  substituteData?: any
) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return { success: false, message: "No autenticado. Por favor inicia sesión." };
    }

    const userId = Number(session.user.id);
    const permissions = session.user.permissions ?? [];

    if (!permissions.includes("orders:update")) {
      return { success: false, message: "No autorizado para actualizar estados de productos." };
    }

    const item = await prisma.campaignOrderItem.findUnique({
      where: { id: itemId },
      include: {
        campaignOrder: {
          include: { client: true },
        },
      },
    });

    if (!item) {
      return { success: false, message: "El producto no existe." };
    }

    const updatedItem = await prisma.$transaction(async (tx) => {
      await tx.campaignOrderItem.update({
        where: { id: itemId },
        data: { arrivalStatus },
      });

      if (arrivalStatus === ItemArrivalStatus.SUBSTITUTED && substituteData) {
        await tx.campaignOrderItemSubstitute.upsert({
          where: { campaignOrderItemId: itemId },
          update: {
            productCode: substituteData.productCode || null,
            productName: substituteData.productName.trim(),
            catalogPrice: substituteData.catalogPrice,
          },
          create: {
            campaignOrderItemId: itemId,
            productCode: substituteData.productCode || null,
            productName: substituteData.productName.trim(),
            catalogPrice: substituteData.catalogPrice,
          },
        });
      } else {
        await tx.campaignOrderItemSubstitute.deleteMany({
          where: { campaignOrderItemId: itemId },
        });
      }

      return tx.campaignOrderItem.findUnique({
        where: { id: itemId },
        include: { substitute: true },
      });
    });

    // Registrar en auditoría
    await logActivity({
      userId,
      action: "UPDATE",
      entity: "CampaignOrderItem",
      entityId: itemId,
      details: {
        cliente: `${item.campaignOrder.client.name} (ID: ${item.campaignOrder.client.id})`,
        producto: item.productName,
        nuevoEstado: itemArrivalStatusTranslations[arrivalStatus] || arrivalStatus,
        sustituto: substituteData ? {
          nombre: substituteData.productName,
          codigo: substituteData.productCode || null,
          precio: substituteData.catalogPrice,
        } : null,
      },
    });

    revalidatePath("/admin/pedidos");
    revalidatePath(`/admin/movimientos/${item.campaignOrder.clientId}`);

    return {
      success: true,
      message: "Estado del producto actualizado con éxito.",
      data: updatedItem,
    };
  } catch (error: any) {
    console.error("Error en updateItemArrivalStatusAction:", error);
    return { success: false, message: error.message || "Error al actualizar estado del producto." };
  }
}

/**
 * Actualiza en lote (batch) el estado de arribo de varios ítems.
 */
export async function updateItemsArrivalStatusAction(
  itemIds: number[],
  arrivalStatus: ItemArrivalStatus,
  substituteData?: any
) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return { success: false, message: "No autenticado. Por favor inicia sesión." };
    }

    const userId = Number(session.user.id);
    const permissions = session.user.permissions ?? [];

    if (!permissions.includes("orders:update")) {
      return { success: false, message: "No autorizado para actualizar estados de productos." };
    }

    await prisma.$transaction(async (tx) => {
      await tx.campaignOrderItem.updateMany({
        where: {
          id: { in: itemIds },
        },
        data: { arrivalStatus },
      });

      if (arrivalStatus === ItemArrivalStatus.SUBSTITUTED && substituteData) {
        for (const id of itemIds) {
          await tx.campaignOrderItemSubstitute.upsert({
            where: { campaignOrderItemId: id },
            update: {
              productCode: substituteData.productCode || null,
              productName: substituteData.productName.trim(),
              catalogPrice: substituteData.catalogPrice,
            },
            create: {
              campaignOrderItemId: id,
              productCode: substituteData.productCode || null,
              productName: substituteData.productName.trim(),
              catalogPrice: substituteData.catalogPrice,
            },
          });
        }
      } else {
        await tx.campaignOrderItemSubstitute.deleteMany({
          where: { campaignOrderItemId: { in: itemIds } },
        });
      }
    });

    // Obtener los IDs de los pedidos afectados e información para auditoría
    const affectedItems = await prisma.campaignOrderItem.findMany({
      where: { id: { in: itemIds } },
      select: {
        campaignOrderId: true,
        productName: true,
        campaignOrder: {
          select: {
            client: {
              select: { name: true }
            }
          }
        }
      },
    });
    const orderIds = Array.from(new Set(affectedItems.map(i => i.campaignOrderId)));

    // Transicionar el estado de cada pedido si corresponde
    for (const orderId of orderIds) {
      const order = await prisma.campaignOrder.findUnique({
        where: { id: orderId },
        include: { items: true, client: true },
      });

      if (order && order.status === CampaignOrderStatus.PENDING) {
        const allItemsVerified = order.items.every(
          (item) => item.arrivalStatus !== ItemArrivalStatus.PENDING
        );

        if (allItemsVerified) {
          const allItemsMissing = order.items.every(
            (item) => item.arrivalStatus === ItemArrivalStatus.MISSING
          );

          const targetStatus = allItemsMissing ? CampaignOrderStatus.CANCELLED : CampaignOrderStatus.VERIFIED;
          await prisma.campaignOrder.update({
            where: { id: orderId },
            data: {
              status: targetStatus,
              updatedById: userId,
            },
          });

          // Registrar en auditoría el cambio automático del pedido
          await logActivity({
            userId,
            action: "UPDATE",
            entity: "CampaignOrder",
            entityId: orderId,
            details: {
              cliente: `${order.client.name} (ID: ${order.client.id})`,
              nuevoEstado: orderStatusTranslations[targetStatus] || targetStatus,
              description: `Pedido verificado automáticamente por actualización masiva de productos.`,
            },
          });
        }
      }
    }

    // Registrar en auditoría
    await logActivity({
      userId,
      action: "UPDATE",
      entity: "CampaignOrderItem",
      entityId: itemIds[0] || 0,
      details: {
        itemIds,
        productos: affectedItems.map(i => `${i.productName} (Cliente: ${i.campaignOrder.client.name})`),
        nuevoEstado: itemArrivalStatusTranslations[arrivalStatus] || arrivalStatus,
        sustituto: substituteData ? {
          nombre: substituteData.productName,
          codigo: substituteData.productCode || null,
          precio: substituteData.catalogPrice,
        } : null,
        description: `Actualización masiva de estado de arribo a ${itemArrivalStatusTranslations[arrivalStatus] || arrivalStatus} para los productos: ${affectedItems.map(i => i.productName).join(", ")}.`,
      },
    });

    revalidatePath("/admin/pedidos");

    return {
      success: true,
      message: `Se actualizaron ${itemIds.length} productos con éxito.`,
    };
  } catch (error: any) {
    console.error("Error en updateItemsArrivalStatusAction:", error);
    return { success: false, message: error.message || "Error al actualizar estado del lote de productos." };
  }
}

/**
 * Transiciona el estado de un pedido completo.
 */
export async function transitionOrderStatusAction(
  orderId: number,
  status: CampaignOrderStatus,
  discount?: number,
  notes?: string | null,
  paymentDateString?: string | null
) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return { success: false, message: "No autenticado. Por favor inicia sesión." };
    }

    const userId = Number(session.user.id);
    const permissions = session.user.permissions ?? [];

    if (!permissions.includes("orders:update")) {
      return { success: false, message: "No autorizado para cambiar el estado del pedido." };
    }

    const order = await prisma.campaignOrder.findUnique({
      where: { id: orderId },
      include: {
        client: true,
        campaign: { include: { company: true } },
      },
    });

    if (!order) {
      return { success: false, message: "El pedido no existe." };
    }

    let paymentDate: Date | null = order.paymentDate;
    if (paymentDateString !== undefined) {
      if (paymentDateString) {
        const [year, month, day] = paymentDateString.split("-").map(Number);
        paymentDate = new Date(Date.UTC(year, month - 1, day));
      } else {
        paymentDate = null;
      }
    } else if (status === CampaignOrderStatus.DELIVERED && !order.paymentDate) {
      paymentDate = order.campaign.paymentDate || null;
    }

    const updatedOrder = await prisma.campaignOrder.update({
      where: { id: orderId },
      data: {
        status,
        deliveredAt: status === CampaignOrderStatus.DELIVERED ? new Date() : order.deliveredAt,
        paymentDate,
        discount: discount !== undefined ? discount : order.discount,
        notes: notes !== undefined ? (notes || null) : order.notes,
        updatedById: userId,
      },
    });

    // Registrar auditoría
    await logActivity({
      userId,
      action: "UPDATE",
      entity: "CampaignOrder",
      entityId: orderId,
      details: {
        cliente: `${order.client.name} (ID: ${order.client.id})`,
        campaña: `${order.campaign.company.name} - ${order.campaign.number}`,
        nuevoEstado: orderStatusTranslations[status] || status,
        descuento: discount !== undefined ? discount : order.discount,
        nota: notes !== undefined ? notes : order.notes,
        fechaPago: paymentDate ? paymentDate.toISOString().split("T")[0] : null,
      },
    });

    revalidatePath("/admin/pedidos");
    revalidatePath(`/admin/movimientos/${order.clientId}`);
    revalidatePath("/admin/movimientos");

    return {
      success: true,
      message: `El pedido del cliente se ha cambiado a ${status} con éxito.`,
      data: updatedOrder,
    };
  } catch (error: any) {
    console.error("Error en transitionOrderStatusAction:", error);
    return { success: false, message: error.message || "Error al cambiar estado del pedido." };
  }
}

export async function updateOrderDiscountAndNotesAction(
  orderId: number,
  discount: number,
  notes: string | null,
  paymentDateString?: string | null
) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return { success: false, message: "No autenticado. Por favor inicia sesión." };
    }

    const userId = Number(session.user.id);
    const permissions = session.user.permissions ?? [];

    if (!permissions.includes("orders:update")) {
      return { success: false, message: "No autorizado para modificar los detalles del pedido." };
    }

    const order = await prisma.campaignOrder.findUnique({
      where: { id: orderId },
      include: {
        client: true,
        campaign: { include: { company: true } },
      },
    });

    if (!order) {
      return { success: false, message: "El pedido no existe." };
    }

    let paymentDate: Date | null = order.paymentDate;
    if (paymentDateString !== undefined) {
      if (paymentDateString) {
        const [year, month, day] = paymentDateString.split("-").map(Number);
        paymentDate = new Date(Date.UTC(year, month - 1, day));
      } else {
        paymentDate = null;
      }
    }

    const updatedOrder = await prisma.campaignOrder.update({
      where: { id: orderId },
      data: {
        discount,
        notes: notes || null,
        paymentDate,
        updatedById: userId,
      },
    });

    // Registrar en auditoría
    await logActivity({
      userId,
      action: "UPDATE",
      entity: "CampaignOrder",
      entityId: orderId,
      details: {
        cliente: `${order.client.name} (ID: ${order.client.id})`,
        campaña: `${order.campaign.company.name} - ${order.campaign.number}`,
        descuento: discount,
        nota: notes,
        fechaPago: paymentDate ? paymentDate.toISOString().split("T")[0] : null,
      },
    });

    revalidatePath("/admin/pedidos");
    revalidatePath(`/admin/movimientos/${order.clientId}`);

    return {
      success: true,
      message: "Descuento, notas y fecha de pago actualizados con éxito.",
      data: updatedOrder,
    };
  } catch (error: any) {
    console.error("Error en updateOrderDiscountAndNotesAction:", error);
    return { success: false, message: error.message || "Error al actualizar descuento y notas." };
  }
}

/**
 * Actualiza la fecha de pago de un pedido.
 */
export async function updateOrderPaymentDateAction(
  orderId: number,
  paymentDateString: string | null
) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return { success: false, message: "No autenticado. Por favor inicia sesión." };
    }

    const userId = Number(session.user.id);
    const permissions = session.user.permissions ?? [];

    if (!permissions.includes("orders:update")) {
      return { success: false, message: "No autorizado para modificar la fecha de pago." };
    }

    const order = await prisma.campaignOrder.findUnique({
      where: { id: orderId },
      include: {
        client: true,
        campaign: { include: { company: true } },
      },
    });

    if (!order) {
      return { success: false, message: "El pedido no existe." };
    }

    let paymentDate: Date | null = null;
    if (paymentDateString) {
      const [year, month, day] = paymentDateString.split("-").map(Number);
      paymentDate = new Date(Date.UTC(year, month - 1, day));
    }

    const updatedOrder = await prisma.campaignOrder.update({
      where: { id: orderId },
      data: {
        paymentDate,
        updatedById: userId,
      },
    });

    // Registrar en auditoría
    await logActivity({
      userId,
      action: "UPDATE",
      entity: "CampaignOrder",
      entityId: orderId,
      details: {
        cliente: `${order.client.name} (ID: ${order.client.id})`,
        campaña: `${order.campaign.company.name} - ${order.campaign.number}`,
        fechaPago: paymentDate ? paymentDate.toISOString().split("T")[0] : null,
      },
    });

    revalidatePath("/admin/pedidos");
    revalidatePath(`/admin/movimientos/${order.clientId}`);
    revalidatePath("/admin/movimientos");

    return {
      success: true,
      message: "Fecha de pago actualizada con éxito.",
      data: updatedOrder,
    };
  } catch (error: any) {
    console.error("Error en updateOrderPaymentDateAction:", error);
    return { success: false, message: error.message || "Error al actualizar la fecha de pago." };
  }
}

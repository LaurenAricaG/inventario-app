"use server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { logActivity } from "@/lib/audit";
import { campaignSchema } from "./schema";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Extrae el public_id de una URL de Cloudinary.
 * Ejemplo: https://res.cloudinary.com/demo/image/upload/v123/inventario/catalogs/abc.pdf
 * → inventario/catalogs/abc
 */
function extractCloudinaryPublicId(url: string): string | null {
  try {
    const match = url.match(/\/upload\/(?:v\d+\/)?(.+?)(?:\.[a-z0-9]+)?$/i);
    return match ? match[1] : null;
  } catch {
    return null;
  }
}

/**
 * Elimina todos los PDFs de Cloudinary asociados a las campañas indicadas
 * y hace soft-delete de sus registros en la BD.
 * Se usa al desactivar campañas para liberar espacio y permitir subir
 * nuevos PDFs si la campaña vuelve a activarse.
 */
async function deleteCloudinaryPdfsForCampaigns(campaignIds: number[]): Promise<void> {
  if (campaignIds.length === 0) return;

  const catalogs = await prisma.catalogPdf.findMany({
    where: {
      campaignId: { in: campaignIds },
      deletedAt: null,
    },
    select: { id: true, pdfUrl: true },
  });

  if (catalogs.length === 0) return;

  // 1. Eliminar archivos de Cloudinary en paralelo
  await Promise.allSettled(
    catalogs
      .filter(({ pdfUrl }) => pdfUrl.includes("res.cloudinary.com"))
      .map(({ pdfUrl }) => {
        const publicId = extractCloudinaryPublicId(pdfUrl);
        if (!publicId) return Promise.resolve();
        return cloudinary.uploader.destroy(publicId, { resource_type: "image" });
      }),
  );

  // 2. Soft-delete de los registros para que se puedan volver a crear
  await prisma.catalogPdf.updateMany({
    where: { id: { in: catalogs.map((c) => c.id) } },
    data: { deletedAt: new Date() },
  });
}

export async function createCampaignAction(
  companyId: number,
  number: string,
  startDate: Date,
  endDate: Date,
  isActive: boolean = false,
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

    if (!permissions.includes("campaigns:create")) {
      return {
        success: false,
        message: "No autorizado. No tienes permiso para crear campañas.",
      };
    }

    const validation = campaignSchema.safeParse({
      companyId,
      number,
      startDate,
      endDate,
      isActive,
    });

    if (!validation.success) {
      const errorMsg =
        validation.error.issues[0]?.message || "Datos de campaña inválidos.";
      return { success: false, message: errorMsg };
    }

    const validCompanyId = validation.data.companyId;
    const validNumber = validation.data.number;
    const validStartDate = validation.data.startDate;
    const validEndDate = validation.data.endDate;
    const validIsActive = validation.data.isActive;

    // Verificar si ya existe en esa empresa
    const existing = await prisma.campaign.findFirst({
      where: {
        number: { equals: validNumber, mode: "insensitive" },
        companyId: validCompanyId,
      },
    });

    if (existing) {
      if (existing.deletedAt) {
        // Restaurar
        const restored = await prisma.campaign.update({
          where: { id: existing.id },
          data: {
            startDate: validStartDate,
            endDate: validEndDate,
            isActive: validIsActive,
            deletedAt: null,
            deletedById: null,
            updatedById: Number(session.user.id),
          },
        });

        // Si se restauró como activa, desactivamos las otras de la misma empresa
        // y eliminamos sus PDFs de Cloudinary
        if (validIsActive) {
          const toDeactivate = await prisma.campaign.findMany({
            where: {
              companyId: validCompanyId,
              id: { not: restored.id },
              deletedAt: null,
              isActive: true,
            },
            select: { id: true },
          });

          await prisma.campaign.updateMany({
            where: {
              companyId: validCompanyId,
              id: { not: restored.id },
              deletedAt: null,
            },
            data: { isActive: false },
          });

          await deleteCloudinaryPdfsForCampaigns(toDeactivate.map((c) => c.id));
        }

        await logActivity({
          userId: Number(session.user.id),
          action: "UPDATE",
          entity: "Campaign",
          entityId: restored.id,
          details: { number: restored.number, restored: true },
        });

        revalidatePath("/admin/campanias");
        return {
          success: true,
          message:
            "La campaña ya existía y ha sido restaurada con los nuevos valores.",
        };
      }

      return {
        success: false,
        message: "Ya existe una campaña con ese número para esta empresa.",
      };
    }

    // Si la nueva campaña es activa, desactivamos las otras de la misma empresa
    // y eliminamos sus PDFs de Cloudinary
    if (validIsActive) {
      const toDeactivate = await prisma.campaign.findMany({
        where: {
          companyId: validCompanyId,
          deletedAt: null,
          isActive: true,
        },
        select: { id: true },
      });

      await prisma.campaign.updateMany({
        where: {
          companyId: validCompanyId,
          deletedAt: null,
        },
        data: { isActive: false },
      });

      await deleteCloudinaryPdfsForCampaigns(toDeactivate.map((c) => c.id));
    }

    const campaign = await prisma.campaign.create({
      data: {
        companyId: validCompanyId,
        number: validNumber,
        startDate: validStartDate,
        endDate: validEndDate,
        isActive: validIsActive,
        createdById: Number(session.user.id),
      },
    });

    const company = await prisma.company.findUnique({
      where: { id: validCompanyId },
      select: { name: true },
    });

    await logActivity({
      userId: Number(session.user.id),
      action: "CREATE",
      entity: "Campaign",
      entityId: campaign.id,
      details: {
        number: validNumber,
        company: company
          ? `${company.name} (ID: ${validCompanyId})`
          : `ID: ${validCompanyId}`,
        startDate: validStartDate,
        endDate: validEndDate,
        isActive: validIsActive,
      },
    });

    revalidatePath("/admin/campanias");
    return { success: true, message: "Campaña creada con éxito." };
  } catch (error: any) {
    console.error("Error al crear campaña:", error);
    if (error.code === "P2002") {
      return {
        success: false,
        message: "Ya existe una campaña con ese número en esta empresa.",
      };
    }
    return {
      success: false,
      message: "Error interno del servidor al crear la campaña.",
    };
  }
}

export async function updateCampaignAction(
  id: number,
  companyId: number,
  number: string,
  startDate: Date,
  endDate: Date,
  isActive: boolean = false,
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

    if (!permissions.includes("campaigns:update")) {
      return {
        success: false,
        message: "No autorizado. No tienes permiso para editar campañas.",
      };
    }

    const validation = campaignSchema.safeParse({
      companyId,
      number,
      startDate,
      endDate,
      isActive,
    });

    if (!validation.success) {
      const errorMsg =
        validation.error.issues[0]?.message || "Datos de campaña inválidos.";
      return { success: false, message: errorMsg };
    }

    const validCompanyId = validation.data.companyId;
    const validNumber = validation.data.number;
    const validStartDate = validation.data.startDate;
    const validEndDate = validation.data.endDate;
    const validIsActive = validation.data.isActive;

    // Verificar si existe otra con el mismo número para la empresa
    const duplicate = await prisma.campaign.findFirst({
      where: {
        id: { not: id },
        number: { equals: validNumber, mode: "insensitive" },
        companyId: validCompanyId,
        deletedAt: null,
      },
    });

    if (duplicate) {
      return {
        success: false,
        message: "Ya existe otra campaña con ese número en esta empresa.",
      };
    }

    const existingCampaign = await prisma.campaign.findUnique({
      where: { id },
    });

    if (!existingCampaign) {
      return {
        success: false,
        message: "La campaña no existe.",
      };
    }

    // Si se activa, desactivamos las otras de la misma empresa
    // y eliminamos sus PDFs de Cloudinary
    if (validIsActive) {
      const toDeactivate = await prisma.campaign.findMany({
        where: {
          companyId: validCompanyId,
          id: { not: id },
          deletedAt: null,
          isActive: true,
        },
        select: { id: true },
      });

      await prisma.campaign.updateMany({
        where: {
          companyId: validCompanyId,
          id: { not: id },
          deletedAt: null,
        },
        data: { isActive: false },
      });

      await deleteCloudinaryPdfsForCampaigns(toDeactivate.map((c) => c.id));
    }

    const updated = await prisma.campaign.update({
      where: { id },
      data: {
        companyId: validCompanyId,
        number: validNumber,
        startDate: validStartDate,
        endDate: validEndDate,
        isActive: validIsActive,
        updatedById: Number(session.user.id),
      },
    });

    const [oldCompany, newCompany] = await Promise.all([
      prisma.company.findUnique({
        where: { id: existingCampaign.companyId },
        select: { name: true },
      }),
      prisma.company.findUnique({
        where: { id: validCompanyId },
        select: { name: true },
      }),
    ]);

    await logActivity({
      userId: Number(session.user.id),
      action: "UPDATE",
      entity: "Campaign",
      entityId: id,
      details: {
        antes: {
          number: existingCampaign.number,
          company: oldCompany
            ? `${oldCompany.name} (ID: ${existingCampaign.companyId})`
            : `ID: ${existingCampaign.companyId}`,
          startDate: existingCampaign.startDate,
          endDate: existingCampaign.endDate,
          isActive: existingCampaign.isActive,
        },
        despues: {
          number: validNumber,
          company: newCompany
            ? `${newCompany.name} (ID: ${validCompanyId})`
            : `ID: ${validCompanyId}`,
          startDate: validStartDate,
          endDate: validEndDate,
          isActive: validIsActive,
        },
      },
    });

    revalidatePath("/admin/campanias");
    return { success: true, message: "Campaña actualizada con éxito." };
  } catch (error: any) {
    console.error("Error al actualizar campaña:", error);
    if (error.code === "P2002") {
      return {
        success: false,
        message: "Ya existe otra campaña con ese número en esta empresa.",
      };
    }
    return {
      success: false,
      message: "Error interno del servidor al actualizar la campaña.",
    };
  }
}

export async function deleteCampaignAction(id: number) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return {
        success: false,
        message: "No autenticado. Por favor inicia sesión.",
      };
    }
    const permissions = session.user.permissions ?? [];

    if (!permissions.includes("campaigns:delete")) {
      return {
        success: false,
        message: "No autorizado. No tienes permiso para eliminar campañas.",
      };
    }

    // Verificar si la campaña está activa
    const campaign = await prisma.campaign.findUnique({
      where: { id },
      select: { isActive: true },
    });

    if (!campaign) {
      return {
        success: false,
        message: "La campaña no existe.",
      };
    }

    if (campaign.isActive) {
      return {
        success: false,
        message:
          "No se puede eliminar una campaña activa. Primero debes pasarla a inactiva.",
      };
    }

    // Verificar si la campaña tiene pedidos activos asociados
    const orderCount = await prisma.campaignOrder.count({
      where: {
        campaignId: id,
        deletedAt: null,
      },
    });

    if (orderCount > 0) {
      return {
        success: false,
        message: `No se puede eliminar. Esta campaña tiene asociada(s) ${orderCount} orden(es) de compra activa(s).`,
      };
    }

    // Verificar si la campaña tiene catálogos activos asociados
    const catalogCount = await prisma.catalogPdf.count({
      where: {
        campaignId: id,
        deletedAt: null,
      },
    });

    if (catalogCount > 0) {
      return {
        success: false,
        message: `No se puede eliminar. Esta campaña tiene asociada(s) ${catalogCount} catálogo(s) PDF activo(s).`,
      };
    }

    // Borrado lógico
    const deleted = await prisma.campaign.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        deletedById: Number(session.user.id),
      },
    });

    await logActivity({
      userId: Number(session.user.id),
      action: "DELETE",
      entity: "Campaign",
      entityId: id,
      details: { number: deleted.number },
    });

    revalidatePath("/admin/campanias");
    return { success: true, message: "Campaña eliminada con éxito." };
  } catch (error: any) {
    console.error("Error al eliminar campaña:", error);
    return {
      success: false,
      message: "Error interno del servidor al eliminar la campaña.",
    };
  }
}

/**
 * Actualiza la fecha de pago de una campaña.
 */
export async function updateCampaignPaymentDateAction(
  campaignId: number,
  paymentDateString: string | null
) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return { success: false, message: "No autenticado. Por favor inicia sesión." };
    }

    const userId = Number(session.user.id);
    const permissions = session.user.permissions ?? [];

    if (!permissions.includes("campaigns:update")) {
      return { success: false, message: "No autorizado para modificar la campaña." };
    }

    const campaign = await prisma.campaign.findUnique({
      where: { id: campaignId },
      include: { company: true },
    });

    if (!campaign) {
      return { success: false, message: "La campaña no existe." };
    }

    let paymentDate: Date | null = null;
    if (paymentDateString) {
      const [year, month, day] = paymentDateString.split("-").map(Number);
      paymentDate = new Date(Date.UTC(year, month - 1, day));
    }

    const updatedCampaign = await prisma.campaign.update({
      where: { id: campaignId },
      data: {
        paymentDate,
        updatedById: userId,
      },
    });

    // Registrar en auditoría
    await logActivity({
      userId,
      action: "UPDATE",
      entity: "Campaign",
      entityId: campaignId,
      details: {
        empresa: campaign.company.name,
        número: campaign.number,
        fechaPago: paymentDate ? paymentDate.toISOString().split("T")[0] : null,
      },
    });

    revalidatePath("/admin/pedidos");
    revalidatePath("/admin/campanias");

    return {
      success: true,
      message: "Fecha límite de pago de la campaña actualizada con éxito.",
      data: updatedCampaign,
    };
  } catch (error: any) {
    console.error("Error en updateCampaignPaymentDateAction:", error);
    return { success: false, message: error.message || "Error al actualizar la fecha de pago de la campaña." };
  }
}

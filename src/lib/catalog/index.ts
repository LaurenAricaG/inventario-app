"use server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { logActivity } from "@/lib/audit";
import { catalogPdfSchema } from "./schema";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Extrae el public_id de Cloudinary a partir de la URL segura.
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

async function deleteCloudinaryFile(pdfUrl: string): Promise<void> {
  if (!pdfUrl.includes("res.cloudinary.com")) return;

  const publicId = extractCloudinaryPublicId(pdfUrl);
  if (!publicId) return;

  try {
    await cloudinary.uploader.destroy(publicId, { resource_type: "image" });
  } catch (error) {
    console.error("Error al eliminar archivo de Cloudinary:", error);
  }
}

export async function createCatalogPdfAction(
  campaignId: number,
  brandId: number,
  title: string | null | undefined,
  pdfUrl: string,
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

    if (!permissions.includes("catalogs:upload")) {
      return {
        success: false,
        message: "No autorizado. No tienes permiso para subir catálogos.",
      };
    }

    const validation = catalogPdfSchema.safeParse({
      campaignId,
      brandId,
      title,
      pdfUrl,
    });

    if (!validation.success) {
      const errorMsg =
        validation.error.issues[0]?.message || "Datos de catálogo inválidos.";
      return { success: false, message: errorMsg };
    }

    const validCampaignId = validation.data.campaignId;
    const validBrandId = validation.data.brandId;
    const validTitle = validation.data.title;
    const finalPdfUrl = validation.data.pdfUrl;

    // Verificar si ya existe en esa campaña y marca
    const existing = await prisma.catalogPdf.findFirst({
      where: {
        campaignId: validCampaignId,
        brandId: validBrandId,
      },
    });

    if (existing) {
      if (existing.deletedAt) {
        // Eliminar el archivo viejo de Cloudinary antes de restaurar con el nuevo
        await deleteCloudinaryFile(existing.pdfUrl);

        const restored = await prisma.catalogPdf.update({
          where: { id: existing.id },
          data: {
            title: validTitle,
            pdfUrl: finalPdfUrl,
            deletedAt: null,
            deletedById: null,
            updatedById: Number(session.user.id),
          },
        });

        await logActivity({
          userId: Number(session.user.id),
          action: "UPDATE",
          entity: "CatalogPdf",
          entityId: restored.id,
          details: { title: restored.title, restored: true },
        });

        revalidatePath("/admin/campanias");
        return {
          success: true,
          message: "El catálogo ya existía y ha sido restaurado con éxito.",
        };
      }

      return {
        success: false,
        message: "Ya existe un catálogo registrado para esta campaña y marca.",
      };
    }

    const catalog = await prisma.catalogPdf.create({
      data: {
        campaignId: validCampaignId,
        brandId: validBrandId,
        title: validTitle,
        pdfUrl: finalPdfUrl,
        createdById: Number(session.user.id),
      },
    });

    // Obtener detalles adicionales para la bitácora
    const relationInfo = await prisma.catalogPdf.findUnique({
      where: { id: catalog.id },
      select: {
        pdfUrl: true,
        title: true,
        campaign: {
          select: {
            number: true,
            company: {
              select: { name: true },
            },
          },
        },
        brand: {
          select: { name: true },
        },
      },
    });

    await logActivity({
      userId: Number(session.user.id),
      action: "CREATE",
      entity: "CatalogPdf",
      entityId: catalog.id,
      details: {
        title: catalog.title,
        campaign: relationInfo?.campaign?.number,
        company: relationInfo?.campaign?.company?.name,
        brand: relationInfo?.brand?.name,
        pdfUrl: relationInfo?.pdfUrl,
      },
    });

    revalidatePath("/admin/campanias");
    return {
      success: true,
      message: "Catálogo PDF creado exitosamente.",
    };
  } catch (error: any) {
    console.error("Error al crear catálogo PDF:", error);
    return {
      success: false,
      message: error.message || "Ocurrió un error inesperado.",
    };
  }
}

export async function updateCatalogPdfAction(
  id: number,
  campaignId: number,
  brandId: number,
  title: string | null | undefined,
  pdfUrl: string,
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

    if (!permissions.includes("catalogs:upload")) {
      return {
        success: false,
        message: "No autorizado. No tienes permiso para editar catálogos.",
      };
    }

    const validation = catalogPdfSchema.safeParse({
      campaignId,
      brandId,
      title,
      pdfUrl,
    });

    if (!validation.success) {
      const errorMsg =
        validation.error.issues[0]?.message || "Datos de catálogo inválidos.";
      return { success: false, message: errorMsg };
    }

    const validCampaignId = validation.data.campaignId;
    const validBrandId = validation.data.brandId;
    const validTitle = validation.data.title;
    const finalPdfUrl = validation.data.pdfUrl;

    // Verificar que el catálogo existe
    const current = await prisma.catalogPdf.findUnique({
      where: { id },
    });

    if (!current || current.deletedAt) {
      return {
        success: false,
        message: "El catálogo PDF no existe o ha sido eliminado.",
      };
    }

    // Verificar unicidad de campaignId y brandId (excluyendo el actual)
    const existingConflict = await prisma.catalogPdf.findFirst({
      where: {
        campaignId: validCampaignId,
        brandId: validBrandId,
        id: { not: id },
        deletedAt: null,
      },
    });

    if (existingConflict) {
      return {
        success: false,
        message: "Ya existe un catálogo registrado para esa campaña y marca.",
      };
    }

    // Detectar si el PDF cambió: si la nueva URL es distinta a la actual,
    // eliminar el archivo viejo de Cloudinary
    const pdfChanged = finalPdfUrl !== current.pdfUrl;

    const updated = await prisma.catalogPdf.update({
      where: { id },
      data: {
        campaignId: validCampaignId,
        brandId: validBrandId,
        title: validTitle,
        pdfUrl: finalPdfUrl,
        updatedById: Number(session.user.id),
      },
    });

    // Eliminar el PDF viejo de Cloudinary después de actualizar la BD con éxito
    if (pdfChanged) {
      await deleteCloudinaryFile(current.pdfUrl);
    }

    // Obtener detalles adicionales para la bitácora
    const relationInfo = await prisma.catalogPdf.findUnique({
      where: { id: updated.id },
      select: {
        pdfUrl: true,
        title: true,
        campaign: {
          select: {
            number: true,
            company: {
              select: { name: true },
            },
          },
        },
        brand: {
          select: { name: true },
        },
      },
    });

    await logActivity({
      userId: Number(session.user.id),
      action: "UPDATE",
      entity: "CatalogPdf",
      entityId: updated.id,
      details: {
        title: updated.title,
        campaign: relationInfo?.campaign?.number,
        company: relationInfo?.campaign?.company?.name,
        brand: relationInfo?.brand?.name,
        pdfUrl: relationInfo?.pdfUrl,
      },
    });

    revalidatePath("/admin/campanias");
    return {
      success: true,
      message: "Catálogo PDF actualizado exitosamente.",
    };
  } catch (error: any) {
    console.error("Error al actualizar catálogo PDF:", error);
    return {
      success: false,
      message: error.message || "Ocurrió un error inesperado.",
    };
  }
}

export async function deleteCatalogPdfAction(id: number) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return {
        success: false,
        message: "No autenticado. Por favor inicia sesión.",
      };
    }
    const permissions = session.user.permissions ?? [];

    if (!permissions.includes("catalogs:upload")) {
      return {
        success: false,
        message: "No autorizado. No tienes permiso para eliminar catálogos.",
      };
    }

    const current = await prisma.catalogPdf.findUnique({
      where: { id },
    });

    if (!current || current.deletedAt) {
      return {
        success: false,
        message: "El catálogo PDF no existe o ya ha sido eliminado.",
      };
    }

    const deleted = await prisma.catalogPdf.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        deletedById: Number(session.user.id),
      },
    });

    // Eliminar el PDF de Cloudinary al borrar el registro
    await deleteCloudinaryFile(current.pdfUrl);

    // Obtener detalles adicionales para la bitácora
    const relationInfo = await prisma.catalogPdf.findUnique({
      where: { id: deleted.id },
      select: {
        pdfUrl: true,
        title: true,
        campaign: {
          select: {
            number: true,
            company: {
              select: { name: true },
            },
          },
        },
        brand: {
          select: { name: true },
        },
      },
    });

    await logActivity({
      userId: Number(session.user.id),
      action: "DELETE",
      entity: "CatalogPdf",
      entityId: deleted.id,
      details: {
        title: deleted.title,
        campaign: relationInfo?.campaign?.number,
        company: relationInfo?.campaign?.company?.name,
        brand: relationInfo?.brand?.name,
        pdfUrl: relationInfo?.pdfUrl,
      },
    });

    revalidatePath("/admin/campanias");
    return {
      success: true,
      message: "Catálogo PDF eliminado exitosamente.",
    };
  } catch (error: any) {
    console.error("Error al eliminar catálogo PDF:", error);
    return {
      success: false,
      message: error.message || "Ocurrió un error inesperado.",
    };
  }
}

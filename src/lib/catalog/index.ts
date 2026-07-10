"use server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { logActivity } from "@/lib/audit";
import { catalogPdfSchema } from "./schema";
import fs from "fs";
import path from "path";

async function savePdfFile(base64Str: string): Promise<string> {
  const match = base64Str.match(/^data:application\/pdf;base64,(.+)$/);
  if (!match) {
    throw new Error("Formato de archivo PDF inválido.");
  }
  const data = match[1];
  const buffer = Buffer.from(data, "base64");

  const uploadDir = path.join(process.cwd(), "public", "uploads", "catalogs");
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  const fileName = `pdf_${Date.now()}_${Math.random().toString(36).substring(2, 9)}.pdf`;
  const filePath = path.join(uploadDir, fileName);
  await fs.promises.writeFile(filePath, buffer);

  return `/uploads/catalogs/${fileName}`;
}

async function deletePdfFile(pdfUrl: string): Promise<void> {
  if (pdfUrl.startsWith("/uploads/catalogs/")) {
    const filePath = path.join(process.cwd(), "public", pdfUrl);
    try {
      if (fs.existsSync(filePath)) {
        await fs.promises.unlink(filePath);
      }
    } catch (error) {
      console.error("Error al eliminar el archivo PDF:", error);
    }
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
    let finalPdfUrl = validation.data.pdfUrl;

    // Verificar si ya existe en esa campaña y marca
    const existing = await prisma.catalogPdf.findFirst({
      where: {
        campaignId: validCampaignId,
        brandId: validBrandId,
      },
    });

    if (existing) {
      if (existing.deletedAt) {
        // Restaurar anterior
        let newFileUrl = finalPdfUrl;
        if (finalPdfUrl.startsWith("data:application/pdf;base64,")) {
          newFileUrl = await savePdfFile(finalPdfUrl);
        }

        const restored = await prisma.catalogPdf.update({
          where: { id: existing.id },
          data: {
            title: validTitle,
            pdfUrl: newFileUrl,
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

    // Guardar archivo si viene en base64
    if (finalPdfUrl.startsWith("data:application/pdf;base64,")) {
      finalPdfUrl = await savePdfFile(finalPdfUrl);
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
    let finalPdfUrl = validation.data.pdfUrl;

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

    // Si cambió el PDF y el nuevo es base64
    let oldPdfToDelete: string | null = null;
    if (finalPdfUrl.startsWith("data:application/pdf;base64,")) {
      if (current.pdfUrl.startsWith("/uploads/catalogs/")) {
        oldPdfToDelete = current.pdfUrl;
      }
      finalPdfUrl = await savePdfFile(finalPdfUrl);
    }

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

    // Eliminar archivo viejo si se reemplazó con éxito
    if (oldPdfToDelete) {
      await deletePdfFile(oldPdfToDelete);
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

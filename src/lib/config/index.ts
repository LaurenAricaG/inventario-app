"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { logActivity } from "@/lib/audit";
import { systemConfigSchema } from "./schema";
import fs from "fs/promises";
import path from "path";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

function extractCloudinaryPublicId(url: string): string | null {
  try {
    const match = url.match(/\/upload\/(?:v\d+\/)?(.+?)(?:\.[a-z0-9]+)?$/i);
    return match ? match[1] : null;
  } catch {
    return null;
  }
}

async function deleteOldLogoFile(logoPath: string) {
  if (!logoPath) return;

  if (logoPath.includes("res.cloudinary.com")) {
    const publicId = extractCloudinaryPublicId(logoPath);
    if (publicId) {
      try {
        await cloudinary.uploader.destroy(publicId, { resource_type: "image" });
      } catch (err) {
        console.error("Error al eliminar logo de Cloudinary:", err);
      }
    }
  } else if (logoPath.startsWith("/uploads/config/")) {
    const fullPath = path.join(process.cwd(), "public", logoPath);
    try {
      await fs.unlink(fullPath);
    } catch (err) {
      console.error("Error al eliminar logo antiguo del sistema:", err);
    }
  }
}

export async function getPublicSystemConfig() {
  try {
    let config = await prisma.systemConfig.findFirst();

    if (!config) {
      config = await prisma.systemConfig.create({
        data: {
          lock: true,
          systemName: "Mi empresa",
          whatsappNumber: "51987654321",
          showPricePublic: true,
          showStockPublic: true,
          showCatalogsPublic: true,
        },
      });
    }

    return config;
  } catch (error) {
    console.error("Error al obtener configuración pública:", error);
    return null;
  }
}

export async function getSystemConfigAction() {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return {
        success: false,
        message: "No autenticado.",
        data: null,
      };
    }

    // Obtener la primera configuración del sistema o crear una por defecto si no existe
    let config = await prisma.systemConfig.findFirst();

    if (!config) {
      config = await prisma.systemConfig.create({
        data: {
          lock: true,
          systemName: "Mi empresa",
          whatsappNumber: "51987654321",
          showPricePublic: true,
          showStockPublic: true,
          showCatalogsPublic: true,
        },
      });
    }

    return {
      success: true,
      message: "Configuración recuperada con éxito.",
      data: config,
    };
  } catch (error) {
    console.error("Error al obtener configuración:", error);
    return {
      success: false,
      message: "Error al recuperar la configuración del sistema.",
      data: null,
    };
  }
}

export async function updateSystemConfigAction(id: number, data: any) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return {
        success: false,
        message: "No autenticado. Por favor inicia sesión.",
      };
    }
    const permissions = session.user.permissions ?? [];

    // Validar permisos básicos
    if (!permissions.includes("config:read")) {
      return {
        success: false,
        message: "No autorizado para ver la configuración.",
      };
    }

    const validation = systemConfigSchema.safeParse(data);
    if (!validation.success) {
      const errorMsg =
        validation.error.issues[0]?.message ||
        "Datos de configuración inválidos.";
      return { success: false, message: errorMsg };
    }

    const existingConfig = await prisma.systemConfig.findUnique({
      where: { id },
    });

    if (!existingConfig) {
      return {
        success: false,
        message: "El registro de configuración no existe en el sistema.",
      };
    }

    // Validar permisos específicos de edición
    const hasEditPermission = permissions.includes("config:edit");
    const hasShowPermission = permissions.includes("config:show");

    // Si intenta cambiar datos de la empresa y no tiene config:edit, denegar
    const isCompanyInfoChanged =
      existingConfig.systemName !== validation.data.systemName ||
      existingConfig.systemLogoUrl !== validation.data.systemLogoUrl ||
      existingConfig.whatsappNumber !== validation.data.whatsappNumber;

    if (isCompanyInfoChanged && !hasEditPermission) {
      return {
        success: false,
        message:
          "No tienes permiso para modificar los datos de la empresa (config:edit).",
      };
    }

    // Si intenta cambiar opciones de visualización pública y no tiene config:show, denegar
    const isVisibilityChanged =
      existingConfig.showPricePublic !== validation.data.showPricePublic ||
      existingConfig.showStockPublic !== validation.data.showStockPublic ||
      existingConfig.showCatalogsPublic !== validation.data.showCatalogsPublic;

    if (isVisibilityChanged && !hasShowPermission) {
      return {
        success: false,
        message:
          "No tienes permiso para modificar las opciones de visibilidad pública (config:show).",
      };
    }

    // Gestionar logo antiguo si se cambió o removió
    if (
      existingConfig.systemLogoUrl &&
      existingConfig.systemLogoUrl !== validation.data.systemLogoUrl
    ) {
      await deleteOldLogoFile(existingConfig.systemLogoUrl);
    }

    const updatedConfig = await prisma.systemConfig.update({
      where: { id },
      data: {
        systemName: validation.data.systemName,
        systemLogoUrl: validation.data.systemLogoUrl,
        whatsappNumber: validation.data.whatsappNumber,
        showPricePublic: validation.data.showPricePublic,
        showStockPublic: validation.data.showStockPublic,
        showCatalogsPublic: validation.data.showCatalogsPublic,
      },
    });

    // Registrar actividad en bitácora
    await logActivity({
      userId: Number(session.user.id),
      action: "UPDATE",
      entity: "SystemConfig",
      entityId: id,
      details: {
        antes: {
          nombreSistema: existingConfig.systemName,
          logoUrl: existingConfig.systemLogoUrl || "Sin logo",
          whatsapp: existingConfig.whatsappNumber,
          mostrarPrecioPublico: existingConfig.showPricePublic ? "Sí" : "No",
          mostrarStockPublico: existingConfig.showStockPublic ? "Sí" : "No",
          mostrarCatalogosPublicos: existingConfig.showCatalogsPublic
            ? "Sí"
            : "No",
        },
        despues: {
          nombreSistema: updatedConfig.systemName,
          logoUrl: updatedConfig.systemLogoUrl || "Sin logo",
          whatsapp: updatedConfig.whatsappNumber,
          mostrarPrecioPublico: updatedConfig.showPricePublic ? "Sí" : "No",
          mostrarStockPublico: updatedConfig.showStockPublic ? "Sí" : "No",
          mostrarCatalogosPublicos: updatedConfig.showCatalogsPublic
            ? "Sí"
            : "No",
        },
      },
    });

    revalidatePath("/admin/configuracion");
    return {
      success: true,
      message: "Configuración del sistema actualizada con éxito.",
    };
  } catch (error) {
    console.error("Error al actualizar configuración:", error);
    return {
      success: false,
      message: "Error interno del servidor al actualizar la configuración.",
    };
  }
}

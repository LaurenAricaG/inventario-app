"use server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { logActivity } from "@/lib/audit";
import { brandSchema } from "./schema";
import fs from "fs/promises";
import path from "path";
import { deleteCloudinaryFile } from "@/lib/cloudinary";

async function saveLogoFile(base64Str: string): Promise<string> {
  const matches = base64Str.match(/^data:image\/([a-zA-Z0-9+]+);base64,(.+)$/);
  if (!matches) {
    throw new Error("Formato de imagen inválido.");
  }
  const ext = matches[1] === "jpeg" ? "jpg" : matches[1];
  const data = matches[2];
  const buffer = Buffer.from(data, "base64");

  const filename = `logo_${Date.now()}_${Math.random().toString(36).substring(2, 7)}.${ext}`;
  const uploadDir = path.join(process.cwd(), "public", "uploads", "brands");

  await fs.mkdir(uploadDir, { recursive: true });

  const filepath = path.join(uploadDir, filename);
  await fs.writeFile(filepath, buffer);

  return `/uploads/brands/${filename}`;
}

async function deleteLogoFile(logoPath: string | null | undefined) {
  if (!logoPath) return;

  if (logoPath.includes("res.cloudinary.com")) {
    await deleteCloudinaryFile(logoPath, "image");
  } else if (logoPath.startsWith("/uploads/brands/")) {
    const fullPath = path.join(process.cwd(), "public", logoPath);
    try {
      await fs.unlink(fullPath);
    } catch (err) {
      console.error("Error al eliminar archivo de logo antiguo:", err);
    }
  }
}

export async function createBrandAction(
  name: string,
  companyId: number,
  logoUrl?: string | null,
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

    if (!permissions.includes("brands:create")) {
      return {
        success: false,
        message: "No autorizado. No tienes permiso para crear marcas.",
      };
    }

    const validation = brandSchema.safeParse({ name, companyId, logoUrl });
    if (!validation.success) {
      const errorMsg =
        validation.error.issues[0]?.message ||
        "Nombre, empresa o logo inválido.";
      return { success: false, message: errorMsg };
    }

    const trimmedName = validation.data.name;
    const trimmedCompanyId = validation.data.companyId;
    const trimmedLogoUrl = validation.data.logoUrl;

    // Verificar si ya existe en esa empresa (incluyendo borrados lógicos para reactivarlos)
    const existing = await prisma.brand.findFirst({
      where: {
        name: { equals: trimmedName, mode: "insensitive" },
        companyId: trimmedCompanyId,
      },
    });

    if (existing) {
      if (existing.deletedAt) {
        // Si estaba eliminado lógicamente, lo restauramos
        const restored = await prisma.brand.update({
          where: { id: existing.id },
          data: {
            deletedAt: null,
            deletedById: null,
            updatedById: Number(session.user.id),
          },
        });

        await logActivity({
          userId: Number(session.user.id),
          action: "UPDATE",
          entity: "Brand",
          entityId: restored.id,
          details: { name: restored.name, restored: true },
        });

        revalidatePath("/admin/marcas");
        return {
          success: true,
          message: "La marca ya existía en esta empresa y ha sido restaurada.",
        };
      }
      return {
        success: false,
        message: "Ya existe una marca con ese nombre en esta empresa.",
      };
    }

    let finalLogoUrl = trimmedLogoUrl;
    if (trimmedLogoUrl && trimmedLogoUrl.startsWith("data:")) {
      finalLogoUrl = await saveLogoFile(trimmedLogoUrl);
    }

    const brand = await prisma.brand.create({
      data: {
        name: trimmedName,
        companyId: trimmedCompanyId,
        logoUrl: finalLogoUrl,
        createdById: Number(session.user.id),
      },
    });

    const company = await prisma.company.findUnique({
      where: { id: trimmedCompanyId },
      select: { name: true },
    });

    await logActivity({
      userId: Number(session.user.id),
      action: "CREATE",
      entity: "Brand",
      entityId: brand.id,
      details: {
        nombre: trimmedName,
        empresa: company ? `${company.name} (ID: ${trimmedCompanyId})` : `ID: ${trimmedCompanyId}`,
        logoUrl: finalLogoUrl,
      },
    });

    revalidatePath("/admin/marcas");
    return { success: true, message: "Marca creada con éxito." };
  } catch (error: any) {
    console.error("Error al crear marca:", error);
    if (error.code === "P2002") {
      return {
        success: false,
        message: "Ya existe una marca con ese nombre en esta empresa.",
      };
    }
    return {
      success: false,
      message: "Error interno del servidor al crear la marca.",
    };
  }
}

export async function updateBrandAction(
  id: number,
  name: string,
  companyId: number,
  logoUrl?: string | null,
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

    if (!permissions.includes("brands:update")) {
      return {
        success: false,
        message: "No autorizado. No tienes permiso para editar marcas.",
      };
    }

    const validation = brandSchema.safeParse({ name, companyId, logoUrl });
    if (!validation.success) {
      const errorMsg =
        validation.error.issues[0]?.message ||
        "Nombre, empresa o logo inválido.";
      return { success: false, message: errorMsg };
    }

    const trimmedName = validation.data.name;
    const trimmedCompanyId = validation.data.companyId;
    const trimmedLogoUrl = validation.data.logoUrl;

    // Verificar si existe otra marca duplicada en la misma empresa
    const duplicate = await prisma.brand.findFirst({
      where: {
        id: { not: id },
        name: { equals: trimmedName, mode: "insensitive" },
        companyId: trimmedCompanyId,
        deletedAt: null,
      },
    });

    if (duplicate) {
      return {
        success: false,
        message: "Ya existe otra marca con ese nombre en esta empresa.",
      };
    }

    let finalLogoUrl = trimmedLogoUrl;
    const existingBrand = await prisma.brand.findUnique({
      where: { id },
      select: { name: true, companyId: true, logoUrl: true },
    });

    if (existingBrand && existingBrand.logoUrl && existingBrand.logoUrl !== trimmedLogoUrl) {
      await deleteLogoFile(existingBrand.logoUrl);
    }

    if (trimmedLogoUrl && trimmedLogoUrl.startsWith("data:")) {
      finalLogoUrl = await saveLogoFile(trimmedLogoUrl);
    }

    await prisma.brand.update({
      where: { id },
      data: {
        name: trimmedName,
        companyId: trimmedCompanyId,
        logoUrl: finalLogoUrl,
        updatedById: Number(session.user.id),
      },
    });

    const [oldCompany, newCompany] = await Promise.all([
      existingBrand?.companyId
        ? prisma.company.findUnique({
          where: { id: existingBrand.companyId },
          select: { name: true },
        })
        : null,
      prisma.company.findUnique({
        where: { id: trimmedCompanyId },
        select: { name: true },
      }),
    ]);

    await logActivity({
      userId: Number(session.user.id),
      action: "UPDATE",
      entity: "Brand",
      entityId: id,
      details: {
        antes: {
          nombre: existingBrand?.name,
          empresa: oldCompany ? `${oldCompany.name} (ID: ${existingBrand?.companyId})` : `ID: ${existingBrand?.companyId}`,
          logoUrl: existingBrand?.logoUrl,
        },
        despues: {
          nombre: trimmedName,
          empresa: newCompany ? `${newCompany.name} (ID: ${trimmedCompanyId})` : `ID: ${trimmedCompanyId}`,
          logoUrl: finalLogoUrl,
        },
      },
    });

    revalidatePath("/admin/marcas");
    return { success: true, message: "Marca actualizada con éxito." };
  } catch (error: any) {
    console.error("Error al actualizar marca:", error);
    if (error.code === "P2002") {
      return {
        success: false,
        message: "Ya existe otra marca con ese nombre en esta empresa.",
      };
    }
    return {
      success: false,
      message: "Error interno del servidor al actualizar la marca.",
    };
  }
}

export async function deleteBrandAction(id: number) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return {
        success: false,
        message: "No autenticado. Por favor inicia sesión.",
      };
    }
    const permissions = session.user.permissions ?? [];

    if (!permissions.includes("brands:delete")) {
      return {
        success: false,
        message: "No autorizado. No tienes permiso para eliminar marcas.",
      };
    }

    // Verificar si la marca está siendo usada por algún producto activo
    const productCount = await prisma.product.count({
      where: {
        brandId: id,
        deletedAt: null,
      },
    });

    if (productCount > 0) {
      return {
        success: false,
        isWarning: true,
        message: `No se puede eliminar la marca porque está asociada a ${productCount} producto(s) activo(s).`,
      };
    }

    const existingBrand = await prisma.brand.findUnique({
      where: { id },
      select: { logoUrl: true },
    });

    if (existingBrand?.logoUrl) {
      await deleteLogoFile(existingBrand.logoUrl);
    }

    // Borrado lógico
    const deleted = await prisma.brand.update({
      where: { id },
      data: {
        logoUrl: null,
        deletedAt: new Date(),
        deletedById: Number(session.user.id),
      },
    });

    await logActivity({
      userId: Number(session.user.id),
      action: "DELETE",
      entity: "Brand",
      entityId: id,
      details: { name: deleted.name },
    });

    revalidatePath("/admin/marcas");
    return { success: true, message: "Marca eliminada con éxito." };
  } catch (error) {
    console.error("Error al eliminar marca:", error);
    return {
      success: false,
      message: "Error interno del servidor al eliminar la marca.",
    };
  }
}

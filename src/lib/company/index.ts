"use server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { logActivity } from "@/lib/audit";
import { companySchema } from "./schema";
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
  const uploadDir = path.join(process.cwd(), "public", "uploads", "companies");

  await fs.mkdir(uploadDir, { recursive: true });

  const filepath = path.join(uploadDir, filename);
  await fs.writeFile(filepath, buffer);

  return `/uploads/companies/${filename}`;
}

async function deleteLogoFile(logoPath: string | null | undefined) {
  if (!logoPath) return;

  if (logoPath.includes("res.cloudinary.com")) {
    await deleteCloudinaryFile(logoPath, "image");
  } else if (logoPath.startsWith("/uploads/companies/")) {
    const fullPath = path.join(process.cwd(), "public", logoPath);
    try {
      await fs.unlink(fullPath);
    } catch (err) {
      console.error("Error al eliminar archivo de logo antiguo:", err);
    }
  }
}

export async function createCompanyAction(name: string, logoUrl?: string | null) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return {
        success: false,
        message: "No autenticado. Por favor inicia sesión.",
      };
    }
    const permissions = session.user.permissions ?? [];

    if (!permissions.includes("companies:create")) {
      return {
        success: false,
        message: "No autorizado. No tienes permiso para crear empresas.",
      };
    }

    const validation = companySchema.safeParse({ name, logoUrl });
    if (!validation.success) {
      const errorMsg =
        validation.error.issues[0]?.message || "Nombre o logo inválido.";
      return { success: false, message: errorMsg };
    }

    const trimmedName = validation.data.name;
    const trimmedLogoUrl = validation.data.logoUrl;

    // Verificar si ya existe (incluyendo borrados lógicos para reactivarlos o evitar duplicados)
    const existing = await prisma.company.findFirst({
      where: {
        name: { equals: trimmedName, mode: "insensitive" },
      },
    });

    if (existing) {
      if (existing.deletedAt) {
        // Si estaba eliminado lógicamente, lo restauramos
        const restored = await prisma.company.update({
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
          entity: "Company",
          entityId: restored.id,
          details: { name: restored.name, restored: true },
        });

        revalidatePath("/admin/empresas");
        return {
          success: true,
          message: "La empresa ya existía y ha sido restaurada.",
        };
      }
      return {
        success: false,
        message: "Ya existe una empresa con ese nombre.",
      };
    }

    let finalLogoUrl = trimmedLogoUrl;
    if (trimmedLogoUrl && trimmedLogoUrl.startsWith("data:")) {
      finalLogoUrl = await saveLogoFile(trimmedLogoUrl);
    }

    const company = await prisma.company.create({
      data: {
        name: trimmedName,
        logoUrl: finalLogoUrl,
        createdById: Number(session.user.id),
      },
    });

    await logActivity({
      userId: Number(session.user.id),
      action: "CREATE",
      entity: "Company",
      entityId: company.id,
      details: { name: trimmedName, logoUrl: finalLogoUrl },
    });

    revalidatePath("/admin/empresas");
    return { success: true, message: "Empresa creada con éxito." };
  } catch (error: any) {
    console.error("Error al crear empresa:", error);
    // Controlar el error único de prisma P2002
    if (error.code === "P2002") {
      return {
        success: false,
        message: "Ya existe una empresa con ese nombre.",
      };
    }
    return {
      success: false,
      message: "Error interno del servidor al crear la empresa.",
    };
  }
}

export async function updateCompanyAction(id: number, name: string, logoUrl?: string | null) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return {
        success: false,
        message: "No autenticado. Por favor inicia sesión.",
      };
    }
    const permissions = session.user.permissions ?? [];

    if (!permissions.includes("companies:update")) {
      return {
        success: false,
        message: "No autorizado. No tienes permiso para editar empresas.",
      };
    }
    const validation = companySchema.safeParse({ name, logoUrl });
    if (!validation.success) {
      const errorMsg =
        validation.error.issues[0]?.message || "Nombre o logo inválido.";
      return { success: false, message: errorMsg };
    }

    const trimmedName = validation.data.name;
    const trimmedLogoUrl = validation.data.logoUrl;

    // Verificar si existe otro con el mismo nombre
    const duplicate = await prisma.company.findFirst({
      where: {
        id: { not: id },
        name: { equals: trimmedName, mode: "insensitive" },
        deletedAt: null,
      },
    });

    if (duplicate) {
      return {
        success: false,
        message: "Ya existe otra empresa con ese nombre.",
      };
    }

    let finalLogoUrl = trimmedLogoUrl;
    const existingCompany = await prisma.company.findUnique({
      where: { id },
      select: { name: true, logoUrl: true },
    });

    if (existingCompany && existingCompany.logoUrl && existingCompany.logoUrl !== trimmedLogoUrl) {
      await deleteLogoFile(existingCompany.logoUrl);
    }

    if (trimmedLogoUrl && trimmedLogoUrl.startsWith("data:")) {
      finalLogoUrl = await saveLogoFile(trimmedLogoUrl);
    }

    await prisma.company.update({
      where: { id },
      data: {
        name: trimmedName,
        logoUrl: finalLogoUrl,
        updatedById: Number(session.user.id),
      },
    });

    await logActivity({
      userId: Number(session.user.id),
      action: "UPDATE",
      entity: "Company",
      entityId: id,
      details: {
        antes: { name: existingCompany?.name, logoUrl: existingCompany?.logoUrl },
        despues: { name: trimmedName, logoUrl: finalLogoUrl },
      },
    });

    revalidatePath("/admin/empresas");
    return { success: true, message: "Empresa actualizada con éxito." };
  } catch (error: any) {
    console.error("Error al actualizar empresa:", error);
    if (error.code === "P2002") {
      return {
        success: false,
        message: "Ya existe otra empresa con ese nombre.",
      };
    }
    return {
      success: false,
      message: "Error interno del servidor al actualizar la empresa.",
    };
  }
}

export async function deleteCompanyAction(id: number) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return {
        success: false,
        message: "No autenticado. Por favor inicia sesión.",
      };
    }
    const permissions = session.user.permissions ?? [];

    if (!permissions.includes("companies:delete")) {
      return {
        success: false,
        message: "No autorizado. No tienes permiso para eliminar empresas.",
      };
    }

    // Verificar si la empresa tiene marcas asociadas activas
    const brandCount = await prisma.brand.count({
      where: {
        companyId: id,
        deletedAt: null,
      },
    });

    if (brandCount > 0) {
      return {
        success: false,
        isWarning: true,
        message: `No se puede eliminar la empresa porque está asignada a ${brandCount} marca(s).`,
      };
    }

    // Verificar si la empresa está siendo usada por algún producto activo
    const productCount = await prisma.product.count({
      where: {
        brand: {
          companyId: id,
        },
        deletedAt: null,
      },
    });

    if (productCount > 0) {
      return {
        success: false,
        isWarning: true,
        message: `No se puede eliminar la empresa porque está asociada a ${productCount} producto(s) activo(s).`,
      };
    }

    const existingCompany = await prisma.company.findUnique({
      where: { id },
      select: { logoUrl: true },
    });

    if (existingCompany?.logoUrl) {
      await deleteLogoFile(existingCompany.logoUrl);
    }

    // Borrado lógico
    const deleted = await prisma.company.update({
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
      entity: "Company",
      entityId: id,
      details: { name: deleted.name },
    });

    revalidatePath("/admin/empresas");
    return { success: true, message: "Empresa eliminada con éxito." };
  } catch (error) {
    console.error("Error al eliminar empresa:", error);
    return {
      success: false,
      message: "Error interno del servidor al eliminar la empresa.",
    };
  }
}

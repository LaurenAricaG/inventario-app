"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { logActivity } from "@/lib/audit";
import { productSchema } from "./schema";
import fs from "fs/promises";
import path from "path";
import { deleteCloudinaryFile } from "@/lib/cloudinary";

async function deleteProductImageFile(imageUrl: string | null | undefined) {
  if (!imageUrl) return;

  if (imageUrl.includes("res.cloudinary.com")) {
    await deleteCloudinaryFile(imageUrl, "image");
  } else if (imageUrl.startsWith("/uploads/products/")) {
    const fullPath = path.join(process.cwd(), "public", imageUrl);
    try {
      await fs.unlink(fullPath);
    } catch (err) {
      console.error("Error al eliminar archivo de imagen de producto:", err);
    }
  }
}

export async function createProductAction(data: any) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return {
        success: false,
        message: "No autenticado. Por favor inicia sesión.",
      };
    }
    const permissions = session.user.permissions ?? [];

    if (!permissions.includes("products:create")) {
      return {
        success: false,
        message: "No autorizado. No tienes permiso para crear productos.",
      };
    }

    const validation = productSchema.safeParse(data);
    if (!validation.success) {
      const errorMsg =
        validation.error.issues[0]?.message || "Datos de producto inválidos.";
      return { success: false, message: errorMsg };
    }

    const {
      name,
      brandId,
      categoryId,
      genderSegmentId,
      code,
      description,
      price,
      costPrice,
      catalogPrice,
      stock,
      isAvailable,
      images,
    } = validation.data;

    // Verificar duplicado por código si existe
    if (code) {
      const existingCode = await prisma.product.findFirst({
        where: {
          code: { equals: code, mode: "insensitive" },
          deletedAt: null,
        },
      });
      if (existingCode) {
        return {
          success: false,
          message: "Ya existe un producto con ese código de barras o referencia.",
        };
      }
    }

    // Crear producto e imágenes asociadas
    const product = await prisma.product.create({
      data: {
        name,
        brandId,
        categoryId,
        genderSegmentId,
        code: code || null,
        description: description || null,
        price,
        costPrice: costPrice || null,
        catalogPrice: catalogPrice || null,
        stock,
        isAvailable,
        createdById: Number(session.user.id),
        images: {
          create: images.map((img) => ({
            url: img.url,
            isMain: img.isMain,
            position: img.position,
          })),
        },
        stockMovements: stock > 0 ? {
          create: {
            quantity: stock,
            type: "INPUT",
            reason: "ADJUSTMENT",
            notes: "Registro de stock inicial al crear producto",
            createdById: Number(session.user.id),
          }
        } : undefined,
      },
      include: {
        images: true,
        brand: true,
        category: true,
        genderSegment: true,
      },
    });

    // Registrar actividad en bitácora
    await logActivity({
      userId: Number(session.user.id),
      action: "CREATE",
      entity: "Product",
      entityId: product.id,
      details: {
        nombre: product.name,
        codigo: product.code || "Sin código",
        descripcion: product.description || "Sin descripción",
        precioCatalogo: product.catalogPrice || "No registrado",
        precioVenta: product.price,
        precioCosto: product.costPrice || "No registrado",
        stock: product.stock,
        marca: `${product.brand.name} (ID: ${product.brandId})`,
        categoria: `${product.category.name} (ID: ${product.categoryId})`,
        genero: product.genderSegment ? `${product.genderSegment.name} (ID: ${product.genderSegmentId})` : "Todos / Unisex",
        disponible: product.isAvailable ? "Sí" : "No",
        imagenes: product.images.map((img) => img.url),
      },
    });

    revalidatePath("/admin/productos");
    return { success: true, message: "Producto creado con éxito." };
  } catch (error: any) {
    console.error("Error al crear producto:", error);
    return {
      success: false,
      message: "Error interno del servidor al crear el producto.",
    };
  }
}

export async function updateProductAction(id: number, data: any) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return {
        success: false,
        message: "No autenticado. Por favor inicia sesión.",
      };
    }
    const permissions = session.user.permissions ?? [];

    if (!permissions.includes("products:update")) {
      return {
        success: false,
        message: "No autorizado. No tienes permiso para editar productos.",
      };
    }

    const validation = productSchema.safeParse(data);
    if (!validation.success) {
      const errorMsg =
        validation.error.issues[0]?.message || "Datos de producto inválidos.";
      return { success: false, message: errorMsg };
    }

    const {
      name,
      brandId,
      categoryId,
      genderSegmentId,
      code,
      description,
      price,
      costPrice,
      catalogPrice,
      stock,
      isAvailable,
      images,
    } = validation.data;

    // Verificar duplicado por código
    if (code) {
      const duplicateCode = await prisma.product.findFirst({
        where: {
          id: { not: id },
          code: { equals: code, mode: "insensitive" },
          deletedAt: null,
        },
      });
      if (duplicateCode) {
        return {
          success: false,
          message: "Ya existe otro producto con ese código de barras o referencia.",
        };
      }
    }

    const existingProduct = await prisma.product.findUnique({
      where: { id },
      include: {
        images: true,
        brand: true,
        category: true,
        genderSegment: true,
      },
    });

    if (!existingProduct || existingProduct.deletedAt) {
      return {
        success: false,
        message: "El producto no existe o fue eliminado.",
      };
    }

    // Gestionar imágenes que fueron eliminadas en disco
    const newImageUrls = new Set(images.map((img) => img.url));
    const imagesToDelete = existingProduct.images.filter(
      (img) => !newImageUrls.has(img.url)
    );

    for (const img of imagesToDelete) {
      await deleteProductImageFile(img.url);
    }

    // Actualizar producto e imágenes
    // Para simplificar, borramos las relaciones existentes y creamos las nuevas
    await prisma.productImage.deleteMany({
      where: { productId: id },
    });

    const updatedProduct = await prisma.product.update({
      where: { id },
      data: {
        name,
        brandId,
        categoryId,
        genderSegmentId,
        code: code || null,
        description: description || null,
        price,
        costPrice: costPrice || null,
        catalogPrice: catalogPrice || null,
        stock,
        isAvailable,
        updatedById: Number(session.user.id),
        images: {
          create: images.map((img) => ({
            url: img.url,
            isMain: img.isMain,
            position: img.position,
          })),
        },
      },
      include: {
        images: true,
        brand: true,
        category: true,
        genderSegment: true,
      },
    });

    await logActivity({
      userId: Number(session.user.id),
      action: "UPDATE",
      entity: "Product",
      entityId: id,
      details: {
        antes: {
          nombre: existingProduct.name,
          codigo: existingProduct.code || "Sin código",
          descripcion: existingProduct.description || "Sin descripción",
          precioCatalogo: existingProduct.catalogPrice || "No registrado",
          precioVenta: existingProduct.price,
          precioCosto: existingProduct.costPrice || "No registrado",
          stock: existingProduct.stock,
          marca: `${existingProduct.brand.name} (ID: ${existingProduct.brandId})`,
          categoria: `${existingProduct.category.name} (ID: ${existingProduct.categoryId})`,
          genero: existingProduct.genderSegment ? `${existingProduct.genderSegment.name} (ID: ${existingProduct.genderSegmentId})` : "Todos / Unisex",
          disponible: existingProduct.isAvailable ? "Sí" : "No",
          imagenes: existingProduct.images.map((img) => img.url),
        },
        despues: {
          nombre: updatedProduct.name,
          codigo: updatedProduct.code || "Sin código",
          descripcion: updatedProduct.description || "Sin descripción",
          precioCatalogo: updatedProduct.catalogPrice || "No registrado",
          precioVenta: updatedProduct.price,
          precioCosto: updatedProduct.costPrice || "No registrado",
          stock: updatedProduct.stock,
          marca: `${updatedProduct.brand.name} (ID: ${updatedProduct.brandId})`,
          categoria: `${updatedProduct.category.name} (ID: ${updatedProduct.categoryId})`,
          genero: updatedProduct.genderSegment ? `${updatedProduct.genderSegment.name} (ID: ${updatedProduct.genderSegmentId})` : "Todos / Unisex",
          disponible: updatedProduct.isAvailable ? "Sí" : "No",
          imagenes: updatedProduct.images.map((img) => img.url),
        },
      },
    });

    revalidatePath("/admin/productos");
    return { success: true, message: "Producto actualizado con éxito." };
  } catch (error: any) {
    console.error("Error al actualizar producto:", error);
    return {
      success: false,
      message: "Error interno del servidor al actualizar el producto.",
    };
  }
}

export async function deleteProductAction(id: number) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return {
        success: false,
        message: "No autenticado. Por favor inicia sesión.",
      };
    }
    const permissions = session.user.permissions ?? [];

    if (!permissions.includes("products:delete")) {
      return {
        success: false,
        message: "No autorizado. No tienes permiso para eliminar productos.",
      };
    }

    // Verificar si el producto tiene ventas directas asociadas
    const salesCount = await prisma.directSaleItem.count({
      where: {
        productId: id,
        directSale: { deletedAt: null },
      },
    });

    if (salesCount > 0) {
      return {
        success: false,
        message: `No se puede eliminar. Este producto está asociado a ${salesCount} venta(s) directa(s) realizada(s).`,
      };
    }

    const existingProduct = await prisma.product.findUnique({
      where: { id },
      include: { images: true },
    });

    if (existingProduct) {
      for (const img of existingProduct.images) {
        await deleteProductImageFile(img.url);
      }
    }

    // Borrado lógico del producto
    const deleted = await prisma.product.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        deletedById: Number(session.user.id),
      },
    });

    await logActivity({
      userId: Number(session.user.id),
      action: "DELETE",
      entity: "Product",
      entityId: id,
      details: { name: deleted.name },
    });

    revalidatePath("/admin/productos");
    return { success: true, message: "Producto eliminado con éxito." };
  } catch (error: any) {
    console.error("Error al eliminar producto:", error);
    return {
      success: false,
      message: "Error interno del servidor al eliminar el producto.",
    };
  }
}

export async function getProductsReportDataAction(search?: string) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return { success: false, message: "No autenticado. Por favor inicia sesión.", data: null };
    }
    const permissions = session.user.permissions ?? [];
    if (!permissions.includes("products:read")) {
      return { success: false, message: "No autorizado para ver productos.", data: null };
    }

    const where: any = {
      deletedAt: null,
    };

    if (search && search.trim() !== "") {
      const term = search.trim();
      where.OR = [
        { name: { contains: term, mode: "insensitive" } },
        { code: { contains: term, mode: "insensitive" } },
        { brand: { name: { contains: term, mode: "insensitive" } } },
        { category: { name: { contains: term, mode: "insensitive" } } },
      ];
    }

    const products = await prisma.product.findMany({
      where,
      include: {
        brand: {
          include: {
            company: true,
          },
        },
        category: true,
        genderSegment: true,
      },
      orderBy: [
        { brand: { name: "asc" } },
        { name: "asc" },
      ],
    });

    return {
      success: true,
      data: products.map((p) => ({
        id: p.id,
        code: p.code,
        name: p.name,
        description: p.description,
        price: p.price,
        catalogPrice: p.catalogPrice,
        costPrice: permissions.includes("products:cost-read") ? p.costPrice : null,
        stock: p.stock,
        isAvailable: p.isAvailable,
        brand: {
          id: p.brand.id,
          name: p.brand.name,
          company: {
            id: p.brand.company.id,
            name: p.brand.company.name,
          },
        },
        category: {
          id: p.category.id,
          name: p.category.name,
        },
        genderSegment: p.genderSegment
          ? {
              id: p.genderSegment.id,
              name: p.genderSegment.name,
            }
          : null,
      })),
    };
  } catch (error: any) {
    console.error("Error al obtener datos para el reporte de productos:", error);
    return { success: false, message: "Error al generar datos del reporte.", data: null };
  }
}


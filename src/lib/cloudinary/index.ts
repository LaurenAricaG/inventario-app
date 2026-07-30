"use server";

import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Extrae el Public ID de una URL de Cloudinary.
 * Ejemplo: https://res.cloudinary.com/demo/image/upload/v123456/inventario/companies/logo_123.png
 * Public ID -> inventario/companies/logo_123
 */
export async function extractCloudinaryPublicId(url: string): Promise<string | null> {
  if (!url || !url.includes("res.cloudinary.com")) return null;
  try {
    const match = url.match(/\/upload\/(?:v\d+\/)?(.+?)(?:\.[a-z0-9]+)?$/i);
    return match ? match[1] : null;
  } catch {
    return null;
  }
}

/**
 * Elimina un archivo de Cloudinary por su URL completa.
 */
export async function deleteCloudinaryFile(
  url: string,
  resourceType: "image" | "raw" | "video" = "image",
): Promise<boolean> {
  if (!url || !url.includes("res.cloudinary.com")) return false;

  const publicId = await extractCloudinaryPublicId(url);
  if (!publicId) return false;

  try {
    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType,
    });
    return result.result === "ok";
  } catch (err) {
    console.error("Error al eliminar archivo de Cloudinary:", err);
    return false;
  }
}

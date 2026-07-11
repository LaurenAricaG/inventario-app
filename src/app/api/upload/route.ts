import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json(
        { error: "No autenticado. Por favor inicia sesión." },
        { status: 401 },
      );
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const type = formData.get("type") as string | null;

    if (!file) {
      return NextResponse.json(
        { error: "No se proporcionó ningún archivo." },
        { status: 400 },
      );
    }

    const imageTypes = ["system-logo", "company-logo", "brand-logo", "product-image"];
    let folder = "inventario/catalogs";
    let resourceType: "image" | "raw" = "image"; // PDFs se suben como 'image' para que el navegador los muestre inline

    if (type && imageTypes.includes(type)) {
      const allowedTypes = [
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/webp",
        "image/gif",
        "image/svg+xml",
      ];
      const allowedExtensions = [".jpg", ".jpeg", ".png", ".webp", ".gif", ".svg"];
      const fileType = file.type;
      const fileNameLower = file.name.toLowerCase();

      const hasValidExt = allowedExtensions.some((ext) => fileNameLower.endsWith(ext));
      const hasValidType = allowedTypes.includes(fileType);

      if (!hasValidType && !hasValidExt) {
        return NextResponse.json(
          {
            error:
              "Formato de archivo no permitido. Solo se aceptan imágenes (PNG, JPG, WEBP, GIF, SVG).",
          },
          { status: 400 },
        );
      }

      resourceType = "image";

      if (type === "system-logo") {
        folder = "inventario/config";
      } else if (type === "company-logo") {
        folder = "inventario/companies";
      } else if (type === "brand-logo") {
        folder = "inventario/brands";
      } else if (type === "product-image") {
        folder = "inventario/products";
      }
    } else {
      if (
        file.type !== "application/pdf" &&
        !file.name.toLowerCase().endsWith(".pdf")
      ) {
        return NextResponse.json(
          {
            error:
              "Formato de archivo no permitido. Solo se aceptan archivos PDF (.pdf).",
          },
          { status: 400 },
        );
      }
    }

    // Convertir el archivo a Buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Subir a Cloudinary usando upload_stream
    const uploadResult = await new Promise<{ secure_url: string }>(
      (resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          {
            folder,
            resource_type: resourceType,
          },
          (error, result) => {
            if (error || !result) {
              reject(error ?? new Error("Error desconocido al subir a Cloudinary."));
            } else {
              resolve(result as { secure_url: string });
            }
          },
        );
        stream.end(buffer);
      },
    );

    return NextResponse.json({ url: uploadResult.secure_url });
  } catch (error: unknown) {
    console.error("Error en API de subida de archivos:", error);
    const message = error instanceof Error ? error.message : "Error al subir el archivo.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

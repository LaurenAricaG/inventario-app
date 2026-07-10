import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import fs from "fs";
import path from "path";

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

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    let folderName = "catalogs";
    let extension = ".pdf";
    let prefix = "pdf";

    const imageTypes = ["company-logo", "brand-logo", "product-image"];

    if (type && imageTypes.includes(type)) {
      const allowedTypes = [
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/webp",
        "image/gif",
        "image/svg+xml",
      ];
      const allowedExtensions = [
        ".jpg",
        ".jpeg",
        ".png",
        ".webp",
        ".gif",
        ".svg",
      ];
      const fileType = file.type;
      const fileNameLower = file.name.toLowerCase();

      const hasValidExt = allowedExtensions.some((ext) =>
        fileNameLower.endsWith(ext),
      );
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

      if (type === "company-logo") {
        folderName = "companies";
        prefix = "logo";
      } else if (type === "brand-logo") {
        folderName = "brands";
        prefix = "logo";
      } else if (type === "product-image") {
        folderName = "products";
        prefix = "prod";
      }

      const matchExt = fileNameLower.match(/\.[a-z0-9]+$/);
      extension = matchExt ? matchExt[0] : ".png";
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

    const uploadDir = path.join(process.cwd(), "public", "uploads", folderName);
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const fileName = `${prefix}_${Date.now()}_${Math.random().toString(36).substring(2, 9)}${extension}`;
    const filePath = path.join(uploadDir, fileName);
    await fs.promises.writeFile(filePath, buffer);

    const fileUrl = `/uploads/${folderName}/${fileName}`;
    return NextResponse.json({ url: fileUrl });
  } catch (error: any) {
    console.error("Error en API de subida de archivos:", error);
    return NextResponse.json(
      { error: error.message || "Error al subir el archivo." },
      { status: 500 },
    );
  }
}

"use client";

import { useState, useRef, ChangeEvent, DragEvent, useEffect } from "react";
import { toast } from "sonner";
import {
  FiUploadCloud,
  FiLink,
  FiTrash2,
  FiStar,
  FiArrowLeft,
  FiArrowRight,
} from "react-icons/fi";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { cn } from "@/utils/cn.utils";

export interface UploadedImage {
  url: string;
  isMain: boolean;
  position: number;
  file?: File; // Contiene el archivo local si aún no ha sido subido
}

interface MultiImageUploadProps {
  value: UploadedImage[];
  onChange: (value: UploadedImage[]) => void;
  disabled?: boolean;
  maxImages?: number;
  maxSizeInMB?: number;
}

export default function MultiImageUpload({
  value = [],
  onChange,
  disabled = false,
  maxImages = 5,
  maxSizeInMB = 5,
}: MultiImageUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [urlInput, setUrlInput] = useState("");
  const [uploadTab, setUploadTab] = useState<"file" | "url">("file");

  const valueRef = useRef(value);
  useEffect(() => {
    valueRef.current = value;
  }, [value]);

  // Limpiar objectURLs de archivos locales cuando el componente se desmonte
  useEffect(() => {
    return () => {
      valueRef.current.forEach((img) => {
        if (img.file && img.url.startsWith("blob:")) {
          URL.revokeObjectURL(img.url);
        }
      });
    };
  }, []);

  const handleSelectFile = (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error(`El archivo "${file.name}" no es una imagen válida.`);
      return;
    }
    if (file.size > maxSizeInMB * 1024 * 1024) {
      toast.error(
        `La imagen "${file.name}" supera el límite de ${maxSizeInMB}MB.`,
      );
      return;
    }

    const tempUrl = URL.createObjectURL(file);
    const isFirst = value.length === 0;

    const newImage: UploadedImage = {
      url: tempUrl,
      file: file,
      isMain: isFirst,
      position: value.length,
    };

    onChange([...value, newImage]);
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    if (value.length + files.length > maxImages) {
      toast.error(
        `Solo puedes seleccionar un máximo de ${maxImages} imágenes.`,
      );
      return;
    }

    files.forEach((file) => handleSelectFile(file));
    e.target.value = ""; // Limpiar input
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (!disabled) setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (disabled) return;

    const files = Array.from(e.dataTransfer.files || []);
    if (files.length === 0) return;

    if (value.length + files.length > maxImages) {
      toast.error(
        `Solo puedes seleccionar un máximo de ${maxImages} imágenes.`,
      );
      return;
    }

    files.forEach((file) => handleSelectFile(file));
  };

  const handleAddUrl = () => {
    if (!urlInput.trim()) return;
    const isUrl = /^https?:\/\/[^\s$.?#].[^\s]*$/i.test(urlInput);
    if (!isUrl) {
      toast.error("Por favor ingresa una URL de imagen válida.");
      return;
    }

    if (value.length >= maxImages) {
      toast.error(`Solo puedes subir un máximo de ${maxImages} imágenes.`);
      return;
    }

    const isFirst = value.length === 0;
    const newImage: UploadedImage = {
      url: urlInput.trim(),
      isMain: isFirst,
      position: value.length,
    };

    onChange([...value, newImage]);
    setUrlInput("");
  };

  const handleRemoveImage = (index: number) => {
    const targetImg = value[index];
    const newImages = value.filter((_, idx) => idx !== index);

    // Revocar el objectURL local si es un archivo pendiente
    if (targetImg.file && targetImg.url.startsWith("blob:")) {
      URL.revokeObjectURL(targetImg.url);
    }

    // Ajustar posiciones
    const adjustedImages = newImages.map((img, idx) => ({
      ...img,
      position: idx,
    }));

    // Si la imagen eliminada era la principal y quedan más imágenes, marcar la primera como principal
    if (targetImg.isMain && adjustedImages.length > 0) {
      adjustedImages[0].isMain = true;
    }

    onChange(adjustedImages);
  };

  const handleSetMain = (index: number) => {
    const nextImages = value.map((img, idx) => ({
      ...img,
      isMain: idx === index,
    }));
    onChange(nextImages);
  };

  const handleMove = (index: number, direction: "left" | "right") => {
    if (direction === "left" && index === 0) return;
    if (direction === "right" && index === value.length - 1) return;

    const targetIndex = direction === "left" ? index - 1 : index + 1;
    const nextImages = [...value];

    // Intercambiar imágenes
    const temp = nextImages[index];
    nextImages[index] = nextImages[targetIndex];
    nextImages[targetIndex] = temp;

    // Reasignar posiciones
    const reordered = nextImages.map((img, idx) => ({
      ...img,
      position: idx,
    }));

    onChange(reordered);
  };

  return (
    <div className="space-y-4">
      {/* Upload Toggle tabs */}
      <div className="flex p-1 bg-bg-surface rounded-xl border border-border-default/50 max-w-60 select-none">
        <button
          type="button"
          disabled={disabled}
          onClick={() => setUploadTab("file")}
          className={cn(
            "flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed",
            uploadTab === "file"
              ? "bg-bg-card text-text-accent shadow-xs border border-border-soft"
              : "border border-transparent text-text-secondary hover:text-text-primary",
          )}
        >
          Subir archivos
        </button>
        <button
          type="button"
          disabled={disabled}
          onClick={() => setUploadTab("url")}
          className={cn(
            "flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed",
            uploadTab === "url"
              ? "bg-bg-card text-text-accent shadow-xs border border-border-soft"
              : "border border-transparent text-text-secondary hover:text-text-primary",
          )}
        >
          Pegar URL
        </button>
      </div>

      {/* Upload Zone */}
      {uploadTab === "file"
        ? value.length < maxImages && (
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={cn(
                "flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-border-strong hover:border-beauty-500 rounded-2xl bg-bg-surface hover:bg-beauty-50/10 dark:hover:bg-beauty-950/5 cursor-pointer text-center transition-all duration-300 select-none group",
                isDragging && "border-beauty-600 bg-beauty-50/20",
                disabled && "opacity-50 cursor-not-allowed pointer-events-none",
              )}
            >
              <label className="flex flex-col items-center justify-center w-full h-full cursor-pointer">
                <div className="p-2.5 bg-bg-card border border-border-soft rounded-xl shadow-xs text-text-secondary group-hover:scale-[1.05] group-hover:text-text-accent transition-all duration-300 mb-2">
                  <FiUploadCloud className="w-5 h-5" />
                </div>
                <span className="text-xs font-bold text-text-primary">
                  Arrastra aquí tus imágenes o haz clic para seleccionar
                </span>
                <span className="text-[10px] text-text-secondary mt-1">
                  Límite: {value.length}/{maxImages} imágenes. Formatos PNG,
                  JPG, WEBP (máx {maxSizeInMB}MB)
                </span>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                  disabled={disabled || value.length >= maxImages}
                />
              </label>
            </div>
          )
        : value.length < maxImages && (
            <div className="flex gap-2">
              <div className="flex-1">
                <Input
                  type="text"
                  placeholder="https://ejemplo.com/imagen.png"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  disabled={disabled}
                  icon={<FiLink className="w-4 h-4 text-text-tertiary" />}
                  className="text-xs h-10"
                />
              </div>
              <Button
                type="button"
                onClick={handleAddUrl}
                disabled={
                  disabled || !urlInput.trim() || value.length >= maxImages
                }
                variant="outline"
                className="px-4 border-border-strong text-text-primary hover:bg-bg-surface"
              >
                Agregar
              </Button>
            </div>
          )}

      {/* Grid of Images / Previews */}
      {value.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
          {/* Uploaded / Selected Previews */}
          {value.map((img, index) => (
            <div
              key={index}
              className={cn(
                "relative group w-full aspect-square border rounded-2xl overflow-hidden bg-bg-surface flex items-center justify-center p-2 shadow-xs transition-all duration-300",
                img.isMain
                  ? "border-beauty-400 ring-2 ring-beauty-400/20"
                  : "border-border-default hover:border-border-strong",
              )}
            >
              <img
                src={img.url}
                alt={`Imagen ${index + 1}`}
                className="max-h-full max-w-full object-contain p-1 select-none"
              />

              {/* Main Badge */}
              {img.isMain && (
                <span className="absolute top-2 left-2 px-1.5 py-0.5 rounded-md bg-beauty-600 text-[9px] font-bold text-white shadow-sm uppercase tracking-wider select-none">
                  Portada
                </span>
              )}

              {/* Local File Pending Upload Badge */}
              {img.file && (
                <span className="absolute bottom-2 left-2 px-1 py-0.5 rounded bg-warning-bg/95 border border-warning-text/10 text-[8px] font-bold text-warning-text shadow-xs uppercase tracking-wider select-none animate-pulse">
                  Pendiente
                </span>
              )}

              {/* Hover overlay with action buttons */}
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-between p-2.5 transition-opacity duration-200">
                {/* Header Actions (Main / Star) */}
                <div className="w-full flex justify-end">
                  <button
                    type="button"
                    disabled={disabled}
                    onClick={() => handleSetMain(index)}
                    className={cn(
                      "p-1.5 rounded-lg border transition-all duration-200 cursor-pointer",
                      img.isMain
                        ? "bg-beauty-600 border-beauty-500 text-white"
                        : "bg-white/10 border-white/20 text-white/80 hover:text-white hover:bg-white/20",
                    )}
                    title={
                      img.isMain ? "Imagen principal" : "Marcar como principal"
                    }
                  >
                    <FiStar className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Footer Controls (Move Left, Delete, Move Right) */}
                <div className="w-full flex items-center justify-between gap-1">
                  <button
                    type="button"
                    disabled={disabled || index === 0}
                    onClick={() => handleMove(index, "left")}
                    className="p-1.5 rounded-lg bg-white/10 border border-white/20 text-white/80 hover:text-white hover:bg-white/20 disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
                    title="Mover a la izquierda"
                  >
                    <FiArrowLeft className="w-3.5 h-3.5" />
                  </button>

                  <button
                    type="button"
                    disabled={disabled}
                    onClick={() => handleRemoveImage(index)}
                    className="p-1.5 rounded-lg bg-danger-bg/30 border border-danger-text/20 hover:bg-danger-bg/50 text-danger-text cursor-pointer hover:scale-[1.05] transition-all"
                    title="Eliminar imagen"
                  >
                    <FiTrash2 className="w-3.5 h-3.5" />
                  </button>

                  <button
                    type="button"
                    disabled={disabled || index === value.length - 1}
                    onClick={() => handleMove(index, "right")}
                    className="p-1.5 rounded-lg bg-white/10 border border-white/20 text-white/80 hover:text-white hover:bg-white/20 disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
                    title="Mover a la derecha"
                  >
                    <FiArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

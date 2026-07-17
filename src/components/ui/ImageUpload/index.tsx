"use client";

import { useState, useRef, useEffect, ChangeEvent } from "react";
import { toast } from "sonner";
import { FiUploadCloud, FiLink, FiImage, FiX, FiTrash2 } from "react-icons/fi";
import Input from "@/components/ui/Input";
import { cn } from "@/utils/cn.utils";

interface ImageUploadProps {
  value: string;
  onChange: (value: string, file?: File | null) => void;
  disabled?: boolean;
  error?: string;
  maxSizeInMB?: number;
  previewAlt?: string;
  fileLabel?: string;
  fileSublabel?: string;
  urlPlaceholder?: string;
}

export default function ImageUpload({
  value,
  onChange,
  disabled = false,
  error,
  maxSizeInMB = 5,
  previewAlt = "Previsualización de imagen",
  fileLabel = "Selecciona un archivo de imagen",
  fileSublabel = `PNG, JPG o WEBP (máximo ${maxSizeInMB}MB)`,
  urlPlaceholder = "https://ejemplo.com/imagen.png",
}: ImageUploadProps) {
  const [uploadTab, setUploadTab] = useState<"file" | "url">("file");
  const [fileInputKey, setFileInputKey] = useState(0);
  const [localPreviewUrl, setLocalPreviewUrl] = useState<string | null>(null);

  const localPreviewUrlRef = useRef<string | null>(null);
  useEffect(() => {
    localPreviewUrlRef.current = localPreviewUrl;
  }, [localPreviewUrl]);

  // Sync tab based on initial value type (http vs local/base64 file)
  useEffect(() => {
    if (value) {
      if (value.startsWith("http")) {
        setUploadTab("url");
      } else {
        setUploadTab("file");
      }
    }
  }, [value]);

  // Clean up local preview when value changes externally from pending-local-file
  useEffect(() => {
    if (value !== "pending-local-file" && localPreviewUrl) {
      URL.revokeObjectURL(localPreviewUrl);
      setLocalPreviewUrl(null);
    }
  }, [value]);

  // Clean up on component unmount
  useEffect(() => {
    return () => {
      if (localPreviewUrlRef.current) {
        URL.revokeObjectURL(localPreviewUrlRef.current);
      }
    };
  }, []);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Por favor selecciona un archivo de imagen válido.");
      return;
    }
    if (file.size > maxSizeInMB * 1024 * 1024) {
      toast.error(
        `La imagen es demasiado grande. El límite es de ${maxSizeInMB}MB.`,
      );
      return;
    }

    if (localPreviewUrl) {
      URL.revokeObjectURL(localPreviewUrl);
    }

    const previewUrl = URL.createObjectURL(file);
    setLocalPreviewUrl(previewUrl);
    onChange("pending-local-file", file);
  };

  const handleClear = () => {
    if (localPreviewUrl) {
      URL.revokeObjectURL(localPreviewUrl);
      setLocalPreviewUrl(null);
    }
    onChange("", null);
    setFileInputKey((prev) => prev + 1);
  };

  const isUrlValue = value ? value.startsWith("http") : false;

  return (
    <div className="space-y-4">
      {/* Segmented Control / Tabs */}
      <div className="flex p-1 bg-bg-surface rounded-xl border border-border-default/50 max-w-60 mx-auto select-none">
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
          Subir archivo
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

      {/* Tab Content */}
      {uploadTab === "file" ? (
        /* Drag & Drop Area / Upload Zone */
        <div className="group relative">
          {value && !isUrlValue ? (
            /* Preview inside Upload Zone */
            <div className="relative w-full h-40 border border-border-strong rounded-2xl overflow-hidden bg-bg-surface flex items-center justify-center shadow-xs">
              <img
                src={
                  value === "pending-local-file"
                    ? localPreviewUrl || undefined
                    : value || undefined
                }
                alt={previewAlt}
                className="max-h-full max-w-full object-contain p-4 transition-transform duration-300 group-hover:scale-[1.03]"
                onError={() => {
                  toast.error("Error al cargar la previsualización.");
                }}
              />
              {/* Overlay controls (always visible, high contrast, clean buttons) */}
              <div className="absolute inset-0 flex items-center justify-center gap-3 rounded-2xl pointer-events-none">
                <label
                  className={cn(
                    "p-2.5 rounded-full bg-white dark:bg-bg-card border border-border-strong text-text-primary dark:text-text-primary hover:text-beauty-600 hover:border-beauty-300 dark:hover:text-beauty-400 dark:hover:border-beauty-700 cursor-pointer hover:scale-110 active:scale-95 transition-all shadow-md pointer-events-auto",
                    disabled &&
                      "opacity-50 cursor-not-allowed pointer-events-none",
                  )}
                  title="Cambiar imagen"
                >
                  <FiUploadCloud className="w-5 h-5" />
                  <input
                    key={fileInputKey}
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                    disabled={disabled}
                  />
                </label>
                <button
                  type="button"
                  onClick={handleClear}
                  disabled={disabled}
                  className="p-2.5 rounded-full bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-950/60 cursor-pointer hover:scale-110 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md pointer-events-auto"
                  title="Eliminar imagen"
                >
                  <FiTrash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          ) : (
            /* Empty Upload Area */
            <label
              className={cn(
                "flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-border-strong hover:border-beauty-500 rounded-2xl bg-bg-surface hover:bg-beauty-50/10 dark:hover:bg-beauty-950/5 cursor-pointer text-center transition-all duration-300 select-none group",
                disabled &&
                  "opacity-50 cursor-not-allowed pointer-events-none border-border-default hover:border-border-default hover:bg-bg-surface",
              )}
            >
              <div className="p-3 bg-bg-card border border-border-soft rounded-xl shadow-xs text-text-secondary group-hover:scale-[1.05] group-hover:text-text-accent transition-all duration-300 mb-3">
                <FiUploadCloud className="w-6 h-6" />
              </div>
              <span className="text-sm font-bold text-text-primary">
                {fileLabel}
              </span>
              <span className="text-xs text-text-secondary mt-1">
                {fileSublabel}
              </span>
              <input
                key={fileInputKey}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
                disabled={disabled}
              />
            </label>
          )}
        </div>
      ) : (
        /* URL Input Option */
        <div className="space-y-4">
          <div className="relative">
            <Input
              type="text"
              placeholder={urlPlaceholder}
              value={isUrlValue ? value : ""}
              onChange={(e) => onChange(e.target.value)}
              disabled={disabled}
              icon={<FiLink className="w-4.5 h-4.5 text-text-tertiary" />}
              error={error}
              className="text-sm h-11"
            />
          </div>

          {/* Preview block for URL */}
          {value && isUrlValue ? (
            <div className="relative w-full h-32 border border-border-soft rounded-xl overflow-hidden bg-bg-surface flex items-center justify-center p-3">
              <img
                src={value}
                alt={previewAlt}
                className="max-h-full max-w-full object-contain"
                onError={() => {
                  // Ignore URL load errors temporarily since user might be typing
                }}
              />
              <button
                type="button"
                onClick={handleClear}
                disabled={disabled}
                className="absolute top-2 right-2 p-1.5 rounded-lg bg-bg-card/80 border border-border-soft text-text-secondary hover:text-danger-text cursor-pointer hover:scale-[1.05] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                title="Eliminar imagen"
              >
                <FiX className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <div className="w-full h-32 border border-dashed border-border-default/60 rounded-xl bg-bg-surface/50 flex flex-col items-center justify-center text-text-tertiary text-xs">
              <FiImage className="w-5 h-5 mb-1" />
              <span>Ingresa una URL para ver la vista previa</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

"use client";

import { useState, useEffect, ChangeEvent } from "react";
import { toast } from "sonner";
import {
  FiUploadCloud,
  FiLink,
  FiFileText,
  FiX,
  FiTrash2,
  FiDownload,
} from "react-icons/fi";
import Input from "@/components/ui/Input";
import { cn } from "@/utils/cn.utils";

interface PdfUploadProps {
  value: string;
  onChange: (value: string, file?: File | null) => void;
  disabled?: boolean;
  error?: string;
  maxSizeInMB?: number;
  fileLabel?: string;
  fileSublabel?: string;
  urlPlaceholder?: string;
}

export default function PdfUpload({
  value,
  onChange,
  disabled = false,
  error,
  maxSizeInMB = 10,
  fileLabel = "Selecciona un archivo PDF",
  fileSublabel = `Documento PDF (máximo ${maxSizeInMB}MB)`,
  urlPlaceholder = "https://ejemplo.com/catalogo.pdf",
}: PdfUploadProps) {
  const [uploadTab, setUploadTab] = useState<"file" | "url">("file");
  const [fileInputKey, setFileInputKey] = useState(0);
  const [fileName, setFileName] = useState("");

  // Sync tab based on initial value type (http vs local/base64 file)
  useEffect(() => {
    if (value) {
      if (value.startsWith("http")) {
        setUploadTab("url");
        setFileName("");
      } else {
        setUploadTab("file");
        // Si es archivo local pendiente, mantenemos el nombre guardado en estado
        if (value === "pending-local-file") {
          // No sobreescribir el nombre local
        } else if (value.startsWith("data:application/pdf")) {
          setFileName("documento_cargado.pdf");
        } else {
          setFileName(value.split("/").pop() || "catalogo.pdf");
        }
      }
    } else {
      setFileName("");
    }
  }, [value]);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== "application/pdf") {
      toast.error("Por favor selecciona un archivo PDF válido.");
      return;
    }
    if (file.size > maxSizeInMB * 1024 * 1024) {
      toast.error(`El archivo es demasiado grande. El límite es de ${maxSizeInMB}MB.`);
      return;
    }

    setFileName(file.name);
    onChange("pending-local-file", file);
  };

  const handleClear = () => {
    onChange("", null);
    setFileName("");
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
              : "border border-transparent text-text-secondary hover:text-text-primary"
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
              : "border border-transparent text-text-secondary hover:text-text-primary"
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
            /* File loaded state */
            <div className="relative w-full h-36 border border-border-strong rounded-2xl bg-bg-surface flex flex-col items-center justify-center p-4 shadow-xs">
              <FiFileText className="w-10 h-10 text-danger-text/80 mb-2 animate-bounce" />
              <span className="text-sm font-semibold text-text-primary truncate max-w-xs px-2">
                {fileName}
              </span>
              <span className="text-xs text-text-tertiary mt-1">
                {value === "pending-local-file" ? "Listo para subir (se guardará al enviar)" : "Listo para guardar"}
              </span>

              {/* Overlay controls */}
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-3 transition-opacity duration-200 rounded-2xl">
                {!value.startsWith("data:") && (
                  <a
                    href={value}
                    download={fileName}
                    className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white cursor-pointer hover:scale-[1.05] active:scale-[0.95] transition-all border border-white/20"
                    title="Descargar PDF"
                  >
                    <FiDownload className="w-5 h-5" />
                  </a>
                )}
                <label
                  className={cn(
                    "p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white cursor-pointer hover:scale-[1.05] active:scale-[0.95] transition-all border border-white/20",
                    disabled && "opacity-50 cursor-not-allowed pointer-events-none"
                  )}
                  title="Cambiar archivo PDF"
                >
                  <FiUploadCloud className="w-5 h-5 text-white" />
                  <input
                    key={fileInputKey}
                    type="file"
                    accept="application/pdf"
                    onChange={handleFileChange}
                    className="hidden"
                    disabled={disabled}
                  />
                </label>
                <button
                  type="button"
                  onClick={handleClear}
                  disabled={disabled}
                  className="p-2.5 rounded-xl bg-danger-bg/20 border border-danger-text/20 hover:bg-danger-bg/40 text-danger-text cursor-pointer hover:scale-[1.05] active:scale-[0.95] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Eliminar PDF"
                >
                  <FiTrash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          ) : (
            /* Empty Upload Area */
            <label
              className={cn(
                "flex flex-col items-center justify-center w-full h-36 border-2 border-dashed border-border-strong hover:border-beauty-500 rounded-2xl bg-bg-surface hover:bg-beauty-50/10 dark:hover:bg-beauty-950/5 cursor-pointer text-center transition-all duration-300 select-none group",
                disabled && "opacity-50 cursor-not-allowed pointer-events-none border-border-default hover:border-border-default hover:bg-bg-surface"
              )}
            >
              <div className="p-3 bg-bg-card border border-border-soft rounded-xl shadow-xs text-text-secondary group-hover:scale-[1.05] group-hover:text-text-accent transition-all duration-300 mb-2">
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
                accept="application/pdf"
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

          {/* Preview/Info block for URL */}
          {value && isUrlValue ? (
            <div className="relative w-full border border-border-soft rounded-xl bg-bg-surface flex flex-col p-4 gap-3">
              <div className="flex items-center gap-3">
                <FiFileText className="w-8 h-8 text-danger-text/80 shrink-0" />
                <div className="flex flex-col min-w-0 flex-1">
                  <span className="text-xs font-semibold text-text-primary truncate max-w-[280px] sm:max-w-md">
                    {value}
                  </span>
                  <span className="text-[10px] text-text-tertiary">Enlace del catálogo externo</span>
                </div>
              </div>
              <div className="flex gap-2 justify-end w-full border-t border-border-default/30 pt-2.5">
                <a
                  href={value}
                  target="_blank"
                  rel="noreferrer"
                  className="p-1.5 rounded-lg bg-bg-card border border-border-soft text-text-secondary hover:text-text-primary cursor-pointer hover:scale-[1.05] transition-all"
                  title="Abrir PDF en nueva pestaña"
                >
                  <FiLink className="w-3.5 h-3.5" />
                </a>
                <button
                  type="button"
                  onClick={handleClear}
                  disabled={disabled}
                  className="p-1.5 rounded-lg bg-bg-card border border-border-soft text-text-secondary hover:text-danger-text cursor-pointer hover:scale-[1.05] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Eliminar enlace"
                >
                  <FiX className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ) : (
            <div className="w-full h-24 border border-dashed border-border-default/60 rounded-xl bg-bg-surface/50 flex flex-col items-center justify-center text-text-tertiary text-xs">
              <FiFileText className="w-5 h-5 mb-1" />
              <span>Ingresa una URL de archivo PDF</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

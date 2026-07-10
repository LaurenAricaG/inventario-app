"use client";

import { useEffect } from "react";
import { FiAlertTriangle, FiRefreshCw, FiRotateCw } from "react-icons/fi";

export type ErrorWithDigest = Error & { digest?: string };

export type ErrorFallbackProps = {
  error: ErrorWithDigest;
  reset: () => void;
  variant?: "full" | "embedded" | "compact";
  title?: string;
};

export function ErrorFallback({
  error,
  reset,
  variant = "full",
  title = "Algo salió mal",
}: ErrorFallbackProps) {
  useEffect(() => {
    console.error("[ErrorFallback log]:", error);
  }, [error]);

  const message =
    typeof error.message === "string" && error.message.length > 0
      ? error.message
      : "Ocurrió un error inesperado en el sistema.";

  const showDevDetails = process.env.NODE_ENV === "development";

  // Estilos de pre-formateado para el código/stack trace (Compartido)
  const preStyles =
    "mt-3 text-left text-[10px] font-mono bg-bg-surface p-3 rounded-xl max-h-32 overflow-y-auto text-text-tertiary whitespace-pre-wrap break-all scrollbar-thin scrollbar-thumb-stone-300 dark:scrollbar-thumb-zinc-700 border border-border-default/40";

  // ================= VARIANTE COMPACT =================
  if (variant === "compact") {
    return (
      <div
        role="alert"
        className="rounded-2xl border border-danger-text/50 text-danger-text p-4 flex items-start gap-3 shadow-xs"
      >
        <FiAlertTriangle className="w-5 h-5 text-danger-text shrink-0 mt-0.5" />
        <div className="flex-1 min-w-0">
          <p className="text-xs font-bold text-danger-text uppercase tracking-wider">
            {title}
          </p>
          <p className="mt-1 text-xs text-text-secondary leading-relaxed">
            {message}
          </p>

          {showDevDetails && (
            <pre className="mt-3 text-[10px] font-mono bg-bg-surface p-2 rounded-lg max-h-24 overflow-y-auto text-text-tertiary whitespace-pre-wrap break-all scrollbar-thin scrollbar-thumb-stone-300 dark:scrollbar-thumb-zinc-700 border border-border-default/40">
              {error.stack || error.toString()}
            </pre>
          )}

          <button
            type="button"
            onClick={reset}
            className="mt-3 text-[11px] font-semibold text-danger-text hover:underline flex items-center gap-1 cursor-pointer"
          >
            <FiRefreshCw className="w-3 h-3" />
            <span>Reintentar</span>
          </button>
        </div>
      </div>
    );
  }

  // ================= VARIANTE EMBEDDED =================
  if (variant === "embedded") {
    return (
      <div className="w-full h-full flex items-center justify-center p-4">
        <div
          role="alert"
          className="w-full max-w-md rounded-3xl border border-danger-text/50 p-6 shadow-xs text-center relative overflow-hidden"
        >
          <div className="mx-auto w-10 h-10 rounded-full bg-danger-text/10 text-danger-text flex items-center justify-center mb-3 border border-danger-text/20">
            <FiAlertTriangle className="w-5 h-5" />
          </div>
          <span className="text-[10px] font-bold text-text-tertiary uppercase tracking-widest">
            Fallo en sección
          </span>
          <h3 className="mt-1.5 font-bold text-danger-text text-base tracking-wide">
            {title}
          </h3>
          <p className="mt-2 text-xs text-text-secondary leading-relaxed">
            {message}
          </p>

          {error.digest && (
            <p className="mt-2 font-mono text-[10px] text-text-tertiary">
              digest: {error.digest}
            </p>
          )}

          {showDevDetails && <pre className={preStyles}>{error.stack}</pre>}

          <button
            type="button"
            onClick={reset}
            className="mt-4 w-full flex items-center justify-center gap-2 py-2.5 px-4 text-danger-text border border-danger-text/20 hover:bg-danger-bg/10 hover:border-danger-text/40 rounded-2xl text-xs font-bold transition-colors cursor-pointer "
          >
            <FiRefreshCw className="w-3.5 h-3.5" />
            <span>Recargar sección</span>
          </button>
        </div>
      </div>
    );
  }

  // ================= VARIANTE FULL =================
  return (
    <div
      role="alert"
      className="min-h-[60vh] w-full flex flex-col items-center justify-center p-6 text-center"
    >
      <div className="w-full max-w-lg rounded-3xl border border-danger-text/50 p-8 shadow-md relative overflow-hidden">
        {/* Glow decorativo de fondo */}
        <div className="absolute top-0 right-0 w-24 h-24 bg-danger-text/5 rounded-full blur-2xl pointer-events-none" />

        <div className="mx-auto w-12 h-12 rounded-full bg-danger-text/10 text-danger-text flex items-center justify-center mb-4 border border-danger-text/20">
          <FiAlertTriangle className="w-6 h-6" />
        </div>
        <h1 className="text-xl font-extrabold text-danger-text tracking-tight">
          {title}
        </h1>
        <p className="mt-3 text-xs sm:text-sm text-text-secondary leading-relaxed max-w-sm mx-auto">
          {message}
        </p>

        {error.digest && (
          <p className="mt-2.5 font-mono text-xs text-text-tertiary">
            digest:{" "}
            <span className="font-bold text-text-primary">{error.digest}</span>
          </p>
        )}

        {showDevDetails && <pre className={preStyles}>{error.stack}</pre>}

        <div className="mt-6 flex flex-col sm:flex-row gap-3">
          <button
            type="button"
            onClick={reset}
            className="flex-1 py-2.5 px-4 text-danger-text border border-danger-text/20 hover:bg-danger-bg/10 hover:border-danger-text/40 rounded-2xl text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-1.5"
          >
            <FiRefreshCw className="w-3.5 h-3.5" />
            <span>Volver a intentar</span>
          </button>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="flex-1 py-2.5 px-4 bg-bg-page hover:bg-beauty-50 border border-border-default hover:border-beauty-200 text-text-primary hover:text-beauty-800 rounded-2xl text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-1.5"
          >
            <FiRotateCw className="w-3.5 h-3.5" />
            <span>Recargar aplicación</span>
          </button>
        </div>
      </div>
    </div>
  );
}

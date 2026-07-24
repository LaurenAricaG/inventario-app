"use client";

import {
  ErrorFallback,
  type ErrorWithDigest,
} from "@/components/error/ErrorFallback";

export default function ConfiguracionError({
  error,
  reset,
}: {
  error: ErrorWithDigest;
  reset: () => void;
}) {
  return (
    <ErrorFallback
      error={error}
      reset={reset}
      variant="full"
      title="No se pudo cargar el módulo de configuraciones"
    />
  );
}

"use client";

import {
  ErrorFallback,
  type ErrorWithDigest,
} from "@/components/error/ErrorFallback";

export default function AdminError({
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
      title="Ha ocurrido un error en esta sección"
    />
  );
}

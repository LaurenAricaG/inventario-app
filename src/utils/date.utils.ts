/**
 * Formatos de fecha centralizados para la aplicación.
 * Todos unificados bajo la configuración regional 'es-PE' (Perú).
 */

/**
 * Formatea una fecha a cadena de fecha y hora local (DD/MM/YYYY HH:MM).
 * Por ejemplo: "13/07/2026 10:00"
 */
export function formatDateTime(dateInput: Date | string | null | undefined): string {
  if (!dateInput) return "";
  try {
    const date = new Date(dateInput);
    if (isNaN(date.getTime())) return "";
    return date.toLocaleString("es-PE", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return String(dateInput);
  }
}

/**
 * Formatea una fecha a cadena de fecha, hora y segundos local (DD/MM/YYYY HH:MM:SS).
 * Por ejemplo: "13/07/2026 10:00:23"
 */
export function formatDateTimeWithSeconds(dateInput: Date | string | null | undefined): string {
  if (!dateInput) return "";
  try {
    const date = new Date(dateInput);
    if (isNaN(date.getTime())) return "";
    return date.toLocaleString("es-PE", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  } catch {
    return String(dateInput);
  }
}

/**
 * Formatea una fecha a solo fecha local sin hora (DD/MM/YYYY).
 * Por ejemplo: "13/07/2026"
 */
export function formatDateLocal(dateInput: Date | string | null | undefined): string {
  if (!dateInput) return "";
  try {
    const date = new Date(dateInput);
    if (isNaN(date.getTime())) return "";
    return date.toLocaleDateString("es-PE", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  } catch {
    return String(dateInput);
  }
}

/**
 * Formatea una fecha a solo fecha (DD/MM/YYYY) usando la zona horaria UTC.
 * Útil para fechas que provienen de la base de datos sin componente de hora (como campañas),
 * evitando desfases de fecha debido a la zona horaria local.
 * Por ejemplo: "13/07/2026"
 */
export function formatDateUTC(dateInput: Date | string | null | undefined): string {
  if (!dateInput) return "";
  try {
    const date = new Date(dateInput);
    if (isNaN(date.getTime())) return "";
    const day = String(date.getUTCDate()).padStart(2, "0");
    const month = String(date.getUTCMonth() + 1).padStart(2, "0");
    const year = date.getUTCFullYear();
    return `${day}/${month}/${year}`;
  } catch {
    return String(dateInput);
  }
}

/**
 * Formatea una fecha a formato largo (DD de [mes] de YYYY).
 * Por ejemplo: "13 de julio de 2026"
 */
export function formatDateLong(dateInput: Date | string | null | undefined): string {
  if (!dateInput) return "";
  try {
    const date = new Date(dateInput);
    if (isNaN(date.getTime())) return "";
    return date.toLocaleDateString("es-PE", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return String(dateInput);
  }
}

/**
 * Formatea una fecha a formato corto (DD [mes corto]).
 * Por ejemplo: "13 jul" o "13 jul."
 */
export function formatDateShort(dateInput: Date | string | null | undefined): string {
  if (!dateInput) return "";
  try {
    const date = new Date(dateInput);
    if (isNaN(date.getTime())) return "";
    return date.toLocaleDateString("es-PE", {
      day: "2-digit",
      month: "short",
    });
  } catch {
    return "";
  }
}

/**
 * Formatea una fecha a formato corto (DD [mes corto]) usando la zona horaria UTC.
 * Útil para evitar desfases de fecha debido a la zona horaria local.
 * Por ejemplo: "13 jul."
 */
export function formatDateShortUTC(dateInput: Date | string | null | undefined): string {
  if (!dateInput) return "";
  try {
    const date = new Date(dateInput);
    if (isNaN(date.getTime())) return "";
    return date.toLocaleDateString("es-PE", {
      day: "2-digit",
      month: "short",
      timeZone: "UTC",
    });
  } catch {
    return "";
  }
}


/**
 * Formatea una fecha a formato corto con hora (DD [mes corto] HH:MM).
 * Por ejemplo: "13 jul 10:00"
 */
export function formatDateShortWithTime(dateInput: Date | string | null | undefined): string {
  if (!dateInput) return "";
  try {
    const date = new Date(dateInput);
    if (isNaN(date.getTime())) return "";
    return date.toLocaleDateString("es-PE", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "";
  }
}

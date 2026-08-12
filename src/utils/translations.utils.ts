/**
 * Centralizador de traducciones, etiquetas y diccionarios de estado del sistema.
 */

// ========================================================
// 1. ESTADOS DE LLEGADA / VERIFICACIÓN DE ÍTEMS DE PEDIDO
// ========================================================
export const itemStatusTranslations: Record<string, string> = {
  PENDING: "Pendiente",
  RECEIVED: "Recibido",
  MISSING: "Faltante",
  SUBSTITUTED: "Sustituido",
};

export const itemStatusColors: Record<string, string> = {
  PENDING: "bg-warning-bg/40 border-warning-text/10 text-warning-text",
  RECEIVED: "bg-success-bg/40 border-success-text/10 text-success-text",
  MISSING: "bg-danger-bg/40 border-danger-text/10 text-danger-text",
  SUBSTITUTED: "bg-info-bg/40 border-info-text/10 text-info-text",
};

/**
 * Traduce el estado de recepción de un ítem.
 */
export function translateItemStatus(status: string | null | undefined): string {
  if (!status) return "Sin Estado";
  return itemStatusTranslations[status] || status;
}

// ========================================================
// 2. ESTADOS DE PEDIDO DE CAMPAÑA
// ========================================================
export const orderStatusTranslations: Record<string, string> = {
  PENDING: "Pendiente",
  VERIFIED: "Verificado",
  PACKED: "Empacado",
  DELIVERED: "Entregado",
  CANCELLED: "Cancelado",
};

export const orderStatusColors: Record<string, string> = {
  PENDING: "bg-warning-bg/50 border-warning-text/10 text-warning-text",
  VERIFIED: "bg-beauty-500/10 border-beauty-500/20 text-beauty-600 dark:text-beauty-500",
  PACKED: "bg-info-bg/50 border-info-text/10 text-info-text",
  DELIVERED: "bg-success-bg/50 border-success-text/10 text-success-text",
  CANCELLED: "bg-danger-bg/50 border-danger-text/10 text-danger-text",
};

/**
 * Traduce el estado general de un pedido.
 */
export function translateOrderStatus(status: string | null | undefined): string {
  if (!status) return "Sin Estado";
  return orderStatusTranslations[status] || status;
}

// ========================================================
// 3. MÉTODOS DE PAGO Y TRANSACCIONES
// ========================================================
export const paymentMethodTranslations: Record<string, string> = {
  CASH: "Efectivo",
  cash: "Efectivo",
  YAPE: "Yape",
  yape: "Yape",
  PLIN: "Plin",
  plin: "Plin",
  BANK_TRANSFER: "Transferencia",
  bank_transfer: "Transferencia",
  OTHER: "Otros",
  other: "Otros",
};

export const paymentMethodBadgeColors: Record<string, string> = {
  CASH: "bg-blue-50/70 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800",
  cash: "bg-blue-50/70 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800",
  YAPE: "bg-purple-50/70 text-purple-700 border-purple-200 dark:bg-purple-900/20 dark:text-purple-300 dark:border-purple-800",
  yape: "bg-purple-50/70 text-purple-700 border-purple-200 dark:bg-purple-900/20 dark:text-purple-300 dark:border-purple-800",
  PLIN: "bg-teal-50/70 text-teal-700 border-teal-200 dark:bg-teal-900/20 dark:text-teal-300 dark:border-teal-800",
  plin: "bg-teal-50/70 text-teal-700 border-teal-200 dark:bg-teal-900/20 dark:text-teal-300 dark:border-teal-800",
  BANK_TRANSFER:
    "bg-indigo-50/70 text-indigo-700 border-indigo-200 dark:bg-indigo-900/20 dark:text-indigo-300 dark:border-indigo-800",
  bank_transfer:
    "bg-indigo-50/70 text-indigo-700 border-indigo-200 dark:bg-indigo-900/20 dark:text-indigo-300 dark:border-indigo-800",
  OTHER:
    "bg-stone-50/70 text-stone-700 border-stone-200 dark:bg-stone-900/20 dark:text-stone-300 dark:border-stone-800",
  other:
    "bg-stone-50/70 text-stone-700 border-stone-200 dark:bg-stone-900/20 dark:text-stone-300 dark:border-stone-800",
};

/**
 * Traduce el método de pago registrado.
 */
export function translatePaymentMethod(method: string | null | undefined): string {
  if (!method) return "Otro";
  return paymentMethodTranslations[method] || method;
}

// ========================================================
// 4. TIPOS DE MOVIMIENTOS DE KARDEX Y RAZONES
// ========================================================
export const stockReasonTranslations: Record<string, string> = {
  PURCHASE: "Compra de Mercadería",
  SALE: "Venta",
  GIFT: "Obsequio / Regalo",
  PERSONAL_USE: "Uso Personal",
  LOSS_OR_DAMAGE: "Pérdida o Daño",
  ADJUSTMENT: "Ajuste de Inventario",
  RETURN: "Devolución de Cliente",
  LOAN: "Préstamo",
  INPUT: "Entrada (+)",
  OUTPUT: "Salida (-)",
};

/**
 * Traduce el motivo o razón de un movimiento de stock.
 */
export function translateStockReason(
  reason: string | null | undefined,
  type?: "INPUT" | "OUTPUT" | string,
): string {
  if (!reason) return "Sin especificar";
  switch (reason) {
    case "PURCHASE":
      return "Compra (Ingreso de mercadería)";
    case "SALE":
      return "Venta";
    case "GIFT":
      return type === "INPUT" ? "Regalo Recibido" : "Regalo a Cliente";
    case "PERSONAL_USE":
      return "Uso Personal";
    case "LOSS_OR_DAMAGE":
      return "Pérdida o Daño de producto";
    case "ADJUSTMENT":
      return type === "INPUT"
        ? "Ajuste de Inventario (Ingreso)"
        : "Ajuste de Inventario (Salida)";
    case "RETURN":
      return type === "INPUT" ? "Devolución de cliente" : "Devolución";
    case "LOAN":
      return type === "INPUT"
        ? "Retorno de Préstamo (Ingreso)"
        : "Préstamo de producto (Salida)";
    default:
      return stockReasonTranslations[reason] || reason;
  }
}

export const movementTypeTranslations: Record<string, string> = {
  VENTA_DIRECTA: "Venta Directa",
  PEDIDO_CATALOGO: "Pedido de Catálogo",
  DEUDA_EXTERNA: "Saldo Anterior / Deuda",
  PAGO: "Pago Recibido",
  IN: "Entrada de Stock",
  OUT: "Salida de Stock",
  ADJUSTMENT: "Ajuste de Inventario",
};

/**
 * Traduce el tipo de movimiento o transacción.
 */
export function translateMovementType(type: string | null | undefined): string {
  if (!type) return "Desconocido";
  return movementTypeTranslations[type] || type;
}

// ========================================================
// 5. TRADUCCIONES Y FORMATEO DE BITÁCORA DE AUDITORÍA
// ========================================================
export const auditEntityTranslations: Record<string, string> = {
  Company: "Empresa",
  Brand: "Marca",
  Category: "Categoría",
  GenderSegment: "Género / Público",
  User: "Usuario",
  Role: "Rol de Usuario",
  Permission: "Permiso",
  Client: "Cliente",
  Product: "Producto",
  ProductImage: "Imagen de Producto",
  DirectSale: "Venta Directa",
  DirectSaleItem: "Ítem de Venta Directa",
  Order: "Pedido Catálogo",
  CampaignOrder: "Pedido de Campaña",
  CampaignOrderItem: "Ítem de Pedido",
  CampaignOrderItemSubstitute: "Sustituto de Ítem",
  Payment: "Pago / Abono",
  Debt: "Deuda Externa",
  ExternalDebt: "Deuda Externa",
  Campaign: "Campaña",
  CatalogPdf: "Catálogo PDF",
  StockMovement: "Movimiento de Stock / Kardex",
  SystemConfig: "Configuración del Sistema",
};

export const auditActionTranslations: Record<string, string> = {
  CREATE: "Creación",
  UPDATE: "Edición",
  DELETE: "Eliminación",
};

/**
 * Recorre recursivamente un objeto o valor de detalles de auditoría
 * y traduce códigos en inglés (como PURCHASE, RETURN, INPUT, OUTPUT, etc.) a español.
 */
export function formatAuditDetails(obj: any): any {
  if (obj === null || obj === undefined) return obj;

  if (typeof obj === "string") {
    if (paymentMethodTranslations[obj]) return paymentMethodTranslations[obj];
    if (stockReasonTranslations[obj]) return stockReasonTranslations[obj];
    if (auditActionTranslations[obj]) return auditActionTranslations[obj];
    if (auditEntityTranslations[obj]) return auditEntityTranslations[obj];
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map((item) => formatAuditDetails(item));
  }

  if (typeof obj === "object") {
    const formatted: Record<string, any> = {};
    for (const key of Object.keys(obj)) {
      formatted[key] = formatAuditDetails(obj[key]);
    }
    return formatted;
  }

  return obj;
}

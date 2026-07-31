/**
 * Devuelve las clases CSS de Tailwind para las insignias (badges) de marca:
 * - Esika: Rojo (Red)
 * - Cyzone: Fucsia (Fuchsia)
 * - L'Bel: Negro (Zinc/Slate)
 * - Avon: Rosado (Pink)
 * - Yambal / Yanbal / Unique: Naranja Naranjado (Orange)
 * - Natura: Amarillo Brillante (Yellow)
 */
export function getBrandBadgeStyle(brandName: string | undefined | null): string {
  if (!brandName) {
    return "bg-beauty-50/90 border-beauty-200/60 text-beauty-700 dark:bg-beauty-950/80 dark:border-beauty-900/60 dark:text-beauty-300";
  }

  const normalized = brandName.toLowerCase().trim();

  // 1. Esika -> Rojo
  if (normalized.includes("esika") || normalized.includes("ésika")) {
    return "bg-red-50/90 border-red-200/60 text-red-700 dark:bg-red-950/80 dark:border-red-900/60 dark:text-red-300";
  }

  // 2. Cyzone -> Fucsia
  if (normalized.includes("cyzone") || normalized.includes("cy zone")) {
    return "bg-fuchsia-50/90 border-fuchsia-200/60 text-fuchsia-700 dark:bg-fuchsia-950/80 dark:border-fuchsia-900/60 dark:text-fuchsia-300";
  }

  // 3. L'Bel / Lbel -> Negro
  if (
    normalized.includes("lbel") ||
    normalized.includes("l'bel") ||
    normalized.includes("l bel")
  ) {
    return "bg-zinc-100/90 border-zinc-300/80 text-zinc-900 dark:bg-zinc-800/90 dark:border-zinc-700/80 dark:text-zinc-100";
  }

  // 4. Avon -> Rosado
  if (normalized.includes("avon")) {
    return "bg-pink-50/90 border-pink-200/60 text-pink-700 dark:bg-pink-950/80 dark:border-pink-900/60 dark:text-pink-300";
  }

  // 5. Yambal / Yanbal / Unique -> Naranja Naranjado
  if (
    normalized.includes("yambal") ||
    normalized.includes("yanbal") ||
    normalized.includes("unique")
  ) {
    return "bg-orange-100/90 border-orange-300/80 text-orange-800 dark:bg-orange-950/90 dark:border-orange-800/80 dark:text-orange-300";
  }

  // 6. Natura -> Amarillo Brillante
  if (normalized.includes("natura")) {
    return "bg-yellow-100/90 border-yellow-400/80 text-yellow-900 dark:bg-yellow-950/90 dark:border-yellow-700/80 dark:text-yellow-300";
  }

  // Fallback
  return "bg-beauty-50/90 border-beauty-200/60 text-beauty-700 dark:bg-beauty-950/80 dark:border-beauty-900/60 dark:text-beauty-300";
}

/**
 * Devuelve las clases CSS de Tailwind para las insignias (badges) de empresa:
 * - Belcorp: Morado (Purple)
 * - Avon: Rosado (Pink)
 * - Yambal / Yanbal / Unique: Naranja (Orange)
 * - Natura: Amarillo (Yellow)
 */
export function getCompanyBadgeStyle(companyName: string | undefined | null): string {
  if (!companyName) {
    return "bg-beauty-50/90 border-beauty-200/60 text-beauty-700 dark:bg-beauty-950/80 dark:border-beauty-900/60 dark:text-beauty-300";
  }

  const normalized = companyName.toLowerCase().trim();

  // 1. Belcorp -> Morado
  if (normalized.includes("belcorp")) {
    return "bg-purple-50/90 border-purple-200/60 text-purple-700 dark:bg-purple-950/80 dark:border-purple-900/60 dark:text-purple-300";
  }

  // 2. Avon -> Rosado
  if (normalized.includes("avon")) {
    return "bg-pink-50/90 border-pink-200/60 text-pink-700 dark:bg-pink-950/80 dark:border-pink-900/60 dark:text-pink-300";
  }

  // 3. Yambal / Yanbal / Unique -> Naranja
  if (
    normalized.includes("yambal") ||
    normalized.includes("yanbal") ||
    normalized.includes("unique")
  ) {
    return "bg-orange-100/90 border-orange-300/80 text-orange-800 dark:bg-orange-950/90 dark:border-orange-800/80 dark:text-orange-300";
  }

  // 4. Natura -> Amarillo Brillante
  if (normalized.includes("natura")) {
    return "bg-yellow-100/90 border-yellow-400/80 text-yellow-900 dark:bg-yellow-950/90 dark:border-yellow-700/80 dark:text-yellow-300";
  }

  // Fallback
  return "bg-beauty-50/90 border-beauty-200/60 text-beauty-700 dark:bg-beauty-950/80 dark:border-beauty-900/60 dark:text-beauty-300";
}

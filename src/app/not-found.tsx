import Link from "next/link";
import { FiShoppingBag } from "react-icons/fi";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-bg-page flex flex-col items-center justify-center p-6 text-center transition-colors duration-300">
      <div className="w-full max-w-md rounded-3xl border border-border-default/80 bg-bg-card p-8 shadow-md relative overflow-hidden">
        {/* Decorative backdrop glow */}
        <div className="absolute top-0 right-0 w-24 h-24 bg-beauty-400/5 dark:bg-beauty-400/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-beauty-400/5 dark:bg-beauty-400/10 rounded-full blur-2xl pointer-events-none" />

        {/* Icon Container */}
        <div className="mx-auto w-14 h-14 rounded-2xl bg-beauty-50 dark:bg-beauty-900/30 text-beauty-500 dark:text-beauty-400 flex items-center justify-center mb-6 border border-beauty-100/50 dark:border-beauty-800/30 shadow-xs">
          <FiShoppingBag className="w-6 h-6" />
        </div>

        {/* Title and message */}
        <h1 className="text-xl font-bold text-text-primary tracking-tight">
          Enlace no disponible
        </h1>
        <p className="mt-3 text-xs sm:text-sm text-text-secondary leading-relaxed max-w-sm mx-auto">
          El enlace del estado de cuenta o catálogo al que intentas acceder no es válido, ha caducado o fue actualizado por la consultora.
        </p>

        {/* Action Button */}
        <div className="mt-8">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 py-3 px-6 bg-beauty-600 hover:bg-beauty-700 text-white rounded-xl text-sm font-semibold transition-all duration-200 shadow-md shadow-beauty-600/15 hover:scale-[1.02] active:scale-[0.98] cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-beauty-400"
          >
            Ir al catálogo
          </Link>
        </div>
      </div>
    </div>
  );
}

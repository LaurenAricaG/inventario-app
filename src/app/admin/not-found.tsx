import Link from "next/link";
import { FiArrowLeft } from "react-icons/fi";

export default function AdminNotFound() {
  return (
    <div className="flex flex-col items-center justify-center flex-1 py-12 px-4 text-center animate-fade-in my-auto">
      <div className="w-full max-w-md rounded-3xl border border-border-default/80 bg-bg-card p-8 sm:p-10 shadow-md relative overflow-hidden">
        {/* Decorative backdrop glow */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-beauty-500/10 dark:bg-beauty-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-beauty-500/10 dark:bg-beauty-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* 404 Visual Number */}
        <div className="mx-auto mb-5 flex flex-col items-center">
          <span className="text-6xl sm:text-7xl font-black tracking-tight text-beauty-600 dark:text-beauty-400 select-none font-sans leading-none">
            404
          </span>
          <span className="mt-2.5 inline-flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-beauty-100 dark:bg-beauty-200/50 text-beauty-700 dark:text-beauty-800 border border-beauty-200 dark:border-beauty-400/40 select-none">
            Página no encontrada
          </span>
        </div>

        {/* Title and message */}
        <h2 className="text-xl sm:text-2xl font-bold text-text-primary tracking-tight">
          Ruta no disponible
        </h2>
        <p className="mt-2.5 text-xs sm:text-sm text-text-secondary leading-relaxed max-w-sm mx-auto">
          La sección a la que intentas acceder no existe en el panel de administración o fue movida.
        </p>

        {/* Action Button */}
        <div className="mt-8">
          <Link
            href="/admin"
            className="inline-flex items-center justify-center gap-2 py-3 px-6 bg-beauty-600 hover:bg-beauty-700 text-white rounded-xl text-sm font-semibold transition-all duration-200 shadow-md shadow-beauty-600/15 hover:scale-[1.02] active:scale-[0.98] cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-beauty-400"
          >
            <FiArrowLeft className="w-4 h-4" />
            <span>Regresar al Inicio</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

import Link from "next/link";
import { FiAlertCircle } from "react-icons/fi";

export default function AdminNotFound() {
  return (
    <div className="flex flex-col items-center justify-center flex-1 py-16 text-center animate-fade-in">
      <div className="w-16 h-16 rounded-2xl bg-danger-bg border border-danger-text/20 flex items-center justify-center text-danger-text mb-6">
        <FiAlertCircle className="w-8 h-8" />
      </div>

      <h2 className="text-2xl font-bold text-text-primary tracking-tight mb-2">
        Página no encontrada
      </h2>

      <p className="text-sm text-text-secondary max-w-sm mb-8">
        La ruta a la que intentas acceder no existe en el panel de administración o no está disponible temporalmente.
      </p>

      <Link
        href="/admin"
        className="px-5 py-2.5 rounded-xl bg-beauty-600 hover:bg-beauty-700 text-white font-semibold transition-colors duration-200 shadow-md shadow-beauty-600/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-beauty-400"
      >
        Regresar al Inicio
      </Link>
    </div>
  );
}

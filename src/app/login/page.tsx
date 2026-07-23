import { Suspense } from "react";
import LoginForm from "@/components/auth/LoginForm";
import ThemeToggle from "@/components/theme/ThemeToggle";

export const metadata = {
  title: "Iniciar sesión",
};

export default function LoginPage() {
  return (
    <div className="relative min-h-screen flex items-center justify-center bg-bg-page px-4 overflow-hidden">
      {/* Top right theme toggle */}
      <div className="absolute top-6 right-6 z-10">
        <ThemeToggle />
      </div>

      {/* Decorative ambient glowing circles */}
      <div className="absolute top-1/4 left-1/4 w-100 h-100 rounded-full bg-beauty-200/5 dark:bg-beauty-400/5 blur-[120px] pointer-events-none -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-1/4 right-1/4 w-112.5 h-112.5 rounded-full bg-beauty-400/5 dark:bg-beauty-600/5 blur-[140px] pointer-events-none translate-x-1/2 translate-y-1/2" />

      {/* Main Form container */}
      <div className="w-full flex justify-center z-10 py-12">
        <Suspense
          fallback={
            <div className="w-full max-w-md p-8 md:p-10 bg-bg-card/75 backdrop-blur-xl border border-border-soft/60 shadow-xl rounded-3xl flex flex-col items-center justify-center min-h-100">
              <svg
                className="animate-spin h-8 w-8 text-beauty-400"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              <p className="mt-4 text-sm text-text-secondary">Cargando...</p>
            </div>
          }
        >
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}

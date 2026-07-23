import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import ThemeProvider from "@/components/theme/ThemeProvider";
import { Toaster } from "sonner";
import { getPublicSystemConfig } from "@/lib/config";
import { SystemConfigProvider } from "@/context/SystemConfigContext";
import "../styles/globals.css";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Catálogo de Productos | Lauren Arica",
  description:
    "Explora nuestro catálogo exclusivo de productos Natura y Avon. Filtra por categoría, marca o género y realiza tus consultas de disponibilidad directo por WhatsApp.",
};

const themeScript = `
(function() {
  try {
    var stored = localStorage.getItem('sistema--theme-storage');
    if (stored) {
      var parsed = JSON.parse(stored);
      if (parsed && parsed.state && parsed.state.theme === 'dark') {
        document.documentElement.classList.add('dark');
      }
    }
  } catch (e) {}
})();
`;

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const rawConfig = await getPublicSystemConfig();
  const systemConfig = rawConfig ? JSON.parse(JSON.stringify(rawConfig)) : null;

  return (
    <html lang="es" className={`${outfit.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="font-sans antialiased">
        <SystemConfigProvider value={systemConfig}>
          <ThemeProvider>
            {children}
            <Toaster
              position="bottom-right"
              toastOptions={{
                classNames: {
                  toast:
                    "group flex items-center gap-3 p-4 rounded-[20px] border text-sm font-sans w-full max-w-md shadow-lg transition-all duration-300 bg-bg-card border-border-default text-text-primary",
                  success:
                    "!bg-success-bg !border-success-text/20 !text-success-text dark:!bg-[#112a18] dark:!border-success-text/30 dark:!text-[#81c784]",
                  error:
                    "!bg-danger-bg !border-danger-text/20 !text-danger-text dark:!bg-[#2e1616] dark:!border-danger-text/30 dark:!text-[#ff6b6b]",
                  warning:
                    "!bg-warning-bg !border-warning-text/20 !text-warning-text dark:!bg-[#2a1e12] dark:!border-warning-text/30 dark:!text-[#ffb74d]",
                  info: "!bg-info-bg !border-info-text/20 !text-info-text dark:!bg-[#0f1d2d] dark:!border-info-text/30 dark:!text-[#60a5fa]",
                  loading:
                    "!bg-beauty-50 !border-beauty-200/40 !text-beauty-800 dark:!bg-[#22101b] dark:!border-beauty-400/20 dark:!text-beauty-400",
                  title: "font-semibold",
                  description:
                    "text-text-secondary group-data-[type]:!text-current group-data-[type]:opacity-80",
                },
              }}
            />
          </ThemeProvider>
        </SystemConfigProvider>
      </body>
    </html>
  );
}

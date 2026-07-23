"use client";

import { useSystemConfig } from "@/context/SystemConfigContext";
import { cn } from "@/utils/cn.utils";

interface BrandLogoProps {
  className?: string;
  logoClassName?: string;
  textClassName?: string;
  showText?: boolean;
  size?: "sm" | "md" | "lg" | "xl";
  // Opciones manuales para Server Components (donde no se puede usar el contexto)
  systemName?: string;
  systemLogoUrl?: string | null;
  children?: React.ReactNode;
}

const sizeMappers = {
  sm: {
    logo: "w-8 h-8 text-xs",
    text: "text-sm",
  },
  md: {
    logo: "w-9 h-9 text-base",
    text: "text-lg",
  },
  lg: {
    logo: "w-10 h-10 text-lg",
    text: "text-lg font-black tracking-tight",
  },
  xl: {
    logo: "w-12 h-12 text-xl",
    text: "text-xl font-black tracking-tight",
  },
};

export default function BrandLogo({
  className,
  logoClassName,
  textClassName,
  showText = true,
  size = "md",
  systemName: customName,
  systemLogoUrl: customLogoUrl,
  children,
}: BrandLogoProps) {
  const contextConfig = useSystemConfig();

  const systemName = customName || contextConfig?.systemName || "Mi empresa";
  const systemLogoUrl =
    customLogoUrl !== undefined ? customLogoUrl : contextConfig?.systemLogoUrl;

  const words = systemName.split(" ");
  const currentSize = sizeMappers[size];

  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      {/* Contenedor del Logo Redondo */}
      <div
        className={cn(
          "rounded-full border border-border-default/40 flex items-center justify-center overflow-hidden transition-transform duration-300 hover:scale-105 select-none relative shrink-0",
          systemLogoUrl
            ? "shadow-[0_2px_8px_rgba(219,39,119,0.12)]"
            : "bg-beauty-400 text-white font-extrabold shadow-md shadow-beauty-400/20",
          currentSize.logo,
          logoClassName,
        )}
      >
        {systemLogoUrl ? (
          <img
            src={systemLogoUrl}
            alt={systemName || "Logo"}
            className="w-full h-full object-cover"
          />
        ) : (
          systemName.charAt(0).toUpperCase()
        )}
      </div>

      {/* Nombre de la empresa con formato del sidebar */}
      {showText && (
        <div
          className={cn(
            "flex flex-col leading-none gap-0.5",
            className?.includes("flex-col") ||
              className?.includes("items-center") ||
              className?.includes("text-center")
              ? "items-center text-center"
              : "items-start",
          )}
        >
          <span
            className={cn(
              "font-semibold tracking-wide text-text-primary whitespace-nowrap overflow-hidden transition-colors duration-300 ease-in-out",
              currentSize.text,
              textClassName,
            )}
          >
            {words.length > 1 ? (
              <>
                {words.slice(0, -1).join(" ")}{" "}
                <span className="text-beauty-600 dark:text-beauty-400 font-bold">
                  {words.at(-1)}
                </span>
              </>
            ) : (
              <span className="text-beauty-600 dark:text-beauty-400 font-bold">
                {systemName}
              </span>
            )}
          </span>
          {children}
        </div>
      )}
    </div>
  );
}

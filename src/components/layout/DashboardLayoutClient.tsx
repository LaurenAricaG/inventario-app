"use client";

import { useState, useEffect } from "react";
import Cookies from "js-cookie";
import Sidebar from "./Sidebar";
import Header from "./Header";
import { cn } from "@/utils/cn.utils";
import { usePathname } from "next/navigation";

interface DashboardLayoutClientProps {
  initialCollapsed: boolean;
  userName?: string;
  userEmail?: string;
  userRole?: string;
  userPermissions?: string[];
  children: React.ReactNode;
}

export default function DashboardLayoutClient({
  initialCollapsed,
  userName = "Usuario",
  userEmail = "",
  userRole = "Rol",
  userPermissions = [],
  children,
}: DashboardLayoutClientProps) {
  const [collapsed, setCollapsed] = useState(initialCollapsed);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  // Cerrar el drawer de móvil cuando cambie de página
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const handleToggle = () => {
    // Si la pantalla es menor al breakpoint 'md' (768px)
    if (window.innerWidth < 768) {
      setMobileOpen((prev) => !prev);
    } else {
      const nextState = !collapsed;
      setCollapsed(nextState);
      Cookies.set("sidebar_collapsed", String(nextState), { expires: 365 });
    }
  };

  return (
    <div className="min-h-screen bg-bg-page transition-colors duration-300 text-text-primary font-sans">
      {/* Backdrop de fondo oscuro para móvil */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/35 backdrop-blur-xs z-40 md:hidden transition-opacity duration-300 cursor-pointer"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar Lateral */}
      <Sidebar
        collapsed={collapsed}
        mobileOpen={mobileOpen}
        onClose={() => setMobileOpen(false)}
        userRole={userRole}
        userPermissions={userPermissions}
      />

      {/* Contenedor de Contenido Principal */}
      <div
        className={cn(
          "min-h-screen flex flex-col transition-all duration-300 ease-in-out",
          "pl-0", // En móvil el menú flota, así que no hay relleno
          collapsed ? "md:pl-20" : "md:pl-64", // En escritorio el relleno cambia según esté colapsado o no
        )}
      >
        {/* Cabecera Superior */}
        <Header
          collapsed={collapsed}
          onToggle={handleToggle}
          userName={userName}
          userEmail={userEmail}
          userRole={userRole}
          userPermissions={userPermissions}
        />

        {/* Área del Contenido de las páginas */}
        <main className="flex min-h-0 flex-1 flex-col p-4 md:p-6 max-w-7xl w-full mx-auto animate-fade-in">
          {children}
        </main>
      </div>
    </div>
  );
}

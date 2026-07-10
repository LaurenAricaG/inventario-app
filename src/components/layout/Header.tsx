"use client";

import { useEffect, useState } from "react";
import ThemeToggle from "@/components/theme/ThemeToggle";
import { FiUser, FiMenu } from "react-icons/fi";

interface HeaderProps {
  collapsed: boolean;
  onToggle: () => void;
  userName?: string;
  userRole?: string;
}

export default function Header({
  collapsed,
  onToggle,
  userName = "Lauren Arica",
  userRole = "SELLER",
}: HeaderProps) {
  const [greeting, setGreeting] = useState("¡Hola!");

  useEffect(() => {
    // Generar saludo simple con primer nombre
    const firstName = userName.split(" ")[0];
    setGreeting(`¡Hola, ${firstName}!`);
  }, [userName]);

  return (
    <header className="sticky top-0 right-0 w-full h-16 bg-bg-page/80 backdrop-blur-md border-b border-border-default z-30 flex items-center justify-between px-4 md:px-6 transition-all duration-300 ease-in-out">
      {/* Saludo con Botón de Hamburguesa */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggle}
          className="p-2 rounded-xl text-text-secondary hover:bg-beauty-50 hover:text-beauty-800 transition-colors duration-300 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-beauty-400"
          aria-label={collapsed ? "Expandir menú" : "Colapsar menú"}
        >
          <FiMenu className="w-5 h-5" />
        </button>
        <h1 className="text-base font-semibold text-text-primary leading-none tracking-wide">
          {greeting}
        </h1>
      </div>

      {/* Acciones del Header */}
      <div className="flex items-center gap-4">
        {/* Toggle de Tema */}
        <ThemeToggle />

        {/* Perfil de Usuario Rápido */}
        <div className="flex items-center gap-2.5 pl-3 border-l border-border-default transition-colors duration-300 ease-in-out">
          <div className="w-9 h-9 rounded-full bg-beauty-100 border border-beauty-200 flex items-center justify-center text-beauty-600">
            <FiUser className="w-4 h-4" />
          </div>
          <div className="hidden md:block text-left">
            <p className="text-xs font-semibold text-text-primary">
              {userName}
            </p>
            <p className="text-[10px] text-text-secondary">
              {userRole === "ADMIN" ? "Administradora" : "Vendedora"}
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}

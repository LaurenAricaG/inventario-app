"use client";

import { useEffect, useState, useRef } from "react";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import Link from "next/link";
import ThemeToggle from "@/components/theme/ThemeToggle";
import {
  FiMenu,
  FiChevronDown,
  FiLogOut,
  FiGlobe,
} from "react-icons/fi";
import ButtonIcon from "@/components/ui/ButtonIcon";
import { cn } from "@/utils/cn.utils";

interface HeaderProps {
  collapsed: boolean;
  onToggle: () => void;
  userName?: string;
  userEmail?: string;
  userRole?: string;
  userPermissions?: string[];
}

export default function Header({
  collapsed,
  onToggle,
  userName = "Usuario",
  userEmail = "",
  userRole = "Rol",
  userPermissions = [],
}: HeaderProps) {
  const [greeting, setGreeting] = useState("¡Hola!");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  // Generar saludo simple con primer nombre
  useEffect(() => {
    const firstName = userName.split(" ")[0];
    setGreeting(`¡Hola, ${firstName}!`);
  }, [userName]);

  // Cerrar menú al cambiar de ruta
  useEffect(() => {
    setIsDropdownOpen(false);
  }, [pathname]);

  // Cerrar menú al hacer clic fuera o presionar Escape
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsDropdownOpen(false);
      }
    };

    if (isDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isDropdownOpen]);

  // Obtener iniciales del usuario para el avatar
  const getInitials = (name: string) => {
    const parts = name.trim().split(" ");
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.slice(0, 2).toUpperCase() || "US";
  };

  const initials = getInitials(userName);

  return (
    <header className="sticky top-0 right-0 w-full h-16 bg-bg-page border-b border-border-default z-40 flex items-center justify-between px-4 md:px-6 transition-all duration-300 ease-in-out">
      {/* Saludo con Botón de Hamburguesa */}
      <div className="flex items-center gap-3">
        <ButtonIcon
          onClick={onToggle}
          variant="beauty"
          icon={FiMenu}
          iconClassName={"w-4 h-4"}
          title={collapsed ? "Expandir menú" : "Colapsar menú"}
          aria-label={collapsed ? "Expandir menú" : "Colapsar menú"}
        />
        <h1 className="text-base font-semibold text-text-primary leading-none tracking-wide">
          {greeting}
        </h1>
      </div>

      {/* Acciones del Header */}
      <div className="flex items-center gap-3 sm:gap-4">
        {/* Toggle de Tema */}
        <ThemeToggle />

        {/* Perfil de Usuario Interactivo con Dropdown */}
        <div ref={dropdownRef} className="relative pl-3 border-l border-border-default">
          <button
            type="button"
            onClick={() => setIsDropdownOpen((prev) => !prev)}
            aria-expanded={isDropdownOpen}
            aria-label="Menú de usuario"
            className={cn(
              "flex items-center gap-2.5 p-1 sm:p-1.5 -m-1 sm:-m-1.5 rounded-2xl transition-all duration-200 cursor-pointer select-none group outline-none",
              "hover:bg-bg-surface active:scale-98",
              isDropdownOpen && "bg-bg-surface ring-2 ring-beauty-400/20"
            )}
          >
            {/* Avatar con indicador activo */}
            <div className="relative">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-beauty-400/20 to-beauty-500/30 border border-beauty-400/40 flex items-center justify-center text-beauty-600 dark:text-beauty-400 font-bold text-xs shadow-xs transition-transform group-hover:scale-105">
                {initials}
              </div>
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-bg-card" />
            </div>

            {/* Texto en Desktop */}
            <div className="hidden md:flex flex-col text-left">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-text-primary group-hover:text-beauty-600 dark:group-hover:text-beauty-400 transition-colors max-w-[130px] truncate">
                  {userName}
                </span>
                <FiChevronDown
                  className={cn(
                    "w-3.5 h-3.5 text-text-tertiary transition-transform duration-200",
                    isDropdownOpen && "rotate-180 text-beauty-500"
                  )}
                />
              </div>
              <span className="text-[10px] font-medium text-text-secondary capitalize">
                {userRole || "Rol"}
              </span>
            </div>
          </button>

          {/* Menú Desplegable (Fondo 100% Opaco) */}
          {isDropdownOpen && (
            <div className="absolute right-0 top-full mt-3 w-64 sm:w-72 bg-bg-card border border-border-default rounded-2xl shadow-2xl p-2.5 z-50 animate-in fade-in zoom-in-95 duration-150">
              {/* Tarjeta de Información de Usuario */}
              <div className="p-3 bg-bg-surface rounded-xl border border-border-soft flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-beauty-400 to-beauty-600 text-white flex items-center justify-center font-bold text-sm shadow-sm shrink-0">
                  {initials}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-text-primary truncate">
                    {userName}
                  </p>
                  {userEmail ? (
                    <p className="text-[11px] text-text-secondary truncate mt-0.5">
                      {userEmail}
                    </p>
                  ) : null}
                  <div className="mt-1">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold bg-beauty-400/15 text-beauty-600 dark:text-beauty-400 border border-beauty-400/20 uppercase tracking-wider">
                      {userRole}
                    </span>
                  </div>
                </div>
              </div>

              {/* Opciones del menú */}
              <div className="pt-2.5 space-y-2">
                {/* Botón Ver Catálogo Público (Tipo Beauty, alineado a la izquierda) */}
                <Link
                  href="/"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setIsDropdownOpen(false)}
                  className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold bg-beauty-400 hover:bg-beauty-600 text-white shadow-sm shadow-beauty-400/20 active:scale-98 transition-all duration-200 cursor-pointer select-none group/btn text-left"
                >
                  <FiGlobe className="w-4 h-4 transition-transform group-hover/btn:scale-110 shrink-0" />
                  <span>Ver Catálogo Web</span>
                </Link>

                {/* Botón de Cerrar Sesión (Alineado a la izquierda) */}
                <button
                  type="button"
                  onClick={() => signOut({ callbackUrl: "/login" })}
                  className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl w-full text-danger-text border border-danger-text/20 hover:bg-danger-bg text-xs font-semibold transition-all duration-300 cursor-pointer group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-danger-text/20 active:scale-98 text-left"
                >
                  <FiLogOut className="w-4 h-4 transition-transform duration-300 group-hover:scale-105 shrink-0" />
                  <span>Cerrar Sesión</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

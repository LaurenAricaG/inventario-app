"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { cn } from "@/utils/cn.utils";
import {
  FiHome,
  FiUsers,
  FiShoppingBag,
  FiDollarSign,
  FiPackage,
  FiCalendar,
  FiCreditCard,
  FiLogOut,
  FiLayers,
  FiActivity,
  FiTag,
  FiSettings,
  FiShield,
  FiAlertTriangle,
} from "react-icons/fi";
import { HiOutlineSquares2X2 } from "react-icons/hi2";
import { TbBrandAirtable } from "react-icons/tb";
import { AiOutlineProduct } from "react-icons/ai";
import BrandLogo from "@/components/ui/BrandLogo";

interface SidebarProps {
  collapsed: boolean;
  mobileOpen: boolean;
  onClose: () => void;
  userRole?: string;
  userPermissions?: string[];
}

export default function Sidebar({
  collapsed,
  mobileOpen,
  onClose,
  userPermissions = [],
}: SidebarProps) {
  const pathname = usePathname();
  const [hoveredItem, setHoveredItem] = useState<{
    label: string;
    rect: DOMRect;
  } | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  // Detectar si la pantalla es móvil para desactivar tooltips en el drawer
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Limpiar tooltip si cambia el estado de colapsado
  useEffect(() => {
    setHoveredItem(null);
  }, [collapsed]);

  const isVisuallyCollapsed = collapsed && !isMobile;

  const navItems = [
    { label: "Inicio", href: "/admin", icon: FiHome },
    ...(userPermissions.includes("clients:read")
      ? [{ label: "Clientes", href: "/admin/clientes", icon: FiUsers }]
      : []),
    ...(userPermissions.includes("users:read")
      ? [{ label: "Usuarios", href: "/admin/usuarios", icon: FiUsers }]
      : []),
    ...(userPermissions.includes("roles:read")
      ? [{ label: "Roles y Permisos", href: "/admin/roles", icon: FiShield }]
      : []),
    ...(userPermissions.includes("genders:read")
      ? [{ label: "Géneros", href: "/admin/generos", icon: FiLayers }]
      : []),
    ...(userPermissions.includes("companies:read")
      ? [
          {
            label: "Empresas",
            href: "/admin/empresas",
            icon: HiOutlineSquares2X2,
          },
        ]
      : []),
    ...(userPermissions.includes("brands:read")
      ? [
          {
            label: "Marcas",
            href: "/admin/marcas",
            icon: TbBrandAirtable,
          },
        ]
      : []),
    ...(userPermissions.includes("categories:read")
      ? [
          {
            label: "Categorías",
            href: "/admin/categorias",
            icon: FiTag,
          },
        ]
      : []),
    ...(userPermissions.includes("products:read")
      ? [
          {
            label: "Productos",
            href: "/admin/productos",
            icon: AiOutlineProduct,
          },
        ]
      : []),
    ...(userPermissions.includes("orders:read")
      ? [
          {
            label: "Pedidos Catálogo",
            href: "/admin/pedidos",
            icon: FiShoppingBag,
          },
        ]
      : []),
    ...(userPermissions.includes("sales:read")
      ? [
          {
            label: "Ventas Directas",
            href: "/admin/ventas",
            icon: FiDollarSign,
          },
        ]
      : []),
    ...(userPermissions.includes("inventory:read")
      ? [
          {
            label: "Inventario (Kardex)",
            href: "/admin/inventario",
            icon: FiPackage,
          },
        ]
      : []),
    ...(userPermissions.includes("campaigns:read")
      ? [
          {
            label: "Campañas / PDFs",
            href: "/admin/campanias",
            icon: FiCalendar,
          },
        ]
      : []),
    ...(userPermissions.includes("transactions:read")
      ? [
          {
            label: "Movimientos",
            href: "/admin/movimientos",
            icon: FiCreditCard,
          },
        ]
      : []),
    ...(userPermissions.includes("payments:read")
      ? [{ label: "Pagos", href: "/admin/pagos", icon: FiDollarSign }]
      : []),
    ...(userPermissions.includes("debts:read")
      ? [{ label: "Deudas", href: "/admin/deudas", icon: FiAlertTriangle }]
      : []),
    ...(userPermissions.includes("audit:read")
      ? [{ label: "Bitácora", href: "/admin/bitacora", icon: FiActivity }]
      : []),
    ...(userPermissions.includes("config:read")
      ? [
          {
            label: "Configuración",
            href: "/admin/configuracion",
            icon: FiSettings,
          },
        ]
      : []),
  ];

  return (
    <aside
      className={cn(
        "fixed top-0 left-0 h-screen bg-bg-surface border-r border-border-default transition-all duration-300 ease-in-out z-50 flex flex-col shadow-xs",
        // Comportamiento móvil (Drawer): oculto a la izquierda por defecto, visible cuando mobileOpen es true
        "w-64 -translate-x-full md:translate-x-0",
        mobileOpen && "translate-x-0",
        // Comportamiento de escritorio: w-20 si está colapsado, w-64 si está expandido
        collapsed ? "md:w-20" : "md:w-64",
      )}
    >
      {/* Cabecera / Logo (Fijo, no se encoge) */}
      <div className="h-16 flex items-center justify-start px-4 border-b border-border-default transition-colors duration-300 ease-in-out shrink-0 overflow-hidden">
        <BrandLogo
          className="pl-2"
          showText={!collapsed}
          textClassName={cn(
            "text-lg transition-all duration-300 ease-in-out",
            collapsed
              ? "md:max-w-0 md:opacity-0 md:pointer-events-none"
              : "max-w-48 opacity-100",
          )}
          size="md"
        />
      </div>

      <nav
        onScroll={() => setHoveredItem(null)}
        className={cn(
          "p-3 space-y-1.5 mt-4 flex-1 min-h-0 overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-thumb-stone-300 dark:scrollbar-thumb-zinc-700",
          collapsed && "md:px-2",
        )}
      >
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            pathname === item.href ||
            (item.href !== "/admin" && pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              onMouseEnter={(e) => {
                if (isVisuallyCollapsed) {
                  const rect = e.currentTarget.getBoundingClientRect();
                  setHoveredItem({ label: item.label, rect });
                }
              }}
              onMouseLeave={() => setHoveredItem(null)}
              className={cn(
                "flex items-center transition-all duration-200 group relative rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-beauty-400",
                // En móvil es w-full con padding. En desktop colapsado es un cuadrado centrado de 48px (w-12 h-12)
                collapsed
                  ? "w-full gap-3 px-3 py-3 md:w-12 md:h-12 md:justify-center md:mx-auto md:px-0 md:gap-0"
                  : "w-full gap-3 px-3 py-3",
                isActive
                  ? "bg-bg-active-item text-text-active-item font-semibold"
                  : "text-text-secondary hover:bg-bg-active-item hover:text-text-active-item",
              )}
              title={isVisuallyCollapsed ? item.label : undefined}
            >
              <Icon
                className={cn(
                  "w-5 h-5 transition-transform duration-300 group-hover:scale-105 shrink-0",
                  isActive
                    ? "text-text-active-item"
                    : "text-text-secondary group-hover:text-text-active-item",
                )}
              />

              {/* Texto de menú: se oculta en desktop si está colapsado con transición suave */}
              <span
                className={cn(
                  "text-sm tracking-wide transition-all duration-300 ease-in-out whitespace-nowrap overflow-hidden",
                  collapsed
                    ? "md:max-w-0 md:opacity-0 md:pointer-events-none"
                    : "max-w-48 opacity-100",
                )}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>

      {/* Botón de Cerrar Sesión en la parte inferior */}
      <div
        className={cn(
          "p-3 border-t border-border-default transition-colors duration-300 ease-in-out shrink-0",
          collapsed && "md:px-2",
        )}
      >
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          onMouseEnter={(e) => {
            if (isVisuallyCollapsed) {
              const rect = e.currentTarget.getBoundingClientRect();
              setHoveredItem({ label: "Cerrar Sesión", rect });
            }
          }}
          onMouseLeave={() => setHoveredItem(null)}
          className={cn(
            "flex items-center gap-3 px-3 py-3 rounded-2xl w-full text-danger-text border border-danger-text/20 hover:bg-danger-bg transition-all duration-300 cursor-pointer group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-danger-text/20",
            collapsed
              ? "md:w-12 md:h-12 md:justify-center md:mx-auto md:px-0 md:gap-0"
              : "",
          )}
        >
          <FiLogOut className="w-5 h-5 transition-transform duration-300 group-hover:scale-105 shrink-0" />
          <span
            className={cn(
              "text-sm font-medium tracking-wide transition-all duration-300 ease-in-out whitespace-nowrap overflow-hidden",
              collapsed
                ? "md:max-w-0 md:opacity-0 md:pointer-events-none"
                : "max-w-48 opacity-100",
            )}
          >
            Cerrar Sesión
          </span>
        </button>
      </div>

      {/* Tooltip flotante de posición fija para evitar recortes por overflow-y-auto */}
      {isVisuallyCollapsed && hoveredItem && (
        <div
          className="fixed px-2.5 py-1.5 bg-text-primary text-bg-page text-xs rounded-lg shadow-md z-50 pointer-events-none transition-all duration-300 whitespace-nowrap"
          style={{
            top: `${hoveredItem.rect.top + hoveredItem.rect.height / 2}px`,
            left: `${hoveredItem.rect.right + 16}px`,
            transform: "translateY(-50%)",
          }}
        >
          {hoveredItem.label}
        </div>
      )}
    </aside>
  );
}

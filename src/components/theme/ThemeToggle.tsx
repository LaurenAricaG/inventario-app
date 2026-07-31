"use client";

import { useEffect, useState } from "react";
import useTheme from "@/store/useTheme";
import { cn } from "@/utils/cn.utils";
import { FiMoon, FiSun } from "react-icons/fi";

const ThemeToggle = () => {
  const theme = useTheme((state) => state.theme);
  const toggleTheme = useTheme((state) => state.toggleTheme);

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return <div className="w-9 h-9" aria-hidden="true" />;

  return (
    <button
      type="button"
      className={cn(
        "w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200 group relative cursor-pointer shadow-xs border shrink-0",
        "border-border-strong bg-bg-card text-text-primary hover:bg-beauty-50 hover:border-beauty-300 dark:hover:bg-beauty-950/80 dark:hover:border-beauty-700",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-beauty-400 focus-visible:ring-offset-2 ring-offset-bg-card"
      )}
      onClick={toggleTheme}
      aria-label="Cambiar tema"
      title={theme === "light" ? "Cambiar a modo oscuro" : "Cambiar a modo claro"}
    >
      {theme === "light" ? (
        <FiMoon className="w-4 h-4 text-text-primary group-hover:text-beauty-600 transition-transform group-hover:scale-110" />
      ) : (
        <FiSun className="w-4 h-4 text-amber-400 group-hover:text-amber-300 transition-transform group-hover:scale-110 group-hover:rotate-45" />
      )}
    </button>
  );
};

export default ThemeToggle;

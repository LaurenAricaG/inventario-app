"use client";

import { useEffect, useState } from "react";
import useTheme from "@/store/useTheme";
import { cn } from "@/utils/cn.utils";
import { FiMoon, FiSun } from "react-icons/fi";

const ThemeToggle = () => {
  const theme = useTheme((state) => state.theme);
  const setTheme = useTheme((state) => state.setTheme);
  const toggleTheme = useTheme((state) => state.toggleTheme);

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    const storedTheme = localStorage.getItem("lauren-theme-storage");

    if (!storedTheme) {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)")
        .matches
        ? "dark"
        : "light";
      setTheme(systemTheme);
    } else {
      document.documentElement.classList.toggle("dark", theme === "dark");
    }
  }, [setTheme, theme]);

  if (!mounted) return <div className="w-12 h-12" />;

  return (
    <button
      className={cn(
        "p-3 rounded-full flex items-center justify-center transition-colors duration-200 group relative focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-beauty-400",
        "text-gray-600 dark:text-gray-100 hover:bg-black/5 dark:hover:bg-white/10 cursor-pointer",
      )}
      onClick={toggleTheme}
      aria-label="Cambiar tema"
    >
      {theme === "light" ? (
        <FiMoon className="text-slate-800" />
      ) : (
        <FiSun className="text-slate-200 " />
      )}
    </button>
  );
};

export default ThemeToggle;

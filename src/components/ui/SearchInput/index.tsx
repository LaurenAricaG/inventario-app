"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { FiSearch, FiX } from "react-icons/fi";
import Input from "@/components/ui/Input";

interface SearchInputProps {
  placeholder?: string;
  debounceMs?: number;
}

export default function SearchInput({
  placeholder = "Buscar...",
  debounceMs = 500,
}: SearchInputProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const initialQuery = searchParams.get("search") || "";
  const [value, setValue] = useState(initialQuery);

  useEffect(() => {
    // Sync state with URL parameter (e.g. if filters are cleared)
    setValue(searchParams.get("search") || "");
  }, [searchParams]);

  useEffect(() => {
    const handler = setTimeout(() => {
      const currentSearch = searchParams.get("search") || "";
      if (value === currentSearch) {
        // If the value hasn't changed from what's in the URL, do nothing
        return;
      }

      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set("search", value);
      } else {
        params.delete("search");
      }
      // Reset to page 1 on new search
      params.delete("page");

      router.push(`${pathname}?${params.toString()}`);
    }, debounceMs);

    return () => {
      clearTimeout(handler);
    };
  }, [value, debounceMs, pathname, router, searchParams]);

  const handleClear = () => {
    setValue("");
    const params = new URLSearchParams(searchParams);
    params.delete("search");
    params.delete("page");
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="w-full max-w-md">
      <Input
        placeholder={placeholder}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        icon={<FiSearch className="w-4 h-4 text-text-tertiary" />}
        endIcon={
          value ? (
            <button
              onClick={handleClear}
              className="p-1 rounded-lg hover:bg-bg-surface text-text-tertiary hover:text-text-primary transition-colors cursor-pointer"
              aria-label="Limpiar búsqueda"
            >
              <FiX className="w-4 h-4" />
            </button>
          ) : undefined
        }
      />
    </div>
  );
}

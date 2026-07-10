"use client";

import { usePathname, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  FiChevronLeft,
  FiChevronRight,
  FiChevronsLeft,
  FiChevronsRight,
} from "react-icons/fi";
import { cn } from "@/utils/cn.utils";

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage?: number;
  onPageChange?: (page: number) => void;
}

export default function Pagination({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage = 10,
  onPageChange,
}: PaginationProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // If there's only 1 or 0 pages, we don't need to display pagination controls
  if (totalPages <= 1) {
    return (
      <div className="flex items-center justify-between py-4 px-6 text-xs text-text-secondary select-none">
        <span>
          Mostrando 1 - {totalItems} de {totalItems} resultados
        </span>
      </div>
    );
  }

  // Calculate items showing range
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  // Helper to build page URL
  const createPageURL = (pageNumber: number | string) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", pageNumber.toString());
    return `${pathname}?${params.toString()}`;
  };

  // Generate page numbers to display
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always include page 1
      pages.push(1);

      // Calculate start and end indices around the current page
      let start = Math.max(2, currentPage - 1);
      let end = Math.min(totalPages - 1, currentPage + 1);

      // Adjust boundaries to ensure we show a consistent number of pages
      if (currentPage <= 3) {
        end = 4;
      } else if (currentPage >= totalPages - 2) {
        start = totalPages - 3;
      }

      // Add left ellipsis if needed
      if (start > 2) {
        pages.push("...");
      }

      // Add pages in the middle
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      // Add right ellipsis if needed
      if (end < totalPages - 1) {
        pages.push("...");
      }

      // Always include the last page
      pages.push(totalPages);
    }

    return pages;
  };

  const pageNumbers = getPageNumbers();

  const handlePageClick = (
    e: React.MouseEvent<HTMLAnchorElement | HTMLButtonElement>,
    page: number
  ) => {
    if (onPageChange) {
      e.preventDefault();
      onPageChange(page);
    }
  };

  // Shared button styles (for active, standard, and hover states)
  const btnClass = cn(
    "flex items-center justify-center w-9 h-9 rounded-xl border select-none text-xs font-semibold transition-all duration-250 ease-in-out cursor-pointer",
    "border-border-default/60 bg-bg-card text-text-secondary hover:bg-beauty-400/10 hover:text-beauty-600 dark:hover:bg-beauty-600/15 dark:hover:text-beauty-400 hover:border-beauty-400/30",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-beauty-400/30 focus-visible:ring-offset-2"
  );

  const renderButton = (page: number, content: React.ReactNode, label: string, disabled: boolean) => {
    const isActive = page === currentPage;

    if (isActive) {
      return (
        <button
          type="button"
          className={cn(
            "flex items-center justify-center w-9 h-9 rounded-xl border select-none text-xs font-bold transition-all duration-200 pointer-events-none",
            "bg-beauty-400 border-beauty-400 text-white shadow-sm shadow-beauty-400/20"
          )}
          aria-current="page"
          aria-label={label}
        >
          {content}
        </button>
      );
    }

    if (disabled) {
      return (
        <button
          type="button"
          disabled
          className={cn(
            "flex items-center justify-center w-9 h-9 rounded-xl border select-none text-xs font-semibold transition-all duration-200",
            "border-border-default/30 bg-bg-surface/30 text-text-tertiary/40 cursor-not-allowed"
          )}
          aria-label={label}
        >
          {content}
        </button>
      );
    }

    if (onPageChange) {
      return (
        <button
          type="button"
          onClick={(e) => handlePageClick(e, page)}
          className={btnClass}
          aria-label={label}
        >
          {content}
        </button>
      );
    }

    return (
      <Link
        href={createPageURL(page)}
        className={btnClass}
        aria-label={label}
      >
        {content}
      </Link>
    );
  };

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-4 px-6 border-t border-border-soft w-full">
      {/* Informative Label */}
      <div className="text-xs text-text-secondary text-center sm:text-left select-none">
        Mostrando <span className="font-semibold text-text-primary">{startItem}</span> a{" "}
        <span className="font-semibold text-text-primary">{endItem}</span> de{" "}
        <span className="font-semibold text-text-primary">{totalItems}</span> resultados
      </div>

      {/* Desktop / Tablet Pagination Controls */}
      <nav className="hidden md:flex items-center gap-1.5" aria-label="Paginación de resultados">
        {/* First Page */}
        {renderButton(1, <FiChevronsLeft className="w-4 h-4" />, "Primera página", currentPage === 1)}

        {/* Previous Page */}
        {renderButton(currentPage - 1, <FiChevronLeft className="w-4 h-4" />, "Página anterior", currentPage === 1)}

        {/* Page Numbers */}
        {pageNumbers.map((page, index) => {
          if (page === "...") {
            return (
              <span
                key={`ellipsis-${index}`}
                className="flex items-center justify-center w-9 h-9 text-text-tertiary select-none text-xs font-medium"
              >
                ...
              </span>
            );
          }

          const pageNum = page as number;
          return (
            <span key={`page-${pageNum}`}>
              {renderButton(pageNum, pageNum.toString(), `Ir a página ${pageNum}`, false)}
            </span>
          );
        })}

        {/* Next Page */}
        {renderButton(
          currentPage + 1,
          <FiChevronRight className="w-4 h-4" />,
          "Página siguiente",
          currentPage === totalPages
        )}

        {/* Last Page */}
        {renderButton(
          totalPages,
          <FiChevronsRight className="w-4 h-4" />,
          "Última página",
          currentPage === totalPages
        )}
      </nav>

      {/* Mobile Pagination Controls (Compact Design) */}
      <nav className="flex md:hidden items-center gap-2" aria-label="Paginación de resultados móvil">
        {renderButton(1, <FiChevronsLeft className="w-3.5 h-3.5" />, "Primera página", currentPage === 1)}
        {renderButton(currentPage - 1, <FiChevronLeft className="w-3.5 h-3.5" />, "Página anterior", currentPage === 1)}

        <span className="text-xs font-semibold text-text-primary px-3 py-1.5 bg-bg-surface rounded-xl border border-border-default/30 select-none">
          {currentPage} de {totalPages}
        </span>

        {renderButton(
          currentPage + 1,
          <FiChevronRight className="w-3.5 h-3.5" />,
          "Página siguiente",
          currentPage === totalPages
        )}
        {renderButton(
          totalPages,
          <FiChevronsRight className="w-3.5 h-3.5" />,
          "Última página",
          currentPage === totalPages
        )}
      </nav>
    </div>
  );
}

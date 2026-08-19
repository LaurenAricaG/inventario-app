"use client";

import { useState } from "react";
import {
  FiCheck,
  FiChevronLeft,
  FiChevronRight,
  FiHeart,
  FiClock,
  FiMessageCircle,
} from "react-icons/fi";
import { FaWhatsapp } from "react-icons/fa";
import { cn } from "@/utils/cn.utils";
import { getBrandBadgeStyle, getCompanyBadgeStyle } from "@/utils/brand.utils";

interface ProductCardProps {
  product: {
    id: number;
    code: string | null;
    name: string;
    description: string | null;
    price: number;
    catalogPrice?: number | null;
    stock: number;
    brand: {
      name: string;
      company: {
        name: string;
      };
    };
    category: {
      name: string;
    };
    genderSegment: {
      name: string;
    } | null;
    images: {
      id: number;
      url: string;
      position: number;
      isMain: boolean;
    }[];
  };
  showPrice: boolean;
  showStockCount: boolean;
  whatsappNumber: string;
  isFavorite: boolean;
  onToggleFavorite: (id: number) => void;
}

export default function ProductCard({
  product,
  showPrice,
  showStockCount,
  whatsappNumber,
  isFavorite,
  onToggleFavorite,
}: ProductCardProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Obtener imágenes ordenadas por posición
  const images =
    product.images.length > 0
      ? [...product.images].sort((a, b) => a.position - b.position)
      : [{ id: 0, url: "/no-image.svg", position: 0, isMain: true }];

  const inStock = product.stock > 0;

  const handlePrevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setCurrentImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setCurrentImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  // Generador de enlace de WhatsApp
  const generateWhatsAppLink = () => {
    const priceLines = showPrice
      ? [
          product.catalogPrice
            ? `*Precio Catálogo:* S/. ${product.catalogPrice.toFixed(2)}`
            : null,
          `*Precio Venta:* S/. ${product.price.toFixed(2)}`,
        ]
          .filter(Boolean)
          .join("\n")
      : "*Precio:* Consultar precio";

    const text = `¡Hola! Vi tu catálogo web y me interesa consultar por el siguiente producto:

*Producto:* ${product.name}
*Código:* ${product.code || "S/C"}
*Catálogo:* ${product.brand.name}
${priceLines}
*Estado:* ${inStock ? "En Stock" : "Bajo Pedido"}

¿Me podrías confirmar disponibilidad? ¡Muchas gracias!`;

    return `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(text)}`;
  };

  return (
    <article className="group bg-bg-card border border-border-default hover:border-beauty-400 dark:hover:border-beauty-600 rounded-2xl overflow-hidden flex flex-col transition-all duration-300 hover:shadow-lg relative h-full">
      {/* Badge de Marca / Catálogo en esquina superior izquierda */}
      <span
        className={cn(
          "absolute top-3 left-3 z-10 px-2.5 py-1 rounded-lg text-[9px] font-extrabold uppercase tracking-wider border shadow-xs select-none backdrop-blur-xs",
          getBrandBadgeStyle(product.brand.name),
        )}
      >
        {product.brand.name}
      </span>

      {/* Botón Favorito */}
      <button
        onClick={() => onToggleFavorite(product.id)}
        className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-white/80 dark:bg-black/50 backdrop-blur-md border border-border-default/30 flex items-center justify-center text-text-secondary hover:text-rose-500 hover:bg-white dark:hover:bg-black transition-all cursor-pointer shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-beauty-400"
        aria-label={isFavorite ? "Quitar de favoritos" : "Añadir a favoritos"}
      >
        <FiHeart
          className={cn(
            "w-4 h-4 transition-transform active:scale-95",
            isFavorite
              ? "fill-rose-500 text-rose-500 scale-110"
              : "text-text-secondary",
          )}
        />
      </button>

      {/* Contenedor de Imagen con Control Deslizante (Slider) */}
      <div className="aspect-4/3 w-full overflow-hidden bg-bg-surface relative border-b border-border-default/40 group-hover:border-border-default/80 transition-colors">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={images[currentImageIndex].url}
          alt={`${product.name} - Imagen ${currentImageIndex + 1}`}
          className={cn(
            "w-full h-full select-none pointer-events-none transition-transform duration-500 ease-out group-hover:scale-105",
            images[currentImageIndex].url === "/no-image.svg"
              ? "object-contain p-8 opacity-40 group-hover:scale-100"
              : "object-contain",
          )}
          loading="lazy"
        />

        {/* Flechas de navegación del Slider (Solo si hay más de 1 imagen) */}
        {images.length > 1 && (
          <>
            <button
              onClick={handlePrevImage}
              className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/90 dark:bg-bg-card/90 backdrop-blur-xs border border-border-strong flex items-center justify-center text-text-primary hover:text-beauty-600 hover:border-beauty-300 dark:hover:text-beauty-400 dark:hover:border-beauty-700 disabled:pointer-events-none cursor-pointer shadow-md transition-all active:scale-90"
              aria-label="Imagen anterior"
              title="Imagen anterior"
            >
              <FiChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={handleNextImage}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/90 dark:bg-bg-card/90 backdrop-blur-xs border border-border-strong flex items-center justify-center text-text-primary hover:text-beauty-600 hover:border-beauty-300 dark:hover:text-beauty-400 dark:hover:border-beauty-700 disabled:pointer-events-none cursor-pointer shadow-md transition-all active:scale-90"
              aria-label="Imagen siguiente"
              title="Imagen siguiente"
            >
              <FiChevronRight className="w-4 h-4" />
            </button>
          </>
        )}

        {/* Indicador de posición de imágenes (Dots) */}
        {images.length > 1 && (
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-10 px-2 py-1 rounded-full bg-black/40 backdrop-blur-xs">
            {images.map((_, idx) => (
              <span
                key={idx}
                className={cn(
                  "w-1.5 h-1.5 rounded-full transition-all duration-200",
                  currentImageIndex === idx
                    ? "bg-white w-3"
                    : "bg-white/50 hover:bg-white/75",
                )}
              />
            ))}
          </div>
        )}
      </div>

      {/* Contenido / Detalles del producto */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-3.5">
        <div className="space-y-1.5">
          {/* Categoría y Segmento Unificados */}
          <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-text-tertiary">
            <span className="truncate">
              {product.category.name}
            </span>
            {product.genderSegment && (
              <>
                <span className="text-border-strong select-none">•</span>
                <span className="shrink-0 text-text-secondary font-bold">
                  {product.genderSegment.name}
                </span>
              </>
            )}
          </div>

          {/* Nombre del Producto */}
          <h3 className="text-sm sm:text-base font-extrabold text-text-primary line-clamp-1 group-hover:text-beauty-600 dark:group-hover:text-beauty-400 transition-colors leading-snug tracking-tight">
            {product.name}
          </h3>

          {/* Código del Producto */}
          {product.code && (
            <span className="text-[10px] font-mono text-text-tertiary block">
              Cod: {product.code}
            </span>
          )}

          {/* Descripción */}
          {product.description ? (
            <p className="text-xs text-text-secondary line-clamp-2 leading-relaxed pt-0.5">
              {product.description}
            </p>
          ) : (
            <p className="text-xs text-text-tertiary italic pt-0.5">
              Sin descripción detallada.
            </p>
          )}
        </div>

        {/* Footer del Card: Precios, Stock y Botón WhatsApp Full Width */}
        <div className="pt-3 border-t border-border-default/40 flex flex-col gap-3">
          {/* Precios y Stock */}
          <div className="flex flex-col min-w-0">
            {showPrice ? (
              <>
                {product.catalogPrice !== null &&
                product.catalogPrice !== undefined &&
                product.catalogPrice > 0 ? (
                  <div className="flex items-center gap-1.5 text-[11px] leading-tight">
                    <span className="text-[9px] text-text-tertiary uppercase font-bold tracking-wider">
                      Catálogo:
                    </span>
                    <span className="text-[11px] font-semibold text-text-tertiary/80 line-through">
                      S/ {product.catalogPrice.toFixed(2)}
                    </span>
                  </div>
                ) : null}

                {/* Fila de Precio Venta y Stock alineados */}
                <div className="flex items-center justify-between gap-2 mt-0.5">
                  <div className="flex items-baseline gap-1">
                    <span className="text-[9px] text-text-tertiary uppercase font-bold tracking-wider">
                      {product.catalogPrice !== null &&
                      product.catalogPrice !== undefined &&
                      product.catalogPrice > 0
                        ? "Venta:"
                        : "Precio:"}
                    </span>
                    <span className="text-xs font-bold text-text-secondary">
                      S/
                    </span>
                    <span className="text-lg sm:text-xl font-black text-text-primary tracking-tight leading-none">
                      {product.price.toFixed(2)}
                    </span>
                  </div>

                  {/* Disponibilidad / Stock */}
                  <span
                    className={cn(
                      "inline-flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-0.5 rounded-full select-none border transition-colors shrink-0",
                      inStock
                        ? "bg-success-bg text-success-text border-success-text/20"
                        : "bg-warning-bg text-warning-text border-warning-text/20",
                    )}
                  >
                    {inStock ? (
                      <>
                        <span className="w-1.5 h-1.5 rounded-full bg-success-text animate-pulse shrink-0" />
                        {showStockCount ? (
                          <span>
                            Stock:{" "}
                            <strong className="font-extrabold">
                              {product.stock}
                            </strong>
                          </span>
                        ) : (
                          <span>En Stock</span>
                        )}
                      </>
                    ) : (
                      <>
                        <FiClock className="w-3 h-3 text-warning-text shrink-0" />
                        <span>Bajo Pedido</span>
                      </>
                    )}
                  </span>
                </div>
              </>
            ) : (
              <div className="flex items-center justify-between gap-2">
                <div className="inline-flex items-center gap-1 text-xs font-extrabold text-success-text">
                  <FiMessageCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>Consultar precio</span>
                </div>

                {/* Disponibilidad / Stock */}
                <span
                  className={cn(
                    "inline-flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-0.5 rounded-full select-none border transition-colors shrink-0",
                    inStock
                      ? "bg-success-bg text-success-text border-success-text/20"
                      : "bg-warning-bg text-warning-text border-warning-text/20",
                  )}
                >
                  {inStock ? (
                    <>
                      <span className="w-1.5 h-1.5 rounded-full bg-success-text animate-pulse shrink-0" />
                      {showStockCount ? (
                        <span>
                          Stock:{" "}
                          <strong className="font-extrabold">
                            {product.stock}
                          </strong>
                        </span>
                      ) : (
                        <span>En Stock</span>
                      )}
                    </>
                  ) : (
                    <>
                      <FiClock className="w-3 h-3 text-warning-text shrink-0" />
                      <span>Bajo Pedido</span>
                    </>
                  )}
                </span>
              </div>
            )}
          </div>

          {/* Botón de WhatsApp Sólido */}
          <a
            href={generateWhatsAppLink()}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold text-xs sm:text-sm transition-all duration-200 shadow-xs hover:shadow-md hover:shadow-emerald-600/20 active:scale-[0.98] select-none group/btn cursor-pointer"
            title="Pedir por WhatsApp"
          >
            <FaWhatsapp className="w-4 h-4 transition-transform group-hover/btn:scale-110" />
            <span>Pedir por WhatsApp</span>
          </a>
        </div>
      </div>
    </article>
  );
}


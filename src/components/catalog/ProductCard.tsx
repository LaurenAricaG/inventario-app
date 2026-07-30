"use client";

import { useState } from "react";
import {
  FiCheck,
  FiChevronLeft,
  FiChevronRight,
  FiHeart,
} from "react-icons/fi";
import { FaWhatsapp } from "react-icons/fa";
import { cn } from "@/utils/cn.utils";

interface ProductCardProps {
  product: {
    id: number;
    code: string | null;
    name: string;
    description: string | null;
    price: number;
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
    const priceText = showPrice
      ? `S/. ${product.price.toFixed(2)}`
      : "Consultar precio";
    const text = `¡Hola! Vi tu catálogo web y me interesa consultar por el siguiente producto:

*Producto:* ${product.name}
*Código:* ${product.code || "S/C"}
*Empresa/Marca:* ${product.brand.company.name} / ${product.brand.name}
*Precio:* ${priceText}
*Estado:* ${inStock ? "En Stock" : "Bajo Pedido"}

¿Me podrías confirmar disponibilidad? ¡Muchas gracias!`;

    return `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(text)}`;
  };

  return (
    <article className="group bg-bg-card border border-border-default hover:border-beauty-400 dark:hover:border-beauty-600 rounded-2xl overflow-hidden flex flex-col transition-all duration-300 hover:shadow-lg relative h-full">
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
      <div className="aspect-4/3 w-full overflow-hidden bg-bg-surface relative border-b border-border-default/40 group-hover:opacity-95 transition-opacity">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={images[currentImageIndex].url}
          alt={`${product.name} - Imagen ${currentImageIndex + 1}`}
          className={cn(
            "w-full h-full select-none pointer-events-none",
            images[currentImageIndex].url === "/no-image.svg"
              ? "object-contain p-8 opacity-40"
              : "object-contain",
          )}
          loading="lazy"
        />

        {/* Flechas de navegación del Slider (Solo si hay más de 1 imagen) */}
        {images.length > 1 && (
          <>
            <button
              onClick={handlePrevImage}
              className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white dark:bg-bg-card border border-border-strong flex items-center justify-center text-text-primary dark:text-text-primary hover:text-beauty-600 hover:border-beauty-300 dark:hover:text-beauty-400 dark:hover:border-beauty-700 disabled:pointer-events-none cursor-pointer shadow-md transition-all active:scale-90"
              aria-label="Imagen anterior"
              title="Imagen anterior"
            >
              <FiChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={handleNextImage}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white dark:bg-bg-card border border-border-strong flex items-center justify-center text-text-primary dark:text-text-primary hover:text-beauty-600 hover:border-beauty-300 dark:hover:text-beauty-400 dark:hover:border-beauty-700 disabled:pointer-events-none cursor-pointer shadow-md transition-all active:scale-90"
              aria-label="Imagen siguiente"
              title="Imagen siguiente"
            >
              <FiChevronRight className="w-4 h-4" />
            </button>
          </>
        )}

        {/* Indicadores de Páginas/Imágenes (Dots de tipo Instagram) */}
        {images.length > 1 && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1 bg-black/30 dark:bg-black/60 px-2 py-1 rounded-full backdrop-blur-xs select-none">
            {images.map((_, idx) => (
              <span
                key={idx}
                className={cn(
                  "w-1.5 h-1.5 rounded-full transition-all duration-200",
                  idx === currentImageIndex
                    ? "bg-white scale-110"
                    : "bg-white/40",
                )}
              />
            ))}
          </div>
        )}

        {/* Marca Badge */}
        <span
          className={cn(
            "absolute bottom-3 left-3 px-2.5 py-1 rounded-lg text-[9px] font-extrabold uppercase tracking-wider border shadow-xs select-none",
            product.brand.company.name.toLowerCase() === "natura"
              ? "bg-orange-50/90 border-orange-200/50 text-orange-700 dark:bg-orange-950/90 dark:border-orange-900/40 dark:text-orange-300"
              : "bg-purple-50/90 border-purple-200/50 text-purple-700 dark:bg-purple-950/90 dark:border-purple-900/40 dark:text-purple-300",
          )}
        >
          {product.brand.name}
        </span>
      </div>

      {/* Contenido / Detalles del producto */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-4">
        <div className="space-y-1.5">
          {/* Empresa, Categoría y Segmento */}
          <div className="flex items-center justify-between text-[9px] uppercase tracking-wider text-text-tertiary font-extrabold gap-2">
            <div className="flex items-center gap-1.5 truncate">
              <span>{product.brand.company.name}</span>
              <span className="text-text-tertiary/50">•</span>
              <span className="text-beauty-600 dark:text-beauty-400 font-bold truncate">
                {product.category.name}
              </span>
            </div>
            {product.genderSegment && (
              <span className="bg-bg-surface px-2 py-0.5 rounded-md font-bold text-text-secondary shrink-0">
                {product.genderSegment.name}
              </span>
            )}
          </div>

          {/* Nombre del Producto */}
          <h3 className="text-xs sm:text-sm font-bold text-text-primary line-clamp-1 group-hover:text-beauty-600 dark:group-hover:text-beauty-400 transition-colors leading-snug">
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
            <p className="text-xs text-text-secondary line-clamp-2 leading-relaxed pt-1">
              {product.description}
            </p>
          ) : (
            <p className="text-xs text-text-tertiary italic pt-1">
              Sin descripción detallada.
            </p>
          )}
        </div>

        {/* Footer del Card: Precios, Stock y WhatsApp */}
        <div className="pt-3.5 border-t border-border-default/40 flex items-center justify-between gap-3">
          {/* Precio y Disponibilidad */}
          <div className="flex flex-col min-w-0">
            <span className="text-[9px] text-text-tertiary uppercase font-bold tracking-wider leading-none">
              Catálogo
            </span>
            {showPrice ? (
              <span className="text-sm sm:text-base font-extrabold text-text-primary mt-1">
                S/. {product.price.toFixed(2)}
              </span>
            ) : (
              <span className="text-xs font-semibold text-text-tertiary italic mt-1.5 select-none leading-tight">
                Consultar
              </span>
            )}

            {/* Disponibilidad / Stock */}
            <span
              className={cn(
                "inline-flex items-center gap-1 text-[8px] font-extrabold mt-1.5 px-1.5 py-0.5 rounded-md w-fit uppercase select-none",
                inStock
                  ? "bg-success-bg text-success-text"
                  : "bg-warning-bg text-warning-text",
              )}
            >
              {inStock && <FiCheck className="w-2 h-2 shrink-0" />}
              {inStock
                ? showStockCount
                  ? `Stock (${product.stock})`
                  : "En Stock"
                : "Bajo Pedido"}
            </span>
          </div>

          {/* Botón de Contacto por WhatsApp */}
          <a
            href={generateWhatsAppLink()}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-xs font-bold shadow-xs hover:shadow-sm transition-all duration-200 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
            title="Consultar por WhatsApp"
          >
            <FaWhatsapp className="w-4 h-4 shrink-0" />
          </a>
        </div>
      </div>
    </article>
  );
}

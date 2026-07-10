"use client";

import { useState, useEffect } from "react";
import {
  FiPackage,
  FiGrid,
  FiTag,
  FiUser,
  FiInfo,
  FiHash,
  FiTrendingUp,
  FiCreditCard,
  FiCheckCircle,
  FiSlash,
} from "react-icons/fi";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import { ProductWithRelations } from "@/types/models";
import { cn } from "@/utils/cn.utils";

interface DetailProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: ProductWithRelations | null;
  canReadCost: boolean;
}

export default function DetailProductModal({
  isOpen,
  onClose,
  product,
  canReadCost,
}: DetailProductModalProps) {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  // Reset selected image index when modal opens or product changes
  useEffect(() => {
    if (isOpen) {
      setSelectedImageIndex(0);
    }
  }, [isOpen, product]);

  if (!product) return null;

  // Sort images by position to keep consistent order
  const images = product.images
    ? [...product.images].sort((a, b) => a.position - b.position)
    : [];

  const mainImage = images[selectedImageIndex] || null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Ficha del Producto"
      size="xl"
      className="max-w-4xl"
      footer={
        <Button
          variant="outline"
          onClick={onClose}
          className="border-border-strong text-text-primary hover:bg-bg-surface px-6"
        >
          Cerrar
        </Button>
      }
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 items-stretch">

        {/* Left Column: Product Information */}
        <div className="flex flex-col justify-between h-full gap-5">

          {/* Header Block: Title & Badges */}
          <div className="space-y-3.5">
            {/* Brand, Category, Gender & Visibility Badges */}
            <div className="flex flex-wrap gap-2 items-center select-none">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-[10px] font-extrabold tracking-wide uppercase bg-beauty-50 text-beauty-800 dark:bg-beauty-950/20 dark:text-beauty-300 border border-beauty-100 dark:border-beauty-500/10">
                <FiTag className="w-3 h-3" />
                {product.brand.name}
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-[10px] font-bold tracking-wide uppercase bg-bg-surface text-text-secondary border border-border-soft">
                <FiGrid className="w-3 h-3" />
                {product.category.name}
              </span>
              {product.genderSegment && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-[10px] font-bold tracking-wide uppercase bg-bg-surface text-text-tertiary border border-border-soft/60">
                  <FiUser className="w-3 h-3" />
                  {product.genderSegment.name}
                </span>
              )}
              {/* Visibility Badge */}
              {product.isAvailable ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-[10px] font-extrabold tracking-wide uppercase bg-success-bg text-success-text border border-success-text/10">
                  <span className="w-1.5 h-1.5 rounded-full bg-success-text animate-pulse" />
                  Público
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-[10px] font-extrabold tracking-wide uppercase bg-bg-surface text-text-tertiary border border-border-soft">
                  <span className="w-1.5 h-1.5 rounded-full bg-text-tertiary" />
                  Pausado
                </span>
              )}
            </div>

            {/* Product Name */}
            <h2 className="text-2xl font-black text-text-primary tracking-tight leading-tight select-text">
              {product.name}
            </h2>

            {/* SKU / Reference Label Tag */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-bg-surface/60 dark:bg-bg-surface/15 border border-border-soft select-text">
              <FiHash className="w-3.5 h-3.5 text-text-tertiary" />
              <span className="text-[10px] font-bold text-text-tertiary uppercase tracking-wider">
                SKU / Ref:
              </span>
              <span className="font-mono text-xs font-extrabold text-text-primary">
                {product.code || "SIN CÓDIGO"}
              </span>
            </div>
          </div>

          {/* Sleek Summary Panel (Stock & Prices combined to avoid bulkiness) */}
          <div className="bg-bg-surface/20 dark:bg-bg-surface/10 border border-border-soft dark:border-border-default/60 rounded-2xl p-4 divide-x divide-border-soft dark:divide-border-default/60 flex items-center justify-between shadow-2xs select-none">

            {/* Stock status */}
            <div className="flex-1 flex flex-col items-center justify-center text-center px-1">
              <span className="text-[10px] font-bold text-text-tertiary uppercase tracking-wider mb-1 flex items-center gap-1">
                <FiPackage className="w-3 h-3" />
                Stock
              </span>
              <span className="text-sm font-extrabold text-text-primary">
                {product.stock} {product.stock === 1 ? "ud." : "uds."}
              </span>
              <span className="text-[9px] font-extrabold mt-0.5">
                {product.stock === 0 ? (
                  <span className="text-danger-text">Agotado</span>
                ) : product.stock < 5 ? (
                  <span className="text-warning-text">Crítico</span>
                ) : (
                  <span className="text-success-text">Disponible</span>
                )}
              </span>
            </div>

            {/* Sale Price */}
            <div className="flex-1 flex flex-col items-center justify-center text-center px-1">
              <span className="text-[10px] font-bold text-text-tertiary uppercase tracking-wider mb-1 flex items-center gap-1">
                <FiTrendingUp className="w-3 h-3" />
                Venta
              </span>
              <span className="text-sm font-black text-beauty-600 dark:text-beauty-400 font-mono">
                S/. {product.price.toFixed(2)}
              </span>
              <span className="text-[9px] font-bold text-text-tertiary mt-0.5">
                P. Público
              </span>
            </div>

            {/* Cost Price */}
            <div className="flex-1 flex flex-col items-center justify-center text-center px-1">
              <span className="text-[10px] font-bold text-text-tertiary uppercase tracking-wider mb-1 flex items-center gap-1">
                <FiCreditCard className="w-3 h-3" />
                Costo
              </span>
              {canReadCost ? (
                <span className="text-sm font-extrabold text-text-primary font-mono">
                  {product.costPrice !== null ? `S/. ${product.costPrice.toFixed(2)}` : "-"}
                </span>
              ) : (
                <span className="text-[9px] font-semibold text-text-tertiary italic">
                  Restringido
                </span>
              )}
              <span className="text-[9px] font-bold text-text-tertiary mt-0.5">
                P. Compra
              </span>
            </div>
          </div>

          {/* Description Box (Fills remaining space to align columns) */}
          <div className="space-y-2 flex flex-col flex-1 min-h-[140px]">
            <div className="flex items-center gap-1.5 text-text-secondary select-none">
              <FiInfo className="w-4 h-4 text-beauty-500 dark:text-beauty-400 stroke-[2]" />
              <span className="text-[10px] font-bold text-text-tertiary uppercase tracking-wider">
                Descripción del Producto
              </span>
            </div>
            <div className="text-sm text-text-secondary bg-bg-surface/10 dark:bg-bg-surface/5 border border-border-soft dark:border-border-default/60 border-l-4 border-l-beauty-500 dark:border-l-beauty-400 p-4 rounded-2xl flex-1 overflow-y-auto whitespace-pre-wrap leading-relaxed select-text min-h-[85px]">
              {product.description ? (
                product.description
              ) : (
                <span className="text-text-tertiary italic font-normal">Este producto no cuenta con una descripción registrada.</span>
              )}
            </div>
          </div>

        </div>

        {/* Right Column: Images Gallery */}
        <div className="flex flex-col justify-between h-full gap-5">
          <div className="w-full flex flex-col flex-1">
            <span className="text-[10px] font-bold text-text-tertiary uppercase tracking-wider mb-2.5 select-none">
              Galería de Imágenes ({images.length} / 5)
            </span>

            {/* Main Selected Image (Fills vertical space) */}
            <div className="w-full flex-1 bg-bg-surface/30 border border-border-default/60 rounded-3xl flex items-center justify-center overflow-hidden shadow-xs select-none p-4 relative group min-h-[250px] md:min-h-[300px]">
              {/* Elegant glass blur background effect behind transparent images */}
              <div className="absolute inset-0 bg-radial from-white/10 to-transparent pointer-events-none opacity-50" />

              {mainImage ? (
                <img
                  src={mainImage.url}
                  alt={`${product.name} - Vista ${selectedImageIndex + 1}`}
                  className="max-h-full max-w-full object-contain rounded-2xl transition-transform duration-300 group-hover:scale-[1.03]"
                />
              ) : (
                <div className="flex flex-col items-center justify-center text-text-tertiary gap-3 select-none">
                  <img
                    src="/no-image.svg"
                    alt="Sin imágenes"
                    className="w-16 h-16 opacity-45 dark:invert"
                  />
                  <span className="text-xs font-semibold text-text-tertiary">Sin imágenes cargadas</span>
                </div>
              )}
            </div>
          </div>

          {/* Thumbnails Row (Always 5 slots, spanning the full width of the main image) */}
          <div className="w-full grid grid-cols-5 gap-3 select-none">
            {Array.from({ length: 5 }).map((_, idx) => {
              const img = images[idx] || null;
              if (img) {
                const isSelected = idx === selectedImageIndex;
                return (
                  <button
                    key={img.id || idx}
                    onClick={() => setSelectedImageIndex(idx)}
                    className={cn(
                      "w-full aspect-square rounded-2xl overflow-hidden border bg-bg-card flex items-center justify-center p-1.5 cursor-pointer transition-all duration-300 focus-visible:outline-none",
                      isSelected
                        ? "border-2 border-beauty-500 ring-4 ring-beauty-500/15 scale-[1.05] shadow-xs opacity-100"
                        : "border-border-default/80 hover:border-border-strong opacity-50 hover:opacity-100 hover:scale-[1.03]"
                    )}
                    aria-label={`Ver imagen ${idx + 1}`}
                  >
                    <img
                      src={img.url}
                      alt={`Miniatura ${idx + 1}`}
                      className="max-h-full max-w-full object-contain rounded-xl"
                    />
                  </button>
                );
              }

              return (
                <div
                  key={`empty-${idx}`}
                  className="w-full aspect-square rounded-2xl border-2 border-dashed border-border-strong dark:border-border-strong bg-bg-surface/50 dark:bg-bg-surface/15 flex items-center justify-center p-2.5"
                  title="Espacio vacío"
                >
                  <img
                    src="/no-image.svg"
                    alt="Espacio vacío"
                    className="max-h-full max-w-full opacity-40 dark:invert"
                  />
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </Modal>
  );
}

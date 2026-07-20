"use client";

import { useState, useMemo, useEffect } from "react";
import {
  FiSearch,
  FiSliders,
  FiX,
  FiRefreshCw,
  FiFileText,
} from "react-icons/fi";
import { FaWhatsapp } from "react-icons/fa";
import Link from "next/link";
import ThemeToggle from "@/components/theme/ThemeToggle";
import ProductCard from "./ProductCard";
import { cn } from "@/utils/cn.utils";
import BrandLogo from "@/components/ui/BrandLogo";

interface CatalogPortalClientProps {
  products: {
    id: number;
    code: string | null;
    name: string;
    description: string | null;
    price: number;
    stock: number;
    brand: {
      id: number;
      name: string;
      company: {
        id: number;
        name: string;
      };
    };
    category: {
      id: number;
      name: string;
    };
    genderSegment: {
      id: number;
      name: string;
    } | null;
    images: {
      id: number;
      url: string;
      position: number;
      isMain: boolean;
    }[];
  }[];
  systemConfig: {
    systemName: string;
    systemLogoUrl: string | null;
    whatsappNumber: string;
    showPricePublic: boolean;
    showStockPublic: boolean;
    showCatalogsPublic: boolean;
  } | null;
}

export default function CatalogPortalClient({
  products,
  systemConfig,
}: CatalogPortalClientProps) {
  const whatsappNumber = systemConfig?.whatsappNumber || "51987654321";
  const systemName = systemConfig?.systemName || "Inventario";
  const showPrice = systemConfig?.showPricePublic ?? true;
  const showStockCount = systemConfig?.showStockPublic ?? true;
  const showCatalogs = systemConfig?.showCatalogsPublic ?? true;



  // Estados para filtros
  const [search, setSearch] = useState("");
  const [selectedCompanies, setSelectedCompanies] = useState<string[]>([]);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("Todas");
  const [selectedGenders, setSelectedGenders] = useState<string[]>([]);
  const [maxPrice, setMaxPrice] = useState<number>(300);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  // Estado para favoritos simulado en memoria local (localStorage)
  const [favorites, setFavorites] = useState<number[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem("lauren-favorites-ids");
    if (saved) {
      try {
        setFavorites(JSON.parse(saved));
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  const toggleFavorite = (id: number) => {
    const nextFavorites = favorites.includes(id)
      ? favorites.filter((favId) => favId !== id)
      : [...favorites, id];
    setFavorites(nextFavorites);
    localStorage.setItem("lauren-favorites-ids", JSON.stringify(nextFavorites));
  };

  // Obtener listas únicas de filtros basadas en los productos disponibles
  const companies = useMemo(() => {
    const names = products.map((p) => p.brand.company.name);
    return Array.from(new Set(names)).sort();
  }, [products]);

  // Filtrar marcas basadas en las empresas seleccionadas
  const brands = useMemo(() => {
    const filteredProducts = products.filter(
      (p) =>
        selectedCompanies.length === 0 ||
        selectedCompanies.includes(p.brand.company.name),
    );
    const names = filteredProducts.map((p) => p.brand.name);
    return Array.from(new Set(names)).sort();
  }, [products, selectedCompanies]);

  const categories = useMemo(() => {
    const names = products.map((p) => p.category.name);
    return ["Todas", ...Array.from(new Set(names)).sort()];
  }, [products]);

  const genders = useMemo(() => {
    const names = products
      .map((p) => p.genderSegment?.name)
      .filter((name): name is string => !!name);
    return Array.from(new Set(names)).sort();
  }, [products]);

  // Encontrar el precio máximo de los productos para ajustar el rango dinámicamente
  const absMaxPrice = useMemo(() => {
    if (products.length === 0) return 300;
    const prices = products.map((p) => p.price);
    return Math.ceil(Math.max(...prices));
  }, [products]);

  // Inicializar maxPrice al cargar
  useEffect(() => {
    setMaxPrice(absMaxPrice);
  }, [absMaxPrice]);

  // Filtrado de productos reactivo
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      // Filtro de búsqueda
      const matchesSearch =
        product.name.toLowerCase().includes(search.toLowerCase()) ||
        (product.code &&
          product.code.toLowerCase().includes(search.toLowerCase())) ||
        (product.description &&
          product.description.toLowerCase().includes(search.toLowerCase()));

      // Filtro de Empresa (Company)
      const matchesCompany =
        selectedCompanies.length === 0 ||
        selectedCompanies.includes(product.brand.company.name);

      // Filtro de marcas
      const matchesBrand =
        selectedBrands.length === 0 ||
        selectedBrands.includes(product.brand.name);

      // Filtro de categoría
      const matchesCategory =
        selectedCategory === "Todas" ||
        product.category.name === selectedCategory;

      // Filtro de género
      const matchesGender =
        selectedGenders.length === 0 ||
        (product.genderSegment &&
          selectedGenders.includes(product.genderSegment.name));

      // Filtro de precio
      const matchesPrice = !showPrice || product.price <= maxPrice;

      return (
        !!matchesSearch &&
        matchesCompany &&
        matchesBrand &&
        matchesCategory &&
        matchesGender &&
        matchesPrice
      );
    });
  }, [
    products,
    search,
    selectedCompanies,
    selectedBrands,
    selectedCategory,
    selectedGenders,
    maxPrice,
    showPrice,
  ]);

  // Manejadores de filtros
  const handleCompanyChange = (companyName: string) => {
    setSelectedCompanies((prev) => {
      const isSelected = prev.includes(companyName);
      const next = isSelected
        ? prev.filter((c) => c !== companyName)
        : [...prev, companyName];
      // Si se quita una empresa, limpiar las marcas seleccionadas que pertenezcan a esa empresa
      if (isSelected) {
        setSelectedBrands([]);
      }
      return next;
    });
  };

  const handleBrandChange = (brandName: string) => {
    setSelectedBrands((prev) =>
      prev.includes(brandName)
        ? prev.filter((b) => b !== brandName)
        : [...prev, brandName],
    );
  };

  const handleGenderChange = (genderName: string) => {
    setSelectedGenders((prev) =>
      prev.includes(genderName)
        ? prev.filter((g) => g !== genderName)
        : [...prev, genderName],
    );
  };

  const resetFilters = () => {
    setSearch("");
    setSelectedCompanies([]);
    setSelectedBrands([]);
    setSelectedCategory("Todas");
    setSelectedGenders([]);
    setMaxPrice(absMaxPrice);
  };

  return (
    <div className="min-h-screen bg-bg-page text-text-primary flex flex-col font-sans transition-colors duration-300">
      {/* 1. Header / Navbar Público */}
      <header className="sticky top-0 z-40 w-full h-16 bg-bg-page/85 backdrop-blur-md border-b border-border-default transition-all duration-300 flex items-center justify-between px-4 sm:px-8">
        <BrandLogo
          size="lg"
          systemName={systemName}
          systemLogoUrl={systemConfig?.systemLogoUrl}
        />

        {/* Acciones Rápidas */}
        <div className="flex items-center gap-2 sm:gap-4">
          {showCatalogs && (
            <Link
              href="/pdf"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-border-strong hover:bg-beauty-50 text-text-primary dark:hover:bg-beauty-950 text-xs font-semibold shadow-xs transition-all duration-200 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-beauty-400"
            >
              <FiFileText className="w-3.5 h-3.5 text-beauty-600" />
              <span>Catálogos</span>
            </Link>
          )}
          <ThemeToggle />
        </div>
      </header>

      {/* 2. Hero Section */}
      <section className="relative bg-bg-card dark:bg-bg-card border-b border-border-soft py-16 px-6 sm:px-12 flex flex-col items-center text-center">
        <div className="relative max-w-3xl flex flex-col items-center">
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-beauty-100/50 dark:bg-beauty-950 text-beauty-600 dark:text-beauty-400 text-xs font-bold uppercase tracking-widest border border-beauty-200/50 dark:border-beauty-400/50 select-none transition-all duration-300">
            <span className="w-1.5 h-1.5 rounded-full bg-beauty-500 animate-pulse" />
            Belleza, Cuidado y Bienestar
          </span>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-text-primary mt-6 mb-4 max-w-2xl leading-tight font-sans">
            Encuentra tus{" "}
            <span className="text-beauty-600 dark:text-beauty-400">
              productos favoritos
            </span>
          </h1>
          <p className="text-sm sm:text-base text-text-secondary max-w-xl mx-auto leading-relaxed mb-8">
            Explora el stock actual o solicita tus productos bajo pedido. Haz
            clic en el botón de WhatsApp de cualquier producto para consultarme
            o pedirlo directamente.
          </p>

          <a
            href={`https://wa.me/${whatsappNumber}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-5 py-3 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold shadow-sm hover:shadow transition-all duration-200 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2"
          >
            <FaWhatsapp className="w-5 h-5" />
            <span>Escríbeme</span>
          </a>
        </div>
      </section>

      {/* 3. Panel de Búsqueda Rápida e Información de Filtros en Móvil */}
      <div className="bg-bg-card border-b border-border-soft px-4 py-3 sm:px-8 flex items-center justify-between gap-3 sticky top-16 z-30 shadow-sm md:hidden">
        <div className="relative flex-1">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary w-4 h-4" />
          <input
            type="text"
            placeholder="Buscar producto o código..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl bg-bg-surface border border-border-default focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-beauty-400 focus-visible:border-beauty-400 transition-all text-text-primary"
            id="mobile-search-input"
          />
        </div>
        <button
          onClick={() => setMobileFiltersOpen(true)}
          className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl bg-beauty-50 hover:bg-beauty-100 text-beauty-800 border border-beauty-200/50 cursor-pointer transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-beauty-400"
          aria-label="Filtros"
        >
          <FiSliders className="w-4 h-4" />
          <span>Filtros</span>
          {(selectedCompanies.length > 0 ||
            selectedBrands.length > 0 ||
            selectedCategory !== "Todas" ||
            selectedGenders.length > 0 ||
            maxPrice < absMaxPrice) && (
              <span className="w-2 h-2 rounded-full bg-beauty-600 animate-pulse" />
            )}
        </button>
      </div>

      {/* 4. Contenido Principal */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-8 py-6 sm:py-8 flex flex-col md:flex-row items-start gap-8 min-w-0">
        {/* FILTROS LATERALES - DESKTOP */}
        <aside className="hidden md:block w-64 shrink-0 h-fit bg-bg-card border border-border-default rounded-2xl p-6 sticky top-20 shadow-sm">
          <div className="flex items-center justify-between pb-4 mb-4 border-b border-border-soft">
            <h2 className="text-sm font-bold tracking-wider text-text-primary uppercase flex items-center gap-2">
              <FiSliders className="w-4 h-4 text-beauty-600" />
              <span>Filtros</span>
            </h2>
            <button
              onClick={resetFilters}
              className="text-[11px] text-text-tertiary hover:text-text-accent flex items-center gap-1 transition-colors cursor-pointer"
              title="Limpiar filtros"
            >
              <FiRefreshCw className="w-3 h-3" />
              <span>Limpiar</span>
            </button>
          </div>

          {/* Filtro: Búsqueda */}
          <div className="mb-5">
            <label
              htmlFor="desktop-search-input"
              className="block text-xs font-semibold text-text-secondary mb-2 uppercase tracking-wider"
            >
              Búsqueda
            </label>
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary w-4 h-4" />
              <input
                type="text"
                placeholder="Nombre o código..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-bg-surface border border-border-default focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-beauty-400 text-text-primary transition-all"
                id="desktop-search-input"
              />
            </div>
          </div>

          {/* Filtro: Empresa */}
          {companies.length > 0 && (
            <div className="mb-5">
              <span className="block text-xs font-semibold text-text-secondary mb-2 uppercase tracking-wider">
                Catálogo de Empresas
              </span>
              <div className="space-y-2">
                {companies.map((company) => (
                  <label
                    key={company}
                    className="flex items-center gap-2.5 text-xs text-text-primary cursor-pointer select-none"
                  >
                    <input
                      type="checkbox"
                      checked={selectedCompanies.includes(company)}
                      onChange={() => handleCompanyChange(company)}
                      className="w-4.5 h-4.5 rounded border-border-strong text-beauty-600 focus:ring-beauty-400 bg-bg-surface cursor-pointer"
                    />
                    <span className="font-medium">{company}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Filtro: Marca */}
          {brands.length > 0 && (
            <div className="mb-5">
              <span className="block text-xs font-semibold text-text-secondary mb-2 uppercase tracking-wider">
                Línea / Marca
              </span>
              <div className="space-y-2 max-h-40 overflow-y-auto pr-1 scrollbar-thin">
                {brands.map((brand) => (
                  <label
                    key={brand}
                    className="flex items-center gap-2.5 text-xs text-text-primary cursor-pointer select-none"
                  >
                    <input
                      type="checkbox"
                      checked={selectedBrands.includes(brand)}
                      onChange={() => handleBrandChange(brand)}
                      className="w-4.5 h-4.5 rounded border-border-strong text-beauty-600 focus:ring-beauty-400 bg-bg-surface cursor-pointer"
                    />
                    <span className="font-medium">{brand}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Filtro: Categoría */}
          {categories.length > 1 && (
            <div className="mb-5">
              <span className="block text-xs font-semibold text-text-secondary mb-2 uppercase tracking-wider">
                Categoría
              </span>
              <div className="flex flex-col gap-1 max-h-48 overflow-y-auto pr-1 scrollbar-thin">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`w-full text-left text-xs px-3 py-2 rounded-xl transition-all cursor-pointer ${selectedCategory === cat
                      ? "bg-beauty-100 text-beauty-900 font-bold dark:bg-beauty-950 dark:text-beauty-100"
                      : "text-text-secondary hover:bg-bg-surface hover:text-text-primary"
                      }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Filtro: Segmento / Género */}
          {genders.length > 0 && (
            <div className="mb-5">
              <span className="block text-xs font-semibold text-text-secondary mb-2 uppercase tracking-wider">
                Público Objetivo
              </span>
              <div className="space-y-2">
                {genders.map((gender) => (
                  <label
                    key={gender}
                    className="flex items-center gap-2.5 text-xs text-text-primary cursor-pointer select-none"
                  >
                    <input
                      type="checkbox"
                      checked={selectedGenders.includes(gender)}
                      onChange={() => handleGenderChange(gender)}
                      className="w-4.5 h-4.5 rounded border-border-strong text-beauty-600 focus:ring-beauty-400 bg-bg-surface cursor-pointer"
                    />
                    <span className="font-medium">{gender}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Filtro: Rango de Precio (Solo si los precios se muestran públicamente) */}
          {showPrice && absMaxPrice > 0 && (
            <div className="mb-5">
              <div className="flex justify-between text-xs font-semibold text-text-secondary mb-2 uppercase tracking-wider">
                <span>Precio Máx.</span>
                <span className="text-beauty-600 font-bold">
                  S/. {maxPrice}
                </span>
              </div>
              <input
                type="range"
                min="0"
                max={absMaxPrice}
                step="5"
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                className="w-full accent-beauty-600 cursor-pointer"
                id="desktop-price-range"
              />
              <div className="flex justify-between text-[10px] text-text-tertiary mt-1">
                <span>S/. 0</span>
                <span>S/. {absMaxPrice}</span>
              </div>
            </div>
          )}
        </aside>

        {/* GRID DE PRODUCTOS */}
        <div className="flex-1 flex flex-col min-w-0 w-full">
          {/* Categorías horizontales rápidas en Móvil y Tablet */}
          {categories.length > 1 && (
            <div className="flex md:hidden items-center gap-2 overflow-x-auto w-full max-w-full pb-4 mb-4 scrollbar-none">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`shrink-0 whitespace-nowrap px-4 py-2 text-xs rounded-full border transition-all cursor-pointer ${selectedCategory === cat
                    ? "bg-beauty-600 border-beauty-600 text-white font-semibold"
                    : "bg-bg-card border-border-default text-text-secondary hover:text-text-primary"
                    }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          )}

          {/* Título de Resultados */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-bold text-text-primary">
                {selectedCategory === "Todas"
                  ? "Todos los productos"
                  : selectedCategory}
              </h2>
              <p className="text-xs text-text-secondary mt-0.5">
                Se encontraron {filteredProducts.length} productos en el
                catálogo
              </p>
            </div>
          </div>

          {/* Sin resultados */}
          {filteredProducts.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 px-4 bg-bg-card border border-border-soft rounded-2xl text-center shadow-sm">
              <div className="w-16 h-16 rounded-full bg-beauty-50 dark:bg-beauty-950 flex items-center justify-center text-beauty-400 mb-4">
                <FiSearch className="w-8 h-8" />
              </div>
              <h3 className="text-base font-bold text-text-primary mb-1">
                No se encontraron productos
              </h3>
              <p className="text-xs text-text-secondary max-w-xs mb-6 leading-relaxed">
                Prueba ajustando los filtros o cambiando el término de búsqueda.
              </p>
              <button
                onClick={resetFilters}
                className="px-4 py-2 text-xs font-semibold rounded-xl bg-beauty-600 hover:bg-beauty-700 text-white transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-beauty-400"
              >
                Restablecer Filtros
              </button>
            </div>
          )}

          {/* Grid de tarjetas */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                showPrice={showPrice}
                showStockCount={showStockCount}
                whatsappNumber={whatsappNumber}
                systemName={systemName}
                isFavorite={favorites.includes(product.id)}
                onToggleFavorite={toggleFavorite}
              />
            ))}
          </div>
        </div>
      </main>

      {/* 5. Footer Público */}
      <footer className="w-full bg-bg-surface border-t border-border-default mt-12 py-8 px-4 sm:px-8 text-center text-xs text-text-secondary transition-colors duration-300">
        <div className="max-w-2xl mx-auto space-y-3">
          <p className="font-semibold text-text-primary">
            {systemName.split(" ").map((word, idx, arr) => (
              <span
                key={idx}
                className={
                  idx === arr.length - 1 ? "text-beauty-600 font-extrabold" : ""
                }
              >
                {word}
                {idx < arr.length - 1 ? " " : ""}
              </span>
            ))}{" "}
            • Catálogo de Exhibición y Consulta
          </p>
          <p className="leading-relaxed">
            Explora los productos disponibles y realiza tu pedido mediante
            WhatsApp.
          </p>
          <div className="pt-3 text-[10px] text-text-tertiary">
            © {new Date().getFullYear()}{" "}
            <span className="text-beauty-600 font-bold">Lauren Arica</span>.
            Todos los derechos reservados.
          </div>
        </div>
      </footer>

      {/* 6. Cajón de Filtros en Móvil (Overlay Modal) */}
      {mobileFiltersOpen && (
        <div className="fixed inset-0 z-50 flex justify-end md:hidden">
          {/* Fondo desenfocado translúcido */}
          <div
            onClick={() => setMobileFiltersOpen(false)}
            className="absolute inset-0 bg-black/40 backdrop-blur-xs transition-opacity duration-300"
          />

          {/* Contenido del Panel */}
          <div className="relative w-80 max-w-xs h-full bg-bg-card shadow-2xl flex flex-col border-l border-border-default">
            {/* Header del cajón */}
            <div className="flex items-center justify-between p-4 border-b border-border-soft">
              <h2 className="text-sm font-bold tracking-wider text-text-primary uppercase flex items-center gap-2">
                <FiSliders className="w-4 h-4 text-beauty-600" />
                <span>Filtros</span>
              </h2>
              <button
                onClick={() => setMobileFiltersOpen(false)}
                className="p-1.5 rounded-lg hover:bg-bg-surface text-text-secondary transition-colors cursor-pointer"
                aria-label="Cerrar filtros"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>

            {/* Filtros Internos */}
            <div className="flex-1 overflow-y-auto p-4 space-y-6">
              {/* Filtro: Empresa */}
              {companies.length > 0 && (
                <div>
                  <span className="block text-xs font-semibold text-text-secondary mb-2.5 uppercase tracking-wider">
                    Empresa
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {companies.map((company) => {
                      const active = selectedCompanies.includes(company);
                      return (
                        <button
                          key={company}
                          onClick={() => handleCompanyChange(company)}
                          className={`px-3 py-2 text-xs font-semibold rounded-xl border transition-all cursor-pointer ${active
                            ? "bg-beauty-50 border-beauty-400 text-beauty-800 font-bold dark:bg-beauty-950 dark:border-beauty-600 dark:text-beauty-100"
                            : "bg-bg-surface border-border-default text-text-secondary"
                            }`}
                        >
                          {company}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Filtro: Marca */}
              {brands.length > 0 && (
                <div>
                  <span className="block text-xs font-semibold text-text-secondary mb-2.5 uppercase tracking-wider">
                    Catalogo
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {brands.map((brand) => {
                      const active = selectedBrands.includes(brand);
                      return (
                        <button
                          key={brand}
                          onClick={() => handleBrandChange(brand)}
                          className={`px-3 py-1.5 text-[11px] font-semibold rounded-xl border transition-all cursor-pointer ${active
                            ? "bg-beauty-50 border-beauty-400 text-beauty-800 font-bold dark:bg-beauty-950 dark:border-beauty-600 dark:text-beauty-100"
                            : "bg-bg-surface border-border-default text-text-secondary"
                            }`}
                        >
                          {brand}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Filtro: Categoría */}
              {categories.length > 1 && (
                <div>
                  <span className="block text-xs font-semibold text-text-secondary mb-2.5 uppercase tracking-wider">
                    Categoría
                  </span>
                  <div className="grid grid-cols-2 gap-1.5">
                    {categories.map((cat) => (
                      <button
                        key={cat}
                        onClick={() => setSelectedCategory(cat)}
                        className={`text-center text-xs py-2 rounded-xl transition-all cursor-pointer ${selectedCategory === cat
                          ? "bg-beauty-100 text-beauty-900 font-bold dark:bg-beauty-950 dark:text-beauty-100 border border-beauty-200/50"
                          : "bg-bg-surface text-text-secondary hover:text-text-primary border border-transparent"
                          }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Filtro: Segmento / Género */}
              {genders.length > 0 && (
                <div>
                  <span className="block text-xs font-semibold text-text-secondary mb-2.5 uppercase tracking-wider">
                    Público Objetivo
                  </span>
                  <div className="grid grid-cols-2 gap-1.5">
                    {genders.map((gender) => {
                      const active = selectedGenders.includes(gender);
                      return (
                        <button
                          key={gender}
                          onClick={() => handleGenderChange(gender)}
                          className={`text-center text-xs py-2 rounded-xl border transition-all cursor-pointer ${active
                            ? "bg-beauty-50 border-beauty-400 text-beauty-800 font-bold dark:bg-beauty-950 dark:border-beauty-600 dark:text-beauty-100"
                            : "bg-bg-surface border-border-default text-text-secondary"
                            }`}
                        >
                          {gender}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Filtro: Rango de Precio */}
              {showPrice && absMaxPrice > 0 && (
                <div>
                  <div className="flex justify-between text-xs font-semibold text-text-secondary mb-2 uppercase tracking-wider">
                    <span>Precio Máx.</span>
                    <span className="text-beauty-600 font-bold font-mono">
                      S/. {maxPrice}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max={absMaxPrice}
                    step="5"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(Number(e.target.value))}
                    className="w-full accent-beauty-600 cursor-pointer"
                    id="mobile-price-range"
                  />
                  <div className="flex justify-between text-[10px] text-text-tertiary mt-1">
                    <span>S/. 0</span>
                    <span>S/. {absMaxPrice}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Footer del cajón / Acciones */}
            <div className="p-4 border-t border-border-soft flex gap-2">
              <button
                onClick={resetFilters}
                className="flex-1 py-2.5 text-xs font-semibold rounded-xl bg-bg-surface hover:bg-bg-accent text-text-secondary transition-colors cursor-pointer border border-border-default"
              >
                Limpiar Todo
              </button>
              <button
                onClick={() => setMobileFiltersOpen(false)}
                className="flex-1 py-2.5 text-xs font-semibold rounded-xl bg-beauty-600 hover:bg-beauty-700 text-white transition-colors cursor-pointer"
              >
                Aplicar Filtros
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

"use client";

import { useState, useMemo, useEffect } from "react";
import {
  FiSearch,
  FiSliders,
  FiX,
  FiRefreshCw,
  FiCheck,
  FiShoppingBag,
  FiMenu,
  FiHeart,
  FiBookOpen,
} from "react-icons/fi";
import { FaWhatsapp } from "react-icons/fa";
import Link from "next/link";
import ThemeToggle from "@/components/theme/ThemeToggle";
import { useSystemConfig } from "@/context/SystemConfigContext";

// Número de WhatsApp configurado para Lauren Arica (puede cambiarse por su número real)
const WHATSAPP_PHONE = "51987654321";

interface ProductMock {
  id: string;
  code: string;
  name: string;
  brand: "Natura" | "Avon";
  category: "Perfumería" | "Maquillaje" | "Rostro" | "Cuerpo" | "Cabello";
  genderSegment: "Femenino" | "Masculino" | "Unisex" | "Infantil" | "Bebé";
  description: string;
  price: number;
  imageUrl: string;
  stock: number;
  isAvailable: boolean;
}

// Catálogo ficticio realista para la demostración
const MOCK_PRODUCTS: ProductMock[] = [
  {
    id: "prod-1",
    code: "NAT-1020",
    name: "Natura Homem Cor.Agio Eau de Parfum",
    brand: "Natura",
    category: "Perfumería",
    genderSegment: "Masculino",
    description:
      "Un perfume amaderado intenso para el hombre que tiene el coraje de actuar con el corazón.",
    price: 180.0,
    imageUrl:
      "https://images.unsplash.com/photo-1541643600914-78b084683601?q=80&w=600&auto=format&fit=crop",
    stock: 5,
    isAvailable: true,
  },
  {
    id: "prod-2",
    code: "NAT-2045",
    name: "Natura Ekos Castaña Pulpa hidratante",
    brand: "Natura",
    category: "Cuerpo",
    genderSegment: "Unisex",
    description:
      "Pulpa hidratante para manos que nutre la piel y fortalece las uñas con aceite de castaña.",
    price: 42.0,
    imageUrl:
      "https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?q=80&w=600&auto=format&fit=crop",
    stock: 12,
    isAvailable: true,
  },
  {
    id: "prod-3",
    code: "AVO-5032",
    name: "Avon Anew Clinical Concentrado Facial",
    brand: "Avon",
    category: "Rostro",
    genderSegment: "Femenino",
    description:
      "Concentrado facial reductor de arrugas con triple ácido hialurónico para piel joven.",
    price: 115.0,
    imageUrl:
      "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?q=80&w=600&auto=format&fit=crop",
    stock: 3,
    isAvailable: true,
  },
  {
    id: "prod-4",
    code: "NAT-3012",
    name: "Natura Una Base Sérum Nude Me",
    brand: "Natura",
    category: "Maquillaje",
    genderSegment: "Femenino",
    description:
      "Base fluida ultra leve que brinda un acabado natural y protege contra el envejecimiento.",
    price: 89.0,
    imageUrl:
      "https://images.unsplash.com/photo-1596462502278-27bfdc403348?q=80&w=600&auto=format&fit=crop",
    stock: 4,
    isAvailable: true,
  },
  {
    id: "prod-5",
    code: "AVO-4011",
    name: "Avon Ultra Matte Lápiz Labial SPF 15",
    brand: "Avon",
    category: "Maquillaje",
    genderSegment: "Femenino",
    description:
      "Labial 100% mate aterciopelado con una aplicación suave y de alta cobertura.",
    price: 28.0,
    imageUrl:
      "https://images.unsplash.com/photo-1586495777744-4413f21062fa?q=80&w=600&auto=format&fit=crop",
    stock: 15,
    isAvailable: true,
  },
  {
    id: "prod-6",
    code: "NAT-2510",
    name: "Natura Tododia Cereza y Avellana Crema",
    brand: "Natura",
    category: "Cuerpo",
    genderSegment: "Unisex",
    description:
      "Crema nutritiva para el cuerpo con fragancia envolvente y nutrición prebiótica profunda.",
    price: 58.0,
    imageUrl:
      "https://images.unsplash.com/photo-1556229010-6c3f2c9ca418?q=80&w=600&auto=format&fit=crop",
    stock: 0,
    isAvailable: true, // Bajo pedido
  },
  {
    id: "prod-7",
    code: "NAT-1051",
    name: "Natura Kaiak Femenino Desodorante Colonia",
    brand: "Natura",
    category: "Perfumería",
    genderSegment: "Femenino",
    description:
      "Una fragancia hiperacuática con notas florales combinadas con la frescura del viento y el mar.",
    price: 125.0,
    imageUrl:
      "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?q=80&w=600&auto=format&fit=crop",
    stock: 7,
    isAvailable: true,
  },
  {
    id: "prod-8",
    code: "AVO-1080",
    name: "Avon Far Away Glamour Eau de Parfum",
    brand: "Avon",
    category: "Perfumería",
    genderSegment: "Femenino",
    description:
      "Perfume oriental floral con notas de grosella negra, flor de naranja y vainilla intensa.",
    price: 95.0,
    imageUrl:
      "https://images.unsplash.com/photo-1523293182086-7651a899d37f?q=80&w=600&auto=format&fit=crop",
    stock: 2,
    isAvailable: true,
  },
  {
    id: "prod-9",
    code: "NAT-6022",
    name: "Natura Lumina Champú Reestructurante",
    brand: "Natura",
    category: "Cabello",
    genderSegment: "Unisex",
    description:
      "Champú para cabello químicamente dañado, repara la fibra capilar desde la raíz.",
    price: 34.0,
    imageUrl:
      "https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?q=80&w=600&auto=format&fit=crop",
    stock: 8,
    isAvailable: true,
  },
  {
    id: "prod-10",
    code: "NAT-7010",
    name: "Natura Naturé Colonia Jugando en Árboles",
    brand: "Natura",
    category: "Perfumería",
    genderSegment: "Infantil",
    description:
      "Colonia infantil con aroma cítrico frutal, ligera y divertida diseñada para niños.",
    price: 49.0,
    imageUrl:
      "https://images.unsplash.com/photo-1515688594390-b649af70d282?q=80&w=600&auto=format&fit=crop",
    stock: 0,
    isAvailable: true, // Bajo pedido
  },
  {
    id: "prod-11",
    code: "AVO-7540",
    name: "Avon Care Sun+ Protector Solar Niños",
    brand: "Avon",
    category: "Cuerpo",
    genderSegment: "Infantil",
    description:
      "Protector solar dermatológicamente testeado, muy resistente al agua con FPS 50.",
    price: 45.0,
    imageUrl:
      "https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?q=80&w=600&auto=format&fit=crop",
    stock: 4,
    isAvailable: true,
  },
  {
    id: "prod-12",
    code: "NAT-8015",
    name: "Natura Mamá y Bebé Agua de Colonia",
    brand: "Natura",
    category: "Perfumería",
    genderSegment: "Bebé",
    description:
      "Fórmula 100% segura para bebés, sin alcohol, con aroma suave y relajante.",
    price: 55.0,
    imageUrl:
      "https://images.unsplash.com/photo-1617897903246-719242758050?q=80&w=600&auto=format&fit=crop",
    stock: 6,
    isAvailable: true,
  },
];

export default function CatalogoPublico() {
  const systemConfig = useSystemConfig();
  const whatsappNumber = systemConfig?.whatsappNumber || WHATSAPP_PHONE;
  const systemName = systemConfig?.systemName || "Inventario";

  // Estados para filtros
  const [search, setSearch] = useState("");
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("Todas");
  const [selectedGenders, setSelectedGenders] = useState<string[]>([]);
  const [maxPrice, setMaxPrice] = useState<number>(200);
  const [onlyInStock, setOnlyInStock] = useState(false);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  // Estado para favoritos simulado en memoria local
  const [favorites, setFavorites] = useState<string[]>([]);

  // Cargar favoritos del localStorage
  useEffect(() => {
    const saved = localStorage.getItem("lauren-favorites");
    if (saved) {
      try {
        setFavorites(JSON.parse(saved));
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  const toggleFavorite = (id: string) => {
    const nextFavorites = favorites.includes(id)
      ? favorites.filter((favId) => favId !== id)
      : [...favorites, id];
    setFavorites(nextFavorites);
    localStorage.setItem("lauren-favorites", JSON.stringify(nextFavorites));
  };

  // Listado de Categorías Únicas
  const categories = [
    "Todas",
    "Perfumería",
    "Maquillaje",
    "Rostro",
    "Cuerpo",
    "Cabello",
  ];

  // Listado de Géneros Únicos
  const genders = ["Femenino", "Masculino", "Unisex", "Infantil", "Bebé"];

  // Filtrado de productos reactivo
  const filteredProducts = useMemo(() => {
    return MOCK_PRODUCTS.filter((product) => {
      // Filtro de búsqueda
      const matchesSearch =
        product.name.toLowerCase().includes(search.toLowerCase()) ||
        product.code.toLowerCase().includes(search.toLowerCase()) ||
        product.description.toLowerCase().includes(search.toLowerCase());

      // Filtro de marcas
      const matchesBrand =
        selectedBrands.length === 0 || selectedBrands.includes(product.brand);

      // Filtro de categoría
      const matchesCategory =
        selectedCategory === "Todas" || product.category === selectedCategory;

      // Filtro de género
      const matchesGender =
        selectedGenders.length === 0 ||
        selectedGenders.includes(product.genderSegment);

      // Filtro de precio
      const matchesPrice = product.price <= maxPrice;

      // Filtro de stock
      const matchesStock = !onlyInStock || product.stock > 0;

      return (
        matchesSearch &&
        matchesBrand &&
        matchesCategory &&
        matchesGender &&
        matchesPrice &&
        matchesStock
      );
    });
  }, [
    search,
    selectedBrands,
    selectedCategory,
    selectedGenders,
    maxPrice,
    onlyInStock,
  ]);

  // Manejadores de filtros
  const handleBrandChange = (brand: string) => {
    setSelectedBrands((prev) =>
      prev.includes(brand) ? prev.filter((b) => b !== brand) : [...prev, brand],
    );
  };

  const handleGenderChange = (gender: string) => {
    setSelectedGenders((prev) =>
      prev.includes(gender)
        ? prev.filter((g) => g !== gender)
        : [...prev, gender],
    );
  };

  const resetFilters = () => {
    setSearch("");
    setSelectedBrands([]);
    setSelectedCategory("Todas");
    setSelectedGenders([]);
    setMaxPrice(200);
    setOnlyInStock(false);
  };

  // Generador de enlace de WhatsApp
  const generateWhatsAppLink = (product: ProductMock) => {
    const brandTag = product.brand === "Natura" ? "🍊 Natura" : "Avon";
    const text = `¡Hola ${systemName.split(" ")[0]}! Vi tu catálogo web y me interesa consultar la disponibilidad del siguiente producto:

*Producto:* ${product.name}
*Código:* ${product.code}
*Marca:* ${product.brand} (${brandTag})
*Precio:* S/. ${product.price.toFixed(2)}
*Estado:* ${product.stock > 0 ? "En Stock" : "Bajo Pedido"}

¿Me podrías confirmar si lo tienes disponible? ¡Gracias!`;

    return `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(text)}`;
  };


  return (
    <div className="min-h-screen bg-bg-page text-text-primary flex flex-col font-sans transition-colors duration-300">
      {/* 1. Header / Navbar Público */}
      <header className="sticky top-0 z-40 w-full h-16 bg-bg-page/85 backdrop-blur-md border-b border-border-default transition-all duration-300 flex items-center justify-between px-4 sm:px-8">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-full bg-beauty-600 flex items-center justify-center text-white font-bold text-lg shadow-sm shadow-beauty-400/50 overflow-hidden">
            {systemConfig?.systemLogoUrl ? (
              <img
                src={systemConfig.systemLogoUrl}
                alt={systemName}
                className="w-full h-full object-cover"
              />
            ) : (
              systemName.charAt(0).toUpperCase()
            )}
          </div>
          <div className="flex flex-col leading-tight">
            <span className="text-sm font-semibold tracking-wide text-text-primary">
              {systemName}
            </span>
            <span className="text-[10px] text-beauty-600 font-semibold tracking-widest uppercase">
              Catálogo
            </span>
          </div>
        </div>

        {/* Acciones Rápidas */}
        <div className="flex items-center gap-2 sm:gap-4">
          <Link
            href="/pdf"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-border-strong hover:bg-beauty-50 text-text-primary dark:hover:bg-beauty-950 text-xs font-semibold shadow-xs transition-all duration-200 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-beauty-400"
          >
            <FiBookOpen className="w-3.5 h-3.5 text-beauty-600" />
            <span>Catálogos PDF</span>
          </Link>
          <ThemeToggle />
          <a
            href={`https://wa.me/${whatsappNumber}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-sm hover:shadow transition-all duration-200 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2"
          >
            <FaWhatsapp className="w-4 h-4" />
            <span className="hidden sm:inline">Escríbeme</span>
          </a>
        </div>

      </header>

      {/* 2. Hero Section */}
      <section className="relative overflow-hidden bg-linear-to-r from-beauty-50 via-bg-accent to-beauty-50 dark:from-beauty-900/40 dark:via-bg-accent dark:to-beauty-900/40 border-b border-border-soft py-12 px-6 sm:px-12 flex flex-col items-center text-center">
        <div className="absolute top-[-50%] right-[-10%] w-72 h-72 rounded-full bg-beauty-100/30 dark:bg-beauty-800/10 blur-3xl" />
        <div className="absolute bottom-[-50%] left-[-10%] w-72 h-72 rounded-full bg-beauty-200/20 dark:bg-beauty-800/10 blur-3xl" />

        <div className="relative max-w-2xl">
          <span className="text-[11px] font-bold tracking-widest text-beauty-600 uppercase bg-beauty-100 dark:bg-beauty-950 px-3 py-1.5 rounded-full border border-beauty-200/50 dark:border-beauty-800">
            Belleza, Cuidado y Bienestar
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-text-primary mt-4 mb-3 font-sans">
            Encuentra tus favoritos de{" "}
            <span className="text-text-accent">Natura & Avon</span>
          </h1>
          <p className="text-sm text-text-secondary max-w-lg mx-auto leading-relaxed">
            Explora el stock actual o solicita tus productos bajo pedido. Haz
            clic en el botón de WhatsApp de cualquier producto para consultarme
            o pedirlo directamente.
          </p>
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
          {(selectedBrands.length > 0 ||
            selectedCategory !== "Todas" ||
            selectedGenders.length > 0 ||
            maxPrice < 200 ||
            onlyInStock) && (
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

          {/* Filtro: Marca */}
          <div className="mb-5">
            <span className="block text-xs font-semibold text-text-secondary mb-2 uppercase tracking-wider">
              Marca
            </span>
            <div className="space-y-2">
              {["Natura", "Avon"].map((brand) => (
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

          {/* Filtro: Categoría */}
          <div className="mb-5">
            <span className="block text-xs font-semibold text-text-secondary mb-2 uppercase tracking-wider">
              Categoría
            </span>
            <div className="flex flex-col gap-1">
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

          {/* Filtro: Segmento / Género */}
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

          {/* Filtro: Rango de Precio */}
          <div className="mb-5">
            <div className="flex justify-between text-xs font-semibold text-text-secondary mb-2 uppercase tracking-wider">
              <span>Precio Máx.</span>
              <span className="text-beauty-600 font-bold">S/. {maxPrice}</span>
            </div>
            <input
              type="range"
              min="20"
              max="250"
              step="5"
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              className="w-full accent-beauty-600 cursor-pointer"
              id="desktop-price-range"
            />
            <div className="flex justify-between text-[10px] text-text-tertiary mt-1">
              <span>S/. 20</span>
              <span>S/. 250</span>
            </div>
          </div>

          {/* Filtro: En stock */}
          <div className="pt-2 border-t border-border-soft">
            <label className="flex items-center gap-2.5 text-xs text-text-primary cursor-pointer select-none">
              <input
                type="checkbox"
                checked={onlyInStock}
                onChange={() => setOnlyInStock(!onlyInStock)}
                className="w-4.5 h-4.5 rounded border-border-strong text-beauty-600 focus:ring-beauty-400 bg-bg-surface cursor-pointer"
              />
              <span className="font-semibold text-text-secondary">
                Sólo productos en stock
              </span>
            </label>
          </div>
        </aside>

        {/* GRID DE PRODUCTOS */}
        <div className="flex-1 flex flex-col min-w-0 w-full">
          {/* Categorías horizontales rápidas en Móvil y Tablet */}
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
                Prueba ajustando los filtros, bajando el precio mínimo o
                cambiando el término de búsqueda.
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
            {filteredProducts.map((product) => {
              const inStock = product.stock > 0;
              const isFav = favorites.includes(product.id);

              return (
                <article
                  key={product.id}
                  className="group bg-bg-card border border-border-soft hover:border-border-strong rounded-2xl overflow-hidden flex flex-col transition-all duration-300 hover:-translate-y-1 hover:shadow-md relative"
                >
                  {/* Botón Favorito Simulador */}
                  <button
                    onClick={() => toggleFavorite(product.id)}
                    className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-white/80 dark:bg-black/50 backdrop-blur-sm border border-border-soft flex items-center justify-center text-text-secondary hover:text-rose-500 hover:bg-white dark:hover:bg-black transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-beauty-400"
                    aria-label={
                      isFav ? "Quitar de favoritos" : "Añadir a favoritos"
                    }
                  >
                    <FiHeart
                      className={`w-4 h-4 transition-transform ${isFav ? "fill-rose-500 text-rose-500 scale-110" : ""}`}
                    />
                  </button>

                  {/* Imagen del producto */}
                  <div className="aspect-4/3 w-full overflow-hidden bg-bg-surface relative border-b border-border-soft">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />

                    {/* Insignia de Marca */}
                    <span
                      className={`absolute bottom-3 left-3 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border shadow-sm ${product.brand === "Natura"
                          ? "bg-orange-50 border-orange-200 text-orange-700 dark:bg-orange-950/80 dark:border-orange-800 dark:text-orange-300"
                          : "bg-purple-50 border-purple-200 text-purple-700 dark:bg-purple-950/80 dark:border-purple-800 dark:text-purple-300"
                        }`}
                    >
                      {product.brand}
                    </span>
                  </div>

                  {/* Detalle del producto */}
                  <div className="p-4 flex-1 flex flex-col justify-between">
                    <div>
                      {/* Código y Tag de Género */}
                      <div className="flex items-center justify-between gap-2 mb-1.5">
                        <span className="text-[10px] font-mono text-text-tertiary font-medium">
                          Cod: {product.code}
                        </span>
                        <span className="text-[10px] bg-bg-surface px-2 py-0.5 rounded-full font-medium text-text-secondary">
                          {product.genderSegment}
                        </span>
                      </div>

                      {/* Nombre */}
                      <h3 className="text-sm font-bold text-text-primary line-clamp-1 group-hover:text-text-accent transition-colors leading-snug">
                        {product.name}
                      </h3>

                      {/* Descripción */}
                      <p className="text-xs text-text-secondary mt-1.5 line-clamp-2 leading-relaxed">
                        {product.description}
                      </p>
                    </div>

                    <div className="mt-4 pt-3.5 border-t border-border-soft flex items-center justify-between gap-4">
                      {/* Precio e Info Stock */}
                      <div className="flex flex-col">
                        <span className="text-[10px] text-text-tertiary leading-none uppercase font-semibold tracking-wider">
                          Precio
                        </span>
                        <span className="text-lg font-extrabold text-text-primary mt-1">
                          S/. {product.price.toFixed(2)}
                        </span>

                        {/* Indicador de disponibilidad */}
                        <span
                          className={`inline-flex items-center gap-1 text-[9px] font-bold mt-1.5 px-2 py-0.5 rounded-md w-fit uppercase ${inStock
                              ? "bg-success-bg text-success-text"
                              : "bg-warning-bg text-warning-text"
                            }`}
                        >
                          {inStock && <FiCheck className="w-2.5 h-2.5" />}
                          {inStock
                            ? `En Stock (${product.stock})`
                            : "Bajo Pedido"}
                        </span>
                      </div>

                      {/* Botón WhatsApp */}
                      <a
                        href={generateWhatsAppLink(product)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-xs font-bold shadow-sm transition-all duration-200 flex-1 text-center cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
                        title="Consultar por WhatsApp"
                      >
                        <FaWhatsapp className="w-4 h-4 shrink-0" />
                        <span>Consultar</span>
                      </a>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </main>

      {/* 5. Footer Público */}
      <footer className="w-full bg-bg-surface border-t border-border-default mt-12 py-8 px-4 sm:px-8 text-center text-xs text-text-secondary transition-colors duration-300">
        <div className="max-w-2xl mx-auto space-y-3">
          <p className="font-semibold text-text-primary">
            Lauren Arica • Consultora de Belleza Autorizada Natura & Avon
          </p>
          <p className="leading-relaxed">
            Los nombres, logotipos y marcas comerciales aquí mostrados son de
            propiedad exclusiva de Natura & Co. y Avon Products Inc. Este es un
            catálogo de exhibición y consulta directa de disponibilidad.
          </p>
          <div className="pt-4 text-[10px] text-text-tertiary">
            © {new Date().getFullYear()} Lauren Arica. Todos los derechos
            reservados.
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
          <div className="relative w-80 max-w-xs h-full bg-bg-card shadow-2xl flex flex-col animate-slide-in-left border-l border-border-default">
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
              {/* Filtro: Marca */}
              <div>
                <span className="block text-xs font-semibold text-text-secondary mb-2.5 uppercase tracking-wider">
                  Marca
                </span>
                <div className="flex gap-2">
                  {["Natura", "Avon"].map((brand) => {
                    const active = selectedBrands.includes(brand);
                    return (
                      <button
                        key={brand}
                        onClick={() => handleBrandChange(brand)}
                        className={`flex-1 py-2 text-xs font-semibold rounded-xl border transition-all cursor-pointer ${active
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

              {/* Filtro: Categoría */}
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

              {/* Filtro: Segmento / Género */}
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

              {/* Filtro: Rango de Precio */}
              <div>
                <div className="flex justify-between text-xs font-semibold text-text-secondary mb-2 uppercase tracking-wider">
                  <span>Precio Máx.</span>
                  <span className="text-beauty-600 font-bold">
                    S/. {maxPrice}
                  </span>
                </div>
                <input
                  type="range"
                  min="20"
                  max="250"
                  step="5"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(Number(e.target.value))}
                  className="w-full accent-beauty-600 cursor-pointer"
                  id="mobile-price-range"
                />
                <div className="flex justify-between text-[10px] text-text-tertiary mt-1">
                  <span>S/. 20</span>
                  <span>S/. 250</span>
                </div>
              </div>

              {/* Filtro: En stock */}
              <div>
                <label className="flex items-center gap-2.5 text-xs text-text-primary cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={onlyInStock}
                    onChange={() => setOnlyInStock(!onlyInStock)}
                    className="w-4.5 h-4.5 rounded border-border-strong text-beauty-600 focus:ring-beauty-400 bg-bg-surface cursor-pointer"
                  />
                  <span className="font-semibold text-text-secondary">
                    Sólo productos en stock
                  </span>
                </label>
              </div>
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

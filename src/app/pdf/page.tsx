import { FiArrowLeft, FiBookOpen, FiExternalLink } from "react-icons/fi";
import Link from "next/link";
import ThemeToggle from "@/components/theme/ThemeToggle";
import { prisma } from "@/lib/prisma";

export const revalidate = 0;

export default async function CatalogoPdfPublico() {
  // Obtener todas las campañas activas con sus empresas, marcas y catálogos asociados
  const activeCampaigns = await prisma.campaign.findMany({
    where: {
      deletedAt: null,
      isActive: true,
    },
    include: {
      company: {
        include: {
          brands: {
            where: { deletedAt: null },
            orderBy: { name: "asc" },
          },
        },
      },
      catalogPdfs: {
        where: { deletedAt: null },
      },
    },
    orderBy: {
      company: {
        name: "asc",
      },
    },
  });

  return (
    <div className="min-h-screen bg-bg-page text-text-primary flex flex-col font-sans transition-colors duration-300">
      {/* 1. Header / Navbar */}
      <header className="sticky top-0 z-40 w-full h-16 bg-bg-page/85 backdrop-blur-md border-b border-border-default transition-all duration-300 flex items-center justify-between px-4 sm:px-8">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="p-2 rounded-xl text-text-secondary hover:bg-beauty-50 hover:text-beauty-800 transition-colors duration-200 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-beauty-400"
            aria-label="Volver al catálogo de productos"
          >
            <FiArrowLeft className="w-5 h-5" />
          </Link>
          <div className="flex flex-col leading-tight">
            <span className="text-sm font-semibold tracking-wide text-text-primary">
              Catálogos PDF
            </span>
            <span className="text-[10px] text-beauty-600 font-semibold tracking-widest uppercase">
              Campañas Activas
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <ThemeToggle />
        </div>
      </header>

      {/* 2. Hero Section */}
      <section className="relative overflow-hidden bg-linear-to-r from-beauty-50 via-bg-accent to-beauty-50 dark:from-beauty-900/40 dark:via-bg-accent dark:to-beauty-900/40 border-b border-border-soft py-10 px-6 sm:px-12 flex flex-col items-center text-center">
        <div className="absolute top-[-50%] right-[-10%] w-72 h-72 rounded-full bg-beauty-100/30 dark:bg-beauty-800/10 blur-3xl" />
        <div className="relative max-w-xl">
          <span className="text-[11px] font-bold tracking-widest text-beauty-600 uppercase bg-beauty-100 dark:bg-beauty-950 px-3 py-1.5 rounded-full border border-beauty-200/50 dark:border-beauty-800">
            📖 Folletos y Revistas Digitales
          </span>
          <h1 className="text-3xl font-extrabold tracking-tight text-text-primary mt-4 mb-2">
            Catálogos en PDF Activos
          </h1>
          <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
            Explora las revistas virtuales de la campaña actual. Haz clic en
            cualquier catálogo para abrir su archivo PDF oficial.
          </p>
        </div>
      </section>

      {/* 3. Contenido Principal */}
      <main className="flex-1 w-full max-w-4xl mx-auto px-4 sm:px-8 py-8 space-y-12">
        {activeCampaigns.length === 0 ? (
          <div className="text-center py-16 space-y-3 select-none">
            <div className="text-4xl">📭</div>
            <h3 className="text-base font-bold text-text-secondary">
              Sin campañas activas
            </h3>
            <p className="text-xs text-text-tertiary">
              No hay ninguna campaña marcada como activa en este momento.
            </p>
          </div>
        ) : (
          activeCampaigns.map((campaign) => {
            const { company } = campaign;
            if (!company) return null;

            return (
              <section key={campaign.id} className="space-y-6">
                {/* Cabecera de la Empresa y la Campaña */}
                <div className="flex flex-col sm:flex-row sm:items-baseline gap-2 pb-3 border-b border-border-soft select-none">
                  <div className="flex items-center gap-2.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-success-text animate-pulse" />
                    <h2 className="text-lg font-extrabold text-text-primary">
                      {company.name}
                    </h2>
                  </div>
                  <span className="text-xs font-bold text-success-text bg-success-bg/30 border border-success-text/10 px-2 py-0.5 rounded-full">
                    Campaña {campaign.number} (Activa)
                  </span>
                  {campaign.startDate && campaign.endDate && (
                    <span className="text-[11px] text-text-tertiary sm:ml-auto">
                      Vigencia:{" "}
                      {new Date(campaign.startDate).toLocaleDateString("es-PE")}{" "}
                      - {new Date(campaign.endDate).toLocaleDateString("es-PE")}
                    </span>
                  )}
                </div>

                {/* Catálogos de las Marcas en formato Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                  {company.brands.map((brand) => {
                    const catalog = campaign.catalogPdfs.find(
                      (c) => c.brandId === brand.id,
                    );

                    return (
                      <article
                        key={brand.id}
                        className={`group bg-bg-card border rounded-2xl overflow-hidden flex flex-col transition-all duration-300 ${
                          catalog
                            ? "border-border-soft hover:border-border-strong hover:-translate-y-1 hover:shadow-md"
                            : "border-border-default/40 opacity-70"
                        }`}
                      >
                        {/* Portada Miniatura */}
                        <div className="aspect-4/3 w-full overflow-hidden bg-bg-surface relative border-b border-border-soft flex items-center justify-center p-4">
                          {brand.logoUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={brand.logoUrl}
                              alt={brand.name}
                              className="max-h-16 max-w-[80%] object-contain group-hover:scale-105 transition-transform duration-500"
                              loading="lazy"
                            />
                          ) : (
                            <span className="text-lg font-black tracking-wider text-text-tertiary select-none group-hover:scale-105 transition-transform duration-500">
                              {brand.name}
                            </span>
                          )}

                          {catalog && (
                            <div className="absolute top-3 right-3 select-none">
                              <div className="w-8 h-8 rounded-full bg-white/90 dark:bg-black/90 flex items-center justify-center text-beauty-600 shadow-sm border border-border-default/20 group-hover:scale-110 transition-transform duration-300">
                                <FiBookOpen className="w-4 h-4" />
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Detalles y Acciones */}
                        <div className="p-4 flex-1 flex flex-col justify-between gap-4">
                          <div>
                            <h3 className="text-xs font-bold text-text-primary uppercase tracking-wider flex items-center gap-1.5 select-none">
                              {brand.name}
                            </h3>
                            <p className="text-[10px] text-text-secondary mt-1 select-none">
                              {catalog
                                ? catalog.title ||
                                  `Catálogo Oficial ${brand.name}`
                                : `Próximamente catálogo de ${brand.name}`}
                            </p>
                          </div>

                          {catalog ? (
                            <a
                              href={catalog.pdfUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center justify-center gap-2 w-full py-2.5 px-3 rounded-xl border border-beauty-500/10 bg-beauty-500/5 hover:bg-beauty-500/15 text-beauty-600 text-xs font-bold transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-beauty-400"
                            >
                              <span>Ver Catálogo PDF</span>
                              <FiExternalLink className="w-3.5 h-3.5" />
                            </a>
                          ) : (
                            <button
                              disabled
                              className="flex items-center justify-center gap-2 w-full py-2.5 px-3 rounded-xl border border-border-default bg-bg-surface/50 text-text-tertiary text-xs font-medium cursor-not-allowed select-none"
                            >
                              <span>No disponible</span>
                            </button>
                          )}
                        </div>
                      </article>
                    );
                  })}
                </div>
              </section>
            );
          })
        )}
      </main>

      {/* 4. Footer */}
      <footer className="w-full bg-bg-surface border-t border-border-default mt-16 py-8 px-4 sm:px-8 text-center text-xs text-text-secondary transition-colors duration-300">
        <div className="max-w-2xl mx-auto space-y-3 select-none">
          <p className="font-semibold text-text-primary">
            Lauren Arica • Consultora Autorizada Belcorp, Natura & Avon
          </p>
          <p className="leading-relaxed">
            Las marcas Ésika, L'Bel, Cyzone, Natura y Avon son marcas
            registradas de sus respectivos dueños. Este sitio enlaza a sus
            catálogos virtuales públicos para facilitar la recopilación de
            pedidos de clientes.
          </p>
          <div className="pt-4 text-[10px] text-text-tertiary">
            © {new Date().getFullYear()} Lauren Arica. Todos los derechos
            reservados.
          </div>
        </div>
      </footer>
    </div>
  );
}

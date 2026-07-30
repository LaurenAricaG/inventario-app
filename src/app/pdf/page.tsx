import { FiBookOpen, FiExternalLink } from "react-icons/fi";
import Link from "next/link";
import ThemeToggle from "@/components/theme/ThemeToggle";
import BrandLogo from "@/components/ui/BrandLogo";
import PageHeader from "@/components/ui/PageHeader";
import { formatDateUTC } from "@/utils/date.utils";
import { prisma } from "@/lib/prisma";
import { getPublicSystemConfig } from "@/lib/config";

export const metadata = {
  title: "Catálogos PDF",
};

export const revalidate = 0;

export default async function CatalogoPdfPublico() {
  const systemConfig = await getPublicSystemConfig();
  const systemName = systemConfig?.systemName || "Mi empresa";

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
      <header className="sticky top-0 z-40 w-full h-16 bg-bg-page/85 backdrop-blur-md border-b border-border-default transition-all duration-300">
        <div className="w-full max-w-5xl mx-auto h-full px-4 sm:px-8 flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-3.5 min-w-0">
            <BrandLogo
              size="md"
              systemName={systemName}
              systemLogoUrl={systemConfig?.systemLogoUrl}
              textClassName="text-base sm:text-lg max-w-[130px] min-[380px]:max-w-[220px] sm:max-w-none truncate"
            />
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* 2. Contenido Principal */}
      <main className="flex-1 w-full max-w-5xl mx-auto px-4 sm:px-8 py-6 space-y-8">
        <PageHeader
          title="Catálogos PDF"
          subtitle="Explora los catalogos digitales"
          breadcrumbs={[
            { label: "Catálogo", href: "/" },
            { label: "Catálogos PDF" },
          ]}
        />
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
                <div className="flex flex-col sm:flex-row sm:items-center gap-2.5 pb-3 border-b border-border-soft select-none">
                  <div className="flex items-center gap-2.5">
                    {company.logoUrl ? (
                      <div className="w-8 h-8 rounded-full bg-white dark:bg-bg-card flex items-center justify-center shrink-0 p-1 shadow-sm">
                        <img
                          src={company.logoUrl}
                          alt={company.name}
                          className="w-full h-full object-contain rounded-full drop-shadow-xs"
                        />
                      </div>
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-beauty-100 dark:bg-beauty-950 text-beauty-600 dark:text-beauty-400 font-extrabold text-sm flex items-center justify-center shrink-0 shadow-sm">
                        {company.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <h2 className="text-lg font-extrabold text-text-primary">
                      {company.name}
                    </h2>
                  </div>
                  <span className="text-xs font-bold text-success-text bg-success-bg/30 border border-success-text/10 px-2.5 py-0.5 rounded-full w-fit">
                    Campaña {campaign.number}
                  </span>
                  {campaign.startDate && campaign.endDate && (
                    <span className="text-[11px] text-text-tertiary sm:ml-auto">
                      Vigencia: {formatDateUTC(campaign.startDate)} -{" "}
                      {formatDateUTC(campaign.endDate)}
                    </span>
                  )}
                </div>

                {/* Catálogos de las Marcas en formato Grid */}
                <div className="grid grid-cols-1 min-[480px]:grid-cols-2 md:grid-cols-3 gap-5 sm:gap-6">
                  {company.brands.map((brand) => {
                    const catalog = campaign.catalogPdfs.find(
                      (c) => c.brandId === brand.id,
                    );

                    return (
                      <article
                        key={brand.id}
                        className={`group bg-bg-card border rounded-2xl overflow-hidden flex flex-col transition-all duration-300 ${catalog
                          ? "border-border-soft hover:border-border-strong hover:-translate-y-1 hover:shadow-md"
                          : "border-border-default/40 opacity-70"
                          }`}
                      >
                        {/* Portada Miniatura */}
                        <div className="h-36 sm:h-40 w-full overflow-hidden bg-bg-surface relative border-b border-border-soft flex items-center justify-center p-4">
                          {brand.logoUrl ? (
                            <img
                              src={brand.logoUrl}
                              alt={brand.name}
                              className="max-h-16 max-w-[80%] object-contain group-hover:scale-105 transition-transform duration-500"
                              loading="lazy"
                            />
                          ) : (
                            <span className="text-base sm:text-lg font-black tracking-wider text-text-tertiary select-none group-hover:scale-105 transition-transform duration-500">
                              {brand.name}
                            </span>
                          )}

                          {catalog && (
                            <div className="absolute top-3 right-3 select-none">
                              <div className="w-8 h-8 rounded-full bg-white/90 dark:bg-black/90 flex items-center justify-center text-beauty-600 shadow-xs border border-border-default/20 group-hover:scale-110 transition-transform duration-300">
                                <FiBookOpen className="w-4 h-4" />
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Detalles y Acciones */}
                        <div className="p-4 flex-1 flex flex-col justify-between gap-4">
                          <div>
                            <h3 className="text-xs sm:text-sm font-bold text-text-primary uppercase tracking-wider flex items-center gap-1.5 select-none truncate">
                              {brand.name}
                            </h3>
                            <p className="text-[11px] text-text-secondary mt-1 select-none line-clamp-1">
                              {catalog
                                ? catalog.title ||
                                `Catálogo Oficial ${brand.name}`
                                : `Próximamente`}
                            </p>
                          </div>

                          {catalog ? (
                            <a
                              href={catalog.pdfUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center justify-center gap-2 w-full py-2.5 px-3 rounded-xl border border-beauty-500/10 bg-beauty-500/5 hover:bg-beauty-500/15 text-beauty-600 text-xs font-bold transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-beauty-400 shrink-0"
                            >
                              <span>Ver Catálogo PDF</span>
                              <FiExternalLink className="w-3.5 h-3.5" />
                            </a>
                          ) : (
                            <button
                              disabled
                              className="flex items-center justify-center gap-2 w-full py-2.5 px-3 rounded-xl border border-border-default bg-bg-surface/50 text-text-tertiary text-xs font-medium cursor-not-allowed select-none shrink-0"
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
      <footer className="mt-16 py-8 border-t border-border-soft text-center text-xs text-text-tertiary bg-bg-surface/50">
        <div className="max-w-7xl mx-auto px-4 space-y-1.5 select-none">
          <p className="font-bold text-text-primary text-sm">
            {systemName.split(" ").map((word, idx, arr) => (
              <span
                key={idx}
                className={
                  idx === arr.length - 1
                    ? "text-beauty-600 dark:text-beauty-400 font-extrabold"
                    : ""
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
    </div>
  );
}

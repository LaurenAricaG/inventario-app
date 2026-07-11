import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Campaigns from "@/components/campaigns";

interface CampaniasPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function CampaniasPage(props: CampaniasPageProps) {
  const session = await auth();
  const permissions = session?.user?.permissions ?? [];

  const hasCampaignsRead = permissions.includes("campaigns:read");
  const hasCatalogsRead = permissions.includes("catalogs:read");

  if (!hasCampaignsRead && !hasCatalogsRead) {
    redirect("/admin");
  }

  const searchParams = await props.searchParams;
  let tab = typeof searchParams.tab === "string" ? searchParams.tab : "campanias";

  // Force active tab matching permissions
  if (tab === "campanias" && !hasCampaignsRead) {
    tab = "catalogos";
  } else if (tab === "catalogos" && !hasCatalogsRead) {
    tab = "campanias";
  }

  const page = Number(searchParams.page) || 1;
  const search =
    typeof searchParams.search === "string" ? searchParams.search : "";
  const onlyActive =
    typeof searchParams.onlyActive === "string"
      ? searchParams.onlyActive !== "false"
      : true; // Por defecto muestra solo campañas activas

  const limit = 10;
  const skip = (page - 1) * limit;

  // Cargar datos comunes para dropdowns de creación/edición
  const [companies, allCampaignsForSelect, brands, existingCatalogPdfs] = await Promise.all([
    prisma.company.findMany({
      where: { deletedAt: null },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
    prisma.campaign.findMany({
      where: { deletedAt: null },
      select: {
        id: true,
        number: true,
        companyId: true,
        isActive: true,
        startDate: true,
        endDate: true,
        paymentDate: true,
        company: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: [
        { isActive: "desc" },
        { company: { name: "asc" } },
        { number: "desc" },
      ],
    }),
    prisma.brand.findMany({
      where: { deletedAt: null },
      select: { id: true, name: true, companyId: true },
      orderBy: { name: "asc" },
    }),
    prisma.catalogPdf.findMany({
      where: { deletedAt: null },
      select: { campaignId: true, brandId: true },
    }),
  ]);

  let campaigns: any[] = [];
  let totalCampaigns = 0;
  let overallCampaignsCount = 0;

  let catalogs: any[] = [];
  let totalCatalogs = 0;
  let overallCatalogsCount = 0;

  if (tab === "campanias") {
    const whereClause = {
      deletedAt: null,
      ...(search
        ? {
            OR: [
              { number: { contains: search, mode: "insensitive" as const } },
              { company: { name: { contains: search, mode: "insensitive" as const } } },
            ],
          }
        : {}),
    };

    const [campList, count, overall] = await Promise.all([
      prisma.campaign.findMany({
        where: whereClause,
        select: {
          id: true,
          companyId: true,
          number: true,
          startDate: true,
          endDate: true,
          paymentDate: true,
          isActive: true,
          createdAt: true,
          company: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        take: limit,
        skip: skip,
        orderBy: [
          { isActive: "desc" },
          { company: { name: "asc" } },
          { number: "desc" },
        ],
      }),
      prisma.campaign.count({ where: whereClause }),
      prisma.campaign.count({ where: { deletedAt: null } }),
    ]);

    campaigns = campList;
    totalCampaigns = count;
    overallCampaignsCount = overall;
  } else {
    // tab === "catalogos"
    const whereClause = {
      deletedAt: null,
      ...(onlyActive ? { campaign: { isActive: true } } : {}),
      ...(search
        ? {
            OR: [
              { title: { contains: search, mode: "insensitive" as const } },
              { brand: { name: { contains: search, mode: "insensitive" as const } } },
              { campaign: { number: { contains: search, mode: "insensitive" as const } } },
            ],
          }
        : {}),
    };

    const [catList, count, overall] = await Promise.all([
      prisma.catalogPdf.findMany({
        where: whereClause,
        select: {
          id: true,
          campaignId: true,
          brandId: true,
          pdfUrl: true,
          title: true,
          createdAt: true,
          campaign: {
            select: {
              id: true,
              number: true,
              isActive: true,
              company: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
          brand: {
            select: {
              id: true,
              name: true,
              logoUrl: true,
            },
          },
        },
        take: limit,
        skip: skip,
        orderBy: { createdAt: "desc" },
      }),
      prisma.catalogPdf.count({ where: whereClause }),
      prisma.catalogPdf.count({ where: { deletedAt: null } }),
    ]);

    catalogs = catList;
    totalCatalogs = count;
    overallCatalogsCount = overall;
  }

  const itemsTotal = tab === "campanias" ? totalCampaigns : totalCatalogs;
  const totalPages = Math.ceil(itemsTotal / limit);

  return (
    <Campaigns
      tab={tab}
      initialCampanias={JSON.parse(JSON.stringify(campaigns))}
      companies={companies}
      overallCount={tab === "campanias" ? overallCampaignsCount : overallCatalogsCount}
      totalItems={itemsTotal}
      totalPages={totalPages}
      currentPage={page}
      itemsPerPage={limit}
      search={search}
      onlyActive={onlyActive}
      permissions={permissions}
      
      // Catálogos PDF específicos
      catalogPdfs={JSON.parse(JSON.stringify(catalogs))}
      overallCatalogsCount={overallCatalogsCount}
      allCampaignsForSelect={allCampaignsForSelect}
      brands={brands}
      existingCatalogPdfs={existingCatalogPdfs}
    />
  );
}

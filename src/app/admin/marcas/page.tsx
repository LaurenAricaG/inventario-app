import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Brands from "@/components/brands";

export const metadata = {
  title: "Marcas",
};

interface MarcasPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function MarcasPage(props: MarcasPageProps) {
  const session = await auth();
  const permissions = session?.user?.permissions ?? [];

  // Validar permiso de lectura
  if (!permissions.includes("brands:read")) {
    redirect("/admin");
  }

  const searchParams = await props.searchParams;
  const page = Number(searchParams.page) || 1;
  const search =
    typeof searchParams.search === "string" ? searchParams.search : "";

  const limit = 10;
  const skip = (page - 1) * limit;

  // Filtros de búsqueda
  const whereClause = {
    deletedAt: null,
    ...(search
      ? {
        name: { contains: search, mode: "insensitive" as const },
      }
      : {}),
  };

  const [brands, totalItems, overallCount, companies] = await Promise.all([
    prisma.brand.findMany({
      where: whereClause,
      select: {
        id: true,
        name: true,
        logoUrl: true,
        company: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      take: limit,
      skip: skip,
      orderBy: { id: "asc" },
    }),
    prisma.brand.count({
      where: whereClause,
    }),
    prisma.brand.count({
      where: { deletedAt: null },
    }),
    prisma.company.findMany({
      where: { deletedAt: null },
      select: {
        id: true,
        name: true,
      },
      orderBy: { name: "asc" },
    }),
  ]);

  const totalPages = Math.ceil(totalItems / limit);
  return (
    <Brands
      initialMarcas={JSON.parse(JSON.stringify(brands))}
      companies={companies}
      overallCount={overallCount}
      totalItems={totalItems}
      totalPages={totalPages}
      currentPage={page}
      itemsPerPage={limit}
      search={search}
      permissions={permissions}
    />
  );
}

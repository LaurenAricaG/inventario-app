import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Companies from "@/components/companies";

interface EmpresasPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function EmpresasPage(props: EmpresasPageProps) {
  const session = await auth();
  const permissions = session?.user?.permissions ?? [];

  // Validar permiso de lectura
  if (!permissions.includes("companies:read")) {
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

  const [companies, totalItems, overallCount] = await Promise.all([
    prisma.company.findMany({
      where: whereClause,
      select: {
        id: true,
        name: true,
        logoUrl: true,
        createdAt: true,
      },
      take: limit,
      skip: skip,
      orderBy: { id: "asc" },
    }),
    prisma.company.count({
      where: whereClause,
    }),
    prisma.company.count({
      where: { deletedAt: null },
    }),
  ]);

  const totalPages = Math.ceil(totalItems / limit);
  return (
    <Companies
      initialEmpresas={JSON.parse(JSON.stringify(companies))}
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

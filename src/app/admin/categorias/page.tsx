import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Categories from "@/components/categories";

interface CategoriasPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function CategoriasPage(props: CategoriasPageProps) {
  const session = await auth();
  const permissions = session?.user?.permissions ?? [];

  // Validar permiso de lectura
  if (!permissions.includes("categories:read")) {
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

  const [categories, totalItems, overallCount] = await Promise.all([
    prisma.category.findMany({
      where: whereClause,
      select: {
        id: true,
        name: true,
        createdAt: true,
      },
      take: limit,
      skip: skip,
      orderBy: { name: "asc" },
    }),
    prisma.category.count({
      where: whereClause,
    }),
    prisma.category.count({
      where: { deletedAt: null },
    }),
  ]);

  const totalPages = Math.ceil(totalItems / limit);

  return (
    <Categories
      initialCategories={JSON.parse(JSON.stringify(categories))}
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

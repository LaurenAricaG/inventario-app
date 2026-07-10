import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Genders from "@/components/genders";

interface GenerosPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function GenerosPage(props: GenerosPageProps) {
  const session = await auth();
  const permissions = session?.user?.permissions ?? [];

  // Validar permiso de lectura
  if (!permissions.includes("genders:read")) {
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

  // Consultar datos en paralelo
  const [genders, totalItems, overallCount] = await Promise.all([
    prisma.genderSegment.findMany({
      where: whereClause,
      select: {
        id: true,
        name: true,
        createdAt: true,
      },
      take: limit,
      skip: skip,
      orderBy: { id: "asc" },
    }),
    prisma.genderSegment.count({
      where: whereClause,
    }),
    prisma.genderSegment.count({
      where: { deletedAt: null },
    }),
  ]);

  const totalPages = Math.ceil(totalItems / limit);

  return (
    <Genders
      initialGenders={JSON.parse(JSON.stringify(genders))}
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

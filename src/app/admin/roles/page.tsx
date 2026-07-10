import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Roles from "@/components/roles";

interface RolesPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function RolesPage(props: RolesPageProps) {
  const session = await auth();
  const permissions = session?.user?.permissions ?? [];

  // Validar permiso de lectura
  if (!permissions.includes("roles:read")) {
    redirect("/admin");
  }

  const searchParams = await props.searchParams;
  const page = Number(searchParams.page) || 1;
  const search = typeof searchParams.search === "string" ? searchParams.search : "";

  const limit = 10;
  const skip = (page - 1) * limit;

  // Filtros de búsqueda para Roles
  const whereClause = {
    deletedAt: null,
    ...(search
      ? {
          name: { contains: search, mode: "insensitive" as const },
        }
      : {}),
  };

  // Consultar roles, totalizadores y lista completa de permisos del sistema
  const [roles, totalItems, overallCount, permissionsList] = await Promise.all([
    prisma.role.findMany({
      where: whereClause,
      take: limit,
      skip: skip,
      include: {
        permissions: {
          include: {
            permission: {
              select: {
                id: true,
                code: true,
                name: true,
                description: true,
              },
            },
          },
        },
      },
      orderBy: { name: "asc" },
    }),
    prisma.role.count({
      where: whereClause,
    }),
    prisma.role.count({
      where: { deletedAt: null },
    }),
    prisma.permission.findMany({
      select: {
        id: true,
        code: true,
        name: true,
        description: true,
      },
      orderBy: { code: "asc" },
    }),
  ]);

  const totalPages = Math.ceil(totalItems / limit);

  return (
    <Roles
      initialRoles={JSON.parse(JSON.stringify(roles))}
      permissionsList={permissionsList}
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

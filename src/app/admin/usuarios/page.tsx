import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Users from "@/components/users";

interface UsuariosPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function UsuariosPage(props: UsuariosPageProps) {
  const session = await auth();
  const permissions = session?.user?.permissions ?? [];

  // Validar permiso de lectura
  if (!permissions.includes("users:read")) {
    redirect("/admin");
  }

  const searchParams = await props.searchParams;
  const page = Number(searchParams.page) || 1;
  const search = typeof searchParams.search === "string" ? searchParams.search : "";
  const status = typeof searchParams.status === "string" ? searchParams.status : "active";

  const limit = 10;
  const skip = (page - 1) * limit;

  // Filtros de búsqueda
  const whereClause = {
    ...(status === "active" ? { deletedAt: null } : {}),
    ...(status === "suspended" ? { deletedAt: { not: null } } : {}),
    ...(search
      ? {
          OR: [
            { name: { contains: search, mode: "insensitive" as const } },
            { username: { contains: search, mode: "insensitive" as const } },
            { email: { contains: search, mode: "insensitive" as const } },
          ],
        }
      : {}),
  };

  // Consultar usuarios, totalizadores y roles disponibles
  const [users, totalItems, overallCount, roles] = await Promise.all([
    prisma.user.findMany({
      where: whereClause,
      take: limit,
      skip: skip,
      include: {
        role: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: { name: "asc" },
    }),
    prisma.user.count({
      where: whereClause,
    }),
    prisma.user.count(),
    prisma.role.findMany({
      select: {
        id: true,
        name: true,
      },
      orderBy: { name: "asc" },
    }),
  ]);

  const totalPages = Math.ceil(totalItems / limit);

  return (
    <Users
      initialUsers={JSON.parse(JSON.stringify(users))}
      roles={roles}
      overallCount={overallCount}
      totalItems={totalItems}
      totalPages={totalPages}
      currentPage={page}
      itemsPerPage={limit}
      search={search}
      statusFilter={status}
      permissions={permissions}
    />
  );
}

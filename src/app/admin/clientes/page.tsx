import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Clients from "@/components/client";

export const metadata = {
  title: "Clientes",
};

interface ClientesPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function ClientesPage(props: ClientesPageProps) {
  const session = await auth();
  const permissions = session?.user?.permissions ?? [];

  // Validar permiso de lectura
  if (!permissions.includes("clients:read")) {
    redirect("/admin");
  }

  const searchParams = await props.searchParams;
  const page = Number(searchParams.page) || 1;
  const search = typeof searchParams.search === "string" ? searchParams.search : "";

  const limit = 10;
  const skip = (page - 1) * limit;

  // Filtros de búsqueda
  const whereClause = {
    deletedAt: null,
    ...(search
      ? {
          OR: [
            { name: { contains: search, mode: "insensitive" as const } },
            { phone: { contains: search, mode: "insensitive" as const } },
            { address: { contains: search, mode: "insensitive" as const } },
          ],
        }
      : {}),
  };

  // Consultas de base de datos en paralelo
  const [clients, totalItems, overallCount] = await Promise.all([
    prisma.client.findMany({
      where: whereClause,
      take: limit,
      skip: skip,
      orderBy: { name: "asc" },
    }),
    prisma.client.count({
      where: whereClause,
    }),
    prisma.client.count({
      where: { deletedAt: null },
    }),
  ]);

  const totalPages = Math.ceil(totalItems / limit);

  return (
    <Clients
      initialClients={JSON.parse(JSON.stringify(clients))}
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

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Debts from "@/components/debts";

export const metadata = {
  title: "Deudas",
};

interface DebtsPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function DebtsPage(props: DebtsPageProps) {
  const session = await auth();
  const permissions = session?.user?.permissions ?? [];

  // Validar permiso de lectura para deudas
  if (!permissions.includes("debts:read")) {
    redirect("/admin");
  }

  const searchParams = await props.searchParams;
  const page = Number(searchParams.page) || 1;
  const search = typeof searchParams.search === "string" ? searchParams.search : "";

  const limit = 10;
  const skip = (page - 1) * limit;

  // Filtros
  const whereClause: any = {
    client: { deletedAt: null },
    ...(search
      ? {
        OR: [
          { client: { name: { contains: search, mode: "insensitive" as const } } },
          { reason: { contains: search, mode: "insensitive" as const } },
          { notes: { contains: search, mode: "insensitive" as const } },
        ],
      }
      : {}),
  };

  // Consultar deudas paginadas, total e info auxiliar para el formulario
  const [debts, totalItems, clients] = await Promise.all([
    prisma.externalDebt.findMany({
      where: whereClause,
      include: {
        client: {
          select: { id: true, name: true },
        },
      },
      orderBy: { createdAt: "desc" },
      take: limit,
      skip: skip,
    }),
    prisma.externalDebt.count({
      where: whereClause,
    }),
    prisma.client.findMany({
      where: { deletedAt: null },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
  ]);

  const totalPages = Math.ceil(totalItems / limit);

  return (
    <Debts
      initialDebts={JSON.parse(JSON.stringify(debts))}
      clients={clients}
      totalItems={totalItems}
      totalPages={totalPages}
      currentPage={page}
      itemsPerPage={limit}
      search={search}
      permissions={permissions}
    />
  );
}

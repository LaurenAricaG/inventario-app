import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import DirectSales from "@/components/direct-sales";

export const metadata = {
  title: "Ventas",
};

interface VentasPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function VentasPage(props: VentasPageProps) {
  const session = await auth();
  const permissions = session?.user?.permissions ?? [];

  // Validar permiso de lectura
  if (!permissions.includes("sales:read")) {
    redirect("/admin");
  }

  const searchParams = await props.searchParams;
  const page = Number(searchParams.page) || 1;
  const search = typeof searchParams.search === "string" ? searchParams.search : "";

  const limit = 10;
  const skip = (page - 1) * limit;

  // Filtros de búsqueda (por nombre de cliente)
  const whereClause = {
    deletedAt: null,
    ...(search
      ? {
        client: {
          name: { contains: search, mode: "insensitive" as const },
        },
      }
      : {}),
  };

  // Consultas en paralelo
  const [sales, totalItems, overallCount] = await Promise.all([
    prisma.directSale.findMany({
      where: whereClause,
      include: {
        client: true,
        items: {
          include: {
            product: {
              include: {
                brand: true,
                category: true,
              },
            },
          },
        },
      },
      take: limit,
      skip: skip,
      orderBy: { createdAt: "desc" },
    }),
    prisma.directSale.count({
      where: whereClause,
    }),
    prisma.directSale.count({
      where: { deletedAt: null },
    }),
  ]);

  const totalPages = Math.ceil(totalItems / limit);

  return (
    <DirectSales
      initialSales={JSON.parse(JSON.stringify(sales))}
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

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Inventory from "@/components/inventory";

interface InventarioPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function InventarioPage(props: InventarioPageProps) {
  const session = await auth();
  const permissions = session?.user?.permissions ?? [];

  // Validar permiso de lectura
  if (!permissions.includes("inventory:read")) {
    redirect("/admin");
  }

  const searchParams = await props.searchParams;
  const page = Number(searchParams.page) || 1;
  const search = typeof searchParams.search === "string" ? searchParams.search : "";
  const typeFilter = typeof searchParams.type === "string" ? searchParams.type : "";

  const limit = 10;
  const skip = (page - 1) * limit;

  // Filtros de búsqueda para StockMovement
  const whereClause = {
    product: {
      deletedAt: null,
      ...(search
        ? {
            OR: [
              { name: { contains: search, mode: "insensitive" as const } },
              { code: { contains: search, mode: "insensitive" as const } },
            ],
          }
        : {}),
    },
    ...(typeFilter === "INPUT" || typeFilter === "OUTPUT"
      ? { type: typeFilter as "INPUT" | "OUTPUT" }
      : {}),
  };

  const [movements, totalItems, overallCount, activeProducts] = await Promise.all([
    prisma.stockMovement.findMany({
      where: whereClause,
      include: {
        product: {
          select: {
            id: true,
            name: true,
            code: true,
            brand: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        createdBy: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      take: limit,
      skip: skip,
      orderBy: { createdAt: "desc" },
    }),
    prisma.stockMovement.count({
      where: whereClause,
    }),
    prisma.stockMovement.count(),
    prisma.product.findMany({
      where: { deletedAt: null },
      select: {
        id: true,
        name: true,
        code: true,
        stock: true,
        brand: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: { name: "asc" },
    }),
  ]);

  const totalPages = Math.ceil(totalItems / limit);

  return (
    <Inventory
      initialMovements={JSON.parse(JSON.stringify(movements))}
      products={JSON.parse(JSON.stringify(activeProducts))}
      overallCount={overallCount}
      totalItems={totalItems}
      totalPages={totalPages}
      currentPage={page}
      itemsPerPage={limit}
      search={search}
      typeFilter={typeFilter}
      permissions={permissions}
    />
  );
}

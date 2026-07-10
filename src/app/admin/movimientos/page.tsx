import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Movements from "@/components/movements";
import { SerializedClientBalance } from "@/components/movements/TableMovements";

interface DBOrderItem {
  arrivalStatus: string;
  substitutePrice: number | null;
  catalogPrice: number;
  quantity: number;
}

interface DBOrder {
  discount: number;
  total: number | null;
  items: DBOrderItem[];
}

const getOrderTotal = (order: DBOrder) => {
  if (order.total !== null && order.total !== undefined) return order.total;
  const subtotal = order.items.reduce((sum, item) => {
    if (item.arrivalStatus === "MISSING") return sum;
    const price =
      item.arrivalStatus === "SUBSTITUTED" && item.substitutePrice !== null
        ? item.substitutePrice
        : item.catalogPrice;
    return sum + item.quantity * price;
  }, 0);
  return Math.max(0, subtotal - order.discount);
};

interface MovimientosPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function MovimientosPage(props: MovimientosPageProps) {
  const session = await auth();
  const permissions = session?.user?.permissions ?? [];

  // Validar permiso de lectura para movimientos (historial de clientes)
  if (!permissions.includes("transactions:read")) {
    redirect("/admin");
  }

  const searchParams = await props.searchParams;
  const page = Number(searchParams.page) || 1;
  const search = typeof searchParams.search === "string" ? searchParams.search : "";

  const limit = 10;
  const skip = (page - 1) * limit;

  // Filtro base para traer únicamente clientes con algún movimiento registrado
  const baseFilter = {
    deletedAt: null,
    OR: [
      { directSales: { some: { deletedAt: null } } },
      { campaignOrders: { some: { deletedAt: null } } },
      { externalDebts: { some: {} } },
      { payments: { some: {} } },
    ],
  };

  // 1. Obtener todos los clientes con movimientos para calcular las estadísticas consolidadas del negocio
  const allClients = await prisma.client.findMany({
    where: baseFilter,
    include: {
      directSales: {
        where: { deletedAt: null },
        select: { total: true },
      },
      campaignOrders: {
        where: { deletedAt: null, status: "DELIVERED" },
        include: {
          items: true,
        },
      },
      externalDebts: {
        select: { amount: true },
      },
      payments: {
        select: { amount: true },
      },
    },
  });

  let totalOutstanding = 0;
  let totalCollected = 0;
  let debtorsCount = 0;

  // Calcular métricas agregadas
  allClients.forEach((client) => {
    const totalSales =
      client.directSales.reduce((sum, s) => sum + s.total, 0) +
      client.campaignOrders.reduce((sum, o) => sum + getOrderTotal(o), 0);
    const totalDebts = client.externalDebts.reduce((sum, d) => sum + d.amount, 0);
    const totalPayments = client.payments.reduce((sum, p) => sum + p.amount, 0);
    const balance = totalSales + totalDebts - totalPayments;

    totalCollected += totalPayments;
    if (balance > 0.01) {
      totalOutstanding += balance;
      debtorsCount++;
    }
  });

  // 2. Obtener clientes filtrados y paginados con movimientos
  const whereClause = {
    ...baseFilter,
    ...(search
      ? {
          name: { contains: search, mode: "insensitive" as const },
        }
      : {}),
  };

  const [paginatedClients, totalItems] = await Promise.all([
    prisma.client.findMany({
      where: whereClause,
      include: {
        directSales: {
          where: { deletedAt: null },
          select: { total: true },
        },
        campaignOrders: {
          where: { deletedAt: null, status: "DELIVERED" },
          include: {
            items: true,
          },
        },
        externalDebts: {
          select: { amount: true },
        },
        payments: {
          select: { amount: true },
        },
      },
      orderBy: { name: "asc" },
      take: limit,
      skip: skip,
    }),
    prisma.client.count({
      where: whereClause,
    }),
  ]);

  const totalPages = Math.ceil(totalItems / limit);

  // Serializar e integrar datos calculados para la vista de listado
  const serializedClients: SerializedClientBalance[] = paginatedClients.map((client) => {
    const totalSales =
      client.directSales.reduce((sum, s) => sum + s.total, 0) +
      client.campaignOrders.reduce((sum, o) => sum + getOrderTotal(o), 0);
    const totalExternalDebts = client.externalDebts.reduce((sum, d) => sum + d.amount, 0);
    const totalPayments = client.payments.reduce((sum, p) => sum + p.amount, 0);
    const balance = totalSales + totalExternalDebts - totalPayments;

    return {
      id: client.id,
      name: client.name,
      phone: client.phone,
      address: client.address,
      totalSales,
      totalExternalDebts,
      totalPayments,
      balance,
    };
  });

  return (
    <Movements
      clients={serializedClients}
      overallCount={allClients.length}
      totalItems={totalItems}
      totalPages={totalPages}
      currentPage={page}
      itemsPerPage={limit}
      search={search}
      summary={{
        totalOutstanding,
        totalCollected,
        debtorsCount,
      }}
    />
  );
}

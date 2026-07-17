import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Payments from "@/components/payments";
import { PaymentMethod } from "@/generated/prisma";

interface DBOrderItem {
  arrivalStatus: string;
  substitute?: {
    catalogPrice: number;
  } | null;
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
      item.arrivalStatus === "SUBSTITUTED" &&
      item.substitute?.catalogPrice !== undefined &&
      item.substitute?.catalogPrice !== null
        ? item.substitute.catalogPrice
        : item.catalogPrice;
    return sum + item.quantity * price;
  }, 0);
  return Math.max(0, subtotal - order.discount);
};


interface PaymentsPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function PaymentsPage(props: PaymentsPageProps) {
  const session = await auth();
  const permissions = session?.user?.permissions ?? [];

  // Validar permiso de lectura para pagos
  if (!permissions.includes("payments:read")) {
    redirect("/admin");
  }

  const searchParams = await props.searchParams;
  const page = Number(searchParams.page) || 1;
  const search = typeof searchParams.search === "string" ? searchParams.search : "";
  const method = typeof searchParams.method === "string" ? searchParams.method : "";

  const limit = 10;
  const skip = (page - 1) * limit;

  // Filtros
  const whereClause: any = {
    client: { deletedAt: null },
    ...(search
      ? {
          OR: [
            { client: { name: { contains: search, mode: "insensitive" as const } } },
            { note: { contains: search, mode: "insensitive" as const } },
          ],
        }
      : {}),
    ...(method && Object.values(PaymentMethod).includes(method as any)
      ? { method: method as PaymentMethod }
      : {}),
  };

  // Consultar pagos paginados, total e info auxiliar para el formulario
  const [payments, totalItems, clients] = await Promise.all([
    prisma.payment.findMany({
      where: whereClause,
      include: {
        client: {
          select: { id: true, name: true },
        },
      },
      orderBy: { paidAt: "desc" },
      take: limit,
      skip: skip,
    }),
    prisma.payment.count({
      where: whereClause,
    }),
    prisma.client.findMany({
      where: { deletedAt: null },
      include: {
        directSales: {
          where: { deletedAt: null },
          select: { total: true },
        },
        campaignOrders: {
          where: { deletedAt: null, status: "DELIVERED" },
          include: {
            items: {
              include: { substitute: true },
            },
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
    }),
  ]);

  const serializedClients = clients.map((client) => {
    const totalSales =
      client.directSales.reduce((sum, s) => sum + s.total, 0) +
      client.campaignOrders.reduce((sum, o) => sum + getOrderTotal(o), 0);
    const totalExternalDebts = client.externalDebts.reduce((sum, d) => sum + d.amount, 0);
    const totalPayments = client.payments.reduce((sum, p) => sum + p.amount, 0);
    const balance = totalSales + totalExternalDebts - totalPayments;
    return {
      id: client.id,
      name: client.name,
      balance,
    };
  });


  const totalPages = Math.ceil(totalItems / limit);

  return (
    <Payments
      initialPayments={JSON.parse(JSON.stringify(payments))}
      clients={serializedClients}
      totalItems={totalItems}
      totalPages={totalPages}
      currentPage={page}
      itemsPerPage={limit}
      search={search}
      selectedMethod={method}
      permissions={permissions}
    />
  );
}

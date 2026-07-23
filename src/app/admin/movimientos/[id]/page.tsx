import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import { PaymentMethod } from "@/generated/prisma";
import ClientDetailsDashboard from "@/components/movements/ClientDetailsDashboard";
import { MovementItem } from "@/components/movements/MovementHistoryTable";

export const metadata = {
  title: "Ficha cliente",
};

interface FichaClientePageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ page?: string }>;
}

const methodTranslations: Record<PaymentMethod, string> = {
  CASH: "Efectivo",
  YAPE: "Yape",
  PLIN: "Plin",
  BANK_TRANSFER: "Transferencia Bancaria",
  OTHER: "Otro",
};

export default async function FichaClientePage(props: FichaClientePageProps) {
  const session = await auth();
  const permissions = session?.user?.permissions ?? [];

  // Validar permisos de detalle para movimientos
  if (!permissions.includes("transactions:detail")) {
    redirect("/admin");
  }

  const { id } = await props.params;
  const searchParams = await props.searchParams;
  const page = Number(searchParams.page) || 1;
  const limit = 10;
  const clientId = Number(id);

  if (isNaN(clientId)) {
    notFound();
  }

  // 1. Obtener detalles del cliente junto con todas sus transacciones
  const client = await prisma.client.findFirst({
    where: { id: clientId, deletedAt: null },
    include: {
      directSales: {
        where: { deletedAt: null },
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
      },
      campaignOrders: {
        where: { deletedAt: null },
        include: {
          client: true,
          campaign: {
            include: { company: true },
          },
          items: {
            include: {
              brand: true,
              substitute: true,
            },
          },
        },
      },
      externalDebts: true,
      payments: true,
    },
  });

  if (!client) {
    notFound();
  }

  // 2. Obtener campañas disponibles para registrar abonos
  const campaigns = await prisma.campaign.findMany({
    where: { deletedAt: null },
    include: { company: true },
    orderBy: { number: "desc" },
  });

  // 3. Unificar todos los registros en una sola lista cronológica de "movimientos"
  const movements: MovementItem[] = [];

  // Añadir Ventas Directas
  client.directSales.forEach((sale) => {
    movements.push({
      id: `ds-${sale.id}`,
      originalId: sale.id,
      type: "VENTA_DIRECTA",
      date: sale.createdAt.toISOString(),
      amount: sale.total,
      description: `Boleta N° DS-${sale.id.toString().padStart(6, "0")}`,
      raw: sale,
    });
  });

  // Añadir Pedidos de Catálogo
  client.campaignOrders.forEach((order) => {
    const orderTotal =
      order.total ||
      order.items.reduce((sum, item) => {
        const price =
          item.arrivalStatus === "MISSING"
            ? 0
            : item.arrivalStatus === "SUBSTITUTED" &&
              item.substitute?.catalogPrice !== undefined &&
              item.substitute?.catalogPrice !== null
              ? item.substitute.catalogPrice
              : item.catalogPrice;
        return sum + item.quantity * price;
      }, 0) - order.discount;

    movements.push({
      id: `co-${order.id}`,
      originalId: order.id,
      type: "PEDIDO_CATALOGO",
      date: order.createdAt.toISOString(),
      amount: orderTotal,
      description: `Pedido N° PC-${order.id.toString().padStart(6, "0")} (Campaña ${order.campaign.number} - ${order.campaign.company.name})`,
      status: order.status,
      raw: order,
    });
  });

  // Añadir Deudas Externas
  client.externalDebts.forEach((debt) => {
    movements.push({
      id: `ed-${debt.id}`,
      originalId: debt.id,
      type: "DEUDA_EXTERNA",
      date: debt.createdAt.toISOString(),
      amount: debt.amount,
      description: `Deuda Adicional: ${debt.reason}`,
      raw: debt,
    });
  });

  // Añadir Pagos
  client.payments.forEach((payment) => {
    movements.push({
      id: `p-${payment.id}`,
      originalId: payment.id,
      type: "PAGO",
      date: payment.paidAt.toISOString(),
      amount: payment.amount,
      description: `Abono recibido - Método: ${methodTranslations[payment.method]}`,
      raw: payment,
    });
  });

  // Ordenar de forma descendente por fecha (más recientes primero)
  movements.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  );

  // 4. Calcular el resumen consolidado de cuentas
  const totalDirectSalesSum = client.directSales.reduce(
    (sum, s) => sum + s.total,
    0,
  );

  // Sumar solo los pedidos de catálogo que hayan sido entregados (DELIVERED)
  const totalDeliveredCampaignOrdersSum = client.campaignOrders.reduce(
    (sum, order) => {
      if (order.status !== "DELIVERED") return sum;
      const orderTotal =
        order.total ||
        order.items.reduce((itemSum, item) => {
          const price =
            item.arrivalStatus === "MISSING"
              ? 0
              : item.arrivalStatus === "SUBSTITUTED" &&
                item.substitute?.catalogPrice !== undefined &&
                item.substitute?.catalogPrice !== null
                ? item.substitute.catalogPrice
                : item.catalogPrice;
          return itemSum + item.quantity * price;
        }, 0) - order.discount;
      return sum + orderTotal;
    },
    0,
  );

  const totalSales = totalDirectSalesSum + totalDeliveredCampaignOrdersSum;
  const totalExternalDebts = client.externalDebts.reduce(
    (sum, d) => sum + d.amount,
    0,
  );
  const totalPayments = client.payments.reduce((sum, p) => sum + p.amount, 0);
  const balance = totalSales + totalExternalDebts - totalPayments;

  // Serializar datos (conectar a strings planos para evitar errores de Next.js Server Actions en Props)
  const clientData = {
    id: client.id,
    name: client.name,
    phone: client.phone,
    address: client.address,
    notes: client.notes,
    shareToken: client.shareToken,
    createdAt: client.createdAt.toISOString(),
  };

  const campaignsData = campaigns.map((camp) => ({
    id: camp.id,
    number: camp.number,
    company: {
      name: camp.company.name,
    },
  }));

  const totalItems = movements.length;
  const totalPages = Math.ceil(totalItems / limit);
  const paginatedMovements = movements.slice((page - 1) * limit, page * limit);

  const serializedMovements = JSON.parse(JSON.stringify(paginatedMovements));

  return (
    <ClientDetailsDashboard
      client={clientData}
      campaigns={campaignsData}
      movements={serializedMovements}
      permissions={permissions}
      summary={{
        totalSales,
        totalExternalDebts,
        totalPayments,
        balance,
      }}
      currentPage={page}
      totalPages={totalPages}
      totalItems={totalItems}
    />
  );
}

import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { PaymentMethod } from "@/generated/prisma";
import ClientPublicPortal from "@/components/movements/ClientPublicPortal";
import { MovementItem } from "@/components/movements/MovementHistoryTable";
import ThemeToggle from "@/components/theme/ThemeToggle";
import { getPublicSystemConfig } from "@/lib/config";

interface CustomerPageProps {
  params: Promise<{ token: string }>;
  searchParams: Promise<{ page?: string }>;
}

const methodTranslations: Record<PaymentMethod, string> = {
  CASH: "Efectivo",
  YAPE: "Yape",
  PLIN: "Plin",
  BANK_TRANSFER: "Transferencia Bancaria",
  OTHER: "Otro",
};

export default async function ClientPortalPage(props: CustomerPageProps) {
  const { token } = await props.params;
  const searchParams = await props.searchParams;
  const page = Number(searchParams.page) || 1;
  const limit = 10;

  // 1. Obtener detalles del cliente junto con todas sus transacciones a partir del token
  const client = await prisma.client.findFirst({
    where: { shareToken: token, deletedAt: null },
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

  // 2. Obtener campañas disponibles para el portal de clientes
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

  // Añadir Pedidos de Catálogo (Solo mostrados al cliente si están en estado DELIVERED)
  client.campaignOrders.forEach((order) => {
    if (order.status !== "DELIVERED") return;

    const orderTotal =
      order.total ||
      order.items.reduce((sum, item) => {
        const price =
          item.arrivalStatus === "MISSING"
            ? 0
            : item.arrivalStatus === "SUBSTITUTED" && item.substitutePrice !== null
              ? item.substitutePrice
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
                item.substitutePrice !== null
                ? item.substitutePrice
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

  // Serializar datos para evitar advertencias de Server Actions en Next.js
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

  const systemConfig = await getPublicSystemConfig();

  return (
    <div className="min-h-screen bg-bg-page text-text-primary p-4 sm:p-6 md:p-8 transition-colors duration-300">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Encabezado del Portal Público */}
        <div className="flex justify-between items-center pb-4 border-b border-border-soft select-none">
          <div className="flex items-center gap-2">
            {systemConfig?.systemLogoUrl ? (
              <img
                src={systemConfig.systemLogoUrl}
                alt={systemConfig.systemName || "Logo"}
                className="w-8 h-8 object-contain rounded-lg bg-bg-surface p-0.5 border border-border-soft"
              />
            ) : null}
            <span className="text-lg font-black tracking-tight text-beauty-600 dark:text-beauty-400">
              {systemConfig?.systemName || "Inventario"}
            </span>
            <span className="text-xs font-bold text-text-tertiary">
              • Portal de Clientes
            </span>
          </div>
          <ThemeToggle />
        </div>

        <ClientPublicPortal
          client={clientData}
          movements={serializedMovements}
          balance={balance}
          currentPage={page}
          totalPages={totalPages}
          totalItems={totalItems}
        />
      </div>
    </div>
  );
}

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import Dashboard from "@/components/dashboard";

export const metadata = {
  title: "Inicio",
};

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

export default async function DashboardPage() {
  const session = await auth();
  const permissions = session?.user?.permissions ?? [];

  // 1. Fetch active campaigns (or fallbacks)
  const activeCampaigns = await prisma.campaign.findMany({
    where: { isActive: true, deletedAt: null },
    include: { company: true },
  });

  const campaignsToUse = activeCampaigns.length > 0
    ? activeCampaigns
    : await prisma.campaign.findMany({
      where: { deletedAt: null },
      include: { company: true },
      orderBy: { endDate: "desc" },
      take: 2,
    });

  const activeCampaignIds = campaignsToUse.map((c) => c.id);

  // 2. Fetch campaign orders (to compute campaign sales)
  const campaignOrders = activeCampaignIds.length > 0
    ? await prisma.campaignOrder.findMany({
      where: {
        campaignId: { in: activeCampaignIds },
        deletedAt: null,
      },
      include: {
        items: {
          include: { substitute: true },
        },
        campaign: { include: { company: true } },
      },
    })
    : [];

  const nonCancelledOrders = campaignOrders.filter((o) => o.status !== "CANCELLED");
  const campaignSalesTotal = nonCancelledOrders.reduce((sum, o) => sum + getOrderTotal(o), 0);
  const campaignOrdersCount = nonCancelledOrders.length;
  const readyForDeliveryCount = nonCancelledOrders.filter((o) => o.status === "PACKED").length;

  // 3. Fetch products and categories count
  const stockAggregate = await prisma.product.aggregate({
    _sum: { stock: true },
    where: { deletedAt: null },
  });
  const totalStock = stockAggregate._sum.stock || 0;

  const categoriesCount = await prisma.category.count({
    where: { deletedAt: null },
  });

  // 4. Fetch clients data for balances and debtors
  const clients = await prisma.client.findMany({
    where: { deletedAt: null },
    include: {
      directSales: {
        where: { deletedAt: null },
        select: { total: true, createdAt: true },
      },
      campaignOrders: {
        where: { deletedAt: null },
        include: {
          items: true,
          campaign: { include: { company: true } },
        },
      },
      externalDebts: {
        select: { amount: true, createdAt: true },
      },
      payments: {
        select: { amount: true },
      },
    },
  });

  let totalOutstanding = 0;
  let debtorsCount = 0;

  const today = new Date();

  const allDebtorsList = clients.map((client) => {
    const deliveredOrders = client.campaignOrders.filter((o) => o.status === "DELIVERED");

    const totalSales =
      client.directSales.reduce((sum, s) => sum + s.total, 0) +
      deliveredOrders.reduce((sum, o) => sum + getOrderTotal(o), 0);

    const totalDebts = client.externalDebts.reduce((sum, d) => sum + d.amount, 0);
    const totalPayments = client.payments.reduce((sum, p) => sum + p.amount, 0);
    const debt = totalSales + totalDebts - totalPayments;

    if (debt > 0.01) {
      totalOutstanding += debt;
      debtorsCount++;
    }

    // Find the latest transaction date for "Origen"
    let latestTxDate: Date | null = null;
    let originLabel = "Ninguno";

    client.directSales.forEach((s) => {
      const d = new Date(s.createdAt);
      if (!latestTxDate || d > latestTxDate) {
        latestTxDate = d;
        originLabel = "Venta Directa";
      }
    });

    client.campaignOrders.forEach((o) => {
      const d = new Date(o.createdAt);
      if (!latestTxDate || d > latestTxDate) {
        latestTxDate = d;
        originLabel = `Campaña ${o.campaign.number}`;
      }
    });

    client.externalDebts.forEach((ed) => {
      const d = new Date(ed.createdAt);
      if (!latestTxDate || d > latestTxDate) {
        latestTxDate = d;
        originLabel = "Deuda Externa";
      }
    });

    let isOverdue = false;
    if (debt > 0.01) {
      const hasOverdueOrder = deliveredOrders.some((order) => {
        const orderDueDate = order.paymentDate
          ? new Date(order.paymentDate)
          : order.campaign.paymentDate
            ? new Date(order.campaign.paymentDate)
            : null;
        return orderDueDate ? orderDueDate < today : false;
      });
      isOverdue = hasOverdueOrder;
    }

    return {
      name: client.name,
      phone: client.phone || "Sin teléfono",
      lastOrder: originLabel,
      debt,
      status: (isOverdue ? "Vencido" : "Pendiente") as "Vencido" | "Pendiente",
    };
  });

  const pendingDebtors = allDebtorsList
    .filter((d) => d.debt > 0.01)
    .sort((a, b) => b.debt - a.debt)
    .slice(0, 5);

  // Compute full clients list with balances for FormPayments searchable dropdown
  const clientsList = clients.map((client) => {
    const deliveredOrders = client.campaignOrders.filter((o) => o.status === "DELIVERED");

    const totalSales =
      client.directSales.reduce((sum, s) => sum + s.total, 0) +
      deliveredOrders.reduce((sum, o) => sum + getOrderTotal(o), 0);

    const totalDebts = client.externalDebts.reduce((sum, d) => sum + d.amount, 0);
    const totalPayments = client.payments.reduce((sum, p) => sum + p.amount, 0);
    const balance = totalSales + totalDebts - totalPayments;

    return {
      id: client.id,
      name: client.name,
      balance,
    };
  }).sort((a, b) => a.name.localeCompare(b.name));

  // 5. Fetch Recent Activities (sales, payments, orders)
  const [recentPayments, recentSales, recentOrders] = await Promise.all([
    prisma.payment.findMany({
      take: 5,
      orderBy: { paidAt: "desc" },
      include: { client: { select: { name: true } } },
    }),
    prisma.directSale.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: { client: { select: { name: true } } },
    }),
    prisma.campaignOrder.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: {
        client: { select: { name: true } },
        campaign: { select: { number: true } },
      },
    }),
  ]);

  const activities: {
    id: string;
    type: "payment" | "sale" | "order";
    date: string;
    description: string;
    clientName: string;
    amount: number;
  }[] = [];

  recentPayments.forEach((p) => {
    activities.push({
      id: `p-${p.id}`,
      type: "payment",
      date: p.paidAt.toISOString(),
      description: `Abonó S/. ${p.amount.toFixed(2)}`,
      clientName: p.client.name,
      amount: p.amount,
    });
  });

  recentSales.forEach((s) => {
    activities.push({
      id: `s-${s.id}`,
      type: "sale",
      date: s.createdAt.toISOString(),
      description: `Compró por S/. ${s.total.toFixed(2)} (Venta Directa)`,
      clientName: s.client.name,
      amount: s.total,
    });
  });

  recentOrders.forEach((o) => {
    activities.push({
      id: `o-${o.id}`,
      type: "order",
      date: o.createdAt.toISOString(),
      description: `Pedido de Campaña ${o.campaign.number}`,
      clientName: o.client.name,
      amount: o.total || 0,
    });
  });

  const sortedActivities = activities
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  const metrics = [
    {
      title: "Monto de campaña",
      value: `S/. ${campaignSalesTotal.toLocaleString("es-PE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      description:
        activeCampaigns.length === 0
          ? "Sin campañas activas"
          : `${activeCampaigns.length} ${activeCampaigns.length === 1
            ? "empresa con campaña activa"
            : "empresas con campañas activas"
          }`,
      iconKey: "trending-up",
      accentClass: "bg-success-bg text-success-text",
      bordercard: "success-text",
    },
    {
      title: "Por cobrar (deudas)",
      value: `S/. ${totalOutstanding.toLocaleString("es-PE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      description: `${debtorsCount} ${debtorsCount === 1 ? "cliente pendiente" : "clientes pendientes"}`,
      iconKey: "alert-circle",
      accentClass: "bg-danger-bg text-danger-text",
      bordercard: "danger-text",
    },
    {
      title: "Productos en stock",
      value: `${totalStock} uds.`,
      description: `${categoriesCount} ${categoriesCount === 1 ? "categoría" : "categorías"}`,
      iconKey: "package",
      accentClass: "bg-info-bg text-info-text",
      bordercard: "info-text",
    },
    {
      title: "Clientes con deudas",
      value: `${debtorsCount} ${debtorsCount === 1 ? "cliente" : "clientes"}`,
      description: "Clientes pendientes de pagar",
      iconKey: "users",
      accentClass: "bg-beauty-50 text-beauty-600 dark:bg-beauty-900/60 dark:text-beauty-200",
      bordercard: "beauty-200",
    },
  ];

  // 6. Fetch data for Recharts Charts
  const productsWithCompany = await prisma.product.findMany({
    where: { deletedAt: null },
    select: {
      stock: true,
      brand: {
        select: {
          company: { select: { name: true } },
        },
      },
    },
  });

  const companyStockMap: Record<string, number> = {};
  productsWithCompany.forEach((p) => {
    const name = p.brand?.company?.name || "Sin Empresa";
    companyStockMap[name] = (companyStockMap[name] || 0) + (p.stock || 0);
  });

  const companyStockData = Object.entries(companyStockMap).map(([name, value]) => ({
    name,
    value,
  }));

  const productsWithCategory = await prisma.product.findMany({
    where: { deletedAt: null },
    select: {
      stock: true,
      category: { select: { name: true } },
    },
  });

  const categoryStockMap: Record<string, number> = {};
  productsWithCategory.forEach((p) => {
    const name = p.category?.name || "Sin Categoría";
    categoryStockMap[name] = (categoryStockMap[name] || 0) + (p.stock || 0);
  });

  const categoryStockData = Object.entries(categoryStockMap)
    .map(([name, stock]) => ({ name, stock }))
    .sort((a, b) => b.stock - a.stock)
    .slice(0, 6);

  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
  sixMonthsAgo.setDate(1);
  sixMonthsAgo.setHours(0, 0, 0, 0);

  const [allPayments, allDirectSales, allDeliveredOrders, allExternalDebts] = await Promise.all([
    prisma.payment.findMany({
      select: { amount: true, paidAt: true },
    }),
    prisma.directSale.findMany({
      where: { deletedAt: null },
      select: { total: true, createdAt: true },
    }),
    prisma.campaignOrder.findMany({
      where: {
        status: "DELIVERED",
        deletedAt: null,
      },
      select: {
        createdAt: true,
        total: true,
        discount: true,
        items: {
          select: {
            arrivalStatus: true,
            catalogPrice: true,
            quantity: true,
            substitute: { select: { catalogPrice: true } },
          },
        },
      },
    }),
    prisma.externalDebt.findMany({
      select: { amount: true, createdAt: true },
    }),
  ]);

  const monthNames = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Set", "Oct", "Nov", "Dic"];
  const financialData: { month: string; deudas: number; cobros: number }[] = [];

  for (let i = 5; i >= 0; i--) {
    const d = new Date();
    d.setMonth(d.getMonth() - i);

    const startOfMonth = new Date(d.getFullYear(), d.getMonth(), 1, 0, 0, 0, 0);
    const endOfMonth = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59, 999);
    const monthLabel = `${monthNames[d.getMonth()]} ${d.getFullYear().toString().slice(-2)}`;

    let debtsUpToMonth = 0;
    let paymentsUpToMonth = 0;
    let cobrosThisMonth = 0;

    allDirectSales.forEach((s) => {
      if (new Date(s.createdAt) <= endOfMonth) {
        debtsUpToMonth += s.total;
      }
    });

    allDeliveredOrders.forEach((o) => {
      if (new Date(o.createdAt) <= endOfMonth) {
        debtsUpToMonth += getOrderTotal(o);
      }
    });

    allExternalDebts.forEach((debt) => {
      if (new Date(debt.createdAt) <= endOfMonth) {
        debtsUpToMonth += debt.amount;
      }
    });

    allPayments.forEach((p) => {
      const paidDate = new Date(p.paidAt);
      if (paidDate <= endOfMonth) {
        paymentsUpToMonth += p.amount;
      }
      if (paidDate >= startOfMonth && paidDate <= endOfMonth) {
        cobrosThisMonth += p.amount;
      }
    });

    const accumulatedDebt = Math.max(0, debtsUpToMonth - paymentsUpToMonth);

    financialData.push({
      month: monthLabel,
      deudas: Number(accumulatedDebt.toFixed(2)),
      cobros: Number(cobrosThisMonth.toFixed(2)),
    });
  }

  // d. Ventas/Pedidos por Empresa en Campaña Activa
  const allCompanies = await prisma.company.findMany({
    where: { deletedAt: null },
    select: { id: true, name: true },
  });

  const companyCampaignOrdersData = await Promise.all(
    allCompanies.map(async (company) => {
      let campaign = await prisma.campaign.findFirst({
        where: { companyId: company.id, isActive: true, deletedAt: null },
      });
      if (!campaign) {
        campaign = await prisma.campaign.findFirst({
          where: { companyId: company.id, deletedAt: null },
          orderBy: { endDate: "desc" },
        });
      }

      if (!campaign) {
        return {
          company: company.name,
          campaignNumber: "-",
          totalAmount: 0,
          count: 0,
        };
      }

      const orders = await prisma.campaignOrder.findMany({
        where: {
          campaignId: campaign.id,
          status: { not: "CANCELLED" },
          deletedAt: null,
        },
        include: {
          items: {
            include: { substitute: true },
          },
        },
      });

      const totalAmount = orders.reduce((sum, o) => sum + getOrderTotal(o), 0);
      return {
        company: company.name,
        campaignNumber: campaign.number,
        totalAmount: Number(totalAmount.toFixed(2)),
        count: orders.length,
      };
    })
  );

  // Serialize Date objects before passing them to the Client Component
  const serializedActiveCampaigns = activeCampaigns.map((camp) => ({
    id: camp.id,
    number: camp.number,
    startDate: camp.startDate.toISOString(),
    endDate: camp.endDate.toISOString(),
    company: { name: camp.company.name },
  }));

  return (
    <Dashboard
      metrics={metrics}
      pendingDebtors={pendingDebtors}
      debtorsCount={debtorsCount}
      totalOutstanding={totalOutstanding}
      activeCampaigns={serializedActiveCampaigns}
      activities={sortedActivities}
      clientsList={clientsList}
      permissions={permissions}
      financialData={financialData}
      companyStockData={companyStockData}
      categoryStockData={categoryStockData}
      companyCampaignOrdersData={companyCampaignOrdersData}
    />
  );
}

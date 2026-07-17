import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import OrdersDashboard from "@/components/orders/OrdersDashboard";

interface PedidosPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function PedidosPage(props: PedidosPageProps) {
  const session = await auth();
  const permissions = session?.user?.permissions ?? [];

  if (!permissions.includes("orders:read")) {
    redirect("/admin");
  }

  const searchParams = await props.searchParams;
  const search = typeof searchParams.search === "string" ? searchParams.search : "";
  const paramCampaignId = typeof searchParams.campaignId === "string" ? Number(searchParams.campaignId) : null;

  // Cargar todas las campañas para el filtro
  const allCampaigns = await prisma.campaign.findMany({
    where: { deletedAt: null },
    include: { company: true },
    orderBy: [
      { isActive: "desc" },
      { number: "desc" },
    ],
  });

  // Elegir campaña seleccionada (por defecto la activa, o la más reciente)
  let selectedCampaignId = paramCampaignId;
  if (!selectedCampaignId) {
    const active = allCampaigns.find((c) => c.isActive);
    selectedCampaignId = active ? active.id : (allCampaigns[0]?.id || 0);
  }

  // Cargar pedidos para la campaña seleccionada
  const orders = selectedCampaignId
    ? await prisma.campaignOrder.findMany({
      where: {
        campaignId: selectedCampaignId,
        deletedAt: null,
        ...(search
          ? {
            client: {
              name: { contains: search, mode: "insensitive" },
            },
          }
          : {}),
      },
      include: {
        client: true,
        campaign: { include: { company: true } },
        items: {
          include: { brand: true, substitute: true },
        },
      },
      orderBy: { createdAt: "desc" },
    })
    : [];

  return (
    <OrdersDashboard
      initialOrders={JSON.parse(JSON.stringify(orders))}
      campaigns={JSON.parse(JSON.stringify(allCampaigns))}
      selectedCampaignId={selectedCampaignId}
      permissions={permissions}
    />
  );
}

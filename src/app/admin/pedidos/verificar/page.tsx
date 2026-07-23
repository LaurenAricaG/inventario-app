import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import OrderVerificationConsole from "@/components/orders/OrderVerificationConsole";

export const metadata = {
  title: "Verificar pedidos",
};

interface VerificarPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function VerificarPage(props: VerificarPageProps) {
  const session = await auth();
  const permissions = session?.user?.permissions ?? [];

  if (!permissions.includes("orders:update")) {
    redirect("/admin/pedidos");
  }

  const searchParams = await props.searchParams;
  const campaignId = typeof searchParams.campaignId === "string" ? Number(searchParams.campaignId) : null;

  if (!campaignId) {
    redirect("/admin/pedidos");
  }

  const campaign = await prisma.campaign.findUnique({
    where: { id: campaignId },
    include: { company: true },
  });

  if (!campaign) {
    redirect("/admin/pedidos");
  }

  // Cargar pedidos de la campaña que no estén anulados/eliminados
  const orders = await prisma.campaignOrder.findMany({
    where: {
      campaignId,
      deletedAt: null,
    },
    include: {
      client: true,
      campaign: { include: { company: true } },
      items: {
        include: { brand: true, substitute: true },
        orderBy: { productName: "asc" },
      },
    },
    orderBy: {
      client: { name: "asc" },
    },
  });

  return (
    <OrderVerificationConsole
      campaign={JSON.parse(JSON.stringify(campaign))}
      orders={JSON.parse(JSON.stringify(orders))}
    />
  );
}

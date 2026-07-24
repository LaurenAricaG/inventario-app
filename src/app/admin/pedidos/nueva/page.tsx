import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import QuickOrderConsole from "@/components/orders/QuickOrderConsole";

export const metadata = {
  title: "Registrar pedidos",
};

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function NuevaPedidosPage(props: PageProps) {
  const session = await auth();
  const permissions = session?.user?.permissions ?? [];

  if (!permissions.includes("orders:create")) {
    redirect("/admin/pedidos");
  }

  const searchParams = await props.searchParams;
  const campaignId = typeof searchParams.campaignId === "string" ? Number(searchParams.campaignId) : undefined;

  if (campaignId) {
    const campaign = await prisma.campaign.findUnique({
      where: { id: campaignId },
    });

    if (!campaign || !campaign.isActive) {
      redirect("/admin/pedidos?error=locked");
    }

    const processedOrdersCount = await prisma.campaignOrder.count({
      where: {
        campaignId,
        deletedAt: null,
        status: {
          notIn: ["PENDING", "CANCELLED"],
        },
      },
    });
    if (processedOrdersCount > 0) {
      redirect("/admin/pedidos?error=locked");
    }
  }

  const [companies, campaigns, brands, clients] = await Promise.all([
    prisma.company.findMany({
      where: { deletedAt: null },
      orderBy: { name: "asc" },
    }),
    prisma.campaign.findMany({
      where: { deletedAt: null },
      include: { company: true },
      orderBy: [
        { isActive: "desc" },
        { number: "desc" },
      ],
    }),
    prisma.brand.findMany({
      where: { deletedAt: null },
      orderBy: { name: "asc" },
    }),
    prisma.client.findMany({
      where: { deletedAt: null },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
  ]);

  return (
    <QuickOrderConsole
      companies={JSON.parse(JSON.stringify(companies))}
      campaigns={JSON.parse(JSON.stringify(campaigns))}
      brands={JSON.parse(JSON.stringify(brands))}
      clients={JSON.parse(JSON.stringify(clients))}
      initialCampaignId={campaignId}
    />
  );
}

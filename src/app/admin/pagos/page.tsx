import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Payments from "@/components/payments";
import { PaymentMethod } from "@/generated/prisma";

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
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
  ]);

  const totalPages = Math.ceil(totalItems / limit);

  return (
    <Payments
      initialPayments={JSON.parse(JSON.stringify(payments))}
      clients={clients}
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

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import FormDirectSale from "@/components/direct-sales/FormDirectSale";

export const metadata = {
  title: "Nueva venta",
};

export default async function NuevaVentaPage() {
  const session = await auth();
  const permissions = session?.user?.permissions ?? [];

  // Validar permiso de creación
  if (!permissions.includes("sales:create")) {
    redirect("/admin/ventas");
  }

  // Cargar clientes activos y productos con stock > 0
  const [clients, products] = await Promise.all([
    prisma.client.findMany({
      where: { deletedAt: null },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
    prisma.product.findMany({
      where: { deletedAt: null, stock: { gt: 0 } },
      include: { brand: true },
      orderBy: { name: "asc" },
    }),
  ]);

  return (
    <FormDirectSale
      clients={JSON.parse(JSON.stringify(clients))}
      products={JSON.parse(JSON.stringify(products))}
    />
  );
}

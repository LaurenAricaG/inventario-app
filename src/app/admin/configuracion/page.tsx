import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getSystemConfigAction } from "@/lib/config";
import SystemConfig from "@/components/config";

export const metadata = {
  title: "Configuración del Sistema",
  description: "Administración general de la empresa y portal público.",
};

export default async function ConfiguracionPage() {
  const session = await auth();
  if (!session || !session.user) {
    redirect("/login");
  }

  const permissions = (session.user.permissions as string[]) ?? [];

  if (!permissions.includes("config:read")) {
    redirect("/admin");
  }

  const res = await getSystemConfigAction();
  if (!res.success || !res.data) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <h2 className="text-xl font-bold text-danger-text">Error de Carga</h2>
        <p className="text-text-secondary mt-1 max-w-md">
          {res.message || "No se pudo recuperar la configuración del sistema."}
        </p>
      </div>
    );
  }

  const serializedConfig = {
    id: res.data.id,
    systemName: res.data.systemName,
    systemLogoUrl: res.data.systemLogoUrl,
    whatsappNumber: res.data.whatsappNumber,
    showPricePublic: res.data.showPricePublic,
    showStockPublic: res.data.showStockPublic,
    showCatalogsPublic: res.data.showCatalogsPublic,
  };

  return (
    <SystemConfig initialConfig={serializedConfig} permissions={permissions} />
  );
}

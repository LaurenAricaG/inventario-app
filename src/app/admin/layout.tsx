import { cookies } from "next/headers";
import { auth } from "@/lib/auth";
import DashboardLayoutClient from "@/components/layout/DashboardLayoutClient";
import ErrorBoundary from "@/components/error/ErrorBoundary";
import { redirect } from "next/navigation";
import { getSystemConfigAction } from "@/lib/config";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const initialCollapsed =
    cookieStore.get("sidebar_collapsed")?.value === "true";

  const session = await auth();

  if (!session) {
    redirect("/login");
  }
  const userName = session?.user?.name ?? "Usuario";
  const userRole = session?.user?.role ?? "SELLER";
  const userPermissions = session?.user?.permissions ?? [];

  const { data: systemConfig } = await getSystemConfigAction();

  return (
    <ErrorBoundary variant="full" title="Error en el Panel de Administración">
      <DashboardLayoutClient
        initialCollapsed={initialCollapsed}
        userName={userName}
        userRole={userRole}
        userPermissions={userPermissions}
        systemConfig={systemConfig}
      >
        {children}
      </DashboardLayoutClient>
    </ErrorBoundary>
  );
}

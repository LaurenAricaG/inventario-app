"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  FiTrendingUp,
  FiAlertCircle,
  FiPackage,
  FiShoppingBag,
  FiUsers,
  FiPlus,
  FiCalendar,
  FiClock,
  FiArrowDownLeft,
  FiArrowUpRight,
} from "react-icons/fi";
import Link from "next/link";
import FormPayments from "@/components/payments/FormPayments";
import { formatDateShortWithTime, formatDateShortUTC } from "@/utils/date.utils";
import TableDashboard, { PendingDebtor } from "./TableDashboard";
import Button from "../ui/Button";
import DashboardCharts, {
  MonthlyFinancial,
  StockCompany,
  StockCategory,
  CompanyCampaignOrders,
} from "./DashboardCharts";

interface ActiveCampaign {
  id: number;
  number: string;
  startDate: string;
  endDate: string;
  company: { name: string };
}

interface Activity {
  id: string;
  type: "payment" | "sale" | "order";
  date: string;
  description: string;
  clientName: string;
  amount: number;
}

interface DashboardProps {
  metrics: {
    title: string;
    value: string;
    description: string;
    iconKey: string;
    accentClass: string;
    bordercard: string;
  }[];
  pendingDebtors: PendingDebtor[];
  debtorsCount: number;
  totalOutstanding: number;
  activeCampaigns: ActiveCampaign[];
  activities: Activity[];
  clientsList: { id: number; name: string; balance: number }[];
  permissions: string[];
  financialData: MonthlyFinancial[];
  companyStockData: StockCompany[];
  categoryStockData: StockCategory[];
  companyCampaignOrdersData: CompanyCampaignOrders[];
}

const iconMap = {
  "trending-up": FiTrendingUp,
  "alert-circle": FiAlertCircle,
  "package": FiPackage,
  "shopping-bag": FiShoppingBag,
  "users": FiUsers,
};

export default function Dashboard({
  metrics,
  pendingDebtors,
  debtorsCount,
  totalOutstanding,
  activeCampaigns,
  activities,
  clientsList,
  permissions,
  financialData,
  companyStockData,
  categoryStockData,
  companyCampaignOrdersData,
}: DashboardProps) {
  const router = useRouter();
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

  const canCreatePayment = permissions.includes("payments:create");
  const canCreateSale = permissions.includes("sales:create");
  const canViewTransactions = permissions.includes("transactions:read");
  const canViewCampaigns = permissions.includes("campaigns:read");

  const today = new Date();

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight text-text-primary">
            Resumen del negocio
          </h2>
          <p className="text-sm text-text-secondary mt-0.5">
            Control de inventario, deudas y pedidos activos
          </p>
        </div>
        <div className="grid grid-cols-2 sm:flex sm:items-center gap-2.5 sm:gap-2 w-full sm:w-auto">
          {canCreateSale && (
            <Link
              href="/admin/ventas/nueva"
              className="w-full sm:w-auto flex items-center justify-center px-3 sm:px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all duration-200 cursor-pointer select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed bg-beauty-400 hover:bg-beauty-600 text-white shadow-sm shadow-beauty-400/10 focus-visible:ring-beauty-400 gap-1.5 sm:gap-2"
            >
              <FiPlus className="w-4 h-4 shrink-0" />
              <span className="truncate">Nueva Venta</span>
            </Link>
          )}
          {canCreatePayment && (
            <Button
              variant="outline"
              onClick={() => setIsPaymentModalOpen(true)}
              className="w-full sm:w-auto flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold shadow-sm"
            >
              <FiPlus className="w-4 h-4 shrink-0" />
              <span className="truncate">Nuevo Pago</span>
            </Button>
          )}
        </div>
      </div>

      {/* Tarjetas de métricas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((metric, index) => {
          const Icon = iconMap[metric.iconKey as keyof typeof iconMap] || FiPackage;
          return (
            <div
              key={index}
              className="bg-bg-card border border-border-default border-l-6 rounded-2xl p-5 flex items-start justify-between hover:shadow-sm transition-shadow duration-300"
              style={{ borderLeftColor: `var(--${metric.bordercard})` }}
            >
              <div className="space-y-1.5 flex-1">
                <p className="text-[11px] font-medium text-text-tertiary uppercase tracking-wider">
                  {metric.title}
                </p>
                <p className="text-xl font-semibold text-text-primary tracking-tight">
                  {metric.value}
                </p>
                <p className="text-xs text-text-secondary">
                  {metric.description}
                </p>
              </div>
              <div
                className={`p-2.5 rounded-xl ${metric.accentClass} ml-3 shrink-0`}
              >
                <Icon className="w-4 h-4" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Sección de Gráficos con Recharts */}
      <DashboardCharts
        financialData={financialData}
        companyStockData={companyStockData}
        categoryStockData={categoryStockData}
        companyCampaignOrdersData={companyCampaignOrdersData}
      />

      {/* Cuerpo principal */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Columna Principal (col-span-2) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Tabla de deudas */}
          <TableDashboard
            debtors={pendingDebtors}
            debtorsCount={debtorsCount}
            totalOutstanding={totalOutstanding}
            canViewTransactions={canViewTransactions}
          />

          {/* Campañas Activas (de dos en dos) */}
          <div className="space-y-3">
            <h3 className="font-semibold text-text-primary text-base flex items-center gap-2 select-none">
              <FiCalendar className="w-4 h-4 text-beauty-500" />
              Campañas Activas
            </h3>

            {activeCampaigns.length === 0 ? (
              <div className="bg-bg-card border border-border-default rounded-2xl p-6 text-center select-none">
                <FiCalendar className="w-8 h-8 text-text-tertiary mx-auto mb-2" />
                <p className="text-xs text-text-secondary mb-3">
                  No hay campañas marcadas como activas en este momento.
                </p>
                {canViewCampaigns && (
                  <Link
                    href="/admin/campanias"
                    className="flex items-center justify-center px-4 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap transition-all duration-200 cursor-pointer select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed bg-beauty-400 hover:bg-beauty-600 text-white shadow-sm shadow-beauty-400/10 focus-visible:ring-beauty-400 gap-2 self-start sm:self-auto"
                  >
                    Gestionar campañas
                  </Link>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {activeCampaigns.map((camp) => {
                  const start = new Date(camp.startDate);
                  const end = new Date(camp.endDate);
                  const startLocal = new Date(start.getUTCFullYear(), start.getUTCMonth(), start.getUTCDate());
                  const endLocal = new Date(end.getUTCFullYear(), end.getUTCMonth(), end.getUTCDate());
                  const todayLocal = new Date(today.getFullYear(), today.getMonth(), today.getDate());
                  const totalDuration = endLocal.getTime() - startLocal.getTime();
                  const elapsed = todayLocal.getTime() - startLocal.getTime();
                  let progressPercent = 0;
                  if (totalDuration > 0) {
                    progressPercent = Math.min(100, Math.max(0, Math.round((elapsed / totalDuration) * 100)));
                  }
                  const diffTime = endLocal.getTime() - todayLocal.getTime();
                  const remainingDays = Math.max(0, Math.round(diffTime / (1000 * 60 * 60 * 24)));

                  return (
                    <div key={camp.id} className="bg-bg-card border border-border-default rounded-2xl p-5 hover:shadow-xs transition-shadow duration-300">
                      <p className="text-xs font-bold text-beauty-600 mb-1">
                        Campaña activa
                      </p>
                      <h4 className="font-semibold text-text-primary text-sm mb-4 leading-tight">
                        {camp.company.name} — Campaña {camp.number}
                      </h4>

                      {/* Barra de progreso */}
                      <div className="mb-4">
                        <div className="flex justify-between items-center mb-1.5">
                          <span className="text-[10px] text-text-tertiary uppercase tracking-wider font-medium">
                            Tiempo transcurrido
                          </span>
                          <span className="text-xs font-semibold text-beauty-600">
                            {progressPercent}%
                          </span>
                        </div>
                        <div className="h-1.5 bg-border-soft rounded-full overflow-hidden">
                          <div
                            className="h-full bg-beauty-400 rounded-full transition-all duration-300"
                            style={{ width: `${progressPercent}%` }}
                          />
                        </div>
                      </div>

                      {/* Datos de campaña */}
                      <div className="grid grid-cols-2 gap-3">
                        <div className="bg-bg-page rounded-xl p-3 border border-border-soft">
                          <p className="text-[10px] text-text-tertiary uppercase tracking-wider font-medium mb-1">
                            Termina
                          </p>
                          <p suppressHydrationWarning className="text-sm font-semibold text-text-primary">
                            {formatDateShortUTC(end)}
                          </p>
                        </div>
                        <div className="bg-bg-page rounded-xl p-3 border border-border-soft">
                          <div className="flex items-center gap-1 mb-1">
                            <FiClock className="w-3 h-3 text-text-tertiary" />
                            <p className="text-[10px] text-text-tertiary uppercase tracking-wider font-medium">
                              Restantes
                            </p>
                          </div>
                          <p className="text-sm font-semibold text-text-primary">
                            {remainingDays} {remainingDays === 1 ? 'día' : 'días'}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Columna Lateral (space-y-4) */}
        <div className="space-y-4">

          {/* Actividad Reciente */}
          <div className="bg-bg-card border border-border-default rounded-2xl p-5 space-y-4">
            <h3 className="font-semibold text-text-primary text-sm select-none">
              Actividad Reciente
            </h3>
            {activities.length === 0 ? (
              <p className="text-xs text-text-tertiary py-4 text-center select-none">Sin actividades recientes.</p>
            ) : (
              <div className="space-y-4 select-none">
                {activities.map((act) => {
                  let Icon = FiPackage;
                  let bgClass = "bg-info-bg/50 text-info-text border-info-text/10";
                  if (act.type === "payment") {
                    Icon = FiArrowDownLeft;
                    bgClass = "bg-success-bg/50 text-success-text border-success-text/10";
                  } else if (act.type === "sale") {
                    Icon = FiArrowUpRight;
                    bgClass = "bg-beauty-100 text-beauty-800 dark:bg-beauty-900/60 dark:text-beauty-200 border-beauty-400/10";
                  } else if (act.type === "order") {
                    Icon = FiShoppingBag;
                    bgClass = "bg-info-bg/50 text-info-text border-info-text/10";
                  }

                  return (
                    <div key={act.id} className="flex items-start gap-3 text-xs leading-normal">
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 border ${bgClass}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="flex-1 space-y-0.5 min-w-0">
                        <p className="font-semibold text-text-primary truncate">
                          {act.clientName}
                        </p>
                        <p className="text-[11px] text-text-secondary">
                          {act.description}
                        </p>
                        <p suppressHydrationWarning className="text-[10px] text-text-tertiary font-medium">
                          {formatDateShortWithTime(act.date)}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>


        </div>
      </div>

      {/* Modal de Registro de Pago */}
      {isPaymentModalOpen && (
        <FormPayments
          isOpen={isPaymentModalOpen}
          onClose={() => setIsPaymentModalOpen(false)}
          clients={clientsList}
          onSuccess={() => {
            setIsPaymentModalOpen(false);
            router.refresh();
          }}
        />
      )}
    </div>
  );
}

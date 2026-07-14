"use client";

import { useState, useTransition, useEffect } from "react";
import { useRouter } from "next/navigation";
import { formatDateUTC } from "@/utils/date.utils";
import Link from "next/link";
import { toast } from "sonner";
import {
  FiShoppingBag,
  FiPlus,
  FiCheckCircle,
  FiArchive,
  FiTruck,
  FiEye,
  FiTrendingUp,
  FiPrinter,
  FiScissors,
  FiCalendar,
  FiLoader,
} from "react-icons/fi";
import Button from "@/components/ui/Button";
import ButtonIcon from "@/components/ui/ButtonIcon";
import Select from "@/components/ui/Select";
import SearchInput from "@/components/ui/SearchInput";
import ErrorBoundary from "@/components/error/ErrorBoundary";
import PageHeader from "@/components/ui/PageHeader";
import OrderDetailModal from "@/components/movements/OrderDetailModal";
import Modal from "@/components/ui/Modal";
import Form, { FormField } from "@/components/ui/Form";
import Input from "@/components/ui/Input";
import { updateCampaignPaymentDateAction } from "@/lib/campaign/index";
import { CampaignOrderStatus } from "@/generated/prisma";
import { printCampaignReport } from "@/utils/print-campaign-report";
import { printCampaignSlips } from "@/utils/print-campaign-slips";
import { printCampaignProductsReport } from "@/utils/print-campaign-products-report";
import { useSystemConfig } from "@/context/SystemConfigContext";

interface SerializedCampaign {
  id: number;
  number: string;
  isActive: boolean;
  company: { id: number; name: string };
  paymentDate?: string | null;
  endDate?: string | null;
}

interface SerializedOrderItem {
  id: number;
  brandId: number;
  productCode: string | null;
  productName: string;
  catalogPrice: number;
  costPrice: number | null;
  quantity: number;
  arrivalStatus: string;
  substituteCode: string | null;
  substituteName: string | null;
  substitutePrice: number | null;
  substituteCostPrice: number | null;
  brand: { id: number; name: string };
}

interface SerializedCampaignOrder {
  id: number;
  clientId: number;
  campaignId: number;
  status: CampaignOrderStatus;
  notes: string | null;
  discount: number;
  total: number | null;
  deliveredAt: string | null;
  paymentDate: string | null;
  createdAt: string;
  updatedAt: string;
  client: { id: number; name: string; address: string | null };
  campaign: SerializedCampaign;
  items: SerializedOrderItem[];
}

interface OrdersDashboardProps {
  initialOrders: SerializedCampaignOrder[];
  campaigns: SerializedCampaign[];
  selectedCampaignId: number;
  permissions: string[];
}

const statusTranslations: Record<CampaignOrderStatus, string> = {
  PENDING: "Pendiente",
  ARRIVED: "Llegado",
  VERIFIED: "Verificado",
  PACKED: "Empacado",
  DELIVERED: "Entregado",
  CANCELLED: "Cancelado",
};

const statusColors: Record<CampaignOrderStatus, string> = {
  PENDING: "bg-warning-bg/50 border-warning-text/10 text-warning-text",
  ARRIVED: "bg-info-bg/50 border-info-text/10 text-info-text",
  VERIFIED:
    "bg-beauty-100 text-beauty-800 dark:bg-beauty-900/60 dark:text-beauty-200 border-beauty-400/10",
  PACKED:
    "bg-beauty-200 text-beauty-900 dark:bg-beauty-900/80 dark:text-beauty-100 border-beauty-400/20",
  DELIVERED: "bg-success-bg/50 border-success-text/10 text-success-text",
  CANCELLED: "bg-danger-bg/50 border-danger-text/10 text-danger-text",
};

export default function OrdersDashboard({
  initialOrders,
  campaigns,
  selectedCampaignId,
  permissions,
}: OrdersDashboardProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);

  // Estados para modal de Fecha de Pago de Campaña
  const [isCampaignPaymentDateModalOpen, setIsCampaignPaymentDateModalOpen] =
    useState(false);
  const [campaignPaymentDateVal, setCampaignPaymentDateVal] = useState("");
  const [isSubmittingCampaignPaymentDate, setIsSubmittingCampaignPaymentDate] =
    useState(false);
  const [paymentDateError, setPaymentDateError] = useState<string | null>(null);

  // Obtener lista única de empresas que tienen al menos una campaña
  const companiesMap = new Map<number, { id: number; name: string }>();
  campaigns.forEach((c) => {
    if (c.company) {
      companiesMap.set(c.company.id, c.company);
    }
  });
  const companiesList = Array.from(companiesMap.values());

  // Encontrar la empresa de la campaña seleccionada por defecto
  const currentCampaign = campaigns.find((c) => c.id === selectedCampaignId);
  const defaultCompanyId =
    currentCampaign?.company.id.toString() ||
    companiesList[0]?.id.toString() ||
    "";

  // Estado local para la empresa seleccionada
  const [selectedCompanyId, setSelectedCompanyId] = useState(defaultCompanyId);

  // Mantener sincronizado el select de empresa al cambiar de campaña
  useEffect(() => {
    if (defaultCompanyId) {
      setSelectedCompanyId(defaultCompanyId);
    }
  }, [defaultCompanyId]);

  // Sync campaign payment date when modal opens or currentCampaign changes
  useEffect(() => {
    if (isCampaignPaymentDateModalOpen && currentCampaign?.paymentDate) {
      setCampaignPaymentDateVal(currentCampaign.paymentDate.split("T")[0]);
    } else if (isCampaignPaymentDateModalOpen) {
      setCampaignPaymentDateVal("");
    }
  }, [isCampaignPaymentDateModalOpen, currentCampaign]);

  const handleSaveCampaignPaymentDate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCampaignId) return;

    if (!campaignPaymentDateVal) {
      setPaymentDateError("La fecha límite de pago es obligatoria.");
      return;
    }

    if (currentCampaign?.endDate) {
      const [year, month, day] = campaignPaymentDateVal.split("-").map(Number);
      const chosenDateUTC = new Date(Date.UTC(year, month - 1, day));

      const targetMinDate = new Date(currentCampaign.endDate);
      targetMinDate.setUTCDate(targetMinDate.getUTCDate() + 5);
      targetMinDate.setUTCHours(0, 0, 0, 0);

      if (chosenDateUTC < targetMinDate) {
        const yyyy = targetMinDate.getUTCFullYear();
        const mm = String(targetMinDate.getUTCMonth() + 1).padStart(2, "0");
        const dd = String(targetMinDate.getUTCDate()).padStart(2, "0");
        const minFormatted = `${dd}/${mm}/${yyyy}`;

        setPaymentDateError(
          `La fecha debe ser a partir de 5 días más que el fin de campaña (${minFormatted}).`
        );
        return;
      }
    }

    setIsSubmittingCampaignPaymentDate(true);
    try {
      const res = await updateCampaignPaymentDateAction(
        selectedCampaignId,
        campaignPaymentDateVal || null,
      );
      if (res.success) {
        toast.success(res.message);
        setPaymentDateError(null);
        setIsCampaignPaymentDateModalOpen(false);
        router.refresh();
      } else {
        toast.error(res.message);
      }
    } catch (error: any) {
      toast.error(
        error.message || "Error al actualizar la fecha de pago de la campaña.",
      );
    } finally {
      setIsSubmittingCampaignPaymentDate(false);
    }
  };

  // Se bloquea el registro si la campaña no es la activa o si ya tiene pedidos en proceso de verificación o despacho
  const isRegistrationLocked =
    !currentCampaign?.isActive ||
    initialOrders.some(
      (o) =>
        o.status !== CampaignOrderStatus.PENDING &&
        o.status !== CampaignOrderStatus.CANCELLED,
    );

  const hasOrders = initialOrders.length > 0;

  const isVerificationFinished =
    hasOrders &&
    initialOrders.every(
      (o) =>
        o.status !== CampaignOrderStatus.PENDING &&
        o.status !== CampaignOrderStatus.ARRIVED,
    );

  const hasPaymentDate = !!currentCampaign?.paymentDate;

  const hasPackedOrDeliveredOrders = initialOrders.some(
    (o) =>
      o.status === CampaignOrderStatus.PACKED ||
      o.status === CampaignOrderStatus.DELIVERED,
  );

  const handleGoToRegister = (e: React.MouseEvent) => {
    if (hasOrders) {
      e.preventDefault();
      return;
    }
    router.push(`/admin/pedidos/nueva?campaignId=${selectedCampaignId}`);
  };

  const handleGoToVerify = (e: React.MouseEvent) => {
    if (!hasOrders) {
      e.preventDefault();
      toast.info("Primero se debe registrar el pedido.");
      return;
    }
    router.push(`/admin/pedidos/verificar?campaignId=${selectedCampaignId}`);
  };

  const handleGoToPack = (e: React.MouseEvent) => {
    if (!hasOrders) {
      e.preventDefault();
      toast.info("Primero se debe registrar el pedido.");
      return;
    }
    if (!isVerificationFinished) {
      e.preventDefault();
      toast.info("Falta verificar los pedidos.");
      return;
    }
    if (!hasPaymentDate) {
      e.preventDefault();
      toast.info("Falta registrar la fecha límite de pago.");
      return;
    }
    router.push(`/admin/pedidos/empacado?campaignId=${selectedCampaignId}`);
  };

  const handleGoToDeliver = (e: React.MouseEvent) => {
    if (!hasOrders) {
      e.preventDefault();
      toast.info("Primero se debe registrar el pedido.");
      return;
    }
    if (!isVerificationFinished) {
      e.preventDefault();
      toast.info("Falta verificar los pedidos.");
      return;
    }
    if (!hasPaymentDate) {
      e.preventDefault();
      toast.info("Falta registrar la fecha límite de pago.");
      return;
    }
    if (!hasPackedOrDeliveredOrders) {
      e.preventDefault();
      toast.info("Falta empacar los pedidos.");
      return;
    }
    router.push(`/admin/pedidos/entregar?campaignId=${selectedCampaignId}`);
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("error") === "locked") {
      toast.error(
        "El registro para esta campaña está cerrado (solo se permite registrar en la campaña activa).",
      );
      params.delete("error");
      router.replace(`/admin/pedidos?${params.toString()}`);
    }
  }, []);

  // Campañas de la empresa seleccionada
  const filteredCampaigns = campaigns.filter(
    (c) => c.company.id === Number(selectedCompanyId),
  );

  const canCreate = permissions.includes("orders:create");
  const canUpdate = permissions.includes("orders:update");

  // Calcular el total de cada pedido considerando productos faltantes y sustitutos
  const getOrderTotal = (order: SerializedCampaignOrder) => {
    if (order.status === "CANCELLED") return 0;
    if (order.total !== null) return order.total;
    const subtotal = order.items.reduce((sum, item) => {
      if (item.arrivalStatus === "MISSING") return sum;
      const price =
        item.arrivalStatus === "SUBSTITUTED" && item.substitutePrice !== null
          ? item.substitutePrice
          : item.catalogPrice;
      return sum + item.quantity * price;
    }, 0);
    return Math.max(0, subtotal - order.discount);
  };

  // Calcular estadísticas consolidadas
  const totalOrders = initialOrders.length;
  const totalAmount = initialOrders.reduce(
    (sum, order) => sum + getOrderTotal(order),
    0,
  );
  const pendingDeliveries = initialOrders.filter(
    (order) => order.status !== "DELIVERED" && order.status !== "CANCELLED",
  ).length;

  const handleCampaignChange = (campaignId: string) => {
    startTransition(() => {
      const params = new URLSearchParams(window.location.search);
      if (campaignId) {
        params.set("campaignId", campaignId);
      } else {
        params.delete("campaignId");
      }
      params.delete("page"); // Resetear paginación
      router.push(`/admin/pedidos?${params.toString()}`);
    });
  };

  const handleCompanyChange = (companyId: string) => {
    setSelectedCompanyId(companyId);

    // Buscar la campaña activa de esta empresa
    const companyCamps = campaigns.filter(
      (c) => c.company.id === Number(companyId),
    );
    const activeCamp = companyCamps.find((c) => c.isActive) || companyCamps[0];

    if (activeCamp) {
      handleCampaignChange(activeCamp.id.toString());
    } else {
      startTransition(() => {
        const params = new URLSearchParams(window.location.search);
        params.delete("campaignId");
        params.delete("page");
        router.push(`/admin/pedidos?${params.toString()}`);
      });
    }
  };

  const systemConfig = useSystemConfig();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Pedidos de Catálogo"
        subtitle="Gestión completa de pedidos por campaña, recepción de cajas y despacho."
        breadcrumbs={[
          { label: "admin", href: "/admin" },
          { label: "pedidos" },
        ]}
        action={
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative w-40">
              <Select
                value={selectedCompanyId}
                onChange={(e) => handleCompanyChange(e.target.value)}
                disabled={filteredCampaigns.length === 0 || isPending}
              >
                {companiesList.map((comp) => (
                  <option key={comp.id} value={comp.id.toString()}>
                    {`${comp.name}`}
                  </option>
                ))}
              </Select>
              {isPending && (
                <FiLoader className="absolute right-8 top-1/2 -translate-y-1/2 w-4 h-4 text-text-tertiary animate-spin pointer-events-none" />
              )}
            </div>
            <div className="w-44">
              <Select
                value={selectedCampaignId.toString()}
                onChange={(e) => handleCampaignChange(e.target.value)}
                disabled={filteredCampaigns.length === 0}
              >
                {filteredCampaigns.length === 0 ? (
                  <option value="0">{`Sin campañas`}</option>
                ) : (
                  filteredCampaigns.map((c) => (
                    <option key={c.id} value={c.id.toString()}>
                      {`${c.number}${c.isActive ? " (Activa)" : ""}`}
                    </option>
                  ))
                )}
              </Select>
            </div>
          </div>
        }
      />

      {/* Botones de Acción */}
      {selectedCampaignId > 0 && (
        <div className="flex flex-wrap items-center gap-2.5">
          {currentCampaign?.isActive ? (
            <>
              {canCreate && (
                <Button
                  type="button"
                  onClick={handleGoToRegister}
                  variant="primary"
                  className="gap-2 shadow-sm"
                  disabled={hasOrders}
                >
                  <FiPlus className="w-4 h-4 shrink-0" />
                  Registrar Pedidos
                </Button>
              )}
              {canUpdate && (
                <>
                  <Button
                    type="button"
                    onClick={handleGoToVerify}
                    variant="outline"
                    className="gap-2 border-border-strong text-text-primary hover:bg-bg-surface"
                  >
                    <FiCheckCircle className="w-4 h-4 shrink-0 text-success-text" />
                    Verificar
                  </Button>
                  <Button
                    type="button"
                    onClick={handleGoToPack}
                    variant="outline"
                    className="gap-2 border-border-strong text-text-primary hover:bg-bg-surface"
                  >
                    <FiArchive className="w-4 h-4 shrink-0 text-beauty-500" />
                    Empacar
                  </Button>
                  <Button
                    type="button"
                    onClick={handleGoToDeliver}
                    variant="outline"
                    className="gap-2 border-border-strong text-text-primary hover:bg-bg-surface"
                  >
                    <FiTruck className="w-4 h-4 shrink-0 text-info-text" />
                    Entregar
                  </Button>

                  {isVerificationFinished &&
                    (currentCampaign?.paymentDate ? (
                      <div className="flex items-center gap-1.5 px-4 py-2 border border-border-default bg-bg-surface/50 rounded-2xl text-xs font-semibold text-text-secondary select-none">
                        <FiCalendar className="w-4 h-4 text-beauty-500 shrink-0" />
                        <span>
                          F. Pago:{" "}
                          <span className="font-bold text-text-primary">
                            {formatDateUTC(currentCampaign.paymentDate)}
                          </span>
                        </span>
                      </div>
                    ) : (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setPaymentDateError(null);
                          setIsCampaignPaymentDateModalOpen(true);
                        }}
                        className="gap-2 border-border-strong text-text-primary hover:bg-bg-surface"
                      >
                        <FiCalendar className="w-4 h-4 shrink-0 text-beauty-500" />
                        F. Pago
                      </Button>
                    ))}
                </>
              )}
            </>
          ) : (
            currentCampaign?.paymentDate && (
              <div className="flex items-center gap-1.5 px-4 py-2 border border-border-default bg-bg-surface/50 rounded-2xl text-xs font-semibold text-text-secondary select-none">
                <FiCalendar className="w-4 h-4 text-beauty-500 shrink-0" />
                <span>
                  F. Pago:{" "}
                  <span className="font-bold text-text-primary">
                    {formatDateUTC(currentCampaign.paymentDate)}
                  </span>
                </span>
              </div>
            )
          )}
        </div>
      )}

      {/* Tarjetas Estadísticas */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 select-none">
        {/* Card: Total Pedidos */}
        <div className="p-5 bg-bg-card border border-border-default/70 rounded-3xl shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-beauty-400/10 text-beauty-500 flex items-center justify-center shrink-0 border border-beauty-500/10">
            <FiShoppingBag className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] text-text-tertiary font-bold uppercase tracking-wider block">
              Total Pedidos
            </span>
            <span className="text-xl font-black text-text-primary tracking-tight mt-0.5 block">
              {totalOrders}
            </span>
          </div>
        </div>

        {/* Card: Monto Consolidado */}
        <div className="p-5 bg-bg-card border border-border-default/70 rounded-3xl shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-success-bg/10 text-success-text flex items-center justify-center shrink-0 border border-success-text/10">
            <FiTrendingUp className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] text-text-tertiary font-bold uppercase tracking-wider block">
              Monto Consolidado
            </span>
            <span className="text-xl font-black text-text-primary tracking-tight mt-0.5 block font-mono">
              S/ {totalAmount.toFixed(2)}
            </span>
          </div>
        </div>

        {/* Card: Pendientes de Entrega */}
        <div className="p-5 bg-bg-card border border-border-default/70 rounded-3xl shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-warning-bg/10 text-warning-text flex items-center justify-center shrink-0 border border-warning-text/10">
            <FiTruck className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <span className="text-[10px] text-text-tertiary font-bold uppercase tracking-wider block">
              Pendientes de Despacho
            </span>
            <span className="text-xl font-black text-text-primary tracking-tight mt-0.5 block">
              {pendingDeliveries}
            </span>
          </div>
        </div>
      </div>

      {/* Contenedor de Tabla y Filtros */}
      <div className="bg-bg-card border border-border-default/80 rounded-2xl shadow-xs overflow-hidden">
        {/* Barra de Filtros y Acciones */}
        <div className="px-6 py-5 border-b border-border-soft flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 bg-bg-card select-none">
          <div className="flex-1 max-w-md">
            <SearchInput placeholder="Buscar por cliente..." />
          </div>
          {selectedCampaignId > 0 && (
            <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  const cmp = campaigns.find(
                    (c) => c.id === selectedCampaignId,
                  );
                  if (cmp) {
                    printCampaignReport(
                      cmp,
                      initialOrders,
                      systemConfig?.systemName ?? "Inventario",
                    );
                  }
                }}
                className="gap-2 border-border-strong text-text-primary hover:bg-bg-surface w-full md:w-auto shrink-0 justify-center"
              >
                <FiPrinter className="w-4 h-4 shrink-0 text-info-text" />
                PDF Clientes
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  const cmp = campaigns.find(
                    (c) => c.id === selectedCampaignId,
                  );
                  if (cmp) {
                    printCampaignProductsReport(
                      cmp,
                      initialOrders,
                      systemConfig?.systemName ?? "Inventario",
                    );
                  }
                }}
                className="gap-2 border-border-strong text-text-primary hover:bg-bg-surface w-full md:w-auto shrink-0 justify-center"
              >
                <FiPrinter className="w-4 h-4 shrink-0 text-success-text" />
                PDF Productos
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  const cmp = campaigns.find(
                    (c) => c.id === selectedCampaignId,
                  );
                  if (cmp) {
                    printCampaignSlips(
                      cmp,
                      initialOrders,
                      systemConfig?.systemName ?? "Inventario",
                    );
                  }
                }}
                className="gap-2 border-border-strong text-text-primary hover:bg-bg-surface w-full md:w-auto shrink-0 justify-center"
              >
                <FiScissors className="w-4 h-4 shrink-0 text-beauty-500" />
                Imprimir Fichas
              </Button>
            </div>
          )}
        </div>

        {/* Tabla */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="border-b border-border-soft bg-bg-surface select-none">
                <th className="px-6 py-3 font-semibold text-text-secondary text-xs uppercase tracking-wider">
                  Cliente
                </th>
                <th className="px-6 py-3 font-semibold text-text-secondary text-xs text-center uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 font-semibold text-text-secondary text-xs text-center uppercase tracking-wider">
                  Productos
                </th>
                <th className="px-6 py-3 font-semibold text-text-secondary text-xs text-right uppercase tracking-wider">
                  Descuento
                </th>
                <th className="px-6 py-3 font-semibold text-text-secondary text-xs text-right uppercase tracking-wider">
                  Total
                </th>
                <th className="px-6 py-3 font-semibold text-text-secondary text-xs text-center uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-soft bg-bg-card">
              {initialOrders.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-10 text-center text-text-tertiary"
                  >
                    No se encontraron pedidos registrados para esta campaña.
                  </td>
                </tr>
              ) : (
                initialOrders.map((order) => {
                  const calculatedTotal = getOrderTotal(order);
                  return (
                    <tr
                      key={order.id}
                      className="hover:bg-bg-surface/50 transition-colors duration-150"
                    >
                      <td className="px-6 py-4 font-bold text-text-primary whitespace-nowrap">
                        <div>
                          <span className="block">{order.client.name}</span>
                          {order.paymentDate ? (
                            <span className="text-[10px] text-beauty-500 font-bold block mt-0.5 select-none">
                              Límite Pago: {formatDateUTC(order.paymentDate)}
                            </span>
                          ) : (
                            <>
                              {order.status === "CANCELLED" ? (
                                <span className="text-[10px] text-beauty-500 font-bold block mt-0.5 select-none">
                                  Cancelado
                                </span>
                              ) : (
                                <span className="text-[10px] text-text-tertiary italic font-medium block mt-0.5 select-none">
                                  Sin fecha de pago
                                </span>
                              )}
                            </>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${statusColors[order.status]}`}
                        >
                          {statusTranslations[order.status]}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center whitespace-nowrap font-medium text-text-secondary">
                        {order.items.reduce(
                          (sum, item) => sum + item.quantity,
                          0,
                        )}{" "}
                        u.
                      </td>
                      <td className="px-6 py-4 text-right whitespace-nowrap font-mono text-text-secondary">
                        S/ {order.discount.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 text-right whitespace-nowrap font-mono font-bold text-text-primary">
                        S/ {calculatedTotal.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center justify-center gap-2">
                          <ButtonIcon
                            onClick={() => setSelectedOrder(order)}
                            variant="beauty"
                            icon={FiEye}
                            title="Ver Detalle de la Ficha"
                          />
                          <ButtonIcon
                            onClick={() => {
                              currentCampaign &&
                                (order.status === "PACKED" ||
                                  order.status === "DELIVERED") &&
                                printCampaignSlips(
                                  currentCampaign,
                                  [order],
                                  systemConfig?.systemName ?? "Inventario",
                                );
                            }}
                            disabled={
                              !(
                                currentCampaign &&
                                (order.status === "PACKED" ||
                                  order.status === "DELIVERED")
                              )
                            }
                            variant="beauty"
                            icon={FiScissors}
                            iconClassName="text-beauty-500"
                            title={
                              !(
                                currentCampaign &&
                                (order.status === "PACKED" ||
                                  order.status === "DELIVERED")
                              )
                                ? "Impresión deshabilitada para este estado"
                                : "Imprimir Ficha Individual"
                            }
                          />
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de Detalles del Pedido */}
      {selectedOrder && (
        <ErrorBoundary>
          <OrderDetailModal
            isOpen={!!selectedOrder}
            onClose={() => setSelectedOrder(null)}
            order={selectedOrder}
          />
        </ErrorBoundary>
      )}

      {/* Modal para Registrar/Editar Fecha de Pago de la Campaña */}
      {isCampaignPaymentDateModalOpen && (
        <Modal
          isOpen={isCampaignPaymentDateModalOpen}
          onClose={() => {
            setIsCampaignPaymentDateModalOpen(false);
            setPaymentDateError(null);
          }}
          title="Fecha Límite de Pago de Campaña"
          size="md"
          footer={
            <div className="flex items-center gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsCampaignPaymentDateModalOpen(false);
                  setPaymentDateError(null);
                }}
                disabled={isSubmittingCampaignPaymentDate}
                className="border-border-strong text-text-primary hover:bg-bg-surface"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                variant="primary"
                form="campaign-payment-date-form"
                loading={isSubmittingCampaignPaymentDate}
              >
                Guardar
              </Button>
            </div>
          }
        >
          <Form
            id="campaign-payment-date-form"
            onSubmit={handleSaveCampaignPaymentDate}
            className="space-y-4 text-sm text-text-secondary select-none"
          >
            <p className="text-xs">
              Establece la fecha límite general de pago para esta campaña. Los
              pedidos entregados heredarán esta fecha automáticamente si no se
              define una específica para el cliente.
            </p>
            <FormField label="Fecha de Pago de Campaña" required error={paymentDateError || undefined}>
              <Input
                type="date"
                value={campaignPaymentDateVal}
                onChange={(e) => {
                  setCampaignPaymentDateVal(e.target.value);
                  if (e.target.value) {
                    setPaymentDateError(null);
                  }
                }}
                placeholder="Seleccionar fecha"
              />
            </FormField>
          </Form>
        </Modal>
      )}
    </div>
  );
}

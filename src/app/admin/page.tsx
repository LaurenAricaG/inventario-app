import {
  FiTrendingUp,
  FiAlertCircle,
  FiPackage,
  FiShoppingBag,
  FiPlus,
  FiArrowRight,
  FiSearch,
  FiCalendar,
  FiClock,
} from "react-icons/fi";
import Link from "next/link";

export default function DashboardPage() {
  const metrics = [
    {
      title: "Ventas de campaña",
      value: "S/. 1,240.00",
      description: "Campaña 07 actual",
      icon: FiTrendingUp,
      accentClass: "bg-success-bg text-success-text",
      borderClass: "border-l-success-text",
      bordercard: "success-text",
    },
    {
      title: "Por cobrar (deudas)",
      value: "S/. 420.00",
      description: "6 clientes pendientes",
      icon: FiAlertCircle,
      accentClass: "bg-danger-bg text-danger-text",
      borderClass: "border-l-danger-text",
      bordercard: "danger-text",
    },
    {
      title: "Productos en stock",
      value: "84 uds.",
      description: "12 categorías",
      icon: FiPackage,
      accentClass: "bg-info-bg text-info-text",
      borderClass: "border-l-info-text",
      bordercard: "info-text",
    },
    {
      title: "Pedidos de campaña",
      value: "14 pedidos",
      description: "4 listos para entrega",
      icon: FiShoppingBag,
      accentClass: "bg-beauty-50 text-beauty-600",
      borderClass: "border-l-beauty-400",
      bordercard: "beauty-200",
    },
  ];

  const pendingDebtors = [
    {
      name: "Lauren Arica",
      phone: "987 654 321",
      lastOrder: "Campaña 06",
      debt: 130.0,
      status: "Vencido",
    },
    {
      name: "María González",
      phone: "951 753 852",
      lastOrder: "Campaña 07",
      debt: 85.5,
      status: "Pendiente",
    },
    {
      name: "Ana Valdivia",
      phone: "963 852 741",
      lastOrder: "Venta Directa",
      debt: 45.0,
      status: "Pendiente",
    },
    {
      name: "Gabriela Torres",
      phone: "954 123 654",
      lastOrder: "Campaña 07",
      debt: 120.0,
      status: "Vencido",
    },
    {
      name: "Carmen Rosa",
      phone: "921 456 789",
      lastOrder: "Campaña 06",
      debt: 39.5,
      status: "Pendiente",
    },
  ];

  const totalDebt = pendingDebtors.reduce((sum, d) => sum + d.debt, 0);

  function getInitials(name: string) {
    return name
      .split(" ")
      .slice(0, 2)
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  }

  // Colores de avatar por índice, usando las clases del token system
  const avatarColors = [
    "bg-beauty-100 text-beauty-800",
    "bg-info-bg text-info-text",
    "bg-success-bg text-success-text",
    "bg-warning-bg text-warning-text",
    "bg-danger-bg text-danger-text",
  ];

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
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 px-4 py-2 bg-beauty-600 hover:bg-beauty-800 text-white rounded-xl text-sm font-medium transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-beauty-400">
            <FiPlus className="w-4 h-4" />
            Nuevo pedido
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-bg-card hover:bg-beauty-50 border border-border-default hover:border-beauty-200 text-text-primary hover:text-beauty-800 rounded-xl text-sm font-medium transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-beauty-400">
            <FiPlus className="w-4 h-4" />
            Nuevo cliente
          </button>
        </div>
      </div>

      {/* Tarjetas de métricas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((metric, index) => {
          const Icon = metric.icon;
          return (
            <div
              key={index}
              className="bg-bg-card border border-border-default border-l-6 rounded-2xl p-5 flex items-start justify-between hover:shadow-sm transition-shadow duration-300"
              style={{ borderLeftColor: `var(--${metric.bordercard})` }}
            >
              {/* Usamos style inline solo para el color dinámico del borde izquierdo */}
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

      {/* Cuerpo principal */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Tabla de deudas */}
        <div className="lg:col-span-2 bg-bg-card border border-border-default rounded-2xl overflow-hidden">
          {/* Header de la tabla */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-border-default">
            <div>
              <h3 className="font-semibold text-text-primary text-sm">
                Deudas pendientes por cobrar
              </h3>
              <p className="text-xs text-text-secondary mt-0.5">
                Clientes con saldos sin pagar
              </p>
            </div>
            <Link
              href="/admin/clientes"
              className="text-xs font-semibold text-beauty-600 hover:text-beauty-800 flex items-center gap-1 transition-colors"
            >
              Ver todos
              <FiArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Tabla */}
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-border-default/60">
                  <th className="px-6 py-3 text-[10px] font-medium text-text-tertiary uppercase tracking-wider">
                    Cliente
                  </th>
                  <th className="px-4 py-3 text-[10px] font-medium text-text-tertiary uppercase tracking-wider">
                    Origen
                  </th>
                  <th className="px-4 py-3 text-[10px] font-medium text-text-tertiary uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-[10px] font-medium text-text-tertiary uppercase tracking-wider text-right">
                    Deuda
                  </th>
                </tr>
              </thead>
              <tbody>
                {pendingDebtors.map((debtor, index) => (
                  <tr
                    key={index}
                    className="border-b border-border-default/40 last:border-0 hover:bg-beauty-50/50 transition-colors"
                  >
                    {/* Cliente con avatar de iniciales */}
                    <td className="px-6 py-3.5">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-semibold shrink-0 ${avatarColors[index % avatarColors.length]}`}
                        >
                          {getInitials(debtor.name)}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-text-primary leading-tight">
                            {debtor.name}
                          </p>
                          <p className="text-[11px] text-text-tertiary">
                            {debtor.phone}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-xs text-text-secondary">
                      {debtor.lastOrder}
                    </td>
                    <td className="px-4 py-3.5">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium ${
                          debtor.status === "Vencido"
                            ? "bg-danger-bg text-danger-text"
                            : "bg-warning-bg text-warning-text"
                        }`}
                      >
                        {debtor.status}
                      </span>
                    </td>
                    <td className="px-6 py-3.5 text-right">
                      <span
                        className={`text-sm font-semibold ${
                          debtor.status === "Vencido"
                            ? "text-danger-text"
                            : "text-text-primary"
                        }`}
                      >
                        S/. {debtor.debt.toFixed(2)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pie de tabla: total */}
          <div className="flex items-center justify-between px-6 py-3.5 bg-bg-surface border-t border-border-default">
            <p className="text-xs text-text-secondary">
              {pendingDebtors.length} clientes con deuda activa
            </p>
            <p className="text-sm font-semibold text-text-primary">
              Total:{" "}
              <span className="text-danger-text">
                S/. {totalDebt.toFixed(2)}
              </span>
            </p>
          </div>
        </div>

        {/* Panel lateral */}
        <div className="space-y-4">
          {/* Campaña activa */}
          <div className="bg-bg-card border border-border-default rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-1">
              <FiCalendar className="w-4 h-4 text-beauty-600" />
              <h3 className="font-semibold text-text-primary text-sm">
                Campaña activa
              </h3>
            </div>
            <p className="text-xs text-text-secondary mb-4">
              Natura & Avon — Campaña 07
            </p>

            {/* Barra de progreso */}
            <div className="mb-4">
              <div className="flex justify-between items-center mb-1.5">
                <span className="text-[10px] text-text-tertiary uppercase tracking-wider font-medium">
                  Progreso
                </span>
                <span className="text-xs font-semibold text-beauty-600">
                  75%
                </span>
              </div>
              <div className="h-1.5 bg-border-soft rounded-full overflow-hidden">
                <div
                  className="h-full bg-beauty-400 rounded-full transition-all duration-300"
                  style={{ width: "75%" }}
                />
              </div>
            </div>

            {/* Datos de campaña */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-bg-page rounded-xl p-3 border border-border-soft">
                <p className="text-[10px] text-text-tertiary uppercase tracking-wider font-medium mb-1">
                  Recepción
                </p>
                <p className="text-sm font-semibold text-text-primary">
                  18 Jun, 2026
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
                  15 días
                </p>
              </div>
            </div>
          </div>

          {/* Búsqueda rápida */}
          <div className="bg-bg-card border border-border-default rounded-2xl p-5">
            <h3 className="font-semibold text-text-primary text-sm mb-3">
              Búsqueda rápida
            </h3>
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-tertiary" />
              <input
                type="text"
                placeholder="Nombre del cliente..."
                className="w-full text-sm pl-9 pr-4 py-2.5 bg-bg-page border border-border-default rounded-xl focus:outline-none focus:border-beauty-400 focus:ring-1 focus:ring-beauty-400 text-text-primary placeholder:text-text-tertiary transition-all duration-300"
              />
            </div>
            <p className="text-[11px] text-text-tertiary mt-2.5">
              Busca un cliente para registrar deudas o abonos.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

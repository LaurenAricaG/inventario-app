"use client";

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from "recharts";

export interface MonthlyFinancial {
  month: string;
  deudas: number;
  cobros: number;
}

export interface StockCompany {
  name: string;
  value: number;
}

export interface StockCategory {
  name: string;
  stock: number;
}

export interface CompanyCampaignOrders {
  company: string;
  campaignNumber: string;
  totalAmount: number;
  count: number;
}

interface DashboardChartsProps {
  financialData: MonthlyFinancial[];
  companyStockData: StockCompany[];
  categoryStockData: StockCategory[];
  companyCampaignOrdersData: CompanyCampaignOrders[];
}

// Colores coherentes con el tema de la aplicación (Belcorp, Avon, Yanbal, etc.)
const COMPANY_COLORS: Record<string, string> = {
  Belcorp: "#a855f7", // Morado
  Avon: "#ec4899",    // Rosado
  Yanbal: "#f97316",  // Naranja
  Otros: "#3b82f6",   // Azul
};

const DEFAULT_COLORS = ["#a855f7", "#ec4899", "#f97316", "#3b82f6", "#10b981", "#6366f1"];

export default function DashboardCharts({
  financialData,
  companyStockData,
  categoryStockData,
  companyCampaignOrdersData,
}: DashboardChartsProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 [&_.recharts-wrapper]:outline-none [&_.recharts-surface]:outline-none [&_svg]:outline-none [&_div]:outline-none [&_.recharts-responsive-container]:outline-none [&_*]:focus:outline-none">
      {/* Gráfico 1: Tendencia Mensual de Deuda Acumulada vs Cobros (col-span-2) */}
      <div className="lg:col-span-2 bg-bg-card border border-border-default rounded-2xl p-5 shadow-xs flex flex-col justify-between">
        <div className="mb-4">
          <h3 className="font-semibold text-text-primary text-base">
            Deuda Acumulada vs. Cobros
          </h3>
          <p className="text-xs text-text-secondary mt-0.5">
            Saldo pendiente acumulado al cierre de cada mes y abonos recibidos (Últimos 6 meses)
          </p>
        </div>

        <div className="h-64 w-full">
          {financialData.length === 0 ? (
            <div className="h-full flex items-center justify-center text-xs text-text-tertiary">
              Sin datos financieros suficientes para mostrar la tendencia.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={financialData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorDeudas" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#f43f5e" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="colorCobros" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-soft)" />
                <XAxis
                  dataKey="month"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 12, fill: "var(--text-tertiary)" }}
                />
                <YAxis
                  width={65}
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 11, fill: "var(--text-tertiary)" }}
                  tickFormatter={(val) => `S/. ${val}`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "var(--bg-card)",
                    borderColor: "var(--border-default)",
                    borderRadius: "12px",
                    fontSize: "12px",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                  }}
                  itemStyle={{
                    color: "var(--text-secondary)",
                    fontSize: "12px",
                  }}
                  labelStyle={{
                    color: "var(--text-primary)",
                    fontWeight: 600,
                    fontSize: "12px",
                  }}
                  formatter={(val: any, name: any) => [
                    `S/. ${Number(val || 0).toFixed(2)}`,
                    name === "Deuda Acumulada" || name === "Deudas" ? "Deuda Acumulada" : name,
                  ]}
                />
                <Area
                  type="monotone"
                  dataKey="deudas"
                  name="Deuda Acumulada"
                  stroke="#f43f5e"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#colorDeudas)"
                />
                <Area
                  type="monotone"
                  dataKey="cobros"
                  name="Cobros"
                  stroke="#10b981"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#colorCobros)"
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Leyenda en la parte inferior */}
        <div className="flex flex-wrap items-center justify-center gap-5 pt-2 border-t border-border-soft text-xs font-medium">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block" />
            <span className="text-text-secondary">Deuda Acumulada</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
            <span className="text-text-secondary">Cobros del Mes</span>
          </div>
        </div>
      </div>

      {/* Gráfico 2: Pedidos / Ventas por Empresa en la Campaña Activa (NUEVO) */}
      <div className="bg-bg-card border border-border-default rounded-2xl p-5 shadow-xs flex flex-col justify-between">
        <div>
          <h3 className="font-semibold text-text-primary text-base">
            Pedidos por Empresa (Campaña Activa)
          </h3>
          <p className="text-xs text-text-secondary mt-0.5">
            Monto de pedidos según la campaña activa de cada marca
          </p>
        </div>

        <div className="h-56 w-full my-2">
          {companyCampaignOrdersData.length === 0 || companyCampaignOrdersData.every((c) => c.totalAmount === 0 && c.count === 0) ? (
            <div className="h-full flex items-center justify-center text-xs text-text-tertiary text-center">
              No hay pedidos registrados en las campañas activas.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={companyCampaignOrdersData}
                margin={{ top: 15, right: 10, left: 0, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-soft)" />
                <XAxis
                  dataKey="company"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 12, fill: "var(--text-secondary)" }}
                />
                <YAxis
                  width={65}
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 11, fill: "var(--text-tertiary)" }}
                  tickFormatter={(val) => `S/. ${val}`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "var(--bg-card)",
                    borderColor: "var(--border-default)",
                    borderRadius: "12px",
                    fontSize: "12px",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                  }}
                  itemStyle={{
                    color: "var(--text-secondary)",
                    fontSize: "12px",
                  }}
                  labelStyle={{
                    color: "var(--text-primary)",
                    fontWeight: 600,
                    fontSize: "12px",
                  }}
                  formatter={(val: any, _name: any, entry: any) => {
                    const payload = entry.payload as CompanyCampaignOrders;
                    return [
                      `S/. ${Number(val || 0).toFixed(2)} (${payload.count} ${payload.count === 1 ? "pedido" : "pedidos"})`,
                      `Campaña ${payload.campaignNumber}`,
                    ];
                  }}
                />
                <Bar dataKey="totalAmount" radius={[8, 8, 0, 0]} barSize={32}>
                  {companyCampaignOrdersData.map((entry, index) => {
                    const color =
                      COMPANY_COLORS[entry.company] ||
                      DEFAULT_COLORS[index % DEFAULT_COLORS.length];
                    return <Cell key={`cell-${index}`} fill={color} />;
                  })}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Leyenda con detalle de pedidos */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2 border-t border-border-soft">
          {companyCampaignOrdersData.map((item, idx) => {
            const color =
              COMPANY_COLORS[item.company] || DEFAULT_COLORS[idx % DEFAULT_COLORS.length];
            return (
              <div key={item.company} className="flex items-center gap-1.5 text-xs">
                <span
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: color }}
                />
                <span className="font-medium text-text-secondary">{item.company}:</span>
                <span className="font-bold text-text-primary">
                  S/. {item.totalAmount.toFixed(0)} ({item.count})
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Gráfico 3: Stock por Empresa (Donut Chart) */}
      <div className="bg-bg-card border border-border-default rounded-2xl p-5 shadow-xs flex flex-col justify-between">
        <div>
          <h3 className="font-semibold text-text-primary text-base">
            Stock por Empresa
          </h3>
          <p className="text-xs text-text-secondary mt-0.5">
            Distribución del inventario en unidades
          </p>
        </div>

        <div className="h-52 w-full my-2 relative flex items-center justify-center">
          {companyStockData.length === 0 || companyStockData.every((c) => c.value === 0) ? (
            <div className="text-xs text-text-tertiary text-center">
              No hay productos registrados en inventario.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={companyStockData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {companyStockData.map((entry, index) => {
                    const color =
                      COMPANY_COLORS[entry.name] ||
                      DEFAULT_COLORS[index % DEFAULT_COLORS.length];
                    return <Cell key={`cell-${index}`} fill={color} stroke="none" />;
                  })}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "var(--bg-card)",
                    borderColor: "var(--border-default)",
                    borderRadius: "12px",
                    fontSize: "12px",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                  }}
                  itemStyle={{
                    color: "var(--text-secondary)",
                    fontSize: "12px",
                  }}
                  labelStyle={{
                    color: "var(--text-primary)",
                    fontWeight: 600,
                    fontSize: "12px",
                  }}
                  formatter={(val: any) => [`${val ?? 0} uds.`, "Stock"]}
                />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Leyenda personalizada */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2 border-t border-border-soft">
          {companyStockData.map((comp, idx) => {
            const color =
              COMPANY_COLORS[comp.name] || DEFAULT_COLORS[idx % DEFAULT_COLORS.length];
            return (
              <div key={comp.name} className="flex items-center gap-1.5 text-xs">
                <span
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: color }}
                />
                <span className="font-medium text-text-secondary">{comp.name}:</span>
                <span className="font-bold text-text-primary">{comp.value}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Gráfico 4: Stock por Categoría (BarChart Horizontal) (col-span-2) */}
      <div className="lg:col-span-2 bg-bg-card border border-border-default rounded-2xl p-5 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-semibold text-text-primary text-base">
              Stock por Categoría Principal
            </h3>
            <p className="text-xs text-text-secondary mt-0.5">
              Unidades disponibles desglosadas por tipo de producto
            </p>
          </div>
        </div>

        <div className="h-56 w-full">
          {categoryStockData.length === 0 || categoryStockData.every((c) => c.stock === 0) ? (
            <div className="h-full flex items-center justify-center text-xs text-text-tertiary">
              Aún no hay unidades registradas en las categorías.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={categoryStockData}
                layout="vertical"
                margin={{ top: 5, right: 20, left: 30, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="var(--border-soft)" />
                <XAxis
                  type="number"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 11, fill: "var(--text-tertiary)" }}
                />
                <YAxis
                  dataKey="name"
                  type="category"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 12, fill: "var(--text-secondary)" }}
                  width={120}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "var(--bg-card)",
                    borderColor: "var(--border-default)",
                    borderRadius: "12px",
                    fontSize: "12px",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                  }}
                  itemStyle={{
                    color: "var(--text-secondary)",
                    fontSize: "12px",
                  }}
                  labelStyle={{
                    color: "var(--text-primary)",
                    fontWeight: 600,
                    fontSize: "12px",
                  }}
                  formatter={(val: any) => [`${val ?? 0} unidades`, "Stock"]}
                />
                <Bar
                  dataKey="stock"
                  name="Unidades"
                  fill="#ec4899"
                  radius={[0, 8, 8, 0]}
                  barSize={16}
                />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
}

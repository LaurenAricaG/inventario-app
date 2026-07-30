"use client";

import { useState, useEffect, useRef, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  FiPlus,
  FiSearch,
  FiUser,
  FiChevronDown,
  FiTrash2,
  FiAlertCircle,
  FiSave,
  FiArrowLeft,
  FiTag,
  FiShoppingBag,
  FiCheck,
} from "react-icons/fi";
import { cn } from "@/utils/cn.utils";
import { formatDateShortUTC } from "@/utils/date.utils";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Modal from "@/components/ui/Modal";
import Form, { FormField } from "@/components/ui/Form";
import { createClientAction } from "@/lib/client";
import PageHeader from "@/components/ui/PageHeader";
import {
  saveCampaignOrdersAction,
  getAutocompleteSuggestionsAction,
} from "@/lib/campaign-order/index";

interface Company {
  id: number;
  name: string;
}

interface Campaign {
  id: number;
  number: string;
  isActive: boolean;
  companyId: number;
  startDate?: string | Date;
  endDate?: string | Date;
  company: { id: number; name: string };
}

interface Brand {
  id: number;
  name: string;
  companyId: number;
}

interface Client {
  id: number;
  name: string;
}

interface QuickOrderConsoleProps {
  companies: Company[];
  campaigns: Campaign[];
  brands: Brand[];
  clients: Client[];
  initialCampaignId?: number;
}

interface LocalItem {
  id: string; // ID temporal local
  brandId: number;
  brandName: string;
  productCode: string;
  productName: string;
  catalogPrice: number;
  quantity: number;
}

interface LocalOrder {
  clientId: number;
  clientName: string;
  discount: number;
  notes: string;
  items: LocalItem[];
}

export default function QuickOrderConsole({
  companies,
  campaigns,
  brands,
  clients: initialClients,
  initialCampaignId,
}: QuickOrderConsoleProps) {
  const router = useRouter();
  const [isSaving, startSaveTransition] = useTransition();

  // Empresa y maestros locales
  const initialCampaign = initialCampaignId
    ? campaigns.find((c) => c.id === initialCampaignId)
    : campaigns.find((c) => c.isActive) || campaigns[0];

  const [selectedCompanyId, setSelectedCompanyId] = useState(
    initialCampaign?.companyId.toString() || companies[0]?.id.toString() || "",
  );
  const [localClients, setLocalClients] = useState<Client[]>(initialClients);

  // Estados del formulario de ingreso rápido
  const [selectedClientId, setSelectedClientId] = useState("");
  const [selectedBrandId, setSelectedBrandId] = useState("");
  const [productCode, setProductCode] = useState("");
  const [productName, setProductName] = useState("");
  const [catalogPrice, setCatalogPrice] = useState("");
  const [quantity, setQuantity] = useState("1");

  // Estados de error de validación
  const [clientError, setClientError] = useState<string | null>(null);
  const [productNameError, setProductNameError] = useState<string | null>(null);
  const [priceError, setPriceError] = useState<string | null>(null);

  // Estado del listado temporal de pedidos
  const [localOrders, setLocalOrders] = useState<Record<number, LocalOrder>>(
    {},
  );

  // Buscador de Clientes
  const [clientSearchQuery, setClientSearchQuery] = useState("");
  const [isClientDropdownOpen, setIsClientDropdownOpen] = useState(false);
  const clientDropdownRef = useRef<HTMLDivElement>(null);

  // Autocomplete de Productos
  const [productSuggestions, setProductSuggestions] = useState<
    { name: string; brandId: number; price: number }[]
  >([]);
  const [showProductSuggestions, setShowProductSuggestions] = useState(false);
  const productSuggestionsRef = useRef<HTMLDivElement>(null);

  // Modal para agregar cliente rápido
  const [isClientModalOpen, setIsClientModalOpen] = useState(false);
  const [newClientName, setNewClientName] = useState("");
  const [newClientPhone, setNewClientPhone] = useState("");
  const [newClientAddress, setNewClientAddress] = useState("");
  const [isCreatingClient, setIsCreatingClient] = useState(false);
  const [newClientNameError, setNewClientNameError] = useState<string | null>(null);

  // Referencias para enfoque por teclado rápido
  const productCodeInputRef = useRef<HTMLInputElement>(null);
  const productNameInputRef = useRef<HTMLInputElement>(null);

  // Encontrar campaña seleccionada de forma dinámica en base a la empresa elegida, priorizando el id inicial, y filtrar marcas
  const selectedCampaign =
    campaigns.find(
      (c) =>
        c.companyId === Number(selectedCompanyId) && c.id === initialCampaignId,
    ) ||
    campaigns.find(
      (c) => c.companyId === Number(selectedCompanyId) && c.isActive,
    ) ||
    campaigns.find((c) => c.companyId === Number(selectedCompanyId));
  const selectedCampaignId = selectedCampaign?.id.toString() || "";

  const filteredBrands = selectedCampaign
    ? brands.filter((b) => b.companyId === selectedCampaign.companyId)
    : [];

  const selectedClient =
    localClients.find((c) => c.id === Number(selectedClientId)) || null;

  // Auto-seleccionar la primera marca de la empresa si cambia el filtro
  useEffect(() => {
    if (filteredBrands.length > 0) {
      setSelectedBrandId(filteredBrands[0].id.toString());
    } else {
      setSelectedBrandId("");
    }
  }, [selectedCampaignId]);

  // Cerrar menú de clientes al hacer click afuera
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (
        clientDropdownRef.current &&
        !clientDropdownRef.current.contains(e.target as Node)
      ) {
        setIsClientDropdownOpen(false);
      }
      if (
        productSuggestionsRef.current &&
        !productSuggestionsRef.current.contains(e.target as Node)
      ) {
        setShowProductSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  // Debounce para sugerencias de productos
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (productName.trim().length >= 2) {
        const res = await getAutocompleteSuggestionsAction(
          productName,
          selectedCompanyId ? Number(selectedCompanyId) : undefined,
        );
        if (res.success && res.suggestions) {
          setProductSuggestions(res.suggestions);
          setShowProductSuggestions(true);
        }
      } else {
        setProductSuggestions([]);
        setShowProductSuggestions(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [productName, selectedCompanyId]);

  // Clientes filtrados
  const filteredClients = localClients.filter((c) =>
    c.name.toLowerCase().includes(clientSearchQuery.toLowerCase().trim()),
  );

  // Agregar un producto a la lista temporal
  const handleAddItem = (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    setClientError(null);
    setProductNameError(null);
    setPriceError(null);

    let hasError = false;

    if (!selectedClientId) {
      setClientError("Por favor, selecciona un cliente.");
      hasError = true;
    }
    if (!productName.trim()) {
      setProductNameError("Por favor, ingresa el nombre del producto.");
      hasError = true;
    }
    const priceNum = parseFloat(catalogPrice);
    if (isNaN(priceNum) || priceNum <= 0) {
      setPriceError("Por favor, ingresa un precio válido mayor a 0.");
      hasError = true;
    }
    const qtyNum = parseInt(quantity);
    if (isNaN(qtyNum) || qtyNum <= 0) {
      hasError = true;
    }

    if (hasError) return;

    if (!selectedBrandId) {
      toast.error("Por favor, selecciona una marca.");
      return;
    }

    const brand = brands.find((b) => b.id === Number(selectedBrandId));
    const client = localClients.find((c) => c.id === Number(selectedClientId))!;

    const newItem: LocalItem = {
      id: Math.random().toString(36).substr(2, 9),
      brandId: Number(selectedBrandId),
      brandName: brand ? brand.name : "Desconocida",
      productCode: productCode.trim(),
      productName: productName.trim(),
      catalogPrice: priceNum,
      quantity: qtyNum,
    };

    setLocalOrders((prev) => {
      const existingOrder = prev[client.id];
      if (existingOrder) {
        return {
          ...prev,
          [client.id]: {
            ...existingOrder,
            items: [...existingOrder.items, newItem],
          },
        };
      } else {
        return {
          ...prev,
          [client.id]: {
            clientId: client.id,
            clientName: client.name,
            discount: 0,
            notes: "",
            items: [newItem],
          },
        };
      }
    });

    // Limpiar campos de producto
    setProductCode("");
    setProductName("");
    setCatalogPrice("");
    setQuantity("1");
    setProductSuggestions([]);
    setShowProductSuggestions(false);
    setClientError(null);
    setProductNameError(null);
    setPriceError(null);

    toast.success("Producto agregado a la lista temporal.");

    // Enfocar nuevamente el código del producto de forma automática
    setTimeout(() => {
      productCodeInputRef.current?.focus();
    }, 50);
  };

  // Crear cliente rápido
  const handleCreateClientQuick = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClientName.trim()) {
      setNewClientNameError("El nombre completo es obligatorio.");
      return;
    }

    setIsCreatingClient(true);
    try {
      const res = await createClientAction({
        name: newClientName.trim(),
        phone: newClientPhone.trim() || undefined,
        address: newClientAddress.trim() || undefined,
      });

      if (res.success && res.data) {
        const createdClient = res.data;
        setLocalClients((prev) =>
          [...prev, createdClient].sort((a, b) => a.name.localeCompare(b.name)),
        );
        setSelectedClientId(createdClient.id.toString());
        setClientError(null);
        setNewClientNameError(null);
        setIsClientModalOpen(false);
        setNewClientName("");
        setNewClientPhone("");
        setNewClientAddress("");
        toast.success("Cliente creado y seleccionado.");
      } else {
        toast.error(res.message || "Error al crear cliente.");
      }
    } catch (err: any) {
      toast.error(err.message || "Error inesperado.");
    } finally {
      setIsCreatingClient(false);
    }
  };

  const handleRemoveItem = (clientId: number, itemId: string) => {
    setLocalOrders((prev) => {
      const order = prev[clientId];
      if (!order) return prev;
      const updatedItems = order.items.filter((item) => item.id !== itemId);
      if (updatedItems.length === 0) {
        const next = { ...prev };
        delete next[clientId];
        return next;
      }
      return {
        ...prev,
        [clientId]: {
          ...order,
          items: updatedItems,
        },
      };
    });
    toast.success("Producto removido.");
  };

  const handleRemoveClientOrder = (clientId: number) => {
    setLocalOrders((prev) => {
      const next = { ...prev };
      delete next[clientId];
      return next;
    });
    toast.success("Pedido del cliente removido.");
  };

  const handleSaveAll = () => {
    const ordersArray = Object.values(localOrders);
    if (ordersArray.length === 0) {
      toast.error("No tienes ningún pedido agregado en la lista temporal.");
      return;
    }

    startSaveTransition(async () => {
      const payload = ordersArray.map((o) => ({
        clientId: o.clientId,
        discount: o.discount,
        notes: o.notes,
        items: o.items.map((i) => ({
          brandId: i.brandId,
          productCode: i.productCode,
          productName: i.productName,
          catalogPrice: i.catalogPrice,
          quantity: i.quantity,
        })),
      }));

      const res = await saveCampaignOrdersAction(
        Number(selectedCampaignId),
        payload,
      );
      if (res.success) {
        toast.success("Todos los pedidos se han guardado con éxito.");
        router.push(`/admin/pedidos?campaignId=${selectedCampaignId}`);
        router.refresh();
      } else {
        toast.error(res.message);
      }
    });
  };

  const totalCalculated = Object.values(localOrders).reduce((sum, order) => {
    const sub = order.items.reduce(
      (s, i) => s + i.quantity * i.catalogPrice,
      0,
    );
    return sum + Math.max(0, sub - order.discount);
  }, 0);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Consola de Carga Rápida de Pedidos"
        subtitle="Registra consecutivamente productos por cliente para una campaña."
        breadcrumbs={[
          { label: "admin", href: "/admin" },
          { label: "pedidos", href: "/admin/pedidos" },
          { label: "registrar pedidos" },
        ]}
        action={
          <Button
            type="button"
            variant="outline"
            onClick={() =>
              router.push(
                selectedCampaign
                  ? `/admin/pedidos?campaignId=${selectedCampaign.id}`
                  : "/admin/pedidos",
              )
            }
            className="flex items-center gap-2 border-border-strong text-text-primary hover:bg-bg-surface"
          >
            <FiArrowLeft className="w-4 h-4" />
            Volver
          </Button>
        }
      />

      {/* Configuración de Campaña / Empresa */}
      <div className="p-6 bg-linear-to-br from-bg-card to-bg-surface border border-border-default/80 rounded-3xl shadow-md select-none flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="w-full md:w-80">
          <FormField label="Empresa de Catálogo">
            <Select
              value={selectedCompanyId}
              onChange={(e) => setSelectedCompanyId(e.target.value)}
            >
              {companies.map((c) => (
                <option key={c.id} value={c.id.toString()}>
                  {`${c.name}`}
                </option>
              ))}
            </Select>
          </FormField>
        </div>

        {selectedCampaign ? (
          <div className="flex-1 flex flex-col sm:flex-row sm:items-center gap-4 bg-beauty-400/5 dark:bg-beauty-900/10 border border-beauty-500/25 px-5 py-4 rounded-2xl transition-all duration-300">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-beauty-500/10 text-beauty-500 flex items-center justify-center border border-beauty-500/20 shrink-0">
                <FiShoppingBag className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] text-beauty-600 dark:text-beauty-400 font-extrabold uppercase tracking-wider block">
                  Campaña Activa
                </span>
                <span className="text-base font-black text-text-primary mt-0.5 block">
                  {selectedCampaign.number}
                </span>
              </div>
            </div>
            <div className="sm:ml-auto flex items-center gap-3">
              {selectedCampaign.isActive && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-success-bg/80 border border-success-text/10 text-success-text shadow-xs">
                  <span className="w-2 h-2 rounded-full bg-success-text animate-pulse shrink-0" />
                  Activa
                </span>
              )}
              {selectedCampaign.endDate && (
                <span
                  suppressHydrationWarning
                  className="text-xs text-text-secondary font-medium"
                >
                  Cierre: {formatDateShortUTC(selectedCampaign.endDate)}
                </span>
              )}
            </div>
          </div>
        ) : (
          <div className="flex-1 p-4 border border-dashed border-danger-text/20 bg-danger-bg/5 rounded-2xl text-xs text-danger-text font-semibold flex items-center gap-2">
            <FiAlertCircle className="w-5 h-5 shrink-0" />
            Esta empresa no tiene ninguna campaña registrada en el sistema.
          </div>
        )}
      </div>

      {/* Consola de Entrada Rápida */}
      <div className="p-6 bg-bg-card border border-border-default/80 rounded-2xl shadow-xs">
        <h2 className="text-sm font-bold text-text-primary flex items-center gap-2 border-b border-border-soft pb-3 mb-5 select-none">
          <FiTag className="w-4 h-4 text-beauty-500" />
          Ingreso de Producto
        </h2>

        <form onSubmit={handleAddItem} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Cliente Searchable Autocomplete */}
            <div ref={clientDropdownRef} className="relative md:col-span-2">
              <label className="block text-xs font-bold text-text-secondary uppercase tracking-wider mb-2 select-none">
                Cliente
              </label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsClientDropdownOpen(!isClientDropdownOpen)}
                  className={cn(
                    "flex-1 px-4 py-3 rounded-2xl border text-sm bg-bg-card text-text-primary transition-all duration-200 outline-none flex items-center justify-between text-left cursor-pointer select-none",
                    "border-border-strong/40 focus:border-beauty-400 focus:ring-4 focus:ring-beauty-400/10",
                    isClientDropdownOpen &&
                    "border-beauty-400 ring-4 ring-beauty-400/10",
                  )}
                >
                  <div className="flex items-center gap-2 truncate min-w-0">
                    <FiUser className="w-4 h-4 text-beauty-500 shrink-0" />
                    <span
                      className={cn(
                        "truncate",
                        selectedClient
                          ? "font-semibold text-text-primary"
                          : "text-text-tertiary",
                      )}
                    >
                      {selectedClient
                        ? selectedClient.name
                        : "Seleccionar cliente..."}
                    </span>
                  </div>
                  <FiChevronDown
                    className={cn(
                      "w-4 h-4 text-text-tertiary shrink-0 transition-transform duration-200",
                      isClientDropdownOpen && "rotate-185",
                    )}
                  />
                </button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setNewClientNameError(null);
                    setNewClientName("");
                    setNewClientPhone("");
                    setNewClientAddress("");
                    setIsClientModalOpen(true);
                  }}
                  className="border-border-strong text-text-primary hover:bg-bg-surface px-3"
                  title="Nuevo Cliente Rápido"
                >
                  <FiPlus className="w-5 h-5 shrink-0" />
                </Button>
              </div>

              {clientError && (
                <p className="text-xs text-danger-text font-semibold mt-1.5 pl-1">
                  {clientError}
                </p>
              )}

              {isClientDropdownOpen && (
                <div className="absolute left-0 right-0 top-full mt-2 z-50 bg-bg-card border border-border-default rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-72 animate-in fade-in zoom-in-95 duration-150">
                  {/* Buscador de Cliente Interno */}
                  <div className="p-2 border-b border-border-soft bg-bg-card">
                    <div className="relative flex items-center">
                      <FiSearch className="absolute left-3 text-text-tertiary w-3.5 h-3.5" />
                      <input
                        type="text"
                        placeholder="Buscar por nombre..."
                        value={clientSearchQuery}
                        onChange={(e) => setClientSearchQuery(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-border-strong/40 bg-bg-surface text-text-primary focus:border-beauty-400 outline-none transition-all"
                        autoFocus
                      />
                    </div>
                  </div>

                  {/* Lista de clientes */}
                  <div className="overflow-y-auto p-1.5 space-y-1 scrollbar-thin scrollbar-thumb-stone-300 dark:scrollbar-thumb-zinc-700 flex-1">
                    {filteredClients.length === 0 ? (
                      <div className="px-4 py-3 text-xs text-text-tertiary text-center select-none">
                        No se encontraron clientes
                      </div>
                    ) : (
                      filteredClients.map((client) => {
                        const isSelected =
                          selectedClientId === client.id.toString();
                        return (
                          <button
                            key={client.id}
                            type="button"
                            onClick={() => {
                              setSelectedClientId(client.id.toString());
                              setClientError(null);
                              setIsClientDropdownOpen(false);
                              setClientSearchQuery("");
                            }}
                            className={cn(
                              "w-full px-3 py-2.5 rounded-xl text-xs text-left flex items-center justify-between cursor-pointer transition-colors select-none",
                              isSelected
                                ? "bg-beauty-400/10 text-beauty-600 dark:bg-beauty-400/15 dark:text-beauty-400 font-semibold"
                                : "text-text-secondary hover:bg-beauty-400/10 hover:text-beauty-600 dark:hover:bg-beauty-400/15 dark:hover:text-beauty-400",
                            )}
                          >
                            <span className="truncate">{client.name}</span>
                            {isSelected && (
                              <FiCheck className="w-3.5 h-3.5 text-beauty-400 shrink-0 ml-2" />
                            )}
                          </button>
                        );
                      })
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Marca Selector */}
            <div>
              <FormField label="Marca">
                <Select
                  value={selectedBrandId}
                  onChange={(e) => setSelectedBrandId(e.target.value)}
                >
                  {filteredBrands.map((b) => (
                    <option key={b.id} value={b.id.toString()}>
                      {b.name}
                    </option>
                  ))}
                </Select>
              </FormField>
            </div>

            {/* Código del Producto */}
            <div>
              <FormField label="Código del Producto">
                <Input
                  value={productCode}
                  onChange={(e) => setProductCode(e.target.value)}
                  placeholder="Ej. 14253"
                  ref={productCodeInputRef}
                />
              </FormField>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Nombre del Producto Autocomplete */}
            <div ref={productSuggestionsRef} className="relative md:col-span-2">
              <FormField label="Nombre del Producto">
                <Input
                  value={productName}
                  onChange={(e) => {
                    setProductName(e.target.value);
                    setProductNameError(null);
                  }}
                  placeholder="Escribe el nombre del labial, crema, etc..."
                  ref={productNameInputRef}
                  onFocus={() => {
                    if (productSuggestions.length > 0)
                      setShowProductSuggestions(true);
                  }}
                />
              </FormField>

              {productNameError && (
                <p className="text-xs text-danger-text font-semibold mt-1.5 pl-1">
                  {productNameError}
                </p>
              )}

              {showProductSuggestions && productSuggestions.length > 0 && (
                <div className="absolute left-0 right-0 mt-2 bg-bg-card border border-border-strong rounded-2xl shadow-lg z-50 overflow-hidden max-h-60 overflow-y-auto divide-y divide-border-soft/40">
                  {productSuggestions.map((item, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setProductName(item.name);
                        setProductNameError(null);
                        setSelectedBrandId(item.brandId.toString());
                        setShowProductSuggestions(false);
                      }}
                      className="w-full px-4 py-3 text-left text-sm hover:bg-bg-surface flex justify-between items-center transition-colors duration-150 cursor-pointer"
                    >
                      <span className="font-semibold text-text-primary">
                        {item.name}
                      </span>
                      <span className="text-xs text-text-tertiary font-mono">
                        Último precio: S/ {item.price.toFixed(2)}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div>
              <FormField label="Precio Catálogo (S/)">
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  value={catalogPrice}
                  onChange={(e) => {
                    setCatalogPrice(e.target.value);
                    setPriceError(null);
                  }}
                  placeholder="0.00"
                />
              </FormField>

              {priceError && (
                <p className="text-xs text-danger-text font-semibold mt-1.5 pl-1">
                  {priceError}
                </p>
              )}
            </div>

            {/* Cantidad y Botón de Agregar */}
            <div className="flex items-start gap-2">
              <div className="flex-1">
                <FormField label="Cant.">
                  <Input
                    type="number"
                    min="1"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                  />
                </FormField>
              </div>
              <Button
                type="submit"
                variant="primary"
                className="py-3 px-4 shadow-sm shrink-0 mt-6"
              >
                Agregar
              </Button>
            </div>
          </div>
        </form>
      </div>

      {/* Listado de Pedidos Temporales Agrupados por Cliente */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-text-primary px-1 select-none">
          Pedidos Registrados en esta Sesión
        </h3>

        {Object.keys(localOrders).length === 0 ? (
          <div className="p-10 border border-dashed border-border-default rounded-3xl text-center bg-bg-card/50 text-text-tertiary select-none">
            <FiAlertCircle className="w-8 h-8 text-text-tertiary mx-auto mb-3" />
            No has agregado ningún producto para ningún cliente en esta sesión
            todavía.
          </div>
        ) : (
          Object.values(localOrders).map((order) => {
            const subtotal = order.items.reduce(
              (s, i) => s + i.quantity * i.catalogPrice,
              0,
            );
            const total = Math.max(0, subtotal - order.discount);

            return (
              <div
                key={order.clientId}
                className="bg-bg-card border border-border-default/80 rounded-2xl shadow-xs overflow-hidden"
              >
                {/* Cabecera del Cliente */}
                <div className="px-6 py-4 bg-bg-surface border-b border-border-soft flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-2">
                    <FiUser className="w-4 h-4 text-beauty-500 shrink-0" />
                    <span className="font-extrabold text-text-primary text-sm">
                      {order.clientName}
                    </span>
                    <span className="text-xs text-text-tertiary font-medium">
                      ({order.items.length} productos)
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-semibold text-text-secondary select-none">
                      Total Cliente:
                    </span>
                    <span className="font-mono font-black text-text-primary text-sm">
                      S/ {total.toFixed(2)}
                    </span>
                    <button
                      onClick={() => handleRemoveClientOrder(order.clientId)}
                      className="p-1.5 rounded-lg border border-transparent text-danger-text hover:bg-danger-bg/50 transition-colors duration-150 cursor-pointer"
                      title="Eliminar pedido del cliente completo"
                    >
                      <FiTrash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Tabla de Productos del Cliente */}
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead>
                      <tr className="border-b border-border-soft/60 bg-bg-surface/30 select-none">
                        <th className="px-6 py-2.5 font-semibold text-text-secondary uppercase tracking-wider">
                          Código
                        </th>
                        <th className="px-6 py-2.5 font-semibold text-text-secondary uppercase tracking-wider">
                          Marca
                        </th>
                        <th className="px-6 py-2.5 font-semibold text-text-secondary uppercase tracking-wider">
                          Producto
                        </th>
                        <th className="px-6 py-2.5 font-semibold text-text-secondary text-right uppercase tracking-wider">
                          Precio Catálogo
                        </th>
                        <th className="px-6 py-2.5 font-semibold text-text-secondary text-center uppercase tracking-wider">
                          Cant.
                        </th>
                        <th className="px-6 py-2.5 font-semibold text-text-secondary text-right uppercase tracking-wider">
                          Subtotal
                        </th>
                        <th className="px-6 py-2.5 font-semibold text-text-secondary text-center uppercase tracking-wider w-16">
                          Acciones
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border-soft/40">
                      {order.items.map((item) => (
                        <tr
                          key={item.id}
                          className="hover:bg-bg-surface/20 transition-colors duration-150"
                        >
                          <td className="px-6 py-3 font-mono text-text-secondary">
                            {item.productCode || "S/C"}
                          </td>
                          <td className="px-6 py-3 font-semibold text-text-secondary">
                            {item.brandName}
                          </td>
                          <td className="px-6 py-3 font-bold text-text-primary">
                            {item.productName}
                          </td>
                          <td className="px-6 py-3 text-right font-mono text-text-secondary">
                            S/ {item.catalogPrice.toFixed(2)}
                          </td>
                          <td className="px-6 py-3 text-center font-semibold text-text-primary">
                            {item.quantity}
                          </td>
                          <td className="px-6 py-3 text-right font-mono font-bold text-text-primary">
                            S/ {(item.quantity * item.catalogPrice).toFixed(2)}
                          </td>
                          <td className="px-6 py-3 text-center">
                            <button
                              onClick={() =>
                                handleRemoveItem(order.clientId, item.id)
                              }
                              className="p-1.5 rounded-lg text-text-tertiary hover:text-danger-text hover:bg-danger-bg/40 transition-all duration-150 cursor-pointer"
                              title="Remover producto"
                            >
                              <FiTrash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Barra de Acciones Finales */}
      <div className="p-5 bg-bg-card border border-border-default/80 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm select-none">
        <div>
          <span className="text-xs font-semibold text-text-secondary block">
            Monto Total de los Pedidos:
          </span>
          <span className="text-xl font-black text-text-primary tracking-tight block font-mono mt-0.5">
            S/ {totalCalculated.toFixed(2)}
          </span>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Button
            type="button"
            variant="outline"
            onClick={() =>
              router.push(
                selectedCampaign
                  ? `/admin/pedidos?campaignId=${selectedCampaign.id}`
                  : "/admin/pedidos",
              )
            }
            disabled={isSaving}
            className="w-full sm:w-auto border-border-strong text-text-primary hover:bg-bg-surface"
          >
            Cancelar
          </Button>
          <Button
            type="button"
            variant="primary"
            onClick={handleSaveAll}
            loading={isSaving}
            disabled={isSaving || Object.keys(localOrders).length === 0}
            className="w-full sm:w-auto gap-2"
          >
            <FiSave className="w-4 h-4 shrink-0" />
            Guardar
          </Button>
        </div>
      </div>

      {/* Modal de Nuevo Cliente Rápido */}
      <Modal
        isOpen={isClientModalOpen}
        onClose={() => {
          setIsClientModalOpen(false);
          setNewClientNameError(null);
        }}
        title="Crear Cliente Rápido"
        size="md"
        footer={
          <div className="flex items-center gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsClientModalOpen(false);
                setNewClientNameError(null);
              }}
              disabled={isCreatingClient}
              className="border-border-strong text-text-primary hover:bg-bg-surface"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="primary"
              form="client-quick-form"
              loading={isCreatingClient}
            >
              Crear y Seleccionar
            </Button>
          </div>
        }
      >
        <Form
          id="client-quick-form"
          onSubmit={handleCreateClientQuick}
          className="space-y-4"
        >
          <FormField label="Nombre Completo" required error={newClientNameError || undefined}>
            <Input
              value={newClientName}
              onChange={(e) => {
                setNewClientName(e.target.value);
                if (e.target.value.trim()) {
                  setNewClientNameError(null);
                }
              }}
              placeholder="Ej. Camila Arica"
            />
          </FormField>
          <FormField label="Teléfono (Opcional)">
            <Input
              value={newClientPhone}
              onChange={(e) => setNewClientPhone(e.target.value)}
              placeholder="Ej. 987654321"
            />
          </FormField>
          <FormField label="Dirección (Opcional)">
            <Input
              value={newClientAddress}
              onChange={(e) => setNewClientAddress(e.target.value)}
              placeholder="Ej. Av. Larco 123, Miraflores"
            />
          </FormField>
        </Form>
      </Modal>
    </div>
  );
}

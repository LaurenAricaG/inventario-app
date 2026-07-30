"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  FiPlus,
  FiMinus,
  FiTrash2,
  FiArrowLeft,
  FiShoppingBag,
  FiSearch,
  FiChevronDown,
  FiCheck,
  FiUser,
} from "react-icons/fi";
import { cn } from "@/utils/cn.utils";
import Button from "@/components/ui/Button";
import ButtonIcon from "@/components/ui/ButtonIcon";
import Form, { FormField } from "@/components/ui/Form";
import Input from "@/components/ui/Input";
import Textarea from "@/components/ui/Textarea";
import { createDirectSaleAction } from "@/lib/direct-sale";
import { directSaleSchema } from "@/lib/direct-sale/schema";
import Modal from "@/components/ui/Modal";
import { createClientAction } from "@/lib/client";
import PageHeader from "@/components/ui/PageHeader";

interface ProductOption {
  id: number;
  name: string;
  code: string | null;
  price: number;
  stock: number;
  brand: { name: string };
}

interface FormDirectSaleProps {
  clients: { id: number; name: string }[];
  products: ProductOption[];
}

interface SelectedItem {
  productId: number;
  name: string;
  brand: string;
  code: string | null;
  quantity: number;
  unitPrice: number;
  maxStock: number;
}

export default function FormDirectSale({
  clients,
  products,
}: FormDirectSaleProps) {
  const router = useRouter();

  // Sale metadata
  const [clientId, setClientId] = useState("");
  const [discountInput, setDiscountInput] = useState("0");
  const [notesInput, setNotesInput] = useState("");

  // Sale items currently added to the table
  const [items, setItems] = useState<SelectedItem[]>([]);

  // Search and Add Selector panel state
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<ProductOption | null>(
    null,
  );
  const [qtyInput, setQtyInput] = useState("1");
  const [priceInput, setPriceInput] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const dropdownRef = useRef<HTMLDivElement>(null);
  const clientDropdownRef = useRef<HTMLDivElement>(null);

  const [localClients, setLocalClients] = useState(clients);

  // Client Selection searchable state
  const [clientSearchQuery, setClientSearchQuery] = useState("");
  const [isClientDropdownOpen, setIsClientDropdownOpen] = useState(false);

  // Quick Client creation states
  const [isClientModalOpen, setIsClientModalOpen] = useState(false);
  const [newClientName, setNewClientName] = useState("");
  const [newClientPhone, setNewClientPhone] = useState("");
  const [newClientAddress, setNewClientAddress] = useState("");
  const [isCreatingClient, setIsCreatingClient] = useState(false);
  const [newClientNameError, setNewClientNameError] = useState<string | null>(
    null,
  );

  // Compute selected client object
  const selectedClient =
    localClients.find((c) => c.id === Number(clientId)) || null;

  // Filter clients based on client search query inside the dropdown
  const filteredClients = localClients.filter((c) =>
    c.name.toLowerCase().includes(clientSearchQuery.toLowerCase().trim()),
  );

  // Filter products that have stock > 0
  const availableProducts = products.filter((p) => p.stock > 0);

  // Filter products based on typing query inside the dropdown
  const filteredProducts = availableProducts.filter((p) => {
    const term = searchQuery.toLowerCase().trim();
    if (!term) return true;
    return (
      p.name.toLowerCase().includes(term) ||
      p.brand.name.toLowerCase().includes(term) ||
      (p.code && p.code.toLowerCase().includes(term))
    );
  });

  // Handle clicks outside the product/client dropdowns to close them
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
      if (
        clientDropdownRef.current &&
        !clientDropdownRef.current.contains(e.target as Node)
      ) {
        setIsClientDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Set quantity input and clamp to max stock if needed
  const handleQuantityChange = (val: string) => {
    let num = parseInt(val) || 0;
    if (selectedProduct) {
      if (num > selectedProduct.stock) {
        num = selectedProduct.stock;
        toast.warning(
          `Cantidad limitada al stock máximo disponible (${selectedProduct.stock} unidades).`,
        );
      }
    }
    setQtyInput(num.toString());
  };

  // Select product from search dropdown
  const handleSelectProduct = (prod: ProductOption) => {
    setSelectedProduct(prod);
    setPriceInput(prod.price.toString());
    setQtyInput("1");
    setIsDropdownOpen(false);
    setSearchQuery("");
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
        setClientId(createdClient.id.toString());
        setErrors((prev) => ({
          ...prev,
          clientId: "",
        }));
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

  // Add selected product to the sales table
  const handleAddItem = () => {
    if (!selectedProduct) {
      toast.error("Por favor selecciona un producto de la lista.");
      return;
    }

    const qtyToAdd = parseInt(qtyInput) || 0;
    const priceToSet = parseFloat(priceInput) || 0;

    if (qtyToAdd <= 0) {
      toast.error("La cantidad debe ser mayor a 0.");
      return;
    }

    if (priceToSet < 0) {
      toast.error("El precio unitario no puede ser negativo.");
      return;
    }

    // Check if the product already exists in the table
    const existingIndex = items.findIndex(
      (item) => item.productId === selectedProduct.id,
    );

    if (existingIndex > -1) {
      // Sum the quantities
      const newQty = items[existingIndex].quantity + qtyToAdd;
      if (newQty > selectedProduct.stock) {
        toast.warning(
          `Cantidad total ajustada al stock disponible (${selectedProduct.stock} uds). Tenías ${items[existingIndex].quantity} en la tabla.`,
        );
        setItems((prev) => {
          const next = [...prev];
          next[existingIndex] = {
            ...next[existingIndex],
            quantity: selectedProduct.stock,
            unitPrice: priceToSet,
          };
          return next;
        });
      } else {
        toast.success(
          `Se sumaron ${qtyToAdd} unidades del producto a la tabla.`,
        );
        setItems((prev) => {
          const next = [...prev];
          next[existingIndex] = {
            ...next[existingIndex],
            quantity: newQty,
            unitPrice: priceToSet,
          };
          return next;
        });
      }
    } else {
      // Add as a new row
      setItems((prev) => [
        ...prev,
        {
          productId: selectedProduct.id,
          name: selectedProduct.name,
          brand: selectedProduct.brand.name,
          code: selectedProduct.code,
          quantity: qtyToAdd,
          unitPrice: priceToSet,
          maxStock: selectedProduct.stock,
        },
      ]);
      toast.success("Producto agregado a la tabla de venta.");
    }

    // Clear product selector panel
    setSelectedProduct(null);
    setQtyInput("1");
    setPriceInput("");
    setErrors((prev) => {
      const next = { ...prev };
      delete next.items;
      return next;
    });
  };

  // Remove a product row
  const handleRemoveItem = (productId: number) => {
    setItems((prev) => prev.filter((item) => item.productId !== productId));
  };

  // Adjust quantity in table row (+ / - controls)
  const handleAdjustQuantity = (productId: number, delta: number) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.productId === productId) {
          const newQty = item.quantity + delta;
          if (newQty < 1) return item; // Minimum 1
          if (newQty > item.maxStock) {
            toast.warning(
              `Cantidad máxima alcanzada para este producto (${item.maxStock} uds).`,
            );
            return item;
          }
          return { ...item, quantity: newQty };
        }
        return item;
      }),
    );
  };

  // Calculations
  const subtotal = items.reduce(
    (sum, item) => sum + item.quantity * item.unitPrice,
    0,
  );
  const discount = parseFloat(discountInput) || 0;
  const total = Math.max(0, subtotal - discount);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const formData = {
      clientId: Number(clientId) || 0,
      discount,
      notes: notesInput || null,
      items: items.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
      })),
    };

    // Client Validation
    const validation = directSaleSchema.safeParse(formData);
    if (!validation.success) {
      const fieldErrors: Record<string, string> = {};
      validation.error.issues.forEach((issue) => {
        if (issue.path[0] === "items") {
          fieldErrors.items = issue.message;
        } else {
          fieldErrors[issue.path[0] as string] = issue.message;
        }
      });
      setErrors(fieldErrors);
      toast.error("Por favor corrige los errores del formulario.");
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await createDirectSaleAction(validation.data);
      if (res.success) {
        toast.success(res.message);
        router.push("/admin/ventas");
      } else {
        toast.error(res.message);
      }
    } catch (error: any) {
      toast.error(error.message || "Ocurrió un error al registrar la venta.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Registrar Nueva Venta Directa"
        subtitle="Registra ventas directas para clientes con stock disponible."
        breadcrumbs={[
          { label: "admin", href: "/admin" },
          { label: "ventas", href: "/admin/ventas" },
          { label: "nueva venta" },
        ]}
        action={
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/admin/ventas")}
            className="flex items-center gap-2 border-border-strong text-text-primary hover:bg-bg-surface"
          >
            <FiArrowLeft className="w-4 h-4" />
            Volver al listado
          </Button>
        }
      />

      <Form onSubmit={handleSubmit} noValidate className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left/Main Column: Search panel & Items list */}
          <div className="lg:col-span-2 space-y-6">
            {/* Search and Selector Panel */}
            <div className="bg-bg-card border border-border-default/80 rounded-2xl p-6 shadow-xs space-y-5">
              <h3 className="text-sm font-bold text-text-primary border-b border-border-soft pb-3 select-none flex items-center gap-2">
                <span className="w-1.5 h-4 bg-beauty-500 rounded-full"></span>
                Buscador de Productos
              </h3>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 items-end">
                {/* Search Autocomplete Combobox */}
                <div className="col-span-2 relative" ref={dropdownRef}>
                  <FormField label="Seleccionar Producto">
                    <button
                      type="button"
                      onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                      className={cn(
                        "w-full px-4 py-3 rounded-2xl border text-sm bg-bg-card text-text-primary transition-all duration-200 outline-none flex items-center justify-between text-left cursor-pointer select-none",
                        "border-border-strong/40 focus:border-beauty-400 focus:ring-4 focus:ring-beauty-400/10",
                        isDropdownOpen &&
                          "border-beauty-400 ring-4 ring-beauty-400/10",
                      )}
                    >
                      <div className="flex items-center gap-2 truncate min-w-0">
                        {selectedProduct ? (
                          <>
                            <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-beauty-400/10 text-beauty-600 dark:bg-beauty-400/20 dark:text-beauty-400 shrink-0 uppercase tracking-wider">
                              {selectedProduct.brand.name}
                            </span>
                            <span className="font-semibold text-text-primary truncate">
                              {selectedProduct.name}
                            </span>
                          </>
                        ) : (
                          <span className="text-text-tertiary">
                            Seleccione un producto...
                          </span>
                        )}
                      </div>
                      <FiChevronDown
                        className={cn(
                          "w-4 h-4 text-text-tertiary transition-transform duration-250 shrink-0 ml-2",
                          isDropdownOpen && "rotate-180",
                        )}
                      />
                    </button>

                    {/* Autocomplete Dropdown List */}
                    {isDropdownOpen && (
                      <div className="absolute left-0 right-0 top-full mt-2 z-50 bg-bg-card border border-border-default rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-72 animate-in fade-in zoom-in-95 duration-150">
                        {/* Buscador de Producto Interno */}
                        <div className="p-2 border-b border-border-soft">
                          <div className="relative flex items-center">
                            <FiSearch className="absolute left-3 text-text-tertiary w-3.5 h-3.5" />
                            <input
                              type="text"
                              placeholder="Buscar por nombre o código..."
                              value={searchQuery}
                              onChange={(e) => setSearchQuery(e.target.value)}
                              className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-border-strong/40 bg-bg-surface text-text-primary focus:border-beauty-400 outline-none transition-all"
                              autoFocus
                            />
                          </div>
                        </div>

                        {/* Lista de productos */}
                        <div className="overflow-y-auto p-1.5 space-y-1 scrollbar-thin scrollbar-thumb-stone-300 dark:scrollbar-thumb-zinc-700">
                          {filteredProducts.length === 0 ? (
                            <div className="px-4 py-3 text-xs text-text-tertiary text-center select-none">
                              No se encontraron productos con stock
                            </div>
                          ) : (
                            filteredProducts.map((p) => {
                              const isSelected = selectedProduct?.id === p.id;
                              return (
                                <button
                                  key={p.id}
                                  type="button"
                                  onClick={() => handleSelectProduct(p)}
                                  className={cn(
                                    "w-full px-3 py-2.5 rounded-xl text-xs text-left flex items-center justify-between cursor-pointer transition-colors select-none",
                                    isSelected
                                      ? "bg-beauty-400/10 text-beauty-600 dark:bg-beauty-400/15 dark:text-beauty-400 font-semibold"
                                      : "text-text-secondary hover:bg-beauty-400/10 hover:text-beauty-600 dark:hover:bg-beauty-400/15 dark:hover:text-beauty-400",
                                  )}
                                >
                                  <span className="flex flex-col min-w-0">
                                    <span className="font-semibold text-text-primary block truncate">
                                      {p.name}
                                    </span>
                                    <span className="flex items-center gap-1.5 mt-1 select-none">
                                      <span className="px-1.5 py-0.5 rounded bg-beauty-400/10 text-beauty-600 dark:bg-beauty-400/20 dark:text-beauty-400 text-[9px] font-bold">
                                        {p.brand.name}
                                      </span>
                                      {p.code && (
                                        <span className="font-mono text-[9px] text-text-tertiary">
                                          #{p.code}
                                        </span>
                                      )}
                                      <span
                                        className={cn(
                                          "text-[9px] font-semibold px-1 py-0.5 rounded",
                                          p.stock <= 2
                                            ? "bg-danger-bg text-danger-text"
                                            : "bg-bg-surface text-text-secondary",
                                        )}
                                      >
                                        Stock: {p.stock} uds
                                      </span>
                                    </span>
                                  </span>
                                  {isSelected ? (
                                    <FiCheck className="w-3.5 h-3.5 text-beauty-400 shrink-0 ml-2" />
                                  ) : (
                                    <span className="text-xs font-bold text-text-primary font-mono ml-2">
                                      S/ {p.price.toFixed(2)}
                                    </span>
                                  )}
                                </button>
                              );
                            })
                          )}
                        </div>
                      </div>
                    )}
                  </FormField>
                </div>

                {/* Quantity input */}
                <div className="w-full">
                  <FormField label="Cantidad">
                    <Input
                      type="number"
                      min="1"
                      value={qtyInput}
                      onChange={(e) => handleQuantityChange(e.target.value)}
                      disabled={!selectedProduct}
                      placeholder="Cantidad"
                    />
                  </FormField>
                </div>

                {/* Unit price input */}
                <div className="w-full">
                  <FormField label="Precio Unitario">
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      value={priceInput}
                      onChange={(e) =>
                        setPriceInput(
                          Math.max(
                            0,
                            parseFloat(e.target.value) || 0,
                          ).toString(),
                        )
                      }
                      disabled={!selectedProduct}
                      placeholder="Precio"
                    />
                  </FormField>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-3 border-t border-border-soft/60">
                {selectedProduct ? (
                  <div className="flex-1 min-w-50 p-3 py-2.5 rounded-xl bg-bg-surface border border-border-default/60 flex flex-row items-center justify-between gap-4 shadow-inner select-none">
                    <div className="flex flex-col gap-0.5 min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="px-1.5 py-0.5 rounded text-[8px] font-bold bg-beauty-400/10 text-beauty-600 dark:bg-beauty-400/20 dark:text-beauty-400 uppercase tracking-wider">
                          {selectedProduct.brand.name}
                        </span>
                        {selectedProduct.code && (
                          <span className="font-mono text-[9px] text-text-tertiary">
                            #{selectedProduct.code}
                          </span>
                        )}
                      </div>
                      <h4 className="text-xs font-bold text-text-primary truncate">
                        {selectedProduct.name}
                      </h4>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      {/* Precio sugerido */}
                      <div className="flex flex-col text-right">
                        <span className="text-[8px] text-text-tertiary uppercase font-bold tracking-wider">
                          P. Catálogo
                        </span>
                        <span className="font-mono text-xs font-bold text-text-primary">
                          S/ {selectedProduct.price.toFixed(2)}
                        </span>
                      </div>

                      {/* Line Separator */}
                      <div className="h-6 w-px bg-border-soft"></div>

                      {/* Stock badge */}
                      <div className="flex flex-col">
                        <span className="text-[8px] text-text-tertiary uppercase font-bold tracking-wider font-sans">
                          Stock
                        </span>
                        <span
                          className={cn(
                            "text-xs font-bold font-mono",
                            selectedProduct.stock <= 2
                              ? "text-danger-text"
                              : "text-emerald-600 dark:text-emerald-400",
                          )}
                        >
                          {selectedProduct.stock} uds
                        </span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-text-tertiary italic select-none flex-1">
                    Selecciona un producto para habilitar la cantidad y precio.
                  </p>
                )}

                <Button
                  type="button"
                  variant="primary"
                  onClick={handleAddItem}
                  disabled={!selectedProduct}
                  className="px-5 py-2.5 rounded-xl flex items-center gap-1.5 text-xs font-semibold shrink-0 cursor-pointer self-end sm:self-auto hover:scale-[1.02] active:scale-[0.98] transition-transform duration-200"
                >
                  <FiPlus className="w-4 h-4" />
                  Agregar
                </Button>
              </div>
            </div>

            {/* Table of selected products */}
            <div className="bg-bg-card border border-border-default/80 rounded-2xl p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-border-soft pb-3 select-none">
                <h3 className="text-sm font-bold text-text-primary flex items-center gap-2">
                  <span className="w-1.5 h-4 bg-beauty-500 rounded-full"></span>
                  Artículos en la Venta
                </h3>
                <span className="px-2.5 py-1 rounded-full text-xs text-text-secondary font-semibold bg-bg-surface border border-border-default/50">
                  {(() => {
                    const totalQty = items.reduce(
                      (sum, item) => sum + item.quantity,
                      0,
                    );
                    return `${totalQty} ${totalQty === 1 ? "ud." : "uds."}`;
                  })()}
                </span>
              </div>

              {errors.items && (
                <p className="text-xs font-semibold text-danger-text select-none">
                  {errors.items}
                </p>
              )}

              {items.length === 0 ? (
                <div className="py-16 text-center border border-dashed border-border-default/60 rounded-xl bg-bg-surface/10 select-none flex flex-col items-center justify-center">
                  <div className="w-12 h-12 rounded-2xl bg-beauty-400/10 text-beauty-500 flex items-center justify-center mb-4">
                    <FiShoppingBag className="w-6 h-6 animate-pulse" />
                  </div>
                  <h4 className="text-sm font-bold text-text-primary mb-1">
                    Aún no hay productos agregados
                  </h4>
                  <p className="text-xs text-text-tertiary max-w-xs leading-relaxed">
                    Selecciona un producto y presiona el botón para añadirlo a
                    la lista de artículos.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-162.5 text-left text-xs sm:text-sm border-collapse">
                    <thead>
                      <tr className="border-b border-border-soft/60 text-text-tertiary font-bold uppercase select-none text-[10px] tracking-wider">
                        <th className="py-3 pl-2">Producto</th>
                        <th className="py-3 text-center w-36">Cantidad</th>
                        <th className="py-3 text-right w-32">
                          Precio Unitario
                        </th>
                        <th className="py-3 text-right w-32">Subtotal</th>
                        <th className="py-3 text-center w-20">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border-soft/40">
                      {items.map((item) => (
                        <tr
                          key={item.productId}
                          className="hover:bg-bg-surface/10 transition-colors"
                        >
                          {/* Product Details */}
                          <td className="py-4 pl-2">
                            <div className="min-w-45">
                              <span className="font-semibold text-text-primary block text-sm">
                                {item.name}
                              </span>
                              <div className="flex items-center gap-1.5 mt-1 select-none">
                                <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-beauty-400/10 text-beauty-600 dark:bg-beauty-400/25 dark:text-beauty-400">
                                  {item.brand}
                                </span>
                                {item.code && (
                                  <span className="text-[10px] text-text-tertiary font-mono">
                                    #{item.code}
                                  </span>
                                )}
                              </div>
                            </div>
                          </td>

                          {/* Quantity +/- Controls */}
                          <td className="py-4">
                            <div className="flex items-center justify-center gap-1 bg-bg-surface border border-border-default/50 dark:border-white/10 rounded-xl p-1 w-28 mx-auto select-none">
                              <ButtonIcon
                                icon={FiMinus}
                                variant="secondary"
                                onClick={() =>
                                  handleAdjustQuantity(item.productId, -1)
                                }
                                disabled={item.quantity <= 1}
                                className="p-1.5 rounded-lg hover:scale-[1] active:scale-[1]"
                                title="Reducir"
                              />
                              <span className="font-mono font-bold text-xs flex-1 text-center text-text-primary">
                                {item.quantity}
                              </span>
                              <ButtonIcon
                                icon={FiPlus}
                                variant="secondary"
                                onClick={() =>
                                  handleAdjustQuantity(item.productId, 1)
                                }
                                disabled={item.quantity >= item.maxStock}
                                className="p-1.5 rounded-lg hover:scale-[1] active:scale-[1]"
                                title="Aumentar"
                              />
                            </div>
                          </td>

                          {/* Unit price */}
                          <td className="py-4 text-right font-mono text-text-secondary font-medium">
                            S/ {item.unitPrice.toFixed(2)}
                          </td>

                          {/* Subtotal */}
                          <td className="py-4 text-right font-mono font-bold text-text-primary">
                            S/ {(item.quantity * item.unitPrice).toFixed(2)}
                          </td>

                          {/* Delete Item */}
                          <td className="py-4 text-center">
                            <ButtonIcon
                              icon={FiTrash2}
                              variant="danger"
                              onClick={() => handleRemoveItem(item.productId)}
                              title="Quitar de la venta"
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          {/* Right/Sidebar Column: Client & Total */}
          <div className="space-y-6">
            <div className="bg-bg-card border border-border-default/80 rounded-2xl p-6 shadow-xs space-y-5">
              <h3 className="text-sm font-bold text-text-primary border-b border-border-soft pb-3 select-none flex items-center gap-2">
                <span className="w-1.5 h-4 bg-beauty-500 rounded-full"></span>
                Datos de la Venta
              </h3>

              {/* Client Selection */}
              <FormField label="Cliente" error={errors.clientId}>
                <div className="flex gap-2 w-full">
                  <div ref={clientDropdownRef} className="flex-1 relative">
                    <button
                      type="button"
                      onClick={() =>
                        setIsClientDropdownOpen(!isClientDropdownOpen)
                      }
                      className={cn(
                        "w-full px-4 py-3 rounded-2xl border text-sm bg-bg-card text-text-primary transition-all duration-200 outline-none flex items-center justify-between text-left cursor-pointer select-none",
                        "border-border-strong/40 focus:border-beauty-400 focus:ring-4 focus:ring-beauty-400/10",
                        isClientDropdownOpen &&
                          "border-beauty-400 ring-4 ring-beauty-400/10",
                        errors.clientId &&
                          "border-danger-text focus:border-danger-text focus:ring-danger-text/10",
                      )}
                    >
                      <div className="flex items-center gap-2 truncate min-w-0">
                        {selectedClient ? (
                          <>
                            <FiUser className="w-4 h-4 text-beauty-500 shrink-0" />
                            <span className="font-semibold text-text-primary truncate">
                              {selectedClient.name}
                            </span>
                          </>
                        ) : (
                          <span className="text-text-tertiary">
                            Seleccione el cliente...
                          </span>
                        )}
                      </div>
                      <FiChevronDown
                        className={cn(
                          "w-4 h-4 text-text-tertiary transition-transform duration-250 shrink-0 ml-2",
                          isClientDropdownOpen && "rotate-180",
                        )}
                      />
                    </button>

                    {isClientDropdownOpen && (
                      <div className="absolute left-0 right-0 top-full mt-2 z-50 bg-bg-card border border-border-default rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-72 animate-in fade-in zoom-in-95 duration-150">
                        {/* Buscador de Cliente Interno */}
                        <div className="p-2 border-b border-border-soft">
                          <div className="relative flex items-center">
                            <FiSearch className="absolute left-3 text-text-tertiary w-3.5 h-3.5" />
                            <input
                              type="text"
                              placeholder="Buscar por nombre..."
                              value={clientSearchQuery}
                              onChange={(e) =>
                                setClientSearchQuery(e.target.value)
                              }
                              className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-border-strong/40 bg-bg-surface text-text-primary focus:border-beauty-400 outline-none transition-all"
                              autoFocus
                            />
                          </div>
                        </div>

                        {/* Lista de clientes */}
                        <div className="overflow-y-auto p-1.5 space-y-1 scrollbar-thin scrollbar-thumb-stone-300 dark:scrollbar-thumb-zinc-700">
                          {filteredClients.length === 0 ? (
                            <div className="px-4 py-3 text-xs text-text-tertiary text-center select-none">
                              No se encontraron clientes
                            </div>
                          ) : (
                            filteredClients.map((c) => {
                              const isSelected = selectedClient?.id === c.id;
                              return (
                                <button
                                  key={c.id}
                                  type="button"
                                  onClick={() => {
                                    setClientId(c.id.toString());
                                    setIsClientDropdownOpen(false);
                                    setClientSearchQuery("");
                                    setErrors((prev) => ({
                                      ...prev,
                                      clientId: "",
                                    }));
                                  }}
                                  className={cn(
                                    "w-full px-3 py-2.5 rounded-xl text-xs text-left flex items-center justify-between cursor-pointer transition-colors select-none",
                                    isSelected
                                      ? "bg-beauty-400/10 text-beauty-600 dark:bg-beauty-400/15 dark:text-beauty-400 font-semibold"
                                      : "text-text-secondary hover:bg-beauty-400/10 hover:text-beauty-600 dark:hover:bg-beauty-400/15 dark:hover:text-beauty-400",
                                  )}
                                >
                                  <span className="truncate">{c.name}</span>
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
              </FormField>

              {/* Discount Input */}
              <FormField label="Descuento Global (S/)" error={errors.discount}>
                <Input
                  type="number"
                  step="0.1"
                  min="0"
                  value={discountInput}
                  onChange={(e) => setDiscountInput(e.target.value)}
                  placeholder="0.00"
                />
              </FormField>

              {/* Notes */}
              <FormField label="Observaciones / Notas" error={errors.notes}>
                <Textarea
                  value={notesInput}
                  onChange={(e) => setNotesInput(e.target.value)}
                  placeholder="Ej. Entregado en oficina, pago pendiente..."
                  rows={3}
                />
              </FormField>

              {/* Totals panel */}
              <div className="bg-bg-surface/50 border border-border-default/50 rounded-2xl p-4 space-y-2.5 shadow-inner">
                <div className="flex items-center justify-between text-xs text-text-secondary select-none font-medium">
                  <span>Subtotal</span>
                  <span className="font-mono font-semibold">
                    S/ {subtotal.toFixed(2)}
                  </span>
                </div>
                {discount > 0 && (
                  <div className="flex items-center justify-between text-xs text-text-secondary select-none font-medium">
                    <span>Descuento</span>
                    <span className="font-mono font-bold text-danger-text">
                      -S/ {discount.toFixed(2)}
                    </span>
                  </div>
                )}
                <div className="border-t border-border-soft/60 pt-2.5 flex items-center justify-between select-none">
                  <span className="text-sm font-bold text-text-primary">
                    Total a Cobrar
                  </span>
                  <span className="font-mono font-extrabold text-lg text-beauty-600 dark:text-beauty-400">
                    S/ {total.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex flex-col gap-2 pt-2">
                <Button
                  type="submit"
                  loading={isSubmitting}
                  className="w-full py-3 text-sm font-bold shadow-md rounded-xl cursor-pointer hover:scale-[1.01] transition-transform duration-150"
                >
                  Confirmar Venta
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push("/admin/ventas")}
                  disabled={isSubmitting}
                  className="w-full border-border-strong text-text-secondary hover:bg-bg-surface/40 rounded-xl cursor-pointer"
                >
                  Cancelar
                </Button>
              </div>
            </div>
          </div>
        </div>
      </Form>

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
          <FormField
            label="Nombre Completo"
            required
            error={newClientNameError || undefined}
          >
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

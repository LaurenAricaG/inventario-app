"use client";

import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import Button from "@/components/ui/Button";
import Form, { FormField } from "@/components/ui/Form";
import Input from "@/components/ui/Input";
import Modal from "@/components/ui/Modal";
import Select from "@/components/ui/Select";
import Textarea from "@/components/ui/Textarea";
import { cn } from "@/utils/cn.utils";
import { FiChevronDown, FiSearch, FiCheck } from "react-icons/fi";
import { createStockMovementAction } from "@/lib/stockmovement";
import { stockMovementSchema } from "@/lib/stockmovement/schema";

interface ActiveProduct {
  id: number;
  name: string;
  code: string | null;
  stock: number;
  brand: {
    id: number;
    name: string;
  };
  images: {
    id: number;
    url: string;
    isMain: boolean;
    position: number;
  }[];
}

interface FormInventoryProps {
  isOpen: boolean;
  onClose: () => void;
  products: ActiveProduct[];
}

const reasonsByType = {
  INPUT: [
    { value: "PURCHASE", label: "Compra (Ingreso de mercadería)" },
    { value: "RETURN", label: "Devolución de cliente" },
    { value: "LOAN", label: "Retorno de préstamo (Ingreso)" },
    { value: "GIFT", label: "Obsequio / Regalo recibido" },
    { value: "ADJUSTMENT", label: "Ajuste de inventario (Manual)" },
  ],
  OUTPUT: [
    { value: "LOAN", label: "Préstamo de producto (Salida)" },
    { value: "PERSONAL_USE", label: "Uso Personal" },
    { value: "LOSS_OR_DAMAGE", label: "Pérdida o Daño de producto" },
    { value: "GIFT", label: "Obsequio / Regalo a cliente" },
    { value: "ADJUSTMENT", label: "Ajuste de inventario (Manual)" },
  ],
};

export default function FormInventory({
  isOpen,
  onClose,
  products,
}: FormInventoryProps) {
  const [productIdInput, setProductIdInput] = useState("");
  const [typeInput, setTypeInput] = useState<"INPUT" | "OUTPUT">("INPUT");
  const [reasonInput, setReasonInput] = useState("PURCHASE");
  const [quantityInput, setQuantityInput] = useState("");
  const [notesInput, setNotesInput] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{
    brandId?: string;
    productId?: string;
    quantity?: string;
    type?: string;
    reason?: string;
    notes?: string;
  }>({});

  // Buscador y desplegable personalizado
  const [selectedBrandId, setSelectedBrandId] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Obtener producto seleccionado actual para mostrar su stock disponible
  const selectedProduct = products.find((p) => p.id === Number(productIdInput));

  // Obtener marcas únicas de los productos activos
  const brandsList = Array.from(
    new Map(products.map((p) => [p.brand.id, p.brand])).values()
  ).sort((a, b) => a.name.localeCompare(b.name));

  // Reiniciar estado del formulario cuando se abre o cierra
  useEffect(() => {
    if (isOpen) {
      setProductIdInput("");
      setSelectedBrandId("");
      setTypeInput("INPUT");
      setReasonInput("PURCHASE");
      setQuantityInput("");
      setNotesInput("");
      setErrors({});
      setSearchQuery("");
      setIsDropdownOpen(false);
    }
  }, [isOpen]);

  // Cerrar desplegable al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Filtrar productos de la marca seleccionada
  const productsOfBrand = products.filter(
    (p) => p.brand.id.toString() === selectedBrandId
  );

  // Filtrar productos por término de búsqueda (nombre o código)
  const filteredProducts = productsOfBrand.filter((p) => {
    const term = searchQuery.toLowerCase().trim();
    if (!term) return true;
    return (
      p.name.toLowerCase().includes(term) ||
      (p.code && p.code.toLowerCase().includes(term))
    );
  });

  // Cambiar el motivo por defecto cuando cambia el tipo de movimiento
  const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value as "INPUT" | "OUTPUT";
    setTypeInput(val);
    if (val === "INPUT") {
      setReasonInput("PURCHASE");
    } else {
      setReasonInput("LOAN");
    }
    // Limpiar error de tipo si existe
    setErrors((prev) => ({ ...prev, type: undefined, reason: undefined }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const fieldErrors: typeof errors = {};
    if (!selectedBrandId) {
      fieldErrors.brandId = "Debes seleccionar una marca.";
    }

    // Validaciones del cliente antes de enviar
    const validation = stockMovementSchema.safeParse({
      productId: productIdInput,
      quantity: quantityInput,
      type: typeInput,
      reason: reasonInput,
      notes: notesInput,
    });

    if (!validation.success || !selectedBrandId) {
      if (!validation.success) {
        validation.error.issues.forEach((issue) => {
          const path = issue.path[0];
          if (path === "productId") {
            fieldErrors.productId = selectedBrandId
              ? "Debes seleccionar un producto de la marca."
              : "Debes seleccionar primero una marca y luego un producto.";
          }
          if (path === "quantity") fieldErrors.quantity = issue.message;
          if (path === "type") fieldErrors.type = issue.message;
          if (path === "reason") fieldErrors.reason = issue.message;
          if (path === "notes") fieldErrors.notes = issue.message;
        });
      }
      setErrors(fieldErrors);
      return;
    }

    // Validación extra de stock máximo disponible para salidas
    if (typeInput === "OUTPUT" && selectedProduct) {
      const qty = Number(quantityInput);
      if (qty > selectedProduct.stock) {
        setErrors((prev) => ({
          ...prev,
          quantity: `Stock insuficiente. Solo hay ${selectedProduct.stock} unidades en existencia.`,
        }));
        return;
      }
    }

    setErrors({});
    setIsSubmitting(true);

    try {
      const res = await createStockMovementAction(validation.data);
      if (res.success) {
        toast.success(res.message);
        onClose();
      } else {
        toast.error(res.message);
        // Si el servidor retorna un error específico de stock, lo mostramos en cantidad
        if (res.message.toLowerCase().includes("stock")) {
          setErrors((prev) => ({ ...prev, quantity: res.message }));
        } else {
          setErrors((prev) => ({ ...prev, notes: res.message }));
        }
      }
    } catch (error: any) {
      toast.error(
        error.message || "Ocurrió un error inesperado al procesar el ajuste de stock."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Ajustar Stock (Kardex)"
      size="md"
      footer={
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isSubmitting}
            className="border-border-strong text-text-primary hover:bg-bg-surface"
          >
            Cancelar
          </Button>
          <Button
            variant="primary"
            form="stockmovement-form"
            type="submit"
            loading={isSubmitting}
          >
            Guardar
          </Button>
        </div>
      }
    >
      <Form id="stockmovement-form" onSubmit={handleSubmit} noValidate>
        {/* Seleccionar Marca */}
        <FormField label="Seleccionar Marca" error={errors.brandId}>
          <Select
            value={selectedBrandId}
            onChange={(e) => {
              setSelectedBrandId(e.target.value);
              setProductIdInput("");
              setSearchQuery("");
              setErrors((prev) => ({ ...prev, brandId: undefined, productId: undefined }));
            }}
            error={errors.brandId}
            placeholder="Seleccione una marca..."
            disabled={isSubmitting}
          >
            <option value="">Seleccione una marca...</option>
            {brandsList.map((b) => (
              <option key={b.id} value={b.id.toString()}>
                {b.name}
              </option>
            ))}
          </Select>
        </FormField>

        {/* Selector de Producto */}
        <FormField
          label="Seleccionar Producto"
        >
          <div ref={dropdownRef} className="w-full relative">
            <button
              type="button"
              disabled={!selectedBrandId || isSubmitting}
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className={cn(
                "w-full px-4 py-3 rounded-2xl border text-sm bg-bg-card text-text-primary transition-all duration-200 outline-none flex items-center justify-between text-left cursor-pointer select-none",
                "border-border-strong/40 focus:border-beauty-400 focus:ring-4 focus:ring-beauty-400/10",
                "disabled:opacity-50 disabled:bg-bg-surface disabled:cursor-not-allowed",
                isDropdownOpen && "border-beauty-400 ring-4 ring-beauty-400/10",
                errors.productId &&
                  "border-danger-text focus:border-danger-text focus:ring-danger-text/10"
              )}
            >
              <span className="truncate">
                {selectedProduct
                  ? `${selectedProduct.name} ${selectedProduct.code ? `[${selectedProduct.code}]` : ""}`
                  : !selectedBrandId
                    ? "Selecciona primero una marca..."
                    : "Seleccione un producto..."}
              </span>
              <FiChevronDown
                className={cn(
                  "w-4 h-4 text-text-tertiary transition-transform duration-250 shrink-0 ml-2",
                  isDropdownOpen && "rotate-180"
                )}
              />
            </button>

            {isDropdownOpen && (
              <div className="absolute left-0 right-0 z-40 mt-2 bg-bg-card border border-border-default rounded-2xl shadow-xl shadow-black/5 dark:shadow-black/20 overflow-hidden animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-72">
                {/* Buscador de Producto */}
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
                <div className="overflow-y-auto p-1.5 space-y-1">
                  {filteredProducts.length === 0 ? (
                    <div className="px-4 py-3 text-xs text-text-tertiary text-center select-none">
                      No se encontraron productos
                    </div>
                  ) : (
                    filteredProducts.map((p) => {
                      const isSelected = p.id === Number(productIdInput);
                      return (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => {
                            setProductIdInput(p.id.toString());
                            setIsDropdownOpen(false);
                            setSearchQuery("");
                            setErrors((prev) => ({ ...prev, productId: undefined }));
                          }}
                          className={cn(
                            "w-full px-3 py-2 rounded-xl text-xs text-left flex items-center justify-between cursor-pointer transition-colors select-none",
                            isSelected
                              ? "bg-beauty-400/10 text-beauty-600 dark:bg-beauty-400/15 dark:text-beauty-400 font-semibold"
                              : "text-text-secondary dark:text-text-primary/85 hover:bg-beauty-400/10 hover:text-beauty-600 dark:hover:bg-beauty-400/15 dark:hover:text-beauty-400"
                          )}
                        >
                          <span className="flex flex-col">
                            <span className="font-medium text-text-primary/90">{p.name}</span>
                            <span className="text-[10px] text-text-tertiary">
                              {p.code ? `Cód: ${p.code} • ` : ""}Stock actual: {p.stock} uds
                            </span>
                          </span>
                          {isSelected && (
                            <FiCheck className="w-3.5 h-3.5 text-beauty-400 shrink-0" />
                          )}
                        </button>
                      );
                    })
                  )}
                </div>
              </div>
            )}
            {errors.productId && (
              <p className="mt-1.5 text-xs font-medium text-danger-text select-none animate-fade-in">
                {errors.productId}
              </p>
            )}
          </div>
          {selectedProduct ? (
            <span className="text-[11px] text-text-secondary mt-1.5 block">
              Stock actual en sistema: <strong className="font-semibold text-text-primary">{selectedProduct.stock}</strong> unidades.
            </span>
          ) : (
            <span className="text-[11px] text-text-tertiary mt-1.5 block">
              {!selectedBrandId ? "Selecciona primero una marca para habilitar el listado" : "Selecciona el producto a ajustar"}
            </span>
          )}
        </FormField>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Tipo de Movimiento */}
          <FormField label="Tipo de Movimiento">
            <Select
              value={typeInput}
              onChange={handleTypeChange}
              error={errors.type}
              disabled={isSubmitting}
            >
              <option value="INPUT">Entrada (+)</option>
              <option value="OUTPUT">Salida (-)</option>
            </Select>
          </FormField>

          {/* Motivo */}
          <FormField label="Motivo del Ajuste">
            <Select
              value={reasonInput}
              onChange={(e) => {
                setReasonInput(e.target.value);
                setErrors((prev) => ({ ...prev, reason: undefined }));
              }}
              error={errors.reason}
              disabled={isSubmitting}
            >
              {reasonsByType[typeInput].map((r) => (
                <option key={r.value} value={r.value}>
                  {r.label}
                </option>
              ))}
            </Select>
          </FormField>
        </div>

        {/* Cantidad */}
        <FormField label="Cantidad de Unidades">
          <Input
            type="number"
            min="1"
            step="1"
            placeholder="Ej. 10"
            value={quantityInput}
            onChange={(e) => {
              setQuantityInput(e.target.value);
              setErrors((prev) => ({ ...prev, quantity: undefined }));
            }}
            error={errors.quantity}
            disabled={isSubmitting}
          />
        </FormField>

        {/* Notas / Observaciones */}
        <FormField label="Notas / Justificación del Ajuste">
          <Textarea
            placeholder="Indica el motivo detallado de este ajuste (ej. compra factura #12, merma por caja rota, etc.)"
            value={notesInput}
            onChange={(e) => {
              setNotesInput(e.target.value);
              setErrors((prev) => ({ ...prev, notes: undefined }));
            }}
            error={errors.notes}
            disabled={isSubmitting}
          />
        </FormField>
      </Form>
    </Modal>
  );
}

"use client";

import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import Button from "@/components/ui/Button";
import Form, { FormField } from "@/components/ui/Form";
import Input from "@/components/ui/Input";
import Modal from "@/components/ui/Modal";
import Select from "@/components/ui/Select";
import Textarea from "@/components/ui/Textarea";
import Checkbox from "@/components/ui/Checkbox";
import MultiImageUpload, {
  UploadedImage,
} from "@/components/ui/MultiImageUpload";
import { createProductAction, updateProductAction } from "@/lib/product";
import { productSchema } from "@/lib/product/schema";
import { ProductWithRelations } from "@/types/models";

interface FormProductsProps {
  isOpen: boolean;
  onClose: () => void;
  product: ProductWithRelations | null;
  brands: { id: number; name: string }[];
  categories: { id: number; name: string }[];
  genders: { id: number; name: string }[];
}

export default function FormProducts({
  isOpen,
  onClose,
  product,
  brands,
  categories,
  genders,
}: FormProductsProps) {
  const nameInputRef = useRef<HTMLInputElement>(null);

  const [nameInput, setNameInput] = useState("");
  const [codeInput, setCodeInput] = useState("");
  const [brandIdInput, setBrandIdInput] = useState("");
  const [categoryIdInput, setCategoryIdInput] = useState("");
  const [genderSegmentIdInput, setGenderSegmentIdInput] = useState("");
  const [descriptionInput, setDescriptionInput] = useState("");
  const [priceInput, setPriceInput] = useState("");
  const [costPriceInput, setCostPriceInput] = useState("");
  const [catalogPriceInput, setCatalogPriceInput] = useState("");
  const [stockInput, setStockInput] = useState("0");
  const [isAvailableInput, setIsAvailableInput] = useState(true);
  const [imagesInput, setImagesInput] = useState<UploadedImage[]>([]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Sync state with active product
  useEffect(() => {
    if (isOpen) {
      setNameInput(product ? product.name : "");
      setCodeInput(product && product.code ? product.code : "");
      setBrandIdInput(product ? String(product.brandId) : "");
      setCategoryIdInput(product ? String(product.categoryId) : "");
      setGenderSegmentIdInput(
        product && product.genderSegmentId
          ? String(product.genderSegmentId)
          : "",
      );
      setDescriptionInput(
        product && product.description ? product.description : "",
      );
      setPriceInput(product ? String(product.price) : "");
      setCostPriceInput(
        product && product.costPrice !== null ? String(product.costPrice) : "",
      );
      setCatalogPriceInput(
        product && product.catalogPrice !== null ? String(product.catalogPrice) : "",
      );
      setStockInput(product ? String(product.stock) : "0");
      setIsAvailableInput(product ? product.isAvailable : true);
      setImagesInput(
        product && product.images
          ? product.images.map((img) => ({
              url: img.url,
              isMain: img.isMain,
              position: img.position,
            }))
          : [],
      );
      setErrors({});
    }
  }, [isOpen, product]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validación preliminar de todos los campos excepto imágenes para no subir archivos si el formulario es inválido
    const formFieldsValidation = productSchema
      .omit({ images: true })
      .safeParse({
        name: nameInput,
        brandId: brandIdInput ? parseInt(brandIdInput, 10) : undefined,
        categoryId: categoryIdInput ? parseInt(categoryIdInput, 10) : undefined,
        genderSegmentId: genderSegmentIdInput
          ? parseInt(genderSegmentIdInput, 10)
          : null,
        code: codeInput || null,
        description: descriptionInput || null,
        price: priceInput ? parseFloat(priceInput) : undefined,
        costPrice: costPriceInput ? parseFloat(costPriceInput) : null,
        catalogPrice: catalogPriceInput ? parseFloat(catalogPriceInput) : null,
        stock: parseFloat(stockInput),
        isAvailable: isAvailableInput,
      });

    if (!formFieldsValidation.success) {
      const fieldErrors: Record<string, string> = {};
      formFieldsValidation.error.issues.forEach((issue) => {
        const path = issue.path[0] as string;
        fieldErrors[path] = issue.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setErrors({});
    setIsSubmitting(true);

    try {
      const uploadedImages: {
        url: string;
        isMain: boolean;
        position: number;
      }[] = [];

      // Subir imágenes que sean archivos locales pendientes
      for (const img of imagesInput) {
        if (img.file) {
          const formData = new FormData();
          formData.append("file", img.file);
          formData.append("type", "product-image");

          const uploadResponse = await fetch("/api/upload", {
            method: "POST",
            body: formData,
          });

          if (!uploadResponse.ok) {
            const uploadData = await uploadResponse.json();
            throw new Error(
              uploadData.error || "Error al subir la imagen del producto.",
            );
          }

          const uploadData = await uploadResponse.json();
          uploadedImages.push({
            url: uploadData.url,
            isMain: img.isMain,
            position: img.position,
          });
        } else {
          uploadedImages.push({
            url: img.url,
            isMain: img.isMain,
            position: img.position,
          });
        }
      }

      // Estructurar el payload final para validación completa
      const finalPayload = {
        ...formFieldsValidation.data,
        images: uploadedImages,
      };

      const validation = productSchema.safeParse(finalPayload);
      if (!validation.success) {
        const fieldErrors: Record<string, string> = {};
        validation.error.issues.forEach((issue) => {
          const path = issue.path[0] as string;
          fieldErrors[path] = issue.message;
        });
        setErrors(fieldErrors);
        return;
      }

      let res;
      if (product) {
        res = await updateProductAction(product.id, validation.data);
      } else {
        res = await createProductAction(validation.data);
      }

      if (res.success) {
        toast.success(res.message);
        onClose();
      } else {
        toast.error(res.message);
        if (res.message.toLowerCase().includes("código")) {
          setErrors({ code: res.message });
        }
      }
    } catch (error: any) {
      toast.error(
        error.message || "Ocurrió un error inesperado al procesar el producto.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={product ? "Editar Producto" : "Crear Producto"}
      size="xl"
      className="max-w-4xl"
      initialFocusRef={nameInputRef}
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
            form="product-form"
            type="submit"
            loading={isSubmitting}
          >
            Guardar
          </Button>
        </div>
      }
    >
      <Form
        id="product-form"
        onSubmit={handleSubmit}
        className="space-y-4"
        noValidate
      >
        {/* Nombre del producto */}
        <FormField label="Nombre del Producto">
          <Input
            ref={nameInputRef}
            type="text"
            placeholder="Ej. Colonia Kaiak Masculina, Labial Matte Natura, etc."
            value={nameInput}
            onChange={(e) => {
              setNameInput(e.target.value);
              if (e.target.value.trim())
                setErrors((prev) => ({ ...prev, name: "" }));
            }}
            error={errors.name}
            disabled={isSubmitting}
          />
        </FormField>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Código de barras / SKU */}
          <FormField label="Código de Barras / Referencia">
            <Input
              type="text"
              placeholder="Ej. 110293, NAT-8902"
              value={codeInput}
              onChange={(e) => {
                setCodeInput(e.target.value);
                if (e.target.value.trim())
                  setErrors((prev) => ({ ...prev, code: "" }));
              }}
              error={errors.code}
              disabled={isSubmitting}
            />
          </FormField>

          {/* Stock */}
          <FormField label={product ? "Stock Actual" : "Stock Inicial"}>
            <Input
              type="number"
              min="0"
              placeholder="0"
              value={stockInput}
              onChange={(e) => {
                setStockInput(e.target.value);
                if (e.target.value.trim())
                  setErrors((prev) => ({ ...prev, stock: "" }));
              }}
              error={errors.stock}
              disabled={isSubmitting || product !== null}
            />
          </FormField>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Catálogo */}
          <FormField label="Catálogo" error={errors.brandId}>
            <Select
              value={brandIdInput}
              onChange={(e) => {
                setBrandIdInput(e.target.value);
                if (e.target.value)
                  setErrors((prev) => ({ ...prev, brandId: "" }));
              }}
              placeholder="Seleccionar..."
              disabled={isSubmitting}
              error={errors.brandId}
            >
              {brands.map((b) => (
                <option key={b.id} value={String(b.id)}>
                  {b.name}
                </option>
              ))}
            </Select>
          </FormField>

          {/* Categoría */}
          <FormField label="Categoría" error={errors.categoryId}>
            <Select
              value={categoryIdInput}
              onChange={(e) => {
                setCategoryIdInput(e.target.value);
                if (e.target.value)
                  setErrors((prev) => ({ ...prev, categoryId: "" }));
              }}
              placeholder="Seleccionar..."
              disabled={isSubmitting}
              error={errors.categoryId}
            >
              {categories.map((c) => (
                <option key={c.id} value={String(c.id)}>
                  {c.name}
                </option>
              ))}
            </Select>
          </FormField>

          {/* Segmento de Género */}
          <FormField label="Género (Opcional)" error={errors.genderSegmentId}>
            <Select
              value={genderSegmentIdInput}
              onChange={(e) => setGenderSegmentIdInput(e.target.value)}
              placeholder="Todos / Unisex..."
              disabled={isSubmitting}
              error={errors.genderSegmentId}
            >
              {genders.map((g) => (
                <option key={g.id} value={String(g.id)}>
                  {g.name}
                </option>
              ))}
            </Select>
          </FormField>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Precio de Catálogo */}
          <FormField label="Precio Catálogo (S/.) (Opcional)">
            <Input
              type="number"
              step="0.01"
              min="0"
              placeholder="0.00"
              value={catalogPriceInput}
              onChange={(e) => {
                setCatalogPriceInput(e.target.value);
                if (e.target.value.trim())
                  setErrors((prev) => ({ ...prev, catalogPrice: "" }));
              }}
              error={errors.catalogPrice}
              disabled={isSubmitting}
            />
          </FormField>

          {/* Precio de Venta */}
          <FormField label="Precio de Venta (S/.)">
            <Input
              type="number"
              step="0.01"
              min="0"
              placeholder="0.00"
              value={priceInput}
              onChange={(e) => {
                setPriceInput(e.target.value);
                if (e.target.value.trim())
                  setErrors((prev) => ({ ...prev, price: "" }));
              }}
              error={errors.price}
              disabled={isSubmitting}
            />
          </FormField>

          {/* Precio de Costo */}
          <FormField label="Precio de Costo (S/.) (Opcional)">
            <Input
              type="number"
              step="0.01"
              min="0"
              placeholder="0.00"
              value={costPriceInput}
              onChange={(e) => {
                setCostPriceInput(e.target.value);
                if (e.target.value.trim())
                  setErrors((prev) => ({ ...prev, costPrice: "" }));
              }}
              error={errors.costPrice}
              disabled={isSubmitting}
            />
          </FormField>
        </div>

        {/* Descripción */}
        <FormField label="Descripción del Producto (Opcional)">
          <Textarea
            error={errors.description}
            placeholder="Escribe detalles del producto, aroma, tamaño, precauciones..."
            value={descriptionInput}
            onChange={(e) => setDescriptionInput(e.target.value)}
            disabled={isSubmitting}
            rows={3}
          />
        </FormField>

        {/* Galería de Imágenes */}
        <FormField label="Galería de Imágenes">
          <MultiImageUpload
            value={imagesInput}
            onChange={setImagesInput}
            disabled={isSubmitting}
            maxImages={5}
          />
        </FormField>

        {/* Disponibilidad */}
        <div className="pt-2 select-none">
          <Checkbox
            id="isAvailable"
            checked={isAvailableInput}
            onChange={(e) => setIsAvailableInput(e.target.checked)}
            disabled={isSubmitting}
            label="Disponible para venta pública"
            subLabel="Si se desmarca, los clientes no verán este producto en el catálogo público."
          />
        </div>
      </Form>
    </Modal>
  );
}

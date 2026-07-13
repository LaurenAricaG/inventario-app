"use client";

import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import Button from "@/components/ui/Button";
import Form, { FormField } from "@/components/ui/Form";
import Input from "@/components/ui/Input";
import Modal from "@/components/ui/Modal";
import Checkbox from "@/components/ui/Checkbox";
import { createRoleAction, updateRoleAction } from "@/lib/role";
import { roleSchema } from "@/lib/role/schema";
import { SerializedRoleWithPermissions } from "@/types/role";

interface FormRoleProps {
  isOpen: boolean;
  onClose: () => void;
  role: SerializedRoleWithPermissions | null;
  permissionsList: {
    id: number;
    code: string;
    name: string;
    description: string | null;
  }[];
}

const categoryTitles: Record<string, string> = {
  users: "Usuarios",
  clients: "Clientes",
  products: "Productos",
  inventory: "Inventario",
  orders: "Pedidos",
  sales: "Ventas",
  debts: "Deudas",
  payments: "Pagos",
  campaigns: "Campañas",
  catalogs: "Catálogos",
  companies: "Empresas",
  brands: "Marcas",
  genders: "Géneros",
  roles: "Roles y Permisos",
  config: "Configuración",
  audit: "Bitácora",
  categories: "Categorías",
};

export default function FormRole({
  isOpen,
  onClose,
  role,
  permissionsList,
}: FormRoleProps) {
  const nameInputRef = useRef<HTMLInputElement>(null);

  const [nameInput, setNameInput] = useState("");
  const [descriptionInput, setDescriptionInput] = useState("");
  const [selectedPermissionIds, setSelectedPermissionIds] = useState<number[]>(
    [],
  );
  const [errors, setErrors] = useState<{
    name?: string;
    description?: string;
    permissionIds?: string;
  }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sync state on edit
  useEffect(() => {
    if (role) {
      setNameInput(role.name);
      setDescriptionInput(role.description || "");
      setSelectedPermissionIds(role.permissions.map((p) => p.permission.id));
    } else {
      setNameInput("");
      setDescriptionInput("");
      setSelectedPermissionIds([]);
    }
    setErrors({});
  }, [role, isOpen]);

  // Group permissions by prefix code
  const groupedPermissions = permissionsList.reduce(
    (acc, p) => {
      const prefix = p.code.split(":")[0] || "otros";
      if (!acc[prefix]) acc[prefix] = [];
      acc[prefix].push(p);
      return acc;
    },
    {} as Record<string, typeof permissionsList>,
  );

  const handlePermissionToggle = (id: number) => {
    setSelectedPermissionIds((prev) => {
      const next = prev.includes(id)
        ? prev.filter((pId) => pId !== id)
        : [...prev, id];
      if (errors.permissionIds)
        setErrors((errs) => ({ ...errs, permissionIds: undefined }));
      return next;
    });
  };

  const handleToggleCategory = (prefix: string) => {
    const categoryPerms = groupedPermissions[prefix] || [];
    const categoryIds = categoryPerms.map((p) => p.id);
    const allSelected = categoryIds.every((id) =>
      selectedPermissionIds.includes(id),
    );

    if (allSelected) {
      // Remove all
      setSelectedPermissionIds((prev) =>
        prev.filter((id) => !categoryIds.includes(id)),
      );
    } else {
      // Add missing
      setSelectedPermissionIds((prev) => {
        const toAdd = categoryIds.filter((id) => !prev.includes(id));
        return [...prev, ...toAdd];
      });
    }
    if (errors.permissionIds)
      setErrors((errs) => ({ ...errs, permissionIds: undefined }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrors({});

    const formData = {
      name: nameInput,
      description: descriptionInput,
      permissionIds: selectedPermissionIds,
    };

    // Client validation
    const validation = roleSchema.safeParse(formData);
    if (!validation.success) {
      const formattedErrors: any = {};
      validation.error.issues.forEach((issue) => {
        const path = issue.path[0] as string;
        formattedErrors[path] = issue.message;
      });
      setErrors(formattedErrors);
      setIsSubmitting(false);
      return;
    }

    try {
      const res = role
        ? await updateRoleAction(role.id, formData)
        : await createRoleAction(formData);

      if (res.success) {
        toast.success(res.message);
        onClose();
      } else {
        toast.error(res.message);
      }
    } catch (error) {
      toast.error("Ocurrió un error inesperado al guardar el rol.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={role ? "Editar Rol y Permisos" : "Registrar Nuevo Rol"}
      size="xl"
      className="max-w-4xl md:max-w-5xl w-full"
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
            form="role-form"
            type="submit"
            loading={isSubmitting}
          >
            Guardar
          </Button>
        </div>
      }
    >
      <Form
        id="role-form"
        onSubmit={handleSubmit}
        noValidate
        className="space-y-6"
      >
        {/* Form Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-bg-surface/20 p-4 border border-border-default/50 rounded-2xl">
          {/* Nombre del rol */}
          <FormField label="Nombre del Rol">
            <Input
              ref={nameInputRef}
              type="text"
              placeholder="Ej. Almacenero, Vendedor..."
              value={nameInput}
              onChange={(e) => {
                setNameInput(e.target.value);
                if (errors.name)
                  setErrors((prev) => ({ ...prev, name: undefined }));
              }}
              error={errors.name}
              disabled={
                isSubmitting ||
                (!!role &&
                  ["ADMIN", "SELLER"].includes(role.name.toUpperCase()))
              }
            />
          </FormField>

          {/* Descripción */}
          <FormField label="Descripción del Rol">
            <Input
              type="text"
              placeholder="Ej. Gestiona stocks y movimientos de kardex..."
              value={descriptionInput}
              onChange={(e) => {
                setDescriptionInput(e.target.value);
                if (errors.description)
                  setErrors((prev) => ({ ...prev, description: undefined }));
              }}
              error={errors.description}
              disabled={isSubmitting}
            />
          </FormField>
        </div>

        {/* Permisos Section Header */}
        <div className="border-t border-border-soft pt-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h4 className="text-sm font-bold text-text-primary">
                Asignación de Permisos del Sistema
              </h4>
              <p className="text-xs text-text-secondary mt-0.5">
                Marca los accesos que deseas conceder a este perfil
              </p>
            </div>
            <span className="text-xs font-mono font-bold text-beauty-500 bg-beauty-400/10 px-2.5 py-1 rounded-lg">
              Seleccionados: {selectedPermissionIds.length} /{" "}
              {permissionsList.length}
            </span>
          </div>

          {errors.permissionIds && (
            <p className="text-xs font-semibold text-danger-text mb-3 select-none">
              {errors.permissionIds}
            </p>
          )}

          {/* 3-Column Categories Grid Container */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-h-[55vh] ">
            {Object.keys(groupedPermissions).map((prefix) => {
              const perms = groupedPermissions[prefix] || [];
              const categoryTitle =
                categoryTitles[prefix] ||
                prefix.charAt(0).toUpperCase() + prefix.slice(1);
              const groupIds = perms.map((p) => p.id);
              const allSelected = groupIds.every((id) =>
                selectedPermissionIds.includes(id),
              );

              return (
                <div
                  key={prefix}
                  className="bg-bg-card border border-border-default/80 hover:border-beauty-200/50 dark:hover:border-beauty-800/80 rounded-2xl p-4 flex flex-col space-y-4 hover:shadow-xs transition-all duration-200"
                >
                  {/* Category Header */}
                  <div className="flex items-center justify-between border-b border-border-soft pb-2.5">
                    <span className="text-xs font-bold text-text-primary uppercase tracking-wider select-none">
                      {categoryTitle}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleToggleCategory(prefix)}
                      className="text-[10px] font-semibold text-beauty-500 hover:text-beauty-600 dark:text-beauty-400 dark:hover:text-beauty-300 hover:underline select-none cursor-pointer"
                    >
                      {allSelected ? "Quitar todos" : "Seleccionar todos"}
                    </button>
                  </div>

                  {/* Permission Checkboxes List */}
                  <div className="space-y-3.5">
                    {perms.map((p) => (
                      <Checkbox
                        key={p.id}
                        id={`perm-${p.id}`}
                        label={p.name}
                        subLabel={p.description || undefined}
                        checked={selectedPermissionIds.includes(p.id)}
                        onChange={() => handlePermissionToggle(p.id)}
                      />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </Form>
    </Modal>
  );
}

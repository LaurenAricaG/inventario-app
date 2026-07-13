"use client";

import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import Button from "@/components/ui/Button";
import Form, { FormField } from "@/components/ui/Form";
import Input from "@/components/ui/Input";
import Modal from "@/components/ui/Modal";
import Select from "@/components/ui/Select";
import { createUserAction, updateUserAction } from "@/lib/user";
import { userSchema } from "@/lib/user/schema";
import { SerializedUserWithRole } from "@/types/user";
import { CiAt } from "react-icons/ci";

interface FormUserProps {
  isOpen: boolean;
  onClose: () => void;
  user: SerializedUserWithRole | null;
  roles: { id: number; name: string }[];
}

export default function FormUser({
  isOpen,
  onClose,
  user,
  roles,
}: FormUserProps) {
  const nameInputRef = useRef<HTMLInputElement>(null);

  const [nameInput, setNameInput] = useState("");
  const [usernameInput, setUsernameInput] = useState("");
  const [emailInput, setEmailInput] = useState("");
  const [passwordInput, setPasswordInput] = useState("");
  const [roleInput, setRoleInput] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{
    name?: string;
    username?: string;
    email?: string;
    password?: string;
    roleId?: string;
  }>({});

  // Sync inputs when modal opens or user changes
  useEffect(() => {
    if (isOpen) {
      setNameInput(user ? user.name || "" : "");
      setUsernameInput(user ? user.username : "");
      setEmailInput(user ? user.email || "" : "");
      setPasswordInput("");
      setRoleInput(user ? user.roleId.toString() : "");
      setErrors({});
    }
  }, [isOpen, user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const fieldErrors: typeof errors = {};

    // Contraseña obligatoria solo al crear nuevo usuario
    if (!user && (!passwordInput || passwordInput.trim() === "")) {
      fieldErrors.password =
        "La contraseña es obligatoria para nuevos usuarios.";
    }

    const validation = userSchema.safeParse({
      name: nameInput,
      username: usernameInput,
      email: emailInput,
      password: passwordInput,
      roleId: roleInput,
    });

    if (!validation.success || Object.keys(fieldErrors).length > 0) {
      if (!validation.success) {
        validation.error.issues.forEach((issue) => {
          const path = issue.path[0] as keyof typeof errors;
          fieldErrors[path] = issue.message;
        });
      }
      setErrors(fieldErrors);
      return;
    }

    setErrors({});
    setIsSubmitting(true);

    try {
      let res;
      if (user) {
        res = await updateUserAction(user.id, validation.data);
      } else {
        res = await createUserAction(validation.data);
      }

      if (res.success) {
        toast.success(res.message);
        onClose();
      } else {
        toast.error(res.message);
        // Mapear errores de duplicados a los campos específicos si corresponden
        if (res.message.toLowerCase().includes("usuario")) {
          setErrors((prev) => ({ ...prev, username: res.message }));
        } else if (
          res.message.toLowerCase().includes("correo") ||
          res.message.toLowerCase().includes("email")
        ) {
          setErrors((prev) => ({ ...prev, email: res.message }));
        }
      }
    } catch (error: any) {
      toast.error(
        error.message || "Ocurrió un error al procesar la solicitud.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={user ? "Editar Usuario" : "Crear Usuario"}
      size="md"
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
            form="user-form"
            type="submit"
            loading={isSubmitting}
          >
            Guardar
          </Button>
        </div>
      }
    >
      <Form id="user-form" onSubmit={handleSubmit} noValidate>
        {/* Nombre completo */}
        <FormField label="Nombre Completo">
          <Input
            ref={nameInputRef}
            type="text"
            placeholder="Ej. Juan Pérez..."
            value={nameInput}
            onChange={(e) => {
              setNameInput(e.target.value);
              if (errors.name)
                setErrors((prev) => ({ ...prev, name: undefined }));
            }}
            error={errors.name}
            disabled={isSubmitting}
          />
        </FormField>

        {/* Nombre de usuario */}
        <FormField label="Nombre de Usuario">
          <Input
            type="text"
            placeholder="juan.perez"
            value={usernameInput}
            onChange={(e) => {
              setUsernameInput(e.target.value);
              if (errors.username)
                setErrors((prev) => ({ ...prev, username: undefined }));
            }}
            icon={<CiAt className="w-4 h-4" />}
            error={errors.username}
            disabled={isSubmitting}
          />
        </FormField>

        {/* Correo */}
        <FormField label="Correo Electrónico">
          <Input
            type="email"
            placeholder="juan.perez@example.com"
            value={emailInput}
            onChange={(e) => {
              setEmailInput(e.target.value);
              if (errors.email)
                setErrors((prev) => ({ ...prev, email: undefined }));
            }}
            error={errors.email}
            disabled={isSubmitting}
          />
        </FormField>

        {/* Contraseña */}
        <FormField label={user ? "Nueva Contraseña (Opcional)" : "Contraseña"}>
          <Input
            type="password"
            placeholder={
              user
                ? "Dejar en blanco para no modificar..."
                : "Mínimo 6 caracteres..."
            }
            value={passwordInput}
            onChange={(e) => {
              setPasswordInput(e.target.value);
              if (errors.password)
                setErrors((prev) => ({ ...prev, password: undefined }));
            }}
            error={errors.password}
            disabled={isSubmitting}
          />
        </FormField>

        {/* Rol */}
        <FormField label="Rol de Acceso" error={errors.roleId}>
          <Select
            value={roleInput}
            onChange={(e) => {
              setRoleInput(e.target.value);
              if (errors.roleId)
                setErrors((prev) => ({ ...prev, roleId: undefined }));
            }}
            error={errors.roleId}
            placeholder="Seleccione un rol..."
            disabled={isSubmitting}
          >
            <option value="">Seleccione un rol...</option>
            {roles.map((r) => (
              <option key={r.id} value={r.id.toString()}>
                {r.name}
              </option>
            ))}
          </Select>
        </FormField>
      </Form>
    </Modal>
  );
}

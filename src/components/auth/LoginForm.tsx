"use client";

import React, { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { toast } from "sonner";
import { FiUser, FiLock, FiEye, FiEyeOff } from "react-icons/fi";
import Card from "@/components/ui/Card";
import Label from "@/components/ui/Label";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/admin";

  const [usernameOrEmail, setUsernameOrEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const validate = () => {
    const newErrors: { [key: string]: string } = {};
    if (!usernameOrEmail.trim()) {
      newErrors.usernameOrEmail = "El usuario o correo es obligatorio.";
    }
    if (!password) {
      newErrors.password = "La contraseña es obligatoria.";
    } else if (password.length < 6) {
      newErrors.password = "La contraseña debe tener al menos 6 caracteres.";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      const result = await signIn("credentials", {
        usernameOrEmail,
        password,
        redirect: false,
      });

      if (result?.error) {
        toast.error("Credenciales incorrectas", {
          description: "Verifica tu usuario/correo y contraseña.",
        });
        setLoading(false);
      } else {
        toast.success("¡Bienvenida al sistema!", {
          description: "Has iniciado sesión correctamente.",
        });
        router.refresh();
        router.push(callbackUrl);
      }
    } catch (error) {
      toast.error("Error al iniciar sesión", {
        description: "Inténtalo de nuevo en unos momentos.",
      });
      setLoading(false);
    }
  };

  return (
    <Card
      glass
      className="w-full max-w-md p-8 md:p-10 border-white/10 shadow-2xl relative overflow-hidden"
    >
      {/* Decorative gradient overlay */}
      <div className="absolute -top-16 -right-16 w-32 h-32 bg-beauty-400/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-16 -left-16 w-32 h-32 bg-beauty-200/20 rounded-full blur-3xl pointer-events-none" />

      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold tracking-tight text-text-primary mb-2">
          Lauren Arica
        </h2>
        <p className="text-sm text-text-secondary">
          Ingresa tus credenciales para acceder al inventario
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <Label htmlFor="usernameOrEmail" required>
            Usuario o Correo
          </Label>
          <Input
            id="usernameOrEmail"
            name="usernameOrEmail"
            type="text"
            placeholder="lauren o lauren@example.com"
            value={usernameOrEmail}
            onChange={(e) => {
              setUsernameOrEmail(e.target.value);
              if (errors.usernameOrEmail) {
                setErrors((prev) => ({ ...prev, usernameOrEmail: "" }));
              }
            }}
            error={errors.usernameOrEmail}
            icon={<FiUser className="w-4 h-4 text-text-tertiary" />}
            autoComplete="username"
          />
        </div>

        <div>
          <Label htmlFor="password" required>
            Contraseña
          </Label>
          <Input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            placeholder="••••••••"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              if (errors.password) {
                setErrors((prev) => ({ ...prev, password: "" }));
              }
            }}
            error={errors.password}
            icon={<FiLock className="w-4 h-4 text-text-tertiary" />}
            autoComplete="current-password"
            endIcon={
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-text-tertiary hover:text-beauty-400 transition-colors cursor-pointer focus:outline-none flex items-center justify-center h-full pr-1"
                title={
                  showPassword ? "Ocultar contraseña" : "Mostrar contraseña"
                }
              >
                {showPassword ? (
                  <FiEyeOff className="w-4 h-4" />
                ) : (
                  <FiEye className="w-4 h-4" />
                )}
              </button>
            }
          />
        </div>

        <Button type="submit" className="w-full mt-2 py-3.5" loading={loading}>
          Iniciar Sesión
        </Button>
      </form>
    </Card>
  );
}

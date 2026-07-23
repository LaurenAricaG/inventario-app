"use client";

import { useState } from "react";
import { ErrorBoundary } from "@/components/error/ErrorBoundary";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import ConfirmModal from "@/components/ui/ConfirmModal";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/Table";
import Form, { FormField } from "@/components/ui/Form";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Checkbox from "@/components/ui/Checkbox";
import Textarea from "@/components/ui/Textarea";
import {
  FiAlertOctagon,
  FiTerminal,
  FiLayout,
  FiUser,
  FiMail,
  FiBriefcase,
  FiInfo,
  FiMaximize2,
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiSave,
  FiX,
  FiCheck,
  FiRefreshCw,
} from "react-icons/fi";

const BuggyComponent = ({ name }: { name: string }) => {
  const [shouldThrow, setShouldThrow] = useState(false);

  if (shouldThrow) {
    throw new Error(
      `Error simulado en "${name}". Se ha producido una excepción de prueba para verificar este nivel de Error Boundary.`,
    );
  }

  return (
    <div className="bg-bg-page/40 border border-border-default/50 rounded-2xl p-6 text-center flex flex-col items-center gap-3">
      <p className="text-xs text-text-secondary font-medium">
        Componente de demostración funcionando correctamente.
      </p>
      <Button
        onClick={() => setShouldThrow(true)}
        variant="outline"
        className="text-xs text-danger-text border-danger-text/20 hover:bg-danger-bg/10 hover:border-danger-text/40 cursor-pointer"
      >
        Forzar Error
      </Button>
    </div>
  );
};

export default function ErrorTestPage() {
  // Sandbox state
  const [showValidationErrors, setShowValidationErrors] = useState(false);
  const [isDemoModalOpen, setIsDemoModalOpen] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isConfirmLoading, setIsConfirmLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formValues, setFormValues] = useState({
    nombre: "usuario",
    correo: "usuario@example.com",
    rol: "admin",
    comentarios: "Esta es una nota de prueba para validar el Textarea.",
    terminos: true,
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 1200));
    setIsSubmitting(false);
    alert(JSON.stringify(formValues, null, 2));
  };

  const handleModalSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    alert("¡Formulario de Modal Guardado con Éxito!");
    setIsDemoModalOpen(false);
  };

  const handleConfirmAction = async () => {
    setIsConfirmLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setIsConfirmLoading(false);
    setIsConfirmModalOpen(false);
    alert("¡Acción confirmada y procesada!");
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto py-4">
      {/* Encabezado */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-text-primary">
          Laboratorio de Componentes y Pruebas
        </h2>
        <p className="text-sm text-text-secondary mt-1">
          Visualiza los nuevos componentes de formulario en acción, prueba el
          soporte de temas claro/oscuro y simula errores en tiempo real.
        </p>
      </div>

      {/* SECCIÓN 1: GALERÍA DE COMPONENTES DE FORMULARIO */}
      <Card className="p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-border-default">
          <div>
            <h3 className="font-bold text-text-primary text-base">
              Galería de Componentes Reutilizables (Formulario)
            </h3>
            <p className="text-xs text-text-secondary mt-0.5">
              Interactúa con los controles personalizados e incluso simula
              estados de error.
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={() => setShowValidationErrors(!showValidationErrors)}
              variant="outline"
              className="text-xs px-4 py-2 border border-border-strong hover:bg-bg-surface text-text-primary cursor-pointer select-none"
            >
              {showValidationErrors ? "Ocultar Errores" : "Simular Errores"}
            </Button>
            <Button
              onClick={() => setIsDemoModalOpen(true)}
              className="text-xs px-4 py-2 bg-beauty-400 hover:bg-beauty-600 text-white flex items-center gap-1.5 cursor-pointer shadow-md shadow-beauty-400/10"
            >
              <FiMaximize2 className="w-3.5 h-3.5" />
              Abrir Form en Modal
            </Button>
            <Button
              onClick={() => setIsConfirmModalOpen(true)}
              variant="outline"
              className="text-xs px-4 py-2 border border-danger-text/20 text-danger-text hover:bg-danger-bg/10 cursor-pointer"
            >
              <FiTrash2 className="w-3.5 h-3.5" />
              Probar ConfirmModal
            </Button>
          </div>
        </div>

        {/* Demo Form */}
        <Form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Input Component */}
            <FormField
              label="Nombre del Cliente"
              required
              error={
                showValidationErrors
                  ? "El nombre es obligatorio o inválido"
                  : undefined
              }
            >
              <Input
                placeholder="Ej. Usuario"
                value={formValues.nombre}
                onChange={(e) =>
                  setFormValues({ ...formValues, nombre: e.target.value })
                }
                icon={<FiUser className="w-4 h-4" />}
              />
            </FormField>

            {/* Input Component (Email) */}
            <FormField
              label="Correo Electrónico"
              required
              error={
                showValidationErrors
                  ? "El correo electrónico no tiene formato correcto"
                  : undefined
              }
            >
              <Input
                type="email"
                placeholder="Ej. email@example.com"
                value={formValues.correo}
                onChange={(e) =>
                  setFormValues({ ...formValues, correo: e.target.value })
                }
                icon={<FiMail className="w-4 h-4" />}
              />
            </FormField>

            {/* Select Component */}
            <FormField
              label="Rol Asignado"
              error={
                showValidationErrors
                  ? "Selecciona una opción permitida"
                  : undefined
              }
            >
              <Select
                value={formValues.rol}
                onChange={(e) =>
                  setFormValues({ ...formValues, rol: e.target.value })
                }
                icon={<FiBriefcase className="w-4 h-4" />}
              >
                <option value="admin">Administrador (ADMIN)</option>
                <option value="seller">Vendedor (SELLER)</option>
                <option value="guest">Invitado (GUEST)</option>
              </Select>
            </FormField>

            {/* Checkbox Component */}
            <div className="flex items-center pt-6">
              <FormField
                error={
                  showValidationErrors
                    ? "Debes aceptar los términos"
                    : undefined
                }
              >
                <Checkbox
                  id="terminos-demo"
                  checked={formValues.terminos}
                  onChange={(e) =>
                    setFormValues({ ...formValues, terminos: e.target.checked })
                  }
                  label="Acepto los términos y políticas de uso"
                />
              </FormField>
            </div>
          </div>

          {/* Textarea Component */}
          <FormField
            label="Comentarios o Notas"
            error={
              showValidationErrors
                ? "Las notas exceden el límite de caracteres permitido"
                : undefined
            }
          >
            <Textarea
              placeholder="Escribe comentarios aquí..."
              value={formValues.comentarios}
              onChange={(e) =>
                setFormValues({ ...formValues, comentarios: e.target.value })
              }
            />
          </FormField>

          {/* Form Actions */}
          <div className="flex justify-end gap-3 pt-3 border-t border-border-soft">
            <Button
              type="button"
              variant="outline"
              onClick={() =>
                setFormValues({
                  nombre: "",
                  correo: "",
                  rol: "seller",
                  comentarios: "",
                  terminos: false,
                })
              }
              disabled={isSubmitting}
            >
              Limpiar Campos
            </Button>
            <Button type="submit" variant="primary" loading={isSubmitting}>
              Guardar Cambios
            </Button>
          </div>
        </Form>
      </Card>

      {/* SECCIÓN 2: LÍMITE DE ERRORES */}
      <div className="space-y-6">
        <div>
          <h3 className="font-bold text-text-primary text-base">
            Laboratorio de Límite de Errores (ErrorBoundary)
          </h3>
          <p className="text-xs text-text-secondary mt-0.5">
            Usa los botones para simular excepciones en los componentes y
            observa cómo responde cada variante.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Variante Compacta */}
          <Card className="p-6 space-y-4">
            <div className="flex items-center gap-2.5 pb-3 border-b border-border-default">
              <div className="p-2 bg-warning-bg/40 text-warning-text rounded-xl">
                <FiTerminal className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-semibold text-text-primary text-sm">
                  Variante: Compact
                </h4>
                <p className="text-[11px] text-text-secondary">
                  Para widgets pequeños o filas inline de datos.
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <ErrorBoundary variant="compact" title="Mini-Widget de Reporte">
                <BuggyComponent name="Mini-Widget de Reporte" />
              </ErrorBoundary>
            </div>
          </Card>

          {/* Variante Integrada (Embedded) */}
          <Card className="p-6 space-y-4">
            <div className="flex items-center gap-2.5 pb-3 border-b border-border-default">
              <div className="p-2 bg-info-bg/40 text-info-text rounded-xl">
                <FiLayout className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-semibold text-text-primary text-sm">
                  Variante: Embedded
                </h4>
                <p className="text-[11px] text-text-secondary">
                  Para bloques modulares del Dashboard o paneles completos.
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <ErrorBoundary
                variant="embedded"
                title="Historial de Transacciones"
              >
                <BuggyComponent name="Historial de Transacciones" />
              </ErrorBoundary>
            </div>
          </Card>
        </div>

        {/* Variante Completa (Full-screen fallback) */}
        <Card className="p-6 space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-border-default">
            <div className="p-2 bg-danger-bg/40 text-danger-text rounded-xl">
              <FiAlertOctagon className="w-4 h-4" />
            </div>
            <div>
              <h4 className="font-semibold text-text-primary text-sm">
                Variante: Full
              </h4>
              <p className="text-[11px] text-text-secondary">
                Para fallos críticos a nivel de layout o página completa.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <ErrorBoundary variant="full" title="Vista de Configuración Global">
              <BuggyComponent name="Vista de Configuración" />
            </ErrorBoundary>
          </div>
        </Card>
      </div>

      {/* SECCIÓN 3: GUÍA DE ESTILOS Y JERARQUÍA DE BOTONES */}
      <Card className="p-6 space-y-6">
        <div>
          <h3 className="font-bold text-text-primary text-base">
            Guía de Estilos y Jerarquía de Botones
          </h3>
          <p className="text-xs text-text-secondary mt-0.5">
            Definición visual de prioridades, colores y hover de los botones
            para mantener la consistencia en toda la aplicación.
          </p>
        </div>

        {/* Tabla de Jerarquía */}
        <Table containerClassName="border border-border-default/60 rounded-2xl">
          <TableHeader>
            <TableRow className="bg-bg-surface text-text-primary font-semibold">
              <TableHead>Prioridad / Acción</TableHead>
              <TableHead>Normal</TableHead>
              <TableHead>Hover</TableHead>
              <TableHead>Deshabilitado</TableHead>
              <TableHead>Cargando</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="text-text-secondary">
            {/* Nivel 1 */}
            <tr>
              <td className="p-4 font-medium text-text-primary">
                <div className="space-y-1">
                  <span className="px-2 py-0.5 rounded-md bg-beauty-400/10 text-beauty-600 dark:bg-beauty-600/15 dark:text-beauty-400 text-[10px] font-bold uppercase tracking-wider font-sans">
                    Nivel 1: Principal
                  </span>
                  <p className="text-[11px] text-text-tertiary">
                    Creación, envío final (ej. Guardar, Nuevo Cliente)
                  </p>
                </div>
              </td>
              <td className="p-4">
                <Button
                  variant="primary"
                  className="py-2 text-xs flex items-center gap-1"
                >
                  <FiPlus className="w-3.5 h-3.5" /> Nuevo Cliente
                </Button>
              </td>
              <td className="p-4">
                <Button
                  variant="primary"
                  className="py-2 text-xs bg-beauty-600 shadow-lg shadow-beauty-500/25 flex items-center gap-1 pointer-events-none"
                >
                  <FiPlus className="w-3.5 h-3.5" /> Nuevo Cliente
                </Button>
              </td>
              <td className="p-4">
                <Button
                  variant="primary"
                  className="py-2 text-xs flex items-center gap-1"
                  disabled
                >
                  <FiPlus className="w-3.5 h-3.5" /> Nuevo Cliente
                </Button>
              </td>
              <td className="p-4">
                <Button
                  variant="primary"
                  className="py-2 text-xs flex items-center gap-1"
                  loading
                >
                  Guardar
                </Button>
              </td>
            </tr>

            {/* Nivel 2 */}
            <tr>
              <td className="p-4 font-medium text-text-primary">
                <div className="space-y-1">
                  <span className="px-2 py-0.5 rounded-md bg-beauty-400/10 text-beauty-600 dark:bg-beauty-600/15 dark:text-beauty-400 text-[10px] font-bold uppercase tracking-wider font-sans">
                    Nivel 2: Secundario
                  </span>
                  <p className="text-[11px] text-text-tertiary">
                    Modificación de datos (ej. Editar, Actualizar)
                  </p>
                </div>
              </td>
              <td className="p-4">
                <Button className="py-2 text-xs bg-beauty-400/10 text-beauty-600 dark:bg-beauty-400/10 dark:text-beauty-400 font-semibold hover:bg-beauty-400/20 dark:hover:bg-beauty-400/20 flex items-center gap-1 cursor-pointer">
                  <FiSave className="w-3.5 h-3.5" /> Editar
                </Button>
              </td>
              <td className="p-4">
                <Button className="py-2 text-xs bg-beauty-400/20 text-beauty-600 dark:bg-beauty-400/20 dark:text-beauty-400 font-semibold flex items-center gap-1 pointer-events-none">
                  <FiSave className="w-3.5 h-3.5" /> Editar
                </Button>
              </td>
              <td className="p-4">
                <Button
                  className="py-2 text-xs bg-beauty-400/5 text-beauty-600/40 dark:bg-beauty-400/5 dark:text-beauty-400/40 font-semibold flex items-center gap-1"
                  disabled
                >
                  <FiSave className="w-3.5 h-3.5" /> Editar
                </Button>
              </td>
              <td className="p-4">
                <Button
                  className="py-2 text-xs bg-beauty-400/10 text-beauty-600 dark:bg-beauty-400/10 dark:text-beauty-400 font-semibold flex items-center gap-1"
                  loading
                >
                  Editar
                </Button>
              </td>
            </tr>

            {/* Nivel 3 */}
            <tr>
              <td className="p-4 font-medium text-text-primary">
                <div className="space-y-1">
                  <span className="px-2 py-0.5 rounded-md bg-border-strong/20 text-text-secondary text-[10px] font-bold uppercase tracking-wider font-sans">
                    Nivel 3: Terciario
                  </span>
                  <p className="text-[11px] text-text-tertiary">
                    Cancelar, volver, cerrar
                  </p>
                </div>
              </td>
              <td className="p-4">
                <Button
                  variant="outline"
                  className="py-2 text-xs flex items-center gap-1"
                >
                  <FiX className="w-3.5 h-3.5" /> Cancelar
                </Button>
              </td>
              <td className="p-4">
                <Button
                  variant="outline"
                  className="py-2 text-xs bg-bg-surface flex items-center gap-1 pointer-events-none"
                >
                  <FiX className="w-3.5 h-3.5" /> Cancelar
                </Button>
              </td>
              <td className="p-4">
                <Button
                  variant="outline"
                  className="py-2 text-xs flex items-center gap-1"
                  disabled
                >
                  <FiX className="w-3.5 h-3.5" /> Cancelar
                </Button>
              </td>
              <td className="p-4">
                <Button
                  variant="outline"
                  className="py-2 text-xs flex items-center gap-1"
                  loading
                >
                  Cancelar
                </Button>
              </td>
            </tr>

            {/* Nivel 4: Editar (Warning) */}
            <tr>
              <td className="p-4 font-medium text-text-primary">
                <div className="space-y-1">
                  <span className="px-2 py-0.5 rounded-md bg-warning-bg/30 text-warning-text text-[10px] font-bold uppercase tracking-wider font-sans">
                    Nivel 4: Editar
                  </span>
                  <p className="text-[11px] text-text-tertiary">
                    Acción de edición en filas
                  </p>
                </div>
              </td>
              <td className="p-4">
                <button className="p-2 rounded-xl bg-warning-bg/40 border border-warning-text/15 text-warning-text cursor-pointer focus-visible:outline-none">
                  <FiEdit2 className="w-3.5 h-3.5" />
                </button>
              </td>
              <td className="p-4">
                <button className="p-2 rounded-xl bg-warning-bg/80 border border-warning-text/30 text-warning-text scale-[1.04] pointer-events-none">
                  <FiEdit2 className="w-3.5 h-3.5" />
                </button>
              </td>
              <td className="p-4">
                <button
                  className="p-2 rounded-xl bg-warning-bg/10 border border-warning-text/5 text-warning-text/40 opacity-50"
                  disabled
                >
                  <FiEdit2 className="w-3.5 h-3.5" />
                </button>
              </td>
              <td className="p-4">
                <button
                  className="p-2 rounded-xl bg-warning-bg/40 border border-warning-text/15 text-warning-text opacity-50"
                  disabled
                >
                  <div className="w-3.5 h-3.5 border-2 border-warning-text border-t-transparent rounded-full animate-spin" />
                </button>
              </td>
            </tr>

            {/* Nivel 5: Eliminar (Danger) */}
            <tr>
              <td className="p-4 font-medium text-text-primary">
                <div className="space-y-1">
                  <span className="px-2 py-0.5 rounded-md bg-danger-bg/30 text-danger-text text-[10px] font-bold uppercase tracking-wider font-sans">
                    Nivel 5: Eliminar
                  </span>
                  <p className="text-[11px] text-text-tertiary">
                    Acción de eliminación o suspensión
                  </p>
                </div>
              </td>
              <td className="p-4">
                <button className="p-2 rounded-xl bg-danger-bg/40 border border-danger-text/15 text-danger-text cursor-pointer focus-visible:outline-none">
                  <FiTrash2 className="w-3.5 h-3.5" />
                </button>
              </td>
              <td className="p-4">
                <button className="p-2 rounded-xl bg-danger-bg/80 border border-danger-text/30 text-danger-text scale-[1.04] pointer-events-none">
                  <FiTrash2 className="w-3.5 h-3.5" />
                </button>
              </td>
              <td className="p-4">
                <button
                  className="p-2 rounded-xl bg-danger-bg/10 border border-danger-text/5 text-danger-text/40 opacity-50"
                  disabled
                >
                  <FiTrash2 className="w-3.5 h-3.5" />
                </button>
              </td>
              <td className="p-4">
                <button
                  className="p-2 rounded-xl bg-danger-bg/40 border border-danger-text/15 text-danger-text opacity-50"
                  disabled
                >
                  <div className="w-3.5 h-3.5 border-2 border-danger-text border-t-transparent rounded-full animate-spin" />
                </button>
              </td>
            </tr>

            {/* Nivel 6: Restaurar / Regenerar (Info) */}
            <tr>
              <td className="p-4 font-medium text-text-primary">
                <div className="space-y-1">
                  <span className="px-2 py-0.5 rounded-md bg-info-bg/30 text-info-text text-[10px] font-bold uppercase tracking-wider font-sans">
                    Nivel 6: Restaurar
                  </span>
                  <p className="text-[11px] text-text-tertiary">
                    Acción de restauración o regeneración
                  </p>
                </div>
              </td>
              <td className="p-4">
                <button className="p-2 rounded-xl bg-info-bg/45 border border-info-text/15 text-info-text cursor-pointer focus-visible:outline-none">
                  <FiRefreshCw className="w-3.5 h-3.5" />
                </button>
              </td>
              <td className="p-4">
                <button className="p-2 rounded-xl bg-info-bg/85 border border-info-text/30 text-info-text scale-[1.04] pointer-events-none">
                  <FiRefreshCw className="w-3.5 h-3.5" />
                </button>
              </td>
              <td className="p-4">
                <button
                  className="p-2 rounded-xl bg-info-bg/10 border border-info-text/5 text-info-text/40 opacity-50"
                  disabled
                >
                  <FiRefreshCw className="w-3.5 h-3.5" />
                </button>
              </td>
              <td className="p-4">
                <button
                  className="p-2 rounded-xl bg-info-bg/45 border border-info-text/15 text-info-text opacity-50"
                  disabled
                >
                  <FiRefreshCw className="w-3.5 h-3.5 animate-spin" />
                </button>
              </td>
            </tr>
          </TableBody>
        </Table>

        {/* Fila de Listado de Muestra y Botones de Acción (Editar/Eliminar/Restaurar) */}
        <div className="space-y-3">
          <h4 className="font-semibold text-text-primary text-sm">
            Botones de Acción Semánticos sobre Listas o Filas
          </h4>
          <p className="text-xs text-text-secondary">
            Simulación de una fila de tabla. Los botones de acción usan colores
            definidos por defecto y hovers táctiles mejorados: **Lápiz de
            edición** (Warning), **Basura de eliminación** (Danger) e **Icono de
            actualización/regeneración** (Info).
          </p>

          <div className="flex items-center justify-between p-4 bg-bg-surface/30 border border-border-default/50 rounded-2xl">
            <div className="flex items-center gap-4">
              <div className="w-8 h-8 rounded-full bg-beauty-400/10 text-beauty-600 flex items-center justify-center font-bold text-xs select-none">
                JP
              </div>
              <div>
                <p className="text-xs font-semibold text-text-primary">
                  Juan Pérez
                </p>
                <p className="text-[10px] text-text-secondary">
                  juan.perez@example.com
                </p>
              </div>
            </div>

            {/* Fila de Acciones */}
            <div className="flex items-center gap-2">
              <button
                className="p-2 rounded-xl bg-warning-bg/40 border border-warning-text/15 text-warning-text hover:bg-warning-bg/80 hover:border-warning-text/30 hover:scale-[1.04] active:scale-[0.96] transition-all duration-200 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-warning-text/20"
                title="Editar Cliente"
              >
                <FiEdit2 className="w-4 h-4" />
              </button>
              <button
                className="p-2 rounded-xl bg-danger-bg/40 border border-danger-text/15 text-danger-text hover:bg-danger-bg/80 hover:border-danger-text/30 hover:scale-[1.04] active:scale-[0.96] transition-all duration-200 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-danger-text/20"
                title="Eliminar Cliente"
              >
                <FiTrash2 className="w-4 h-4" />
              </button>
              <button
                className="p-2 rounded-xl bg-info-bg/45 border border-info-text/15 text-info-text hover:bg-info-bg/85 hover:border-info-text/30 hover:scale-[1.04] active:scale-[0.96] transition-all duration-200 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-info-text/20"
                title="Regenerar Enlace"
              >
                <FiRefreshCw className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </Card>

      {/* MODAL CON FORMULARIO INTEGRADO */}
      <Modal
        isOpen={isDemoModalOpen}
        onClose={() => setIsDemoModalOpen(false)}
        title="Formulario desde Modal Reutilizable"
        size="md"
        footer={
          <>
            <Button
              variant="outline"
              type="button"
              className="py-2 text-xs"
              onClick={() => setIsDemoModalOpen(false)}
            >
              Cancelar
            </Button>
            <Button
              variant="primary"
              type="submit"
              form="modal-demo-form"
              className="py-2 text-xs bg-beauty-400 hover:bg-beauty-600 text-white"
            >
              Guardar Datos
            </Button>
          </>
        }
      >
        <Form id="modal-demo-form" onSubmit={handleModalSubmit}>
          <div className="p-1 space-y-4">
            <div className="flex gap-3 items-start p-3 bg-info-bg/30 border border-info-text/20 rounded-xl text-info-text">
              <FiInfo className="w-4 h-4 mt-0.5 shrink-0" />
              <p className="text-xs leading-relaxed">
                Este formulario está alojado dentro del componente{" "}
                <strong>Modal</strong> reutilizable. Al hacer clic en "Guardar
                Datos" se disparará el submit nativo.
              </p>
            </div>

            <FormField label="Nombre Completo" required>
              <Input
                placeholder="Ej. Juan Pérez"
                required
                icon={<FiUser className="w-4 h-4" />}
              />
            </FormField>

            <FormField label="Correo Electrónico" required>
              <Input
                type="email"
                placeholder="Ej. juan@example.com"
                required
                icon={<FiMail className="w-4 h-4" />}
              />
            </FormField>

            <FormField label="Tipo de Cuenta">
              <Select defaultValue="premium">
                <option value="basic">Plan Básico</option>
                <option value="premium">Plan Premium</option>
              </Select>
            </FormField>

            <FormField>
              <Checkbox
                id="modal-check"
                label="Activar notificaciones semanales"
                defaultChecked
              />
            </FormField>
          </div>
        </Form>
      </Modal>

      <ConfirmModal
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        onConfirm={handleConfirmAction}
        isLoading={isConfirmLoading}
        title="¿Eliminar este registro?"
        description="Esta acción eliminará de forma permanente los datos seleccionados y no se podrá deshacer. ¿Deseas continuar?"
        confirmText="Sí, eliminar"
        cancelText="Cancelar"
        variant="danger"
      />
    </div>
  );
}

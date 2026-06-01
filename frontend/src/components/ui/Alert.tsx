/**
 * @fileoverview Componente Alert - Banner de notificación con icono y variantes de color.
 */

import { type ReactNode } from "react";

/**
 * Propiedades del componente Alert.
 */
type AlertProps = {
  /** Contenido del mensaje de alerta */
  children: ReactNode;
  /**
   * Tipo de alerta que determina el color y el icono.
   * @default "error"
   */
  variant?: "error" | "success" | "warning" | "info";
  /** Clases CSS adicionales */
  className?: string;
};

/** Estilos de color por variante */
const variantStyles = {
  error: "bg-red-500/10 border-red-500/30 text-red-400",
  success: "bg-emerald-500/10 border-emerald-500/30 text-emerald-400",
  warning: "bg-amber-500/10 border-amber-500/30 text-amber-400",
  info: "bg-blue-500/10 border-blue-500/30 text-blue-400",
};

/** Paths SVG de los iconos por variante */
const iconPaths = {
  error: "M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z",
  success: "M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z",
  warning: "M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z",
  info: "M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zm-1 4a1 1 0 00-1 1v3a1 1 0 002 0V11a1 1 0 00-1-1z",
};

/**
 * Componente de alerta para mostrar mensajes de error, éxito, advertencia o información.
 * Incluye un icono SVG apropiado según la variante.
 *
 * @component
 * @param {AlertProps} props
 * @param {ReactNode} props.children - Mensaje de la alerta
 * @param {"error"|"success"|"warning"|"info"} [props.variant="error"] - Tipo de alerta
 * @param {string} [props.className] - Clases adicionales
 * @returns {JSX.Element} Banner de alerta
 *
 * @example
 * <Alert variant="success">Socio creado correctamente</Alert>
 *
 * @example
 * <Alert variant="error">{error}</Alert>
 */
export default function Alert({ children, variant = "error", className = "" }: AlertProps) {
  return (
    <div className={`rounded-xl p-3 flex items-center gap-2 border ${variantStyles[variant]} ${className}`}>
      <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d={iconPaths[variant]} clipRule="evenodd" />
      </svg>
      <p className="text-sm">{children}</p>
    </div>
  );
}

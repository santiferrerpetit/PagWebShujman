/**
 * @fileoverview Componentes de UI reutilizables con estilos de Tailwind.
 * Sistema de diseño del club - botones, tarjetas, inputs y alertas.
 */

import { type ButtonHTMLAttributes, type ReactNode } from "react";

/**
 * Propiedades del componente Button.
 * Extiende todas las props nativas de HTMLButtonElement.
 */
type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  /** Contenido del botón (texto, iconos, etc.) */
  children: ReactNode;
  /**
   * Variante visual del botón.
   * @default "primary"
   */
  variant?: "primary" | "secondary" | "danger" | "ghost";
  /**
   * Tamaño del botón.
   * @default "md"
   */
  size?: "sm" | "md" | "lg";
  /**
   * Muestra un spinner y deshabilita el botón mientras se ejecuta una acción.
   * @default false
   */
  isLoading?: boolean;
};

/** Mapas de estilos Tailwind por variante */
const variantStyles = {
  primary: "bg-blue-600 hover:bg-blue-700 text-white",
  secondary: "bg-slate-700 hover:bg-slate-600 text-white",
  danger: "bg-red-600 hover:bg-red-700 text-white",
  ghost: "bg-transparent text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-700",
};

/** Mapas de estilos Tailwind por tamaño */
const sizeStyles = {
  sm: "px-3 py-2 text-sm",
  md: "px-4 py-3 text-base",
  lg: "px-6 py-4 text-lg",
};

/**
 * Componente de botón personalizado con variantes y tamaños.
 *
 * @component
 * @param {ButtonProps} props - Propiedades del botón
 * @param {ReactNode} props.children - Contenido del botón
 * @param {"primary"|"secondary"|"danger"|"ghost"} [props.variant="primary"] - Variante visual
 * @param {"sm"|"md"|"lg"} [props.size="md"] - Tamaño del botón
 * @param {boolean} [props.isLoading=false] - Estado de carga con spinner
 * @returns {JSX.Element} Botón estilizado
 *
 * @example
 * <Button variant="primary" size="lg" onClick={handleClick}>
 *   Guardar
 * </Button>
 *
 * @example
 * <Button variant="danger" isLoading={isSaving} disabled>
 *   Eliminar
 * </Button>
 */
export default function Button({
  children,
  variant = "primary",
  size = "md",
  isLoading = false,
  className = "",
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      disabled={disabled || isLoading}
      className={`
        ${variantStyles[variant]}
        ${sizeStyles[size]}
        font-semibold rounded-xl transition-colors duration-200
        disabled:opacity-70 disabled:cursor-not-allowed
        flex items-center justify-center gap-2
        ${className}
      `}
      {...props}
    >
      {isLoading && (
        <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      )}
      {children}
    </button>
  );
}

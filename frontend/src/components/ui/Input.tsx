/**
 * @fileoverview Componente Input con label, icono y mensaje de error.
 * Usa forwardRef para compatibilidad con react-hook-form.
 */

import { type InputHTMLAttributes, forwardRef } from "react";

/**
 * Propiedades del componente Input.
 * Extiende todas las props nativas de HTMLInputElement.
 */
type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  /** Etiqueta descriptiva sobre el input */
  label?: string;
  /** Mensaje de error que se muestra debajo del input */
  error?: string;
  /** Icono decorativo a la izquierda del campo */
  icon?: React.ReactNode;
};

/**
 * Campo de entrada estilizado con soporte para label, ícono y error.
 * Implementa forwardRef para ser usado con react-hook-form.
 *
 * @component
 * @param {InputProps} props
 * @param {string} [props.label] - Etiqueta del campo
 * @param {string} [props.error] - Mensaje de error a mostrar
 * @param {ReactNode} [props.icon] - Icono SVG a la izquierda
 * @param {string} [props.className] - Clases adicionales
 * @returns {JSX.Element} Input estilizado
 *
 * @example
 * // Con react-hook-form
 * <Input
 *   label="Nombre"
 *   placeholder="Juan"
 *   {...register("firstName", { required: "Requerido" })}
 *   error={errors.firstName?.message}
 * />
 *
 * @example
 * // Con icono
 * <Input
 *   label="Email"
 *   type="email"
 *   icon={<EmailSVG />}
 * />
 */
const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, icon, className = "", ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-slate-300 mb-2">
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              {icon}
            </div>
          )}
          <input
            ref={ref}
            className={`
              w-full ${icon ? "pl-10" : "pl-4"} pr-4 py-3
              bg-slate-900 border border-slate-800 rounded-xl
              text-white placeholder-slate-500
              focus:outline-none focus:ring-2 focus:ring-blue-600/30 focus:border-blue-600
              transition-colors
              disabled:opacity-50 disabled:cursor-not-allowed
              ${error ? "border-red-500 focus:border-red-500 focus:ring-red-500/50" : ""}
              ${className}
            `}
            {...props}
          />
        </div>
        {error && (
          <span className="text-red-400 text-xs mt-1 flex items-center gap-1">
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            {error}
          </span>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";

export default Input;

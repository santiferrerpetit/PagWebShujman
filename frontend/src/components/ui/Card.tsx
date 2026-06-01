/**
 * @fileoverview Componente Card - Contenedor visual con fondo glass y borde decorativo.
 */

import { type ReactNode } from "react";

/**
 * Propiedades del componente Card.
 */
type CardProps = {
  /** Contenido interno de la tarjeta */
  children: ReactNode;
  /** Clases CSS adicionales */
  className?: string;
  /** Título opcional centrado en el encabezado */
  title?: string;
  /** Subtítulo opcional debajo del título */
  subtitle?: string;
};

/**
 * Componente contenedor con estilo glass (blur + fondo semitransparente).
 * Ideal para agrupar formularios, tablas o secciones de contenido.
 *
 * @component
 * @param {CardProps} props
 * @param {ReactNode} props.children - Contenido de la tarjeta
 * @param {string} [props.className] - Clases adicionales de Tailwind
 * @param {string} [props.title] - Título centrado
 * @param {string} [props.subtitle] - Subtítulo debajo del título
 * @returns {JSX.Element} Contenedor estilizado
 *
 * @example
 * <Card title="Bienvenido" subtitle="Ingresá tus datos">
 *   <Formulario />
 * </Card>
 */
export default function Card({ children, className = "", title, subtitle }: CardProps) {
  return (
    <div className={`bg-slate-900 border border-slate-800 rounded-2xl p-8 md:p-10 ${className}`}>
      {(title || subtitle) && (
        <div className="text-center mb-8">
          {title && <h2 className="text-2xl font-bold text-white mb-2">{title}</h2>}
          {subtitle && <p className="text-slate-400">{subtitle}</p>}
        </div>
      )}
      {children}
    </div>
  );
}

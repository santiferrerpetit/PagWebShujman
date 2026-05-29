import { type ReactNode } from "react";

type CardProps = {
  children: ReactNode;
  className?: string;
  title?: string;
  subtitle?: string;
};

export default function Card({ children, className = "", title, subtitle }: CardProps) {
  return (
    <div className={`bg-slate-800/80 backdrop-blur-xl rounded-3xl shadow-2xl shadow-black/30 border border-slate-700/50 p-8 md:p-10 ${className}`}>
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

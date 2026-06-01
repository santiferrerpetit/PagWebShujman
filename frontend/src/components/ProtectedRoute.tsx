/**
 * @fileoverview Guard de ruta que redirige a /auth/login si el usuario no está autenticado.
 * Muestra un spinner mientras se verifica la sesión.
 */

import { Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

/**
 * Componente wrapper que protege rutas privadas.
 * Redirige al login si no hay usuario autenticado.
 *
 * @component
 * @param {Object} props
 * @param {React.ReactNode} props.children - Componente o página a renderizar si hay sesión
 * @returns {JSX.Element} El contenido protegido o una redirección al login
 *
 * @example
 * <Route path="/dashboard" element={
 *   <ProtectedRoute>
 *     <DashboardPage />
 *   </ProtectedRoute>
 * } />
 */
export default function ProtectedRoute({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="h-[calc(100vh-7rem)] flex justify-center items-center">
        <div className="text-white text-2xl">Cargando...</div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth/login" replace />;
  }

  return <>{children}</>;
}

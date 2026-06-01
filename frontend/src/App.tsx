/**
 * @fileoverview Punto de entrada de la aplicación React.
 * Configura React Router con lazy loading, AuthProvider global y layout base.
 * Cada página se carga bajo demanda para optimizar el bundle inicial.
 *
 * @author Alumno
 * @version 1.0.0
 */

import { Suspense, lazy } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";
import Navbar from "@/components/Navbar";
import ProtectedRoute from "@/components/ProtectedRoute";

// Lazy loading de páginas para mejorar performance del bundle
const HomePage = lazy(() => import("@/pages/HomePage"));
const LoginPage = lazy(() => import("@/features/auth/pages/LoginPage"));
const RegisterPage = lazy(() => import("@/features/auth/pages/RegisterPage"));
const DashboardPage = lazy(() => import("@/pages/DashboardPage"));
const MembersPage = lazy(() => import("@/features/members/pages/MembersPage"));
const FeesPage = lazy(() => import("@/features/fees/pages/FeesPage"));

/**
 * Fallback mostrado mientras se carga una página en modo lazy.
 * @returns {JSX.Element} Spinner centrado
 */
function LoadingFallback() {
  return (
    <div className="flex-1 flex items-center justify-center bg-neutral-950">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500" />
    </div>
  );
}

const basename = window.location.pathname.startsWith("/~")
  ? `/${window.location.pathname.split("/")[1]}`
  : "/";

/**
 * Componente raíz de la aplicación.
 * Provee el contexto de autenticación, el router y la estructura de layout (Navbar + rutas).
 *
 * @component
 * @returns {JSX.Element} Árbol completo de la aplicación
 */
export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter basename={basename}>
        <div className="min-h-full flex flex-col bg-neutral-950 text-white">
          <Navbar />
          <Suspense fallback={<LoadingFallback />}>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/auth/login" element={<LoginPage />} />
              <Route path="/auth/register" element={<RegisterPage />} />
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <DashboardPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/members"
                element={
                  <ProtectedRoute>
                    <MembersPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/fees"
                element={
                  <ProtectedRoute>
                    <FeesPage />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </Suspense>
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}

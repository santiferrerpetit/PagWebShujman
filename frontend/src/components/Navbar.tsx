/**
 * @fileoverview Barra de navegación principal con enlaces dinámicos según autenticación.
 * Muestra enlaces públicos cuando no hay sesión y enlaces protegidos al iniciar sesión.
 */

import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

/**
 * Componente de navegación sticky con glass effect.
 * Adapta los enlaces mostrados según el estado de autenticación del usuario.
 *
 * @component
 * @returns {JSX.Element} Barra de navegación superior
 *
 * @example
 * // Se renderiza automáticamente dentro del layout en App.tsx
 * <Navbar />
 */
export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate("/auth/login");
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="bg-slate-900 border-b border-slate-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <span className="text-lg font-bold text-white">
              Gestión de Clubes
            </span>
          </Link>

          {/* Navigation Links */}
          <ul className="flex items-center gap-1">
            {!user ? (
              <>
                <li>
                  <Link
                    to="/"
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      isActive("/")
                        ? "text-white bg-slate-800"
                        : "text-slate-400 hover:text-white hover:bg-slate-800"
                    }`}
                  >
                    Inicio
                  </Link>
                </li>
                <li>
                  <Link
                    to="/auth/login"
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      isActive("/auth/login")
                        ? "text-white bg-slate-800"
                        : "text-slate-400 hover:text-white hover:bg-slate-800"
                    }`}
                  >
                    Ingresar
                  </Link>
                </li>
                <li>
                  <Link
                    to="/auth/register"
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      isActive("/auth/register")
                        ? "text-white bg-slate-800"
                        : "bg-blue-600 text-white hover:bg-blue-700"
                    }`}
                  >
                    Registrarse
                  </Link>
                </li>
              </>
            ) : (
              <>
                <li>
                  <Link
                    to="/dashboard"
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      isActive("/dashboard")
                        ? "text-white bg-slate-800"
                        : "text-slate-400 hover:text-white hover:bg-slate-800"
                    }`}
                  >
                    Panel
                  </Link>
                </li>
                <li>
                  <Link
                    to="/members"
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      isActive("/members")
                        ? "text-white bg-slate-800"
                        : "text-slate-400 hover:text-white hover:bg-slate-800"
                    }`}
                  >
                    Socios
                  </Link>
                </li>
                <li>
                  <Link
                    to="/fees"
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      isActive("/fees")
                        ? "text-white bg-slate-800"
                        : "text-slate-400 hover:text-white hover:bg-slate-800"
                    }`}
                  >
                    Aranceles
                  </Link>
                </li>
                <li className="ml-2">
                  <button
                    onClick={handleLogout}
                    className="px-4 py-2 rounded-lg text-sm font-medium text-red-400 hover:text-red-300 hover:bg-red-400/10 transition-all duration-200 flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    Salir
                  </button>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
}

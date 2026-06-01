/**
 * @fileoverview Contexto de autenticación global de la aplicación.
 * Provee el estado del usuario, login, logout y verificación de sesión al montar.
 * Emite eventos "auth:logout" para que otros componentes reaccionen al cierre de sesión.
 */

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import { meApi, logoutApi } from "@/features/auth/api/authApi";

/**
 * Representa un usuario autenticado en el sistema.
 */
export interface User {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  roleId: number;
  role: { id: number; name: string };
}

/**
 * Tipo del contexto de autenticación expuesto a los consumidores.
 */
interface AuthContextType {
  /** Usuario autenticado, o null si no hay sesión */
  user: User | null;
  /** Almacena el token y el usuario en el contexto tras login exitoso */
  login: (token: string, user: User) => void;
  /** Cierra la sesión, elimina el token y notifica con evento "auth:logout" */
  logout: () => void;
  /** true mientras se verifica el token al montar la app */
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

/**
 * Provider del contexto de autenticación.
 * Al montarse, verifica si hay un token en localStorage y obtiene los datos del usuario.
 * Escucha el evento "auth:logout" para cerrar sesión desde cualquier parte de la app.
 *
 * @component
 * @param {Object} props
 * @param {ReactNode} props.children - Subárbol de componentes que tendrán acceso al contexto
 * @returns {JSX.Element} Provider con el contexto de autenticación
 *
 * @example
 * // En App.tsx
 * <AuthProvider>
 *   <App />
 * </AuthProvider>
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setLoading(false);
      return;
    }

    meApi()
      .then((data) => {
        if (data.user) {
          setUser(data.user as User);
        } else {
          localStorage.removeItem("token");
        }
      })
      .catch(() => {
        localStorage.removeItem("token");
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    const handleLogout = () => {
      localStorage.removeItem("token");
      setUser(null);
    };
    window.addEventListener("auth:logout", handleLogout);
    return () => window.removeEventListener("auth:logout", handleLogout);
  }, []);

  const login = useCallback((token: string, userData: User) => {
    localStorage.setItem("token", token);
    setUser(userData);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("token");
    setUser(null);
    logoutApi().catch(() => {});
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

/**
 * Hook para consumir el contexto de autenticación.
 * Debe usarse dentro de un {@link AuthProvider}.
 *
 * @returns {AuthContextType} Estado y acciones de autenticación
 * @throws {Error} Si se usa fuera de un AuthProvider
 *
 * @example
 * const { user, login, logout, loading } = useAuth();
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

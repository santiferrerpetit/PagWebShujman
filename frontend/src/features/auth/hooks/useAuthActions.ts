/**
 * @fileoverview Hooks de acciones de autenticación (login y registro).
 * Encapsulan el estado de carga y errores para formularios de auth.
 */

import { useState } from "react";
import { loginApi, registerApi, type User } from "@/features/auth/api/authApi";

/**
 * Hook para gestionar el inicio de sesión.
 * Maneja el estado de carga, errores y retorna la función login.
 *
 * @returns {Object} Estado y función de login
 * @returns {Function} returns.login - (username: string, password: string) => Promise<{token, user} | null>
 * @returns {boolean} returns.isLoading - Indica si la petición está en curso
 * @returns {string|null} returns.error - Mensaje de error si falló
 * @returns {Function} returns.setError - Permite limpiar o setear el error manualmente
 *
 * @example
 * const { login, isLoading, error } = useLogin();
 * const result = await login("usuario", "contraseña");
 * if (result) {
 *   // result.token y result.user disponibles
 * }
 */
export function useLogin() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function login(username: string, password: string): Promise<{ token: string; user: User } | null> {
    setIsLoading(true);
    setError(null);
    try {
      const result = await loginApi(username, password);
      return result;
    } catch (err: any) {
      setError(err.message || "Error en el inicio de sesión");
      return null;
    } finally {
      setIsLoading(false);
    }
  }

  return { login, isLoading, error, setError };
}

/**
 * Hook para gestionar el registro de nuevos usuarios.
 * Maneja el estado de carga, errores y retorna la función register.
 *
 * @returns {Object} Estado y función de registro
 * @returns {Function} returns.register - (payload: RegisterPayload) => Promise<User | null>
 * @returns {boolean} returns.isLoading - Indica si la petición está en curso
 * @returns {string|null} returns.error - Mensaje de error si falló
 * @returns {Function} returns.setError - Permite limpiar o setear el error manualmente
 *
 * @example
 * const { register, isLoading, error, setError } = useRegister();
 * const user = await register({
 *   firstName: "Juan", lastName: "Pérez",
 *   username: "juanp", email: "juan@email.com",
 *   password: "123456", confirmPassword: "123456"
 * });
 */
export function useRegister() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function register(payload: {
    firstName: string;
    lastName: string;
    username: string;
    email: string;
    password: string;
    confirmPassword: string;
  }): Promise<User | null> {
    setIsLoading(true);
    setError(null);
    try {
      const result = await registerApi(payload);
      return result;
    } catch (err: any) {
      setError(err.message || "Error al registrar usuario");
      return null;
    } finally {
      setIsLoading(false);
    }
  }

  return { register, isLoading, error, setError };
}

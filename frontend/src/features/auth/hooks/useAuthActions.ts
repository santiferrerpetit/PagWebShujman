import { useState } from "react";
import { loginApi, registerApi, type User } from "@/features/auth/api/authApi";

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

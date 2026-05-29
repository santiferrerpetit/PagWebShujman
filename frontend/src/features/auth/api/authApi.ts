import { apiFetch } from "@/lib/api";

export type User = {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  roleId: number;
  role: { id: number; name: string };
  createdAt: string;
  updatedAt?: string;
};

type LoginResponse = {
  token: string;
  user: User;
};

type MeResponse = {
  user: User;
};

export async function loginApi(username: string, password: string): Promise<LoginResponse> {
  return apiFetch("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ username, password }),
    skipAuth: true,
  });
}

export async function registerApi(payload: {
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
}): Promise<User> {
  return apiFetch("/api/auth/register", {
    method: "POST",
    body: JSON.stringify(payload),
    skipAuth: true,
  });
}

export async function meApi(): Promise<MeResponse> {
  return apiFetch("/api/auth/me");
}

export async function logoutApi(): Promise<{ message: string }> {
  return apiFetch("/api/auth/logout", { method: "POST" });
}

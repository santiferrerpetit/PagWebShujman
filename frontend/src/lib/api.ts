export const API_BASE = "http://localhost:3001";

interface ApiOptions extends RequestInit {
  skipAuth?: boolean;
}

interface ApiError extends Error {
  statusCode?: number;
  code?: string;
}

export async function apiFetch<T = any>(path: string, options: ApiOptions = {}): Promise<T> {
  const url = `${API_BASE}${path}`;
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...((options.headers as Record<string, string>) || {}),
  };

  const token = localStorage.getItem("token");
  if (token && !options.skipAuth) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    localStorage.removeItem("token");
    window.dispatchEvent(new Event("auth:logout"));
    throw Object.assign(new Error("Sesión expirada. Por favor inicia sesión nuevamente."), {
      statusCode: 401,
      code: "UNAUTHORIZED",
    } as ApiError);
  }

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw Object.assign(new Error(data.message || "Error en la petición"), {
      statusCode: response.status,
      code: data.code || "REQUEST_ERROR",
    } as ApiError);
  }

  return data as T;
}

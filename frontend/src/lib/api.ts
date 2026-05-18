export const API_BASE = window.location.pathname.startsWith("/~")
  ? `/${window.location.pathname.split("/")[1]}/api`
  : "http://localhost:3001";

export async function apiFetch(path: string, options?: RequestInit) {
  const token = localStorage.getItem("token");

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options?.headers as Record<string, string> || {}),
  };

  return fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });
}

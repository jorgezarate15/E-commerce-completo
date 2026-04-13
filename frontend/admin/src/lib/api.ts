import type {
  AdminAnalyticsResponse,
  AdminOrderListResponse,
  AdminProductListResponse,
  AdminUserListResponse,
  AuthResponse,
} from "../types";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000/api/v1";

async function request<T>(path: string, token: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...(init?.headers ?? {}),
    },
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || `Request failed: ${response.status}`);
  }

  return (await response.json()) as T;
}

export async function loginAdmin(email: string, password: string): Promise<AuthResponse> {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    throw new Error("Credenciales invalidas");
  }

  return (await response.json()) as AuthResponse;
}

export async function runSeed(token: string): Promise<void> {
  await request<{ status: string }>("/seed/dev-seed", token, { method: "POST" });
}

export function getAdminProducts(token: string): Promise<AdminProductListResponse> {
  return request<AdminProductListResponse>("/admin/products", token);
}

export function getAdminOrders(token: string): Promise<AdminOrderListResponse> {
  return request<AdminOrderListResponse>("/admin/orders", token);
}

export function updateOrderStatus(token: string, orderId: number, status: string): Promise<void> {
  return request<void>(`/admin/orders/${orderId}/status`, token, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
}

export function getAdminUsers(token: string, search: string): Promise<AdminUserListResponse> {
  const query = search ? `?search=${encodeURIComponent(search)}` : "";
  return request<AdminUserListResponse>(`/admin/users${query}`, token);
}

export function updateUserRole(token: string, userId: number, role: string): Promise<void> {
  return request<void>(`/admin/users/${userId}/role`, token, {
    method: "PATCH",
    body: JSON.stringify({ role }),
  });
}

export function getAdminAnalytics(
  token: string,
  filters: { from?: string; to?: string; status?: string },
): Promise<AdminAnalyticsResponse> {
  const params = new URLSearchParams();
  if (filters.from) {
    params.append("from", filters.from);
  }
  if (filters.to) {
    params.append("to", filters.to);
  }
  if (filters.status) {
    params.append("status", filters.status);
  }
  const query = params.toString();
  return request<AdminAnalyticsResponse>(`/admin/analytics${query ? `?${query}` : ""}`, token);
}

import type {
  AuthResponse,
  CartResponse,
  LoginRequest,
  OrderCreateRequest,
  OrderCreateResponse,
  OrderListResponse,
  PaymentIntentResponse,
  PaymentResponse,
  ProductListResponse,
  ProductQuery,
  RegisterRequest,
} from "../types";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000/api/v1";

function withQuery(path: string, query: Record<string, string | number | undefined>): string {
  const params = new URLSearchParams();
  Object.entries(query).forEach(([key, value]) => {
    if (value !== undefined && value !== "") {
      params.append(key, String(value));
    }
  });
  const queryString = params.toString();
  return queryString ? `${path}?${queryString}` : path;
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
    ...init,
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || `Request failed: ${response.status}`);
  }

  return (await response.json()) as T;
}

export async function login(payload: LoginRequest): Promise<AuthResponse> {
  return request<AuthResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function register(payload: RegisterRequest): Promise<AuthResponse> {
  return request<AuthResponse>("/auth/register", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function getProducts(query: ProductQuery): Promise<ProductListResponse> {
  return request<ProductListResponse>(
    withQuery("/products", {
      search: query.search,
      category: query.category,
      brand: query.brand,
      size: query.size,
      color: query.color,
      min_price: query.minPrice,
      max_price: query.maxPrice,
      page: query.page,
      page_size: query.pageSize,
    }),
  );
}

export async function getCart(token: string): Promise<CartResponse> {
  return request<CartResponse>("/cart", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

export async function addCartItem(token: string, productVariantId: number, quantity = 1): Promise<CartResponse> {
  return request<CartResponse>("/cart/items", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ product_variant_id: productVariantId, quantity }),
  });
}

export async function createOrder(token: string, payload: OrderCreateRequest): Promise<OrderCreateResponse> {
  return request<OrderCreateResponse>("/orders", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });
}

export async function getOrders(token: string): Promise<OrderListResponse> {
  return request<OrderListResponse>("/orders", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

export async function createPaymentIntent(
  token: string,
  orderId: number,
  provider: "stripe" | "paypal",
): Promise<PaymentIntentResponse> {
  return request<PaymentIntentResponse>("/payments/intent", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ order_id: orderId, provider }),
  });
}

export async function confirmPayment(token: string, paymentId: number): Promise<PaymentResponse> {
  return request<PaymentResponse>("/payments/confirm", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ payment_id: paymentId }),
  });
}

export async function triggerMockWebhook(providerReference: string): Promise<PaymentResponse> {
  return request<PaymentResponse>("/payments/mock-webhook", {
    method: "POST",
    headers: {
      "X-Webhook-Secret": "dev_webhook_secret",
    },
    body: JSON.stringify({ provider_reference: providerReference, event: "payment_succeeded" }),
  });
}

export interface ProductCard {
  id: number;
  name: string;
  brand: string;
  category: string;
  material: string | null;
  base_price: number;
  sale_price: number | null;
  default_variant_id: number;
  in_stock: boolean;
  image_url: string | null;
}

export interface ProductListResponse {
  items: ProductCard[];
  total: number;
  page: number;
  page_size: number;
}

export interface ProductQuery {
  search?: string;
  category?: string;
  brand?: string;
  size?: string;
  color?: string;
  minPrice?: number;
  maxPrice?: number;
  page: number;
  pageSize: number;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  full_name: string;
  password: string;
}

export interface UserProfile {
  id: number;
  email: string;
  full_name: string;
  role: string;
  newsletter_subscribed: boolean;
  is_active: boolean;
}

export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
}

export interface AuthResponse {
  user: UserProfile;
  tokens: TokenResponse;
}

export interface CartItem {
  id: number;
  product_variant_id: number;
  product_name: string;
  size: string;
  color: string;
  unit_price: number;
  quantity: number;
  line_total: number;
}

export interface CartResponse {
  cart_id: number;
  items: CartItem[];
  subtotal: number;
  taxes: number;
  shipping_estimate: number;
  discount_total: number;
  total: number;
}

export interface OrderSummary {
  id: number;
  status: string;
  subtotal: number;
  taxes: number;
  shipping_cost: number;
  discount_total: number;
  total: number;
  tracking_number: string | null;
}

export interface OrderListResponse {
  items: OrderSummary[];
  total: number;
}

export interface OrderCreateRequest {
  shipping_address: string;
  shipping_method: "standard" | "express";
}

export interface OrderCreateResponse {
  order: OrderSummary;
  message: string;
}

export interface PaymentIntentResponse {
  payment_id: number;
  order_id: number;
  provider: string;
  status: string;
  amount: number;
  provider_reference: string;
  client_secret: string;
}

export interface PaymentResponse {
  payment_id: number;
  order_id: number;
  provider: string;
  status: string;
  amount: number;
  provider_reference: string | null;
}

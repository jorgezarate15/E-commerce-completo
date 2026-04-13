export interface AdminProductSummary {
  id: number;
  name: string;
  brand: string;
  category: string;
  variants: number;
  total_stock: number;
}

export interface AdminProductListResponse {
  items: AdminProductSummary[];
  total: number;
}

export interface AdminOrderSummary {
  id: number;
  user_id: number;
  customer_email: string;
  status: string;
  total: number;
  created_at: string;
}

export interface AdminOrderListResponse {
  items: AdminOrderSummary[];
  total: number;
}

export interface AdminUserSummary {
  id: number;
  email: string;
  full_name: string;
  role: string;
  is_active: boolean;
}

export interface AdminUserListResponse {
  items: AdminUserSummary[];
  total: number;
}

export interface AuthResponse {
  user: {
    id: number;
    email: string;
    full_name: string;
    role: string;
  };
  tokens: {
    access_token: string;
    refresh_token: string;
    token_type: string;
  };
}

export interface AdminStatusBucket {
  status: string;
  count: number;
}

export interface AdminTopProduct {
  product_name: string;
  units_sold: number;
  revenue: number;
}

export interface AdminAnalyticsResponse {
  total_orders: number;
  paid_orders: number;
  total_revenue: number;
  average_order_value: number;
  orders_today: number;
  status_breakdown: AdminStatusBucket[];
  top_products: AdminTopProduct[];
  daily_series: Array<{
    day: string;
    orders: number;
    revenue: number;
  }>;
}

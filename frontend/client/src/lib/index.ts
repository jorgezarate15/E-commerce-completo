// ============================================================
// Routes
// ============================================================
export const ROUTE_PATHS = {
  HOME: "/",
  PRODUCTS: "/products",
  PRODUCT_DETAIL: "/products/:id",
  CART: "/cart",
  CHECKOUT: "/checkout",
} as const;

export const productDetailPath = (id: string | number) => `/products/${id}`;

// ============================================================
// Types
// ============================================================
export interface Product {
  id: number;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  category: string;
  rating: number;
  reviews: number;
  badge?: "new" | "sale" | "hot" | "limited";
  description: string;
  features: string[];
  stock: number;
  colors?: string[];
  sizes?: string[];
}

export interface CartItem {
  product: Product;
  quantity: number;
  selectedColor?: string;
  selectedSize?: string;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  count: number;
}

// ============================================================
// Utilities
// ============================================================
export const formatPrice = (price: number) =>
  new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR" }).format(price);

export const discountPercent = (original: number, current: number) =>
  Math.round(((original - current) / original) * 100);

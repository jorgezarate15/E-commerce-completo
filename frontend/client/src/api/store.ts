import type { Product } from "@/lib/index";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000/api/v1";

interface ProductListResponse {
  items: Product[];
  total: number;
}

interface CategoryCount {
  id: string;
  count: number;
}

interface CategoryListResponse {
  items: CategoryCount[];
}

async function request<T>(path: string): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`);
  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`);
  }
  return (await response.json()) as T;
}

export async function getStoreProducts(): Promise<Product[]> {
  const response = await request<ProductListResponse>("/products");
  return response.items;
}

export async function getStoreProductById(id: number): Promise<Product> {
  return request<Product>(`/products/${id}`);
}

export async function getStoreCategoryCounts(): Promise<CategoryCount[]> {
  const response = await request<CategoryListResponse>("/categories");
  return response.items;
}

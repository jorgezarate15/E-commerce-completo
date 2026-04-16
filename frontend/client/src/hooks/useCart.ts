import { create } from "zustand";
import type { CartItem, Product } from "@/lib/index";

interface CartStore {
  items: CartItem[];
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  addItem: (product: Product, options?: { color?: string; size?: string }) => void;
  removeItem: (productId: number) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  clearCart: () => void;
  total: () => number;
  totalItems: () => number;
}

export const useCart = create<CartStore>((set, get) => ({
  items: [],
  isOpen: false,

  openCart: () => set({ isOpen: true }),
  closeCart: () => set({ isOpen: false }),

  addItem: (product, options = {}) => {
    const items = get().items;
    const existing = items.find(
      (i) =>
        i.product.id === product.id &&
        i.selectedColor === options.color &&
        i.selectedSize === options.size
    );

    if (existing) {
      set({
        items: items.map((i) =>
          i.product.id === product.id &&
          i.selectedColor === options.color &&
          i.selectedSize === options.size
            ? { ...i, quantity: Math.min(i.quantity + 1, product.stock) }
            : i
        ),
      });
    } else {
      set({
        items: [
          ...items,
          {
            product,
            quantity: 1,
            selectedColor: options.color,
            selectedSize: options.size,
          },
        ],
      });
    }
    set({ isOpen: true });
  },

  removeItem: (productId) =>
    set({ items: get().items.filter((i) => i.product.id !== productId) }),

  updateQuantity: (productId, quantity) => {
    if (quantity <= 0) {
      get().removeItem(productId);
      return;
    }
    set({
      items: get().items.map((i) =>
        i.product.id === productId ? { ...i, quantity } : i
      ),
    });
  },

  clearCart: () => set({ items: [] }),

  total: () =>
    get().items.reduce((sum, i) => sum + i.product.price * i.quantity, 0),

  totalItems: () => get().items.reduce((sum, i) => sum + i.quantity, 0),
}));

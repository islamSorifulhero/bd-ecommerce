// lib/store/cart-store.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface CartItem {
  productId: string;
  variantId?: string; // undefined when the product has no variants
  variantLabel?: string;
  name: string;
  slug: string;
  price: number; // effective price (variant override, else discount/base)
  image: string;
  quantity: number;
  stock: number;
}

function sameLine(a: { productId: string; variantId?: string }, b: { productId: string; variantId?: string }) {
  return a.productId === b.productId && a.variantId === b.variantId;
}

interface CartState {
  items: CartItem[];
  addItem: (item: Omit<CartItem, "quantity">, qty?: number) => void;
  removeItem: (productId: string, variantId?: string) => void;
  updateQuantity: (productId: string, quantity: number, variantId?: string) => void;
  clearCart: () => void;
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  totalItems: () => number;
  totalPrice: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,

      addItem: (item, qty = 1) => {
        const items = get().items;
        const existing = items.find((i) => sameLine(i, item));

        if (existing) {
          const newQty = Math.min(existing.quantity + qty, item.stock);
          set({
            items: items.map((i) => (sameLine(i, item) ? { ...i, quantity: newQty } : i)),
          });
        } else {
          set({ items: [...items, { ...item, quantity: Math.min(qty, item.stock) }] });
        }
        set({ isOpen: true });
      },

      removeItem: (productId, variantId) => {
        set({
          items: get().items.filter((i) => !sameLine(i, { productId, variantId })),
        });
      },

      updateQuantity: (productId, quantity, variantId) => {
        if (quantity <= 0) {
          get().removeItem(productId, variantId);
          return;
        }
        set({
          items: get().items.map((i) =>
            sameLine(i, { productId, variantId })
              ? { ...i, quantity: Math.min(quantity, i.stock) }
              : i
          ),
        });
      },

      clearCart: () => set({ items: [] }),
      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),

      totalItems: () => get().items.reduce((sum, i) => sum + i.quantity, 0),
      totalPrice: () =>
        get().items.reduce((sum, i) => sum + i.price * i.quantity, 0),
    }),
    {
      name: "bd-shop-cart", // localStorage key
      partialize: (state) => ({ items: state.items }),
    }
  )
);

// lib/store/compare-store.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";

const MAX_COMPARE = 4;

interface CompareState {
  productIds: string[];
  toggleProduct: (productId: string) => { added: boolean; atLimit: boolean };
  removeProduct: (productId: string) => void;
  clear: () => void;
  isComparing: (productId: string) => boolean;
}

export const useCompareStore = create<CompareState>()(
  persist(
    (set, get) => ({
      productIds: [],

      toggleProduct: (productId) => {
        const exists = get().productIds.includes(productId);
        if (exists) {
          set({ productIds: get().productIds.filter((id) => id !== productId) });
          return { added: false, atLimit: false };
        }
        if (get().productIds.length >= MAX_COMPARE) {
          return { added: false, atLimit: true };
        }
        set({ productIds: [...get().productIds, productId] });
        return { added: true, atLimit: false };
      },

      removeProduct: (productId) => {
        set({ productIds: get().productIds.filter((id) => id !== productId) });
      },

      clear: () => set({ productIds: [] }),

      isComparing: (productId) => get().productIds.includes(productId),
    }),
    { name: "bd-shop-compare" }
  )
);

export { MAX_COMPARE };

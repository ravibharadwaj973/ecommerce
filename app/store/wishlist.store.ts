import { create } from "zustand";

export const useWishlistStore = create((set, get) => ({
  items: [],
  loading: false,

  setWishlist: (items) => set({ items }),

  clearWishlist: () => set({ items: [] }),

  isWishlisted: (productId) =>
    get().items.some(item => item.product?._id === productId),
}));
import { create } from "zustand";

// 1. Define the shape of a Wishlist Item
interface WishlistItem {
  product: {
    _id: string;
    name: string;
    price: number;
    images: string[];
    // add other necessary product fields here
  };
  addedAt?: Date;
}

// 2. Define the Store's State and Actions
interface WishlistState {
  items: WishlistItem[];
  loading: boolean;
  setWishlist: (items: WishlistItem[]) => void;
  clearWishlist: () => void;
  isWishlisted: (productId: string) => boolean;
}

// 3. Create the store with the defined Type
export const useWishlistStore = create<WishlistState>((set, get) => ({
  items: [],
  loading: false,

  setWishlist: (items) => set({ items }),

  clearWishlist: () => set({ items: [] }),

  isWishlisted: (productId: string) =>
    get().items.some((item) => item.product?._id === productId),
}));
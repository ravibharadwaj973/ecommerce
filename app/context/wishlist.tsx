"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { toast } from "sonner";

interface WishlistContextType {
  wishlistIds: string[]; // For heart icons
  wishlistItems: any[];  // For the Wishlist Page
  isToggling: string | null;
  toggleWishlist: (e: React.MouseEvent | null, productId: string) => Promise<void>;
  removeItem: (productId: string) => Promise<void>;
  isLoadingWishlist: boolean;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const [wishlistItems, setWishlistItems] = useState<any[]>([]);
  const [wishlistIds, setWishlistIds] = useState<string[]>([]);
  const [isToggling, setIsToggling] = useState<string | null>(null);
  const [isLoadingWishlist, setIsLoadingWishlist] = useState(true);

  const fetchWishlist = async () => {
    try {
      const res = await fetch("/api/wishlist");
      const result = await res.json();
      if (result.success) {
        setWishlistItems(result.data.items);
        setWishlistIds(result.data.items.map((item: any) => item.product?._id));
      }
    } catch (err) { console.error(err); }
    finally { setIsLoadingWishlist(false); }
  };

  useEffect(() => { fetchWishlist(); }, []);

  // Shared toggle function (Used by Heart Icons)
  const toggleWishlist = async (e: React.MouseEvent | null, productId: string) => {
    if (e) { e.preventDefault(); e.stopPropagation(); }
    setIsToggling(productId);
    try {
      const res = await fetch("/api/wishlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId }),
      });
      const result = await res.json();
      
      if (result.success) {
        toast.success(result.message);
        // Refresh both IDs and Items
        fetchWishlist();
      }else{
        toast.success(result.message);
      }
    } catch (err) { toast.error("Error updating wishlist"); }
    finally { setIsToggling(null); }
  };

  // Specific delete function (Used by Trash icon in Wishlist Page)
  const removeItem = async (productId: string) => {
    try {
      const res = await fetch("/api/wishlist/clear", {
        method: "DELETE",
        body: JSON.stringify({ productId }),
      });
      const result = await res.json();
      if (result.success) {
        toast.success(result.message);
        setWishlistItems(result.data.items);
        setWishlistIds(result.data.items.map((item: any) => item.product?._id));
      }
    } catch (err) { toast.error("Failed to remove item"); }
  };

  return (
    <WishlistContext.Provider value={{ wishlistIds, wishlistItems, isToggling, toggleWishlist, removeItem, isLoadingWishlist }}>
      {children}
    </WishlistContext.Provider>
  );
}

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) throw new Error("useWishlist must be used within WishlistProvider");
  return context;
};
"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { toast } from "sonner";
import { useAuth } from "./AuthContext";
import { useWishlistStore } from "../store/wishlist.store";

const WishlistContext = createContext();

export function WishlistProvider({ children }) {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
const { setWishlist, clearWishlist } = useWishlistStore();

  useEffect(() => {
    if (user) {
      fetchWishlist();
    } else {
     clearWishlist();
      setLoading(false);
    }
  }, [user]);

  const fetchWishlist = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/wishlist");
      const data = await res.json();

      if (data.success) {
        setWishlist(data.data.items);
      }
    } catch {
      toast.error("Failed to load wishlist");
    } finally {
      setLoading(false);
    }
  };

  const addToWishlist = async (productId) => {
    try {
      const res = await fetch("/api/wishlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId }),
      });

      const data = await res.json();

      if (data.success) {
        setItems((prev) => [...prev, data.data.item]);
        toast.success("Added to wishlist");
      } else {
        toast.error(data.message);
      }
    } catch {
      toast.error("Wishlist error");
    }
  };

  const removeFromWishlist = async (productId) => {
    try {
  
      const res = await fetch(`/api/wishlist/${productId}`, {
        method: "DELETE",
      });

      const data = await res.json();

      if (data.success) {
        setItems((prev) => prev.filter((i) => i.product._id !== productId));
        toast.success("Removed from wishlist");
      } else {
        toast.error(data.message);
      }
    } catch {
      toast.error("Failed to remove item");
    }
  };

  return (
    <WishlistContext.Provider
      value={{
        items,
        loading,
        addToWishlist,
        removeFromWishlist,
        refresh: fetchWishlist,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export const useWishlist = () => useContext(WishlistContext);

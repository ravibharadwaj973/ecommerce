// context/CartContext.tsx
"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { toast } from "sonner";

interface CartContextType {
  cart: any;
  loading: boolean;
  refreshCart: () => Promise<void>;
  updateQuantity: (variantId: string, newQty: number) => Promise<void>;
  removeItem: (variantId: string) => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: React.ReactNode }) => {
  const [cart, setCart] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const refreshCart = useCallback(async () => {
    try {
      const res = await fetch("/api/cart");
      const result = await res.json();
      if (result.success) {
      
        setCart(result.data);
      }
    } catch (err) {
      console.error("Cart fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const updateQuantity = async (variantId: string, newQty: number) => {
    if (newQty < 1) return;
    try {
      const res = await fetch("/api/cart/update", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ variantId, quantity: newQty }),
      });
      const result = await res.json();
      if (result.success) {
        toast.success("product has updated ");
        setCart(result.data);
      }
    } catch (err) {
      console.error("Update failed", err);
    }
  };

  const removeItem = async (variantId: string) => {
    try {
      const res = await fetch("/api/cart/remove", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ variantId }),
      });
      const result = await res.json();
      if (result.success) {
        toast.success("product has removed");
        setCart(result.data);
      }
    } catch (err) {
      console.error("Remove failed", err);
    }
  };

  useEffect(() => {
    refreshCart();
  }, [refreshCart]);

  return (
    <CartContext.Provider
      value={{ cart, loading, refreshCart, updateQuantity, removeItem }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within a CartProvider");
  return context;
};

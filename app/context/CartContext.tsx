'use client';
import { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';
import { toast } from 'sonner';

const CartContext = createContext();

export function CartProvider({ children }) {
  const { user } = useAuth();
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cartSummary, setCartSummary] = useState({
    totalItems: 0,
    totalAmount: 0,
    itemsCount: 0
  });

  // Fetch cart when user changes
  useEffect(() => {
    if (user) {
      fetchCart();
      fetchCartSummary();

    } else {
      setCart(null);
      setCartSummary({ totalItems: 0, totalAmount: 0, itemsCount: 0 });
      setLoading(false);
    }
  }, [user]);

  const fetchCart = async () => {
    try {
      const response = await fetch('/api/cart');
      const data = await response.json();
      
      if (data.success) {
        setCart(data.data.cart);
      } else {
        setCart(null);
      }
    } catch (error) {
      console.error('Error fetching cart:', error);
      setCart(null);
    } finally {
      setLoading(false);
    }
  };

  const fetchCartSummary = async () => {
    try {
      const response = await fetch('/api/cart/summary');
      const data = await response.json();
      
      if (data.success) {
        setCartSummary(data.data);
      }
    } catch (error) {
      console.error('Error fetching cart summary:', error);
    }
  };
   

  const addToCart = async (productId, size, quantity ) => {
    if (!user) {
      toast.error('Please login to add items to cart');
      return { success: false, requiresLogin: true };
    }

    try {
      const response = await fetch('/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itemId: productId, size, quantity })
      });

      const data = await response.json();

      if (data.success) {
        setCart(data.data.cart);
        // Recalculate summary from the updated cart
        await fetchCartSummary();
        toast.success('Product added to cart!');
        return { success: true };
      } else {
        toast.error(data.message || 'Failed to add to cart');
        return { success: false, message: data.message };
      }
    } catch (error) {
      toast.error('Error adding product to cart');
      return { success: false, message: 'Network error' };
    }
  };

  const updateCartItem = async (productId, size, quantity) => {
    try {
      const response = await fetch('/api/cart', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itemId: productId, size, quantity })
      });

      const data = await response.json();

      if (data.success) {
        setCart(data.data.cart);
        await fetchCartSummary();
        
        if (quantity === 0) {
          toast.success('Item removed from cart');
        } else {
          toast.success('Cart updated successfully');
        }
        
        return { success: true };
      } else {
        toast.error(data.message || 'Failed to update cart');
        return { success: false };
      }
    } catch (error) {
      toast.error('Error updating cart');
      return { success: false };
    }
  };

  const removeFromCart = async (productId, size) => {
    try {
      const response = await fetch('/api/cart/remove', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itemId: productId, size })
      });

      const data = await response.json();

      if (data.success) {
        setCart(data.data.cart);
        await fetchCartSummary();
        toast.success('Item removed from cart');
        return { success: true };
      } else {
        toast.error(data.message || 'Failed to remove item');
        return { success: false };
      }
    } catch (error) {
      toast.error('Error removing item from cart');
      return { success: false };
    }
  };

  const clearCart = async () => {
    try {
      const response = await fetch('/api/cart', {
        method: 'DELETE'
      });

      const data = await response.json();

      if (data.success) {
        setCart(null);
        setCartSummary({ totalItems: 0, totalAmount: 0, itemsCount: 0 });
        toast.success('Cart cleared successfully');
        return { success: true };
      } else {
        toast.error(data.message || 'Failed to clear cart');
        return { success: false };
      }
    } catch (error) {
      toast.error('Error clearing cart');
      return { success: false };
    }
  };

  const syncCart = async (guestCart) => {
    try {
      const response = await fetch('/api/cart/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ guestCart })
      });

      const data = await response.json();

      if (data.success) {
        setCart(data.data.cart);
        await fetchCartSummary();
        return { success: true };
      }
      return { success: false };
    } catch (error) {
      return { success: false };
    }
  };

  // Helper function to flatten cart items for display
  const getCartItemsArray = () => {
    if (!cart || !cart.items) return [];
    
    const items = [];
    for (const productId in cart.items) {
      for (const size in cart.items[productId]) {
        items.push({
          productId,
          size,
          ...cart.items[productId][size]
        });
      }
    }
    return items;
  };
const checkout = async (checkoutData) => {
  if (!user) {
    toast.error('Please login to complete checkout');
    return { success: false, requiresLogin: true };
  }
  try {
    const response = await fetch('/api/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(checkoutData)
    });

    const data = await response.json();

    if (data.success) {
      // Clear cart state
      setCart(null);
      setCartSummary({ totalItems: 0, totalAmount: 0, itemsCount: 0 });
      
      return { 
        success: true, 
        order: data.data.order,
        orderNumber: data.data.orderNumber
      };
    } else {
      toast.error(data.message || 'Checkout failed');
      return { success: false, message: data.message };
    }
  } catch (error) {
    toast.error('Error during checkout');
    return { success: false, message: 'Network error' };
  }
};


  const value = {
    cart,
    cartSummary,
    loading,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart,
    syncCart,
      checkout,
    refreshCart: fetchCart,
    refreshSummary: fetchCartSummary,
    getCartItemsArray,
    setCartSummary
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
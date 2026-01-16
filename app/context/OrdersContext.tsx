// context/OrdersContext.jsx
'use client';
import { createContext, useContext, useState } from 'react';
import { useAuth } from './AuthContext';
import { toast } from 'sonner';

const OrdersContext = createContext();

export function OrdersProvider({ children }) {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentOrder, setCurrentOrder] = useState(null);

  const fetchOrders = async (filters = {}) => {
    if (!user) return;

    setLoading(true);
    try {
      const queryParams = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) queryParams.set(key, value);
      });

      const endpoint = user.role === 'admin' ? '/api/orders' : '/api/order/my-orders';
      const response = await fetch(`${endpoint}?${queryParams}`);
      const data = await response.json();

      if (data.success) {
        setOrders(data.data.orders);
        return data;
      } else {
        toast.error(data.message || 'Failed to fetch orders');
      }
    } catch (error) {
      toast.error('Error fetching orders');
    } finally {
      setLoading(false);
    }
  };

  const fetchOrderById = async (orderId) => {
    try {
      const response = await fetch(`/api/orders/${orderId}`);
      const data = await response.json();

      if (data.success) {
        setCurrentOrder(data.data.order);
        return data.data.order;
      } else {
        toast.error(data.message || 'Failed to fetch order');
        return null;
      }
    } catch (error) {
      toast.error('Error fetching order details');
      return null;
    }
  };

  const createOrder = async (orderData) => {
    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData)
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Order created successfully!');
        return { success: true, order: data.data.order };
      } else {
        toast.error(data.message || 'Failed to create order');
        return { success: false, message: data.message };
      }
    } catch (error) {
      toast.error('Error creating order');
      return { success: false, message: 'Network error' };
    }
  };

  const updateOrderStatus = async (orderId, status) => {
    try {
      const response = await fetch(`/api/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Order status updated successfully');
        // Update local state
        setOrders(prev => prev.map(order => 
          order._id === orderId ? { ...order, status } : order
        ));
        if (currentOrder && currentOrder._id === orderId) {
          setCurrentOrder(prev => ({ ...prev, status }));
        }
        return { success: true };
      } else {
        toast.error(data.message || 'Failed to update order status');
        return { success: false };
      }
    } catch (error) {
      toast.error('Error updating order status');
      return { success: false };
    }
  };

  const updatePaymentStatus = async (orderId, paymentStatus) => {
    try {
      const response = await fetch(`/api/orders/${orderId}/payment-status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentStatus })
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Payment status updated successfully');
        // Update local state
        setOrders(prev => prev.map(order => 
          order._id === orderId ? { ...order, paymentStatus } : order
        ));
        if (currentOrder && currentOrder._id === orderId) {
          setCurrentOrder(prev => ({ ...prev, paymentStatus }));
        }
        return { success: true };
      } else {
        toast.error(data.message || 'Failed to update payment status');
        return { success: false };
      }
    } catch (error) {
      toast.error('Error updating payment status');
      return { success: false };
    }
  };



  const deleteOrder = async (orderId) => {
    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: 'DELETE'
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Order deleted successfully');
        setOrders(prev => prev.filter(order => order._id !== orderId));
        if (currentOrder && currentOrder._id === orderId) {
          setCurrentOrder(null);
        }
        return { success: true };
      } else {
        toast.error(data.message || 'Failed to delete order');
        return { success: false };
      }
    } catch (error) {
      toast.error('Error deleting order');
      return { success: false };
    }
  };
  const cancelOrder = async (orderId) => {
  try {
    const response = await fetch(`/api/orders/${orderId}/cancel`, {
      method: 'PATCH'
    });

    const data = await response.json();

    if (data.success) {
      toast.success('Order cancelled successfully');
      // Update local state
      setOrders(prev => prev.map(order => 
        order._id === orderId ? { ...order, status: 'cancelled', paymentStatus: 'refunded' } : order
      ));
      if (currentOrder && currentOrder._id === orderId) {
        setCurrentOrder(prev => ({ 
          ...prev, 
          status: 'cancelled', 
          paymentStatus: 'refunded' 
        }));
      }
      return { success: true };
    } else {
      toast.error(data.message || 'Failed to cancel order');
      return { success: false };
    }
  } catch (error) {
    toast.error('Error cancelling order');
    return { success: false };
  }
};

const reorderItems = async (orderId) => {
  try {
    // Fetch order details first
    const orderResponse = await fetch(`/api/orders/${orderId}`);
    const orderData = await orderResponse.json();

    if (!orderData.success) {
      toast.error('Failed to fetch order details');
      return { success: false };
    }

    const order = orderData.data.order;

    // Add all items to cart
    for (const item of order.items) {
      const cartResponse = await fetch('/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          itemId: item.productId,
          size: item.size || 'One Size',
          quantity: item.quantity
        })
      });

      const cartData = await cartResponse.json();
      if (!cartData.success) {
        throw new Error(`Failed to add ${item.name} to cart`);
      }
    }

    toast.success('All items added to cart successfully!');
    return { success: true };
  } catch (error) {
    toast.error('Failed to reorder items');
    return { success: false };
  }
};

const downloadInvoice = async (orderId) => {
  try {
    // In a real app, this would call your invoice generation API
    const response = await fetch(`/api/orders/${orderId}/invoice`);
    const data = await response.json();

    if (data.success) {
      // Create download link
      const link = document.createElement('a');
      link.href = data.data.invoiceUrl;
      link.download = `invoice-${orderId}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success('Invoice downloaded successfully');
      return { success: true };
    } else {
      toast.error('Failed to generate invoice');
      return { success: false };
    }
  } catch (error) {
    toast.error('Error downloading invoice');
    return { success: false };
  }
};


  const value = {
    orders,
    currentOrder,
    loading,
    fetchOrders,
    fetchOrderById,
    createOrder,
    updateOrderStatus,
    updatePaymentStatus,
    cancelOrder,
    deleteOrder,
    setCurrentOrder,
     reorderItems, // Add this
  downloadInvoice, // Add this
  };

  return (
    <OrdersContext.Provider value={value}>
      {children}
    </OrdersContext.Provider>
  );
}

export const useOrders = () => {
  const context = useContext(OrdersContext);
  if (!context) {
    throw new Error('useOrders must be used within an OrdersProvider');
  }
  return context;
};
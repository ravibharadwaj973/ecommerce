'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useOrders } from '../../context/OrdersContext';
import CheckoutLayout from '../../components/checkout/CheckoutLayout';
import ReviewStep from '../../components/checkout/ReviewStep';
import OrderConfirmation from '../../components/checkout/OrderConfirmation';

export default function ReviewPage() {
  const { user } = useAuth();
  const { cart, cartSummary, loading, checkout } = useCart();
  const { createOrder } = useOrders();
  const router = useRouter();

  const [formData, setFormData] = useState({});
  const [selectedPayment, setSelectedPayment] = useState('razorpay');
  const [processing, setProcessing] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);
  const [orderNumber, setOrderNumber] = useState('');

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }

    if (!loading && (!cart || Object.keys(cart.items).length === 0)) {
      router.push('/cart');
    }

    // Load data from localStorage
    const savedData = localStorage.getItem('checkoutFormData');
    if (savedData) {
      setFormData(JSON.parse(savedData));
    }

    // Check if payment was successful
    const paymentSuccess = localStorage.getItem('paymentSuccess');
    if (paymentSuccess) {
      setSelectedPayment('razorpay');
    }
  }, [user, cart, loading, router]);

  const handleEdit = (step) => {
    switch (step) {
      case 'contact':
        router.push('/checkout');
        break;
      case 'shipping':
        router.push('/checkout/shipping');
        break;
      case 'payment':
        router.push('/checkout/payment');
        break;
    }
  };

const handlePlaceOrder = async () => {
  setProcessing(true);

  try {
    const shippingCost = cartSummary.totalAmount > 50 ? 0 : 9.99;
    const tax = cartSummary.totalAmount * 0.08;
    const total = cartSummary.totalAmount + shippingCost + tax;

    const shippingAddress = { ...formData };

    const paymentMethod = {
      type: selectedPayment,
      razorpayResponse:
        typeof window !== "undefined" &&
        localStorage.getItem("razorpayResponse")
          ? JSON.parse(localStorage.getItem("razorpayResponse"))
          : null,
    };

    const result = await checkout({
      shippingAddress,
      paymentMethod,
    });

    if (result.success) {
      console.log("Redirecting:", result.orderNumber, total);

   

      // Now safe
      setOrderNumber(result.orderNumber);
      setOrderComplete(true);

      // Clear local data
      if (typeof window !== "undefined") {
        localStorage.removeItem("checkoutFormData");
        localStorage.removeItem("paymentSuccess");
        localStorage.removeItem("razorpayResponse");
      }
     const successUrl = `/order-success?order=${result.orderNumber}&amount=${total}`;
      window.location.assign(successUrl); // This will definitely navigate
    } else {
      alert(result.message || "Failed to create order");
    }
  } catch (err) {
    console.error("Order placement error:", err);
    alert("Failed to place order. Please try again.");
  } finally {
    setProcessing(false);
  }
};

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading checkout...</p>
        </div>
      </div>
    );
  }

  if (!user || !cart || Object.keys(cart.items).length === 0) {
    return null;
  }

  if (orderComplete) {
    return (
      <OrderConfirmation
        formData={formData}
        orderNumber={orderNumber}
        cartSummary={cartSummary}
      />
    );
  }

  return (
    <CheckoutLayout
      currentStep="review"
      cart={cart}
      cartSummary={cartSummary}
    >
      <ReviewStep
        formData={formData}
        selectedPayment={selectedPayment}
        cartSummary={cartSummary}
        onEdit={handleEdit}
        onPlaceOrder={handlePlaceOrder}
        processing={processing}
      />
    </CheckoutLayout>
  );
}
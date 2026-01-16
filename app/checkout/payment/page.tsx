'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import CheckoutLayout from '../../components/checkout/CheckoutLayout';
import PaymentStep from '../../components/checkout/PaymentStep';

export default function PaymentPage() {
  const { user } = useAuth();
  const { cart, cartSummary, loading } = useCart();
  const router = useRouter();

  const [formData, setFormData] = useState({
    email: '',
    phone: '',
    firstName: '',
    lastName: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'India',
  });

  const [selectedPayment, setSelectedPayment] = useState('razorpay');

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

    // Load Razorpay script
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, [user, cart, loading, router]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    const updatedData = {
      ...formData,
      [name]: value
    };
    setFormData(updatedData);
    localStorage.setItem('checkoutFormData', JSON.stringify(updatedData));
  };

  const handleNext = () => {
    router.push('/checkout/review');
  };

  const handleBack = () => {
    router.push('/checkout/shipping');
  };

  const handleRazorpayPayment = async () => {
    try {
      // Create order in your backend
      const shippingCost = cartSummary.totalAmount > 50 ? 0 : 9.99;
      const tax = cartSummary.totalAmount * 0.08;
      const total = cartSummary.totalAmount + shippingCost + tax;

      const orderResponse = await fetch('/api/payment/order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: Math.round(total * 100), // Convert to paise
        }),
      });

      const orderData = await orderResponse.json();

      if (!orderData.success) {
        alert('Failed to create payment order');
        return;
      }

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: orderData.order.amount,
        currency: "INR",
        name: "Your Store",
        description: "Order Payment",
        order_id: orderData.order.id,
        handler: async function (response) {
          // Verify payment
          const verifyResponse = await fetch('/api/payment/verify', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(response),
          });

          const verifyData = await verifyResponse.json();

          if (verifyData.success) {
            // Save payment info and proceed to review
            localStorage.setItem('paymentSuccess', 'true');
            localStorage.setItem('razorpayResponse', JSON.stringify(response));
            router.push('/checkout/review');
          } else {
            alert('Payment verification failed');
          }
        },
        prefill: {
          name: `${formData.firstName} ${formData.lastName}`,
          email: formData.email,
          contact: formData.phone,
        },
        notes: {
          address: formData.address,
        },
        theme: {
          color: "#6366f1",
        },
        modal: {
          ondismiss: function() {
            alert('Payment cancelled');
          }
        }
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (error) {
      console.error('Payment error:', error);
      alert('Payment failed. Please try again.');
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

  return (
    <CheckoutLayout
      currentStep="payment"
      cart={cart}
      cartSummary={cartSummary}
    >
      <PaymentStep
        formData={formData}
        onChange={handleInputChange}
        onNext={handleNext}
        onBack={handleBack}
        cartSummary={cartSummary}
        onRazorpayPayment={handleRazorpayPayment}
      />
    </CheckoutLayout>
  );
}
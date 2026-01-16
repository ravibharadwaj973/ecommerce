'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import CheckoutLayout from '../../components/checkout/CheckoutLayout';
import ShippingStep from '../../components/checkout/ShippingStep';

export default function ShippingPage() {
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

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }

    if (!loading && (!cart || Object.keys(cart.items).length === 0)) {
      router.push('/cart');
    }

    // Load data from localStorage or previous step
    const savedData = localStorage.getItem('checkoutFormData');
    if (savedData) {
      setFormData(JSON.parse(savedData));
    }
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
    router.push('/checkout/payment');
  };

  const handleBack = () => {
    router.push('/checkout');
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
      currentStep="shipping"
      cart={cart}
      cartSummary={cartSummary}
    >
      <ShippingStep
        formData={formData}
        onChange={handleInputChange}
        onNext={handleNext}
        onBack={handleBack}
      />
    </CheckoutLayout>
  );
}
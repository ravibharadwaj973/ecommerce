'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import CheckoutLayout from '../components/checkout/CheckoutLayout';
import ContactStep from '../components/checkout/ContactStep';

export default function CheckoutPage() {
  const { user } = useAuth();
  const { cart, cartSummary, loading } = useCart();
  const router = useRouter();

  const [formData, setFormData] = useState({
    email: user?.email || '',
    phone: '',
    firstName: '',
    lastName: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'India',
  });

  const [currentStep, setCurrentStep] = useState('contact');

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }

    if (!loading && (!cart || Object.keys(cart.items).length === 0)) {
      router.push('/cart');
    }
  }, [user, cart, loading, router]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleNext = () => {
    if (currentStep === 'contact') {
      router.push('/checkout/shipping');
    }
  };

  const handleStepChange = (step) => {
    setCurrentStep(step);
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
    return null; // Will redirect in useEffect
  }

  return (
    <CheckoutLayout
      currentStep={currentStep}
      onStepChange={handleStepChange}
      cart={cart}
      cartSummary={cartSummary}
    >
      <ContactStep
        formData={formData}
        onChange={handleInputChange}
        onNext={handleNext}
      />
    </CheckoutLayout>
  );
}
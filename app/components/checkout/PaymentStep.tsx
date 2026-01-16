'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { CreditCard, Wallet, Building, QrCode, Lock } from 'lucide-react';

const paymentMethods = [
  {
    id: 'razorpay',
    name: 'Credit/Debit Card',
    icon: CreditCard,
    description: 'Pay securely with Razorpay',
    supported: true
  },
  {
    id: 'cod',
    name: 'Cash on Delivery',
    icon: Wallet,
    description: 'Pay when you receive your order',
    supported: true
  },
  {
    id: 'bank',
    name: 'Bank Transfer',
    icon: Building,
    description: 'Transfer directly to our bank account',
    supported: true
  }
];

export default function PaymentStep({ 
  formData, 
  onChange, 
  onNext, 
  onBack,
  cartSummary,
  onRazorpayPayment 
}) {
  const [selectedPayment, setSelectedPayment] = useState('razorpay');

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (selectedPayment === 'razorpay') {
      // Handle Razorpay payment
      handleRazorpayPayment();
    } else {
      // For other payment methods, proceed to review
      onNext();
    }
  };

  const handleRazorpayPayment = async () => {
    try {
      // Create order in your backend
      const orderResponse = await fetch('/api/payment/order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: Math.round(cartSummary.totalAmount * 100), // Convert to paise
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
        name: "Your Store Name",
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
            // Payment successful, proceed to next step
            onNext();
          } else {
            alert('Payment verification failed');
          }
        },
        prefill: {
          name: `${formData.firstName} ${formData.lastName}`,
          email: formData.email,
          contact: formData.phone,
        },
        theme: {
          color: "#6366f1",
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (error) {
      console.error('Payment error:', error);
      alert('Payment failed. Please try again.');
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center mb-6">
        <CreditCard className="w-6 h-6 text-indigo-600 mr-3" />
        <h2 className="text-2xl font-bold text-gray-900">Payment Method</h2>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="space-y-4">
          {/* Payment Method Selection */}
          <div className="space-y-3">
            {paymentMethods.map((method) => (
              <div
                key={method.id}
                className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                  selectedPayment === method.id
                    ? 'border-indigo-500 bg-indigo-50'
                    : 'border-gray-200 hover:border-gray-300'
                } ${!method.supported ? 'opacity-50 cursor-not-allowed' : ''}`}
                onClick={() => method.supported && setSelectedPayment(method.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <method.icon className={`w-5 h-5 ${
                      selectedPayment === method.id ? 'text-indigo-600' : 'text-gray-400'
                    }`} />
                    <div>
                      <h3 className="font-medium text-gray-900">{method.name}</h3>
                      <p className="text-sm text-gray-500">{method.description}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Payment Details Based on Selection */}
          {selectedPayment === 'cod' && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-sm text-yellow-800">
                💵 You'll pay with cash when your order is delivered. Please have exact change ready.
              </p>
            </div>
          )}

          {selectedPayment === 'bank' && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="text-sm text-blue-800 space-y-2">
                <p><strong>Bank Name:</strong> Your Business Bank</p>
                <p><strong>Account Number:</strong> 1234 5678 9012</p>
                <p><strong>IFSC Code:</strong> ABCD0123456</p>
              </div>
            </div>
          )}

          {/* Security Notice */}
          <div className="flex items-center space-x-2 text-sm text-green-600 bg-green-50 p-3 rounded-lg">
            <Lock className="w-4 h-4" />
            <span>Your payment is secure and encrypted</span>
          </div>

          <div className="flex justify-between pt-4">
            <button
              type="button"
              onClick={onBack}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
            >
              Back
            </button>
            <button
              type="submit"
              className="bg-indigo-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-indigo-700 transition-colors flex items-center space-x-2"
            >
              {selectedPayment === 'razorpay' ? (
                <>
                  <CreditCard className="w-4 h-4" />
                  <span>Pay Now</span>
                </>
              ) : (
                <span>Continue to Review</span>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
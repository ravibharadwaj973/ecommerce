'use client';
import { motion } from 'framer-motion';
import { CheckCircle, Edit } from 'lucide-react';

export default function ReviewStep({ 
  formData, 
  selectedPayment, 
  cartSummary, 
  onEdit, 
  onPlaceOrder,
  processing,
  orderNumber, // Add this prop
  totalAmount // Add this prop
}) {
  const shippingCost = cartSummary.totalAmount > 50 ? 0 : 9.99;
  const tax = cartSummary.totalAmount * 0.08;
  const total = cartSummary.totalAmount + shippingCost + tax;

  const handlePlaceOrder = async () => {
    // Call the parent's onPlaceOrder function
    const result = await onPlaceOrder();
    
    // The router.push should be handled in the parent component
    // after the order is successfully created
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center mb-6">
        <CheckCircle className="w-6 h-6 text-indigo-600 mr-3" />
        <h2 className="text-2xl font-bold text-gray-900">Review Your Order</h2>
      </div>

      <div className="space-y-6">
        {/* Contact Information */}
        <div className="border-b border-gray-200 pb-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-gray-900">Contact Information</h3>
            <button
              onClick={() => onEdit('contact')}
              className="text-indigo-600 hover:text-indigo-700 flex items-center space-x-1"
            >
              <Edit className="w-4 h-4" />
              <span>Edit</span>
            </button>
          </div>
          <p className="text-gray-600">{formData.email}</p>
          <p className="text-gray-600">{formData.phone}</p>
        </div>

        {/* Shipping Address */}
        <div className="border-b border-gray-200 pb-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-gray-900">Shipping Address</h3>
            <button
              onClick={() => onEdit('shipping')}
              className="text-indigo-600 hover:text-indigo-700 flex items-center space-x-1"
            >
              <Edit className="w-4 h-4" />
              <span>Edit</span>
            </button>
          </div>
          <p className="text-gray-600">
            {formData.firstName} {formData.lastName}
          </p>
          <p className="text-gray-600">{formData.address}</p>
          <p className="text-gray-600">
            {formData.city}, {formData.state} {formData.zipCode}
          </p>
          <p className="text-gray-600">{formData.country}</p>
        </div>

        {/* Payment Method */}
        <div className="border-b border-gray-200 pb-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-gray-900">Payment Method</h3>
            <button
              onClick={() => onEdit('payment')}
              className="text-indigo-600 hover:text-indigo-700 flex items-center space-x-1"
            >
              <Edit className="w-4 h-4" />
              <span>Edit</span>
            </button>
          </div>
          <p className="text-gray-600 capitalize">
            {selectedPayment === 'razorpay' ? 'Credit/Debit Card (Razorpay)' : 
             selectedPayment === 'cod' ? 'Cash on Delivery' : 
             'Bank Transfer'}
          </p>
        </div>

        {/* Order Total */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="font-semibold text-gray-900 mb-3">Order Total</h3>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Subtotal</span>
              <span>₹{cartSummary.totalAmount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Shipping</span>
              <span>{shippingCost === 0 ? 'FREE' : `₹${shippingCost.toFixed(2)}`}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Tax</span>
              <span>₹{tax.toFixed(2)}</span>
            </div>
            <div className="border-t border-gray-200 pt-2">
              <div className="flex justify-between font-semibold">
                <span>Total</span>
                <span>₹{total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Place Order Button */}
        <button 
          onClick={handlePlaceOrder}
          disabled={processing}
          className="w-full bg-indigo-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
        >
          {processing ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Processing...</span>
            </>
          ) : (
            <>
              <CheckCircle className="w-5 h-5" />
              <span>Place Order</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
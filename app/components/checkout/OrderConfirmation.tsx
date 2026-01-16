'use client';
import { motion } from 'framer-motion';
import { CheckCircle, Package, Mail } from 'lucide-react';
import Link from 'next/link';

export default function OrderConfirmation({ formData, orderNumber, cartSummary }) {
  const shippingCost = cartSummary.totalAmount > 50 ? 0 : 9.99;
  const tax = cartSummary.totalAmount * 0.08;
  const total = cartSummary.totalAmount + shippingCost + tax;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5 }}
            className="mb-6"
          >
            <CheckCircle className="w-24 h-24 text-green-500 mx-auto" />
          </motion.div>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Order Confirmed!</h1>
          <p className="text-lg text-gray-600 mb-2">
            Thank you for your purchase, {formData.firstName}!
          </p>
          <p className="text-gray-600 mb-6">
            Your order number is <strong className="text-indigo-600">{orderNumber}</strong>
          </p>

          <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6 text-left">
            <div className="flex items-center mb-4">
              <Mail className="w-5 h-5 text-gray-400 mr-2" />
              <h3 className="font-semibold text-gray-900">Order Details Sent</h3>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              We've sent order confirmation and tracking details to <strong>{formData.email}</strong>
            </p>
            
            <h3 className="font-semibold text-gray-900 mb-3">Order Summary</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Items:</span>
                <span>₹{cartSummary.totalAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping:</span>
                <span>{shippingCost === 0 ? 'FREE' : `₹${shippingCost.toFixed(2)}`}</span>
              </div>
              <div className="flex justify-between">
                <span>Tax:</span>
                <span>₹{tax.toFixed(2)}</span>
              </div>
              <div className="border-t border-gray-200 pt-2 mt-2">
                <div className="flex justify-between font-semibold">
                  <span>Total:</span>
                  <span>₹{total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/products"
              className="bg-indigo-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-indigo-700 transition-colors flex items-center justify-center space-x-2"
            >
              <Package className="w-4 h-4" />
              <span>Continue Shopping</span>
            </Link>
            <Link
              href="/orders"
              className="border border-gray-300 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
            >
              View Orders
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
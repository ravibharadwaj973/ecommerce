'use client';
import { motion } from 'framer-motion';
import { Package } from 'lucide-react';

export default function OrderSummary({ cart, cartSummary, currentStep }) {
  if (!cart || !cart.items) return null;

  const shippingCost = cartSummary.totalAmount > 50 ? 0 : 9.99;
  const tax = cartSummary.totalAmount * 0.08;
  const total = cartSummary.totalAmount + shippingCost + tax;

  const cartItems = [];
  for (const productId in cart.items) {
    for (const size in cart.items[productId]) {
      cartItems.push({
        productId,
        size,
        ...cart.items[productId][size]
      });
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="bg-white rounded-lg border border-gray-200 p-6 sticky top-8"
    >
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Order Summary</h2>

      {/* Order Items */}
      <div className="space-y-3 mb-4 max-h-64 overflow-y-auto">
        {cartItems.map((item) => (
          <div key={`${item.productId}-${item.size}`} className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
              {item.image ? (
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <Package className="w-6 h-6 text-gray-400 m-3" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {item.name}
              </p>
              <p className="text-xs text-gray-500">
                Size: {item.size} × {item.quantity}
              </p>
            </div>
            <p className="text-sm font-semibold text-gray-900">
              ₹{(item.price * item.quantity).toFixed(2)}
            </p>
          </div>
        ))}
      </div>

      {/* Price Breakdown */}
      <div className="border-t border-gray-200 pt-4 space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Subtotal</span>
          <span className="text-gray-900">₹{cartSummary.totalAmount.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Shipping</span>
          <span className="text-gray-900">
            {shippingCost === 0 ? 'FREE' : `₹${shippingCost.toFixed(2)}`}
          </span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Tax</span>
          <span className="text-gray-900">₹{tax.toFixed(2)}</span>
        </div>
        <div className="border-t border-gray-200 pt-2">
          <div className="flex justify-between text-lg font-semibold">
            <span className="text-gray-900">Total</span>
            <span className="text-gray-900">₹{total.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Free Shipping Notice */}
      {cartSummary.totalAmount < 50 && (
        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-sm text-yellow-800 text-center">
            Add ₹{(50 - cartSummary.totalAmount).toFixed(2)} more for free shipping!
          </p>
        </div>
      )}
    </motion.div>
  );
}
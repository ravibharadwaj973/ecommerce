// components/CartIcon.jsx
'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, X, ArrowRight, Package } from 'lucide-react';
import Link from 'next/link';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

export default function CartIcon() {
  const { user } = useAuth();
  const { cartSummary, cart, updateCartItem, removeFromCart } = useCart();
  const [isOpen, setIsOpen] = useState(false);

  if (!user) {
    return (
      <Link
        href="/login"
        className="relative p-2 text-gray-700 hover:text-indigo-600 transition-colors"
        title="Login to view cart"
      >
        <ShoppingCart className="w-6 h-6" />
      </Link>
    );
  }

  const cartItems = cart ? Object.entries(cart.items).flatMap(([productId, sizes]) =>
    Object.entries(sizes).map(([size, item]) => ({
      productId,
      size,
      ...item
    }))
  ) : [];

  const handleQuantityChange = async (productId, size, newQuantity) => {
    if (newQuantity >= 0) {
      await updateCartItem(productId, size, newQuantity);
    }
  };

  return (
    <>
      {/* Cart Icon */}
      <button
        onClick={() => setIsOpen(true)}
        className="relative p-2 text-gray-700 hover:text-indigo-600 transition-colors"
      >
        <ShoppingCart className="w-6 h-6" />
        {cartSummary.totalItems > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 bg-indigo-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-semibold"
          >
            {cartSummary.totalItems}
          </motion.span>
        )}
      </button>

      {/* Cart Sidebar */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black bg-opacity-50 z-40"
            />

            {/* Sidebar */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 30 }}
              className="fixed top-0 right-0 h-full w-96 bg-white shadow-xl z-50 flex flex-col"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">
                  Your Cart ({cartSummary.totalItems})
                </h2>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Cart Items */}
              <div className="flex-1 overflow-y-auto p-4">
                {cartItems.length > 0 ? (
                  <div className="space-y-4">
                    {cartItems.map((item) => (
                      <div
                        key={`${item.productId}-${item.size}`}
                        className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg"
                      >
                        {/* Product Image */}
                        <div className="w-12 h-12 bg-white rounded border border-gray-200 overflow-hidden flex-shrink-0">
                          {item.image ? (
                            <img
                              src={item.image}
                              alt={item.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <Package className="w-6 h-6 text-gray-400 m-1" />
                          )}
                        </div>

                        {/* Product Info */}
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-medium text-gray-900 truncate">
                            {item.name}
                          </h4>
                          <p className="text-xs text-gray-600">
                            Size: {item.size} • ${item.price}
                          </p>
                          <div className="flex items-center space-x-2 mt-1">
                            <button
                              onClick={() => handleQuantityChange(item.productId, item.size, item.quantity - 1)}
                              className="w-6 h-6 rounded border border-gray-300 flex items-center justify-center text-xs hover:bg-gray-100"
                            >
                              -
                            </button>
                            <span className="text-sm font-medium w-6 text-center">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => handleQuantityChange(item.productId, item.size, item.quantity + 1)}
                              disabled={!item.available || item.quantity >= item.stock}
                              className="w-6 h-6 rounded border border-gray-300 flex items-center justify-center text-xs hover:bg-gray-100 disabled:opacity-50"
                            >
                              +
                            </button>
                          </div>
                        </div>

                        {/* Remove Button */}
                        <button
                          onClick={() => removeFromCart(item.productId, item.size)}
                          className="text-red-400 hover:text-red-600 transition-colors p-1"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <ShoppingCart className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">Your cart is empty</p>
                  </div>
                )}
              </div>

              {/* Footer */}
              {cartItems.length > 0 && (
                <div className="border-t border-gray-200 p-4 space-y-4">
                  {/* Total */}
                  <div className="flex justify-between items-center text-lg font-semibold">
                    <span className="text-gray-900">Total:</span>
                    <span className="text-gray-900">${cartSummary.totalAmount.toFixed(2)}</span>
                  </div>

                  {/* Actions */}
                  <div className="space-y-2">
                    <Link
                      href="/cart"
                      onClick={() => setIsOpen(false)}
                      className="w-full bg-indigo-600 text-white py-2 px-4 rounded-lg font-semibold hover:bg-indigo-700 transition-colors flex items-center justify-center space-x-2"
                    >
                      <span>View Cart</span>
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                    <Link
                      href="/checkout"
                      onClick={() => setIsOpen(false)}
                      className="w-full border border-indigo-600 text-indigo-600 py-2 px-4 rounded-lg font-semibold hover:bg-indigo-50 transition-colors text-center block"
                    >
                      Checkout
                    </Link>
                  </div>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
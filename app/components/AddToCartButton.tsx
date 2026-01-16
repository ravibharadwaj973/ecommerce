'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { ShoppingCart, Check, Plus, Minus } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';

export default function AddToCartButton({ 
  product, 
  size = 'One Size', 
  className = '',
  showQuantity = false 
}) {
  const { user } = useAuth();
  const { addToCart, cart } = useCart();
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [localQuantity, setLocalQuantity] = useState(1);

  // Check if product is in cart (handle nested structure)
  const isInCart = cart?.items?.[product._id]?.[size];

  const handleAddToCart = async () => {
    if (!user) {
      // Handle guest cart or redirect to login
      toast.error('Please login to add items to cart');
      return;
    }

    setLoading(true);
    
    const quantity = showQuantity ? localQuantity : 1;
    const result = await addToCart(product._id, size, quantity);
    
    if (result.success) {
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 2000);
      if (showQuantity) setLocalQuantity(1);
    }
    
    setLoading(false);
  };

  const incrementQuantity = () => {
    if (localQuantity < product.stock) {
      setLocalQuantity(prev => prev + 1);
    }
  };

  const decrementQuantity = () => {
    if (localQuantity > 1) {
      setLocalQuantity(prev => prev - 1);
    }
  };

  if (showSuccess) {
    return (
      <motion.button
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        className={`bg-green-600 text-white px-6 py-3 rounded-lg font-semibold flex items-center justify-center space-x-2 ${className}`}
      >
        <Check className="w-5 h-5" />
        <span>Added to Cart!</span>
      </motion.button>
    );
  }

  return (
    <div className={`flex items-center space-x-3 ${className}`}>
      {/* Quantity Selector */}
      {showQuantity && (
        <div className="flex items-center space-x-2 bg-gray-100 rounded-lg p-1">
          <button
            onClick={decrementQuantity}
            disabled={localQuantity <= 1}
            className="w-8 h-8 rounded flex items-center justify-center text-gray-600 hover:bg-white disabled:opacity-50"
          >
            <Minus className="w-4 h-4" />
          </button>
          <span className="w-8 text-center font-medium">{localQuantity}</span>
          <button
            onClick={incrementQuantity}
            disabled={localQuantity >= product.stock}
            className="w-8 h-8 rounded flex items-center justify-center text-gray-600 hover:bg-white disabled:opacity-50"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Add to Cart Button */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={handleAddToCart}
        disabled={loading || product.stock === 0 || (showQuantity && localQuantity > product.stock)}
        className={`flex-1 ${
          isInCart 
            ? 'bg-green-600 hover:bg-green-700' 
            : 'bg-indigo-600 hover:bg-indigo-700'
        } text-white px-6 py-3 rounded-lg font-semibold flex items-center justify-center space-x-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed`}
      >
        {loading ? (
          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
        ) : (
          <>
            <ShoppingCart className="w-5 h-5" />
            <span>
              {isInCart ? 'Added to Cart' : product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
            </span>
          </>
        )}
      </motion.button>
    </div>
  );
}
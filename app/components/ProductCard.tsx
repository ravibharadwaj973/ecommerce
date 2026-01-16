// components/ProductCard.jsx
'use client';
import { motion } from 'framer-motion';
import { ShoppingCart, Heart, Eye, Star } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import Link from 'next/link';
import { useWishlist } from '../context/wishlist';
import { useWishlistStore } from '../store/wishlist.store';

export default function ProductCard({ product , compact = false }) {
  // const [isLiked, setIsLiked] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const{addToWishlist,removeFromWishlist}=useWishlist();
  
const {  isWishlisted } = useWishlistStore();
  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      const response = await fetch('/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: product._id, quantity: 1 })
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Product added to cart!');
      } else {
        toast.error(data.message || 'Failed to add to cart');
      }
    } catch (error) {
      toast.error('Error adding product to cart');
    }
  };
  
 const isLiked = isWishlisted(product._id);

 const handleLike = () => {
  if (isLiked) {
    removeFromWishlist(product._id);
  } else {
    addToWishlist(product._id);
  }
};

  // Helper function to get image URL
  const getImageUrl = (image) => {
    if (typeof image === 'string') return image;
    if (image.url) return image.url;
    if (image.secure_url) return image.secure_url;
    return '/placeholder-image.jpg';
  };

  // Get the first image or placeholdeFhearr
  const mainImage = product.images?.[0] ? getImageUrl(product.images[0]) : '/placeholder-image.jpg';

  const currentPrice = product.isOnSale && product.salePrice ? product.salePrice : product.price;
  const isSaleActive = product.isOnSale && product.salePrice;
  
  // Calculate discount percentage dynamically
  const discountPercent = isSaleActive 
    ? Math.round(((product.price - currentPrice) / product.price) * 100)
    : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
     whileHover={compact ? {} : { y: -5 }}
      transition={{ duration: 0.3 }}
      className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden group hover:shadow-lg transition-all duration-300"
    >
      {/* Product Image */}
      <div className="relative overflow-hidden bg-gray-100">
        <Link href={`/products/${product._id}`}>
          <div   className={`relative cursor-pointer ${
    compact ? 'aspect-[4/5]' : 'aspect-square'
  }`}>
            {/* Main Product Image */}
            <img
              src={mainImage}
              alt={product.name}
              className={`w-full h-full object-cover transition-opacity duration-300 ${
                imageLoaded ? 'opacity-100' : 'opacity-0'
              } ${compact ? 'group-hover:scale-100' : 'group-hover:scale-105'}transition-transform duration-500`}
              onLoad={() => setImageLoaded(true)}
            />
            
            {/* Loading Skeleton */}
            {!imageLoaded && (
              <div className="absolute inset-0 bg-gray-200 animate-pulse" />
            )}
            
            {/* Quick Actions Overlay */}
           <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
  <div className="flex space-x-2 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
    
    {/* Add to Cart */}
    <button
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        handleAddToCart();
      }}
      className="bg-white p-3 rounded-full shadow-lg hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
      disabled={product.stock === 0}
    >
      <ShoppingCart className="w-4 h-4" />
    </button>

    {/* View Product (Eye icon) */}
    <button
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        router.push(`/products/${product._id}`);
      }}
      className="bg-white p-3 rounded-full shadow-lg hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
    >
      <Eye className="w-4 h-4" />
    </button>

  </div>
</div>

          </div>
        </Link>

        {/* Sale Badge */}
        {isSaleActive && (
          <div className="absolute top-3 left-3 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-semibold">
            -{discountPercent}%
          </div>
        )}

        {/* Stock Badge */}
        {product.stock === 0 && (
          <div className="absolute top-3 left-3 bg-gray-600 text-white px-2 py-1 rounded-full text-xs font-semibold">
            Out of Stock
          </div>
        )}

        {/* Like Button */}
        <button
          onClick={()=>handleLike(product._id)}
          className="absolute top-3 right-3 p-2 rounded-full bg-white bg-opacity-80 hover:bg-opacity-100 transition-all shadow-sm"
        >
          <Heart
            className={`w-4 h-4 transition-colors ${
              isLiked ? 'fill-red-500 text-red-500' : 'text-gray-600 hover:text-red-500'
            }`}
          />
        </button>
      </div>

      {/* Product Info */}
     <div className={compact ? 'p-3' : 'p-4'}>
        <Link href={`/products/${product._id}`}>
          <h3  className={`hover:text-indigo-600 transition-colors line-clamp-2 cursor-pointer ${
    compact
      ? 'text-sm font-medium mb-1'
      : 'text-base font-semibold mb-2'
  }`}>
            {product.name}
          </h3>
        </Link>

        {/* Category */}
        {product.category && (
          <p className="text-xs text-gray-500 mb-2 capitalize">
            {product.category.name || product.category}
          </p>
        )}

       {!compact && (
  <p className="text-gray-600 text-sm line-clamp-2 mb-3">
    {product.description}
  </p>
)}

        {/* Rating */}
        <div className="flex items-center mb-3">
          <div className="flex items-center">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`w-3 h-3 ${
                  i < Math.floor(product.rating?.average || 0)
                    ? 'fill-yellow-400 text-yellow-400'
                    : 'text-gray-300'
                }`}
              />
            ))}
          </div>
          <span className="text-xs text-gray-500 ml-1">
            ({product.rating?.count || 0})
          </span>
        </div>

        {/* Price and Add to Cart */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className={`${compact ? 'text-sm' : 'text-lg'} font-bold text-gray-900`}>
              ${currentPrice}
            </span>
            {isSaleActive && (
              <span className="text-sm text-gray-500 line-through">
                ${product.price}
              </span>
            )}
          </div>

          <button
            onClick={handleAddToCart}
            disabled={product.stock === 0}
            className={`p-2 rounded-lg transition-colors ${
              product.stock === 0
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-indigo-600 text-white hover:bg-indigo-700'
            }`}
          >
            <ShoppingCart className="w-4 h-4" />
          </button>
        </div>

        {/* Stock Status */}
        <div className="mt-2">
          <span
            className={`text-xs font-medium px-2 py-1 rounded-full ${
              product.stock > 10
                ? 'text-green-600 bg-green-50'
                : product.stock > 0
                ? 'text-orange-600 bg-orange-50'
                : 'text-red-600 bg-red-50'
            }`}
          >
            {product.stock > 10
              ? 'In stock'
              : product.stock > 0
              ? `Only ${product.stock} left`
              : 'Out of stock'}
          </span>
        </div>
      </div>
    </motion.div>
  );
}
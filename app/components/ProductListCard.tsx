// components/ProductListCard.jsx
'use client';
import { Heart, ShoppingCart, Star, Tag, Zap, Sparkles } from 'lucide-react';
import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

export default function ProductListCard({ product }) {
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [imageError, setImageError] = useState(false);

  const primaryImage = product.images?.[0]?.url || '/placeholder-product.jpg';
  
  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
 
    alert('Add to cart:', product.name);
  };

  const handleWishlist = (e) => {
    alert(e)
    e.preventDefault();
    e.stopPropagation();
    setIsWishlisted(!isWishlisted);
  };


  const displayPrice = product.salePrice || product.price;
  const originalPrice = product.salePrice ? product.price : null;
  const discountPercent = product.discountPercent;

  return (
    <Link href={`/products/${product._id || product.id}`}>
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all duration-300 group cursor-pointer">
        <div className="flex flex-col md:flex-row">
          {/* Product Image */}
          <div className="md:w-48 lg:w-56 xl:w-64 h-48 md:h-auto relative overflow-hidden">
            <Image
              src={imageError ? '/placeholder-product.jpg' : primaryImage}
              alt={product.name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              onError={() => setImageError(true)}
            />
            
            {/* Badges */}
            <div className="absolute top-3 left-3 flex flex-col space-y-1">
              {product.isFeatured && (
                <span className="bg-yellow-500 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center space-x-1">
                  <Sparkles className="w-3 h-3" />
                  <span>Featured</span>
                </span>
              )}
              {product.isOnSale && (
                <span className="bg-red-500 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center space-x-1">
                  <Zap className="w-3 h-3" />
                  <span>Sale</span>
                </span>
              )}
              {product.isLimitedEdition && (
                <span className="bg-purple-500 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center space-x-1">
                  <Tag className="w-3 h-3" />
                  <span>Limited</span>
                </span>
              )}
            </div>

            {discountPercent > 0 && (
              <span className="absolute top-3 right-3 bg-green-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                -{discountPercent}%
              </span>
            )}
          </div>

          {/* Product Details */}
          <div className="flex-1 p-6">
            <div className="flex flex-col h-full justify-between">
              <div>
                {/* Category and Brand */}
                <div className="flex items-center space-x-2 text-sm text-gray-500 mb-2">
                  {product.category?.name && (
                    <span className="bg-gray-100 px-2 py-1 rounded">gjhgmbmjhkkjhkjhkjhj{product.category.name}</span>
                  )}
                  {product.brand && (
                    <span className="text-gray-600">hgjhg {product.brand}</span>
                  )}
                </div>

                {/* Product Name */}
                <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-indigo-600 transition-colors line-clamp-2">
                  {product.name}
                </h3>

                {/* Description */}
                <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                  {product.shortDescription || product.description}
                </p>

                {/* Rating */}
                <div className="flex items-center space-x-2 mb-3">
                  <div className="flex items-center space-x-1">
                    <Star className="w-4 h-4 text-yellow-400 fill-current" />
                    <span className="text-sm font-medium text-gray-900">
                      {product.rating?.average || '4.5'}
                    </span>
                  </div>
                  <span className="text-gray-400 text-sm">•</span>
                  <span className="text-gray-500 text-sm">
                    {product.rating?.count || '0'} reviews
                  </span>
                  {product.stock > 0 && (
                    <>
                      <span className="text-gray-400 text-sm">•</span>
                      <span className="text-green-600 text-sm font-medium">
                        In Stock ({product.stock})
                      </span>
                    </>
                  )}
                </div>

                {/* Tags */}
                {product.tags && product.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-3">
                    {product.tags.slice(0, 3).map((tag, index) => (
                      <span
                        key={index}
                        className="bg-blue-50 text-blue-700 px-2 py-1 rounded text-xs"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Price and Actions */}
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-2">
                  <span className="text-xl font-bold text-gray-900">
                    ${displayPrice}
                  </span>
                  {originalPrice && (
                    <span className="text-lg text-gray-500 line-through">
                      ${originalPrice}
                    </span>
                  )}
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={handleAddToCart}
                    className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors flex items-center space-x-2"
                  >
                    <ShoppingCart className="w-4 h-4" />
                    <span className="hidden sm:inline">Add to Cart chal</span>
                  </button>
                  <button
                    onClick={()=>alert(product._id)}
                    className={`p-2 rounded-lg border transition-colors ${
                      isWishlisted
                        ? 'bg-blue-50 border-blue-200 text-blue-600'
                        : 'bg-gray-50 border-gray-200 text-gray-600 hover:text-red-600'
                    }`}
                  >
                    <Heart 
                      className={`w-5 h-5 ${isWishlisted ? 'fill-current' : ''}`} 
                    />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
// components/ProductGrid.jsx
'use client';
import { motion, AnimatePresence } from 'framer-motion';
import ProductCard from './ProductCard';
import ProductListCard from './ProductListCard';
import { useState, useEffect } from 'react';
import { 
  Grid, 
  List, 
  Filter, 
  SlidersHorizontal,
  Sparkles,
  Zap,
  Tag
} from 'lucide-react';

export default function ProductGrid({ 
 products, 
  loading = false, 
  filters = {},
  viewMode: externalViewMode = 'grid',
  onViewModeChange,
  showViewControls = true,
  compact = false   // ✅ NEW
}) {
  const [internalViewMode, setInternalViewMode] = useState('grid');
  const [displayedProducts, setDisplayedProducts] = useState(products);

  // Use external view mode if provided, otherwise use internal state
  const viewMode = onViewModeChange ? externalViewMode : internalViewMode;

  const handleViewModeChange = (mode) => {
    if (onViewModeChange) {
      onViewModeChange(mode);
    } else {
      setInternalViewMode(mode);
    }
  };

  // Update displayed products when products change
  useEffect(() => {
    setDisplayedProducts(products);
  }, [products]);

  // Enhanced loading skeleton with view mode support
  if (loading) {
    if (viewMode === 'list') {
      return (
        <div className="space-y-4">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden animate-pulse"
            >
              <div className="flex">
                <div className="w-48 h-48 bg-gray-200" />
                <div className="flex-1 p-6 space-y-4">
                  <div className="h-6 bg-gray-200 rounded w-3/4" />
                  <div className="h-4 bg-gray-200 rounded w-full" />
                  <div className="h-4 bg-gray-200 rounded w-2/3" />
                  <div className="flex justify-between items-center">
                    <div className="h-8 bg-gray-200 rounded w-1/4" />
                    <div className="flex space-x-2">
                      <div className="h-10 bg-gray-200 rounded w-24" />
                      <div className="h-10 bg-gray-200 rounded w-10" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      );
    }

    return (
      <div className={`grid gap-4 ${
  compact
    ? 'grid-cols-2 md:grid-cols-4 lg:grid-cols-5'
    : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
}`}>
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden animate-pulse"
          >
            <div className="aspect-square bg-gray-200" />
            <div className="p-4 space-y-3">
              <div className="h-4 bg-gray-200 rounded w-3/4" />
              <div className="h-3 bg-gray-200 rounded w-full" />
              <div className="h-3 bg-gray-200 rounded w-2/3" />
              <div className="flex justify-between items-center">
                <div className="h-6 bg-gray-200 rounded w-1/3" />
                <div className="h-8 bg-gray-200 rounded w-8" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Enhanced empty state with filter information
  if (!displayedProducts || displayedProducts.length === 0) {
    const hasActiveFilters = Object.keys(filters).some(key => 
      key !== 'page' && key !== 'limit' && key !== 'sortBy' && key !== 'sortOrder' && 
      filters[key] && filters[key] !== ''
    );

    return (
      <div className="text-center py-16">
        <div className="text-gray-400 text-6xl mb-6">🎯</div>
        <h3 className="text-xl font-semibold text-gray-900 mb-3">
          {hasActiveFilters ? 'No matching products found' : 'No products available'}
        </h3>
        <p className="text-gray-600 max-w-md mx-auto mb-6">
          {hasActiveFilters 
            ? 'Try adjusting your search criteria or browse different categories.'
            : 'Check back later for new arrivals or explore our featured collections.'
          }
        </p>
        
        {hasActiveFilters && (
          <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <SlidersHorizontal className="w-4 h-4" />
              <span>Active filters:</span>
            </div>
            <div className="flex flex-wrap gap-2 justify-center">
              {filters.search && (
                <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm">
                  Search: "{filters.search}"
                </span>
              )}
              {filters.category && (
                <span className="bg-green-50 text-green-700 px-3 py-1 rounded-full text-sm">
                  Category
                </span>
              )}
              {filters.brand && (
                <span className="bg-purple-50 text-purple-700 px-3 py-1 rounded-full text-sm">
                  Brand: {filters.brand}
                </span>
              )}
              {filters.priceRange && (
                <span className="bg-orange-50 text-orange-700 px-3 py-1 rounded-full text-sm">
                  Price Range
                </span>
              )}
              {filters.isFeatured === 'true' && (
                <span className="bg-yellow-50 text-yellow-700 px-3 py-1 rounded-full text-sm flex items-center">
                  <Sparkles className="w-3 h-3 mr-1" />
                  Featured
                </span>
              )}
              {filters.isOnSale === 'true' && (
                <span className="bg-red-50 text-red-700 px-3 py-1 rounded-full text-sm flex items-center">
                  <Zap className="w-3 h-3 mr-1" />
                  On Sale
                </span>
              )}
              {filters.tag && (
                <span className="bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full text-sm flex items-center">
                  <Tag className="w-3 h-3 mr-1" />
                  {filters.tag}
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* View Controls and Product Count */}
      {showViewControls && (
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center ">
            
            {/* Quick filter indicators */}
            <div className="hidden md:flex items-center space-x-2">
              {filters.isFeatured === 'true' && (
                <span className="flex items-center space-x-1 bg-yellow-50 text-yellow-700 px-2 py-1 rounded-full text-xs">
                  <Sparkles className="w-3 h-3" />
                  <span>Featured</span>
                </span>
              )}
              {filters.isOnSale === 'true' && (
                <span className="flex items-center space-x-1 bg-red-50 text-red-700 px-2 py-1 rounded-full text-xs">
                  <Zap className="w-3 h-3" />
                  <span>On Sale</span>
                </span>
              )}
              {filters.isLimitedEdition === 'true' && (
                <span className="flex items-center space-x-1 bg-purple-50 text-purple-700 px-2 py-1 rounded-full text-xs">
                  <Tag className="w-3 h-3" />
                  <span>Limited</span>
                </span>
              )}
            </div>
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center space-x-2 bg-gray-100 rounded-lg p-1">
            <span className="text-xs text-gray-600 px-2 hidden sm:block">View:</span>
            <button
              onClick={() => handleViewModeChange('grid')}
              className={`p-2 rounded-md transition-all duration-200 ${
                viewMode === 'grid' 
                  ? 'bg-white text-indigo-600 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
              title="Grid View"
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleViewModeChange('list')}
              className={`p-2 rounded-md transition-all duration-200 ${
                viewMode === 'list' 
                  ? 'bg-white text-indigo-600 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
              title="List View"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Products Display */}
      <AnimatePresence mode="wait">
        {viewMode === 'list' ? (
          <motion.div
            key="list-view"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-4"
          >
            {displayedProducts.map((product, index) => (
              <motion.div
                key={product._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <ProductListCard product={product} />
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <motion.div
            key="grid-view"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          >
            {displayedProducts.map((product, index) => (
              <motion.div
                key={product._id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
               <div className={compact ? 'scale-95 origin-top' : ''}>
  <ProductCard product={product} compact={compact} />
</div>

              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Load More Indicator (for infinite scroll) */}
      {filters.hasMore && (
        <div className="text-center pt-8">
          <div className="inline-flex items-center space-x-2 text-gray-600">
            <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
            <span>Loading more products...</span>
          </div>
        </div>
      )}
    </div>
  );
}
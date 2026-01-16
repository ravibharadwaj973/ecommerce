'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '../../context/AuthContext';
import { 
  MagnifyingGlassIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  EyeSlashIcon,
  ArchiveBoxIcon,
  PhotoIcon,
  StarIcon,
  FireIcon,
  ClockIcon,
  TagIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

interface Category {
  _id: string;
  name: string;
}

interface ProductImage {
  url: string;
  publicId: string;
  width: number;
  height: number;
  format: string;
  bytes: number;
  isPrimary: boolean;
  altText: string;
}

interface Product {
  _id: string;
  name: string;
  description: string;
  shortDescription: string;
  price: number;
  comparePrice: number;
  salePrice: number;
  discountPercent: number;
  category: Category;
  subcategory: string;
  brand: string;
  stock: number;
  lowStockThreshold: number;
  season: string;
  isLimitedEdition: boolean;
  isBackorder: boolean;
  estimatedRestockDate: string;
  sizes: string[];
  colors: string[];
  features: string[];
  tags: string[];
  images: ProductImage[];
  isPublished: boolean;
  isFeatured: boolean;
  isOnSale: boolean;
  saleStartDate: string;
  saleEndDate: string;
  rating: {
    average: number;
    count: number;
  };
  viewCount: number;
  purchaseCount: number;
  wishlistCount: number;
  salesCount: number;
  trendingScore: number;
  createdAt: string;
  updatedAt: string;
}

interface ProductsResponse {
  success: boolean;
  data: {
    products: Product[];
  };
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

interface ProductFilters {
  search: string;
  category: string;
  brand: string;
  minPrice: string;
  maxPrice: string;
  priceRange: string;
  inStock: string;
  isPublished: string;
  isFeatured: string;
  isOnSale: string;
  isLimitedEdition: string;
  isLowStock: string;
  season: string;
  color: string;
  tag: string;
  hasImages: string;
  sortBy: string;
  sortOrder: string;
  page: number;
  limit: number;
}

export default function ProductsPage() {
  const { user, checkAdminAccess } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<Category[]>([]);
  const [filters, setFilters] = useState<ProductFilters>({
    search: '',
    category: '',
    brand: '',
    minPrice: '',
    maxPrice: '',
    priceRange: '',
    inStock: '',
    isPublished: '',
    isFeatured: '',
    isOnSale: '',
    isLimitedEdition: '',
    isLowStock: '',
    season: '',
    color: '',
    tag: '',
    hasImages: '',
    sortBy: 'createdAt',
    sortOrder: 'desc',
    page: 1,
    limit: 12,
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    total: 0,
    pages: 0,
  });

  useEffect(() => {
    if (user && checkAdminAccess()) {
      fetchProducts();
      fetchCategories();
    }
  }, [filters, user]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams();
      
      Object.entries(filters).forEach(([key, value]) => {
        if (value) queryParams.append(key, value.toString());
      });

      const response = await fetch(`/api/products?${queryParams}`);
      const data: ProductsResponse = await response.json();

      if (data.success) {
        setProducts(data.data.products);
        setPagination(data.pagination);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories');
      const data = await response.json();
      if (data.success) {
        setCategories(data.data.categories);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const handleFilterChange = (key: keyof ProductFilters, value: string | number) => {
    setFilters(prev => ({ ...prev, [key]: value, page: 1 }));
  };

  const handleDeleteProduct = async (productId: string) => {
    if (!confirm('Are you sure you want to delete this product? This will also delete all associated images.')) return;

    try {
      const response = await fetch(`/api/products/${productId}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        fetchProducts();
        alert('Product deleted successfully');
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error('Error deleting product:', error);
      alert('Error deleting product');
    }
  };

  const handleStatusChange = async (productId: string, field: 'isPublished' | 'isFeatured' | 'isOnSale', value: boolean) => {
    try {
      const response = await fetch(`/api/products/${productId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ [field]: value }),
      });

      const data = await response.json();

      if (data.success) {
        fetchProducts();
        const fieldName = field === 'isPublished' ? 'publication status' : 
                         field === 'isFeatured' ? 'featured status' : 'sale status';
        alert(`Product ${fieldName} updated successfully`);
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error('Error updating product status:', error);
      alert('Error updating product status');
    }
  };

  const handleStockUpdate = async (productId: string, newStock: number) => {
    try {
      const response = await fetch(`/api/products/${productId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ stock: newStock }),
      });

      const data = await response.json();

      if (data.success) {
        fetchProducts();
        alert('Stock updated successfully');
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error('Error updating stock:', error);
      alert('Error updating stock');
    }
  };

  // 🔥 NEW: Advanced status badges
  const getStockBadgeColor = (stock: number, lowStockThreshold: number) => {
    if (stock === 0) return 'bg-red-100 text-red-800';
    if (stock <= lowStockThreshold) return 'bg-orange-100 text-orange-800';
    return 'bg-green-100 text-green-800';
  };

  const getStockBadgeText = (stock: number, lowStockThreshold: number) => {
    if (stock === 0) return 'Out of Stock';
    if (stock <= lowStockThreshold) return `Low (${stock})`;
    return `In Stock (${stock})`;
  };

  const getStatusBadgeColor = (status: boolean) => {
    return status ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800';
  };

  const getSeasonBadgeColor = (season: string) => {
    const colors = {
      'spring': 'bg-green-100 text-green-800',
      'summer': 'bg-yellow-100 text-yellow-800',
      'fall': 'bg-orange-100 text-orange-800',
      'winter': 'bg-blue-100 text-blue-800',
      'all-season': 'bg-gray-100 text-gray-800'
    };
    return colors[season as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getPrimaryImage = (images: ProductImage[]) => {
    const primary = images.find(img => img.isPrimary);
    return primary ? primary.url : (images.length > 0 ? images[0].url : null);
  };

  const getOptimizedImageUrl = (imageUrl: string, width: number = 400, height: number = 300) => {
    return imageUrl.replace('/upload/', `/upload/w_${width},h_${height},c_fill/`);
  };

  const getPriceDisplay = (product: Product) => {
    const isSaleActive = product.isOnSale && product.salePrice && 
      (!product.saleStartDate || new Date(product.saleStartDate) <= new Date()) &&
      (!product.saleEndDate || new Date(product.saleEndDate) >= new Date());

    if (isSaleActive && product.salePrice) {
      return (
        <div className="flex items-center space-x-2">
          <span className="text-lg font-semibold text-green-600">
            ${product.salePrice}
          </span>
          <span className="text-sm text-gray-500 line-through">
            ${product.price}
          </span>
          <span className="text-sm font-medium text-red-600">
            -{product.discountPercent}%
          </span>
        </div>
      );
    }
    return (
      <span className="text-lg font-semibold text-gray-900">
        ${product.price}
      </span>
    );
  };

  // 🔥 NEW: Check if product is new arrival (less than 30 days old)
  const isNewArrival = (createdAt: string) => {
    const createdDate = new Date(createdAt);
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    return createdDate > thirtyDaysAgo;
  };

  // 🔥 NEW: Check if product is trending (high trending score)
  const isTrending = (trendingScore: number) => {
    return trendingScore > 50;
  };

  if (!user || !checkAdminAccess()) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-600">Access denied. Admin or vendor role required.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Product Management</h1>
          <p className="text-gray-600 mt-1">Advanced product catalog with analytics and inventory management</p>
        </div>
        <Link
          href="/admin/products/create"
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <PlusIcon className="w-5 h-5 mr-2" />
          Add Product
        </Link>
      </div>

      {/* 🔥 ENHANCED: Advanced Filters */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          {/* Search */}
          <div className="relative">
            <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search products..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-black focus:border-blue-500"
            />
          </div>

          {/* Category Filter */}
          <select
            value={filters.category}
            onChange={(e) => handleFilterChange('category', e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
          >
            <option value="">All Categories</option>
            {categories.map((category) => (
              <option key={category._id} value={category._id}>
                {category.name}
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={filters.isPublished}
            onChange={(e) => handleFilterChange('isPublished', e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
          >
            <option value="">All Status</option>
            <option value="true">Published</option>
            <option value="false">Unpublished</option>
          </select>

          {/* 🔥 NEW: Price Range Filter */}
          <select
            value={filters.priceRange}
            onChange={(e) => handleFilterChange('priceRange', e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
          >
            <option value="">All Price Ranges</option>
            <option value="under-50">Under $50</option>
            <option value="50-100">$50 - $100</option>
            <option value="100-200">$100 - $200</option>
            <option value="200-500">$200 - $500</option>
            <option value="500-plus">$500+</option>
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Brand Filter */}
          <input
            type="text"
            placeholder="Brand filter..."
            value={filters.brand}
            onChange={(e) => handleFilterChange('brand', e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
          />

          {/* 🔥 NEW: Season Filter */}
          <select
            value={filters.season}
            onChange={(e) => handleFilterChange('season', e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
          >
            <option value="">All Seasons</option>
            <option value="spring">Spring</option>
            <option value="summer">Summer</option>
            <option value="fall">Fall</option>
            <option value="winter">Winter</option>
            <option value="all-season">All Season</option>
          </select>

          {/* 🔥 NEW: Special Filters */}
          <select
            value={filters.isLowStock}
            onChange={(e) => handleFilterChange('isLowStock', e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
          >
            <option value="">Stock Status</option>
            <option value="true">Low Stock</option>
            <option value="false">Adequate Stock</option>
          </select>

          {/* 🔥 ENHANCED: Advanced Sort Options */}
          <select
            value={`${filters.sortBy}-${filters.sortOrder}`}
            onChange={(e) => {
              const [sortBy, sortOrder] = e.target.value.split('-');
              handleFilterChange('sortBy', sortBy);
              handleFilterChange('sortOrder', sortOrder as 'asc' | 'desc');
            }}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
          >
            <option value="createdAt-desc">Newest First</option>
            <option value="createdAt-asc">Oldest First</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="salesCount-desc">Best Selling</option>
            <option value="trendingScore-desc">Trending</option>
            <option value="viewCount-desc">Most Viewed</option>
            <option value="rating.average-desc">Highest Rated</option>
            <option value="stock-desc">Stock: High to Low</option>
            <option value="stock-asc">Stock: Low to High</option>
          </select>
        </div>

        {/* Reset Filters */}
        <div className="mt-4 flex justify-between items-center">
          <span className="text-sm text-gray-600">
            Showing {pagination.total} products • {products.filter(p => p.isPublished).length} published • {products.filter(p => p.stock === 0).length} out of stock
          </span>
          <button
            onClick={() => setFilters({
              search: '',
              category: '',
              brand: '',
              minPrice: '',
              maxPrice: '',
              priceRange: '',
              inStock: '',
              isPublished: '',
              isFeatured: '',
              isOnSale: '',
              isLimitedEdition: '',
              isLowStock: '',
              season: '',
              color: '',
              tag: '',
              hasImages: '',
              sortBy: 'createdAt',
              sortOrder: 'desc',
              page: 1,
              limit: 12,
            })}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-black"
          >
            Reset All Filters
          </button>
        </div>
      </div>

      {/* Products Grid */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((product) => (
            <div
              key={product._id}
              className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-all duration-200"
            >
              {/* Product Image with Enhanced Overlay */}
              <div className="relative aspect-w-16 aspect-h-12 bg-gray-100">
                {getPrimaryImage(product.images) ? (
                  <>
                    <img
                      src={getOptimizedImageUrl(getPrimaryImage(product.images)!)}
                      alt={product.name}
                      className="w-full h-48 object-cover"
                    />
                    {/* 🔥 ENHANCED: Image Count & Analytics Badge */}
                    <div className="absolute top-2 right-2 flex flex-col space-y-1">
                      {product.images.length > 1 && (
                        <div className="bg-black bg-opacity-60 text-white px-2 py-1 rounded-full text-xs">
                          {product.images.length} images
                        </div>
                      )}
                      {product.trendingScore > 0 && (
                        <div className="bg-orange-500 text-white px-2 py-1 rounded-full text-xs flex items-center">
                          <FireIcon className="w-3 h-3 mr-1" />
                          {product.trendingScore}
                        </div>
                      )}
                    </div>
                  </>
                ) : (
                  <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
                    <PhotoIcon className="w-12 h-12 text-gray-400" />
                  </div>
                )}

                {/* 🔥 ENHANCED: Status Overlay with New Badges */}
                <div className="absolute top-2 left-2 flex flex-col space-y-1">
                  {!product.isPublished && (
                    <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-medium">
                      Draft
                    </span>
                  )}
                  {product.isFeatured && (
                    <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-xs font-medium flex items-center">
                      <StarIcon className="w-3 h-3 mr-1" />
                      Featured
                    </span>
                  )}
                  {product.isOnSale && (
                    <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs font-medium">
                      Sale {product.discountPercent}%
                    </span>
                  )}
                  {isNewArrival(product.createdAt) && (
                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium flex items-center">
                      <ClockIcon className="w-3 h-3 mr-1" />
                      New
                    </span>
                  )}
                  {product.isLimitedEdition && (
                    <span className="bg-pink-100 text-pink-800 px-2 py-1 rounded-full text-xs font-medium flex items-center">
                      <TagIcon className="w-3 h-3 mr-1" />
                      Limited
                    </span>
                  )}
                  {product.isBackorder && (
                    <span className="bg-indigo-100 text-indigo-800 px-2 py-1 rounded-full text-xs font-medium">
                      Backorder
                    </span>
                  )}
                </div>

                {/* 🔥 NEW: Season Badge */}
                {product.season && product.season !== 'all-season' && (
                  <div className="absolute bottom-2 left-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSeasonBadgeColor(product.season)}`}>
                      {product.season}
                    </span>
                  </div>
                )}
              </div>

              {/* Product Info */}
              <div className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-semibold text-gray-900 line-clamp-2 text-sm leading-tight">
                    {product.name}
                  </h3>
                  <div className="flex space-x-1 ml-2">
                    <button
                      onClick={() => handleStatusChange(product._id, 'isPublished', !product.isPublished)}
                      className={`p-1 rounded transition-colors ${
                        product.isPublished
                          ? 'text-green-600 hover:bg-green-50'
                          : 'text-gray-400 hover:bg-gray-50'
                      }`}
                      title={product.isPublished ? 'Unpublish' : 'Publish'}
                    >
                      {product.isPublished ? (
                        <EyeIcon className="w-4 h-4" />
                      ) : (
                        <EyeSlashIcon className="w-4 h-4" />
                      )}
                    </button>
                    <button
                      onClick={() => handleStatusChange(product._id, 'isFeatured', !product.isFeatured)}
                      className={`p-1 rounded transition-colors ${
                        product.isFeatured
                          ? 'text-purple-600 hover:bg-purple-50'
                          : 'text-gray-400 hover:bg-gray-50'
                      }`}
                      title={product.isFeatured ? 'Remove featured' : 'Mark as featured'}
                    >
                      <StarIcon className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* 🔥 ENHANCED: Short Description */}
                {product.shortDescription && (
                  <p className="text-gray-600 text-xs mb-2 line-clamp-2">
                    {product.shortDescription}
                  </p>
                )}

                <p className="text-gray-600 text-xs mb-3 line-clamp-2">
                  {product.description}
                </p>

                {/* Price and Rating */}
                <div className="flex justify-between items-center mb-3">
                  {getPriceDisplay(product)}
                  {product.rating.count > 0 && (
                    <div className="flex items-center space-x-1">
                      <StarIcon className="w-4 h-4 text-yellow-400" />
                      <span className="text-sm text-gray-600">
                        {product.rating.average.toFixed(1)}
                      </span>
                      <span className="text-xs text-gray-400">
                        ({product.rating.count})
                      </span>
                    </div>
                  )}
                </div>

                {/* 🔥 ENHANCED: Advanced Analytics */}
                <div className="grid grid-cols-4 gap-2 text-xs text-gray-600 mb-3">
                  <div className="text-center">
                    <div className="font-semibold">{product.viewCount}</div>
                    <div>Views</div>
                  </div>
                  <div className="text-center">
                    <div className="font-semibold">{product.salesCount}</div>
                    <div>Sold</div>
                  </div>
                  <div className="text-center">
                    <div className="font-semibold">{product.wishlistCount}</div>
                    <div>Saved</div>
                  </div>
                  <div className="text-center">
                    <div className="font-semibold">{product.trendingScore}</div>
                    <div>Trend</div>
                  </div>
                </div>

                {/* 🔥 ENHANCED: Stock Management with Low Stock Warning */}
                <div className="mb-3 p-2 bg-gray-50 rounded-lg">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs font-medium">Stock Level</span>
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStockBadgeColor(product.stock, product.lowStockThreshold)}`}>
                      {getStockBadgeText(product.stock, product.lowStockThreshold)}
                    </span>
                  </div>
                  {product.stock <= product.lowStockThreshold && product.stock > 0 && (
                    <div className="flex items-center text-xs text-orange-600 mb-1">
                      <ExclamationTriangleIcon className="w-3 h-3 mr-1" />
                      Low stock alert ({product.lowStockThreshold} threshold)
                    </div>
                  )}
                  <div className="flex space-x-1">
                    <input
                      type="number"
                      min="0"
                      value={product.stock}
                      onChange={(e) => {
                        const newStock = parseInt(e.target.value) || 0;
                        setProducts(prev => prev.map(p => 
                          p._id === product._id ? { ...p, stock: newStock } : p
                        ));
                      }}
                      onBlur={(e) => {
                        const newStock = parseInt(e.target.value) || 0;
                        if (newStock !== product.stock) {
                          handleStockUpdate(product._id, newStock);
                        }
                      }}
                      className="flex-1 px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                    />
                    <button
                      onClick={() => handleStockUpdate(product._id, product.stock + 5)}
                      className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200"
                    >
                      +5
                    </button>
                    <button
                      onClick={() => handleStockUpdate(product._id, Math.max(0, product.stock - 5))}
                      className="px-2 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200"
                    >
                      -5
                    </button>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex space-x-2">
                  <Link
                    href={`/admin/products/${product._id}`}
                    className="flex-1 flex items-center justify-center px-2 py-2 bg-blue-600 text-white text-xs rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <PencilIcon className="w-3 h-3 mr-1" />
                    Edit
                  </Link>
                  <button
                    onClick={() => handleDeleteProduct(product._id)}
                    className="px-3 py-2 bg-red-600 text-white text-xs rounded-lg hover:bg-red-700 transition-colors"
                  >
                    <TrashIcon className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="flex items-center justify-between bg-white px-6 py-4 rounded-lg shadow-sm border border-gray-200">
          <div className="text-sm text-gray-700">
            Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
            {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
            {pagination.total} products
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => handleFilterChange('page', pagination.page - 1)}
              disabled={pagination.page === 1}
              className="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <span className="px-3 py-1 text-sm text-gray-700">
              Page {pagination.page} of {pagination.pages}
            </span>
            <button
              onClick={() => handleFilterChange('page', pagination.page + 1)}
              disabled={pagination.page === pagination.pages}
              className="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {!loading && products.length === 0 && (
        <div className="text-center py-12">
          <ArchiveBoxIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
          <p className="text-gray-600 mb-4 max-w-md mx-auto">
            {Object.values(filters).some(val => val) 
              ? 'No products match your current filters. Try adjusting your search criteria.'
              : 'Your product catalog is empty. Start by adding your first product to showcase your offerings.'
            }
          </p>
          <Link
            href="/admin/products/create"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <PlusIcon className="w-5 h-5 mr-2" />
            Add Your First Product
          </Link>
        </div>
      )}
    </div>
  );
}
// app/categories/[id]/page.jsx
'use client';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Package, ArrowLeft, Filter, Grid, List } from 'lucide-react';
import Link from 'next/link';
import ProductGrid from '../../components/ProductGrid';

export default function CategoryDetailPage() {
  const params = useParams();
  const [category, setCategory] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('grid');
  const [sortBy, setSortBy] = useState('createdAt');

  useEffect(() => {
    fetchCategoryAndProducts();
  }, [params.id, sortBy]);

  const fetchCategoryAndProducts = async () => {
    setLoading(true);
    try {
      // Fetch category details
      const categoryResponse = await fetch(`/api/categories/${params.id}`);
      const categoryData = await categoryResponse.json();

      if (categoryData.success) {
        setCategory(categoryData.data.category);
      }

      // Fetch products for this category
      const productsResponse = await fetch(`/api/products?category=${params.id}&sortBy=${sortBy}&isPublished=true`);
      const productsData = await productsResponse.json();

      if (productsData.success) {
        setProducts(productsData.data.products);
      }
    } catch (error) {
      console.error('Error fetching category details:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-64 mb-6"></div>
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="bg-white rounded-xl shadow-sm p-6">
                  <div className="aspect-square bg-gray-200 rounded-lg mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!category) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Category Not Found</h2>
          <Link href="/categories" className="text-indigo-600 hover:text-indigo-500">
            Back to Categories
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Breadcrumb and Back Button */}
        <nav className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Link href="/" className="hover:text-indigo-600 transition-colors">Home</Link>
            <span>/</span>
            <Link href="/categories" className="hover:text-indigo-600 transition-colors">Categories</Link>
            <span>/</span>
            <span className="text-gray-900 font-medium">{category.name}</span>
          </div>
          
          <Link 
            href="/categories" 
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Categories</span>
          </Link>
        </nav>

        {/* Category Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl border border-gray-200 overflow-hidden mb-8"
        >
          <div className="grid grid-cols-1 lg:grid-cols-3">
            {/* Category Image */}
            <div className="lg:col-span-1">
              <div className="aspect-video lg:aspect-square bg-gradient-to-br from-indigo-50 to-purple-100">
                {category.image ? (
                  <img
                    src={category.image}
                    alt={category.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Package className="w-16 h-16 text-indigo-400" />
                  </div>
                )}
              </div>
            </div>

            {/* Category Info */}
            <div className="lg:col-span-2 p-8">
              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                {category.name}
              </h1>
              
              {category.description && (
                <p className="text-lg text-gray-600 leading-relaxed mb-6">
                  {category.description}
                </p>
              )}

              <div className="flex items-center space-x-6 text-sm text-gray-600">
                <div className="flex items-center space-x-2">
                  <Package className="w-4 h-4" />
                  <span>{products.length} products available</span>
                </div>
                
                {!category.isActive && (
                  <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs font-semibold">
                    Inactive
                  </span>
                )}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Products Section */}
        <div className="mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              Products in {category.name}
            </h2>

            <div className="flex items-center space-x-4">
              {/* Sort */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="createdAt">Newest First</option>
                <option value="price">Price: Low to High</option>
                <option value="-price">Price: High to Low</option>
                <option value="name">Name: A-Z</option>
                <option value="rating.average">Highest Rated</option>
              </select>

              {/* View Toggle */}
              <div className="flex border border-gray-300 rounded-lg overflow-hidden">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 ${viewMode === 'grid' ? 'bg-indigo-600 text-white' : 'bg-white text-gray-600'}`}
                >
                  <Grid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 ${viewMode === 'list' ? 'bg-indigo-600 text-white' : 'bg-white text-gray-600'}`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Products Grid */}
          <ProductGrid 
            products={products} 
            loading={loading}
            viewMode={viewMode}
          />

          {!loading && products.length === 0 && (
            <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
              <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No products found
              </h3>
              <p className="text-gray-600 mb-6">
                There are no products available in this category at the moment.
              </p>
              <Link
                href="/categories"
                className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Browse Other Categories
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
// app/admin/products/page.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

import { useApi } from '../../hooks/useApi';
import { Plus, Edit, Trash2, Eye, Package, Search, Filter } from 'lucide-react';
import Image from 'next/image';

type Product = {
  _id: string;
  name: string;
  slug: string;
  description: string;
  category?: {
    name: string;
    slug: string;
  };
  images: Array<{
    url: string;
    isPrimary: boolean;
    altText: string;
  }>;
  brand: string;
  variantCount: number;
  isPublished: boolean;
  createdAt: string;
};

export default function ProductsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterPublished, setFilterPublished] = useState<'all' | 'published' | 'draft'>('all');
  
  const { 
    data: products, 
    loading, 
    error,
    fetchData: fetchProducts,
    deleteData: deleteProduct 
  } = useApi<Product[]>();

  useEffect(() => {
    fetchProducts('/api/newproducts');
  }, []);

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"?`)) return;
    
    const result = await deleteProduct(`/api/newproducts/${id}`);
    if (result) {
      fetchProducts('/api/newproducts');
    }
  };

  const filteredProducts = products?.filter(product => {
    // Search filter
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         product.brand?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         product.category?.name.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Published filter
    const matchesPublished = 
      filterPublished === 'all' ||
      (filterPublished === 'published' && product.isPublished) ||
      (filterPublished === 'draft' && !product.isPublished);
    
    return matchesSearch && matchesPublished;
  });

  return (
   <div>
      {/* Header with Actions */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Products</h1>
            <p className="text-gray-600 mt-1">
              Manage your product catalog ({filteredProducts?.length || 0} products)
            </p>
          </div>
          
          <Link
            href="/admin/products/create"
            className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Product
          </Link>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Search */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search Products
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by name, brand, or category..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <div className="flex gap-2">
                {['all', 'published', 'draft'].map((status) => (
                  <button
                    key={status}
                    onClick={() => setFilterPublished(status as any)}
                    className={`px-4 py-2 rounded-lg transition-colors ${
                      filterPublished === status
                        ? 'bg-blue-100 text-blue-700 border border-blue-200'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Products Grid */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading products...</p>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <p className="text-red-800">Error: {error}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts?.map((product) => (
            <div
              key={product._id}
              className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
            >
              {/* Product Image */}
              <div className="relative h-48 bg-gray-100">
                {product.images?.[0]?.url ? (
                  <img
                    src={product.images[0].url}
                    alt={product.images[0].altText || product.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Package className="w-12 h-12 text-gray-300" />
                  </div>
                )}
                
                {/* Status Badge */}
                <span className={`absolute top-3 right-3 px-2 py-1 text-xs rounded-full ${
                  product.isPublished
                    ? 'bg-green-100 text-green-800'
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {product.isPublished ? 'Published' : 'Draft'}
                </span>
              </div>

              {/* Product Info */}
              <div className="p-4">
                <h3 className="font-semibold text-gray-900 line-clamp-1">
                  {product.name}
                </h3>
                
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-sm text-gray-600">
                    {product.category?.name || 'Uncategorized'}
                  </span>
                  {product.brand && (
                    <>
                      <span className="text-gray-300">•</span>
                      <span className="text-sm text-gray-600">{product.brand}</span>
                    </>
                  )}
                </div>

                <p className="text-gray-600 text-sm mt-3 line-clamp-2">
                  {product.description || 'No description'}
                </p>

                <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                  <div className="text-sm text-gray-500">
                    {product.variantCount || 0} variants
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/admin/products/${product._id}`}
                      className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="View Details"
                    >
                      <Eye className="w-4 h-4" />
                    </Link>
                    
                    <Link
                      href={`/admin/products/${product._id}/edit`}
                      className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                      title="Edit"
                    >
                      <Edit className="w-4 h-4" />
                    </Link>
                    
                    <button
                      onClick={() => handleDelete(product._id, product.name)}
                      className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && filteredProducts?.length === 0 && (
        <div className="text-center py-12">
          <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
          <p className="text-gray-600 mb-6">
            {searchQuery || filterPublished !== 'all'
              ? 'Try adjusting your filters'
              : 'Get started by creating your first product'}
          </p>
          <Link
            href="/admin/products/create"
            className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Create Product
          </Link>
        </div>
      )}
   </div>
  );
}
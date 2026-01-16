// app/products/page.jsx
'use client';
import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import ProductGrid from '../components/ProductGrid';
import ProductFilters from '../components/ProductFilters';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function ProductsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [wish, setWish]=useState([])
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({});
  const [availableFilters, setAvailableFilters] = useState({
    brands: [],
    tags: [],
    features: [],
    colors: [],
    seasons: []
  });
  
  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    category: searchParams.get('category') || '',
    brand: searchParams.get('brand') || '',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    priceRange: searchParams.get('priceRange') || '',
    inStock: searchParams.get('inStock') || '',
    isFeatured: searchParams.get('isFeatured') || '',
    isOnSale: searchParams.get('isOnSale') || '',
    isLimitedEdition: searchParams.get('isLimitedEdition') || '',
    isLowStock: searchParams.get('isLowStock') || '',
    season: searchParams.get('season') || '',
    color: searchParams.get('color') || '',
    tag: searchParams.get('tag') || '',
    sortBy: searchParams.get('sortBy') || 'createdAt',
    sortOrder: searchParams.get('sortOrder') || 'desc',
    page: parseInt(searchParams.get('page')) || 1,
    limit: parseInt(searchParams.get('limit')) || 12
  });

  // Fetch products with all filters
  const fetchProducts = async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value && value !== '') {
          queryParams.set(key, value.toString());
        }
      });

      const response = await fetch(`/api/products?${queryParams}`);
      const data = await response.json();

      if (data.success) {
        setProducts(data.data.products);
        setPagination(data.pagination);
        
        // Extract available filter options from products
        extractFilterOptions(data.data.products);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  // Extract available filter options from products
  const extractFilterOptions = (products) => {
    const brands = new Set();
    const tags = new Set();
    const features = new Set();
    const colors = new Set();
    const seasons = new Set();

    products.forEach(product => {
      if (product.brand) brands.add(product.brand);
      if (product.tags && Array.isArray(product.tags)) {
        product.tags.forEach(tag => tags.add(tag));
      }
      if (product.features && Array.isArray(product.features)) {
        product.features.forEach(feature => features.add(feature));
      }
      if (product.colors && Array.isArray(product.colors)) {
        product.colors.forEach(color => colors.add(color));
      }
      if (product.season) seasons.add(product.season);
    });

    setAvailableFilters({
      brands: Array.from(brands).sort(),
      tags: Array.from(tags).sort(),
      features: Array.from(features).sort(),
      colors: Array.from(colors).sort(),
      seasons: Array.from(seasons).sort()
    });
  };

  // Fetch categories
  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories?onlyActive=true');
      const data = await response.json();
      if (data.success) {
        setCategories(data.data.categories);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, [filters]);

  useEffect(() => {
    // Update URL with current filters
    const queryParams = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value && value !== '') {
        queryParams.set(key, value.toString());
      }
    });
    
    router.replace(`/products?${queryParams}`, { scroll: false });
  }, [filters, router]);

  const handleFiltersChange = (newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters, page: 1 }));
  };

  const handlePageChange = (newPage) => {
    setFilters(prev => ({ ...prev, page: newPage }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const clearAllFilters = () => {
    setFilters({
      search: '',
      category: '',
      brand: '',
      minPrice: '',
      maxPrice: '',
      priceRange: '',
      inStock: '',
      isFeatured: '',
      isOnSale: '',
      isLimitedEdition: '',
      isLowStock: '',
      season: '',
      color: '',
      tag: '',
      sortBy: 'createdAt',
      sortOrder: 'desc',
      page: 1,
      limit: 12
    });
  };

  const hasActiveFilters = Object.entries(filters).some(([key, value]) => {
    const excludedKeys = ['page', 'limit', 'sortBy', 'sortOrder'];
    return !excludedKeys.includes(key) && value && value !== '';
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 ">

     

        {/* Filters */}
        <ProductFilters
          filters={filters}
          onFiltersChange={handleFiltersChange}
          categories={categories}
          availableFilters={availableFilters}
          onClearAll={clearAllFilters}
          hasActiveFilters={hasActiveFilters}
        />

        {/* Products Grid */}
        <ProductGrid 
          products={products} 
          loading={loading} 
          filters={filters}
        />

        {/* Pagination */}
        {pagination && pagination.pages > 1 && (
          <div className="flex justify-center items-center space-x-2 mt-8">
            <button
              onClick={() => handlePageChange(pagination.page - 1)}
              disabled={pagination.page === 1}
              className="p-2 rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            {[...Array(pagination.pages)].map((_, i) => {
              const pageNumber = i + 1;
              // Show first 3 pages, last 3 pages, and pages around current page
              if (
                pageNumber === 1 ||
                pageNumber === pagination.pages ||
                (pageNumber >= pagination.page - 1 && pageNumber <= pagination.page + 1)
              ) {
                return (
                  <button
                    key={pageNumber}
                    onClick={() => handlePageChange(pageNumber)}
                    className={`px-3 py-2 rounded-lg border transition-colors ${
                      pagination.page === pageNumber
                        ? 'bg-indigo-600 text-white border-indigo-600'
                        : 'border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {pageNumber}
                  </button>
                );
              } else if (
                pageNumber === pagination.page - 2 ||
                pageNumber === pagination.page + 2
              ) {
                return <span key={pageNumber} className="px-2">...</span>;
              }
              return null;
            })}

            <button
              onClick={() => handlePageChange(pagination.page + 1)}
              disabled={pagination.page === pagination.pages}
              className="p-2 rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
// components/ProductFilters.jsx
'use client';
import { useState, useEffect } from 'react';
import { Filter, X, ChevronDown, Tag, Palette, Sparkles, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ProductFilters({ 
  filters, 
  onFiltersChange, 
  categories = [],
  availableFilters = {},
  onClearAll,
  hasActiveFilters
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [localFilters, setLocalFilters] = useState(filters);
  const [activeTab, setActiveTab] = useState('all');
  const [togalfilter,setTogalfilter]=useState(false)

  const priceRanges = [
    { value: 'under-50', label: 'Under $50' },
    { value: '50-100', label: '$50 - $100' },
    { value: '100-200', label: '$100 - $200' },
    { value: '200-500', label: '$200 - $500' },
    { value: '500-plus', label: '$500 & Above' },
  ];

  const sortOptions = [
    { value: 'createdAt', label: 'Newest' },
    { value: 'price', label: 'Price: Low to High' },
    { value: '-price', label: 'Price: High to Low' },
    { value: 'name', label: 'Name: A-Z' },
    { value: '-name', label: 'Name: Z-A' },
    { value: 'rating', label: 'Highest Rated' },
    { value: 'sales', label: 'Best Selling' },
    { value: 'trending', label: 'Trending' },
  ];

  const seasonOptions = [
    { value: 'spring', label: 'Spring' },
    { value: 'summer', label: 'Summer' },
    { value: 'fall', label: 'Fall' },
    { value: 'winter', label: 'Winter' },
    { value: 'all-season', label: 'All Season' },
  ];

  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  const updateFilter = (key, value) => {
    const newFilters = { ...localFilters, [key]: value };
    setLocalFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const clearFilters = () => {
    const clearedFilters = {
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
      sortOrder: 'desc'
    };
    setLocalFilters(clearedFilters);
    onClearAll();
  };

  const removeFilter = (filterKey) => {
    const newFilters = { ...localFilters, [filterKey]: '' };
    setLocalFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const getActiveFilterCount = () => {
    return Object.entries(localFilters).filter(([key, value]) => {
      const excludedKeys = ['page', 'limit', 'sortBy', 'sortOrder'];
      return !excludedKeys.includes(key) && value && value !== '';
    }).length;
  };

  const filterTabs = [
    { id: 'all', label: 'All Filters', icon: Filter },
    { id: 'categories', label: 'Categories', icon: null },
    { id: 'attributes', label: 'Attributes', icon: Tag },
    { id: 'features', label: 'Features', icon: Sparkles },
  ];

  return (
    <div className="bg-white rounded-lg border border-gray-200 mb-6">
      {/* Active Filters Bar */}
      {hasActiveFilters && (
        <div className="border-b border-gray-200 p-4">
          <div className="flex flex-wrap gap-2">
            {localFilters.search && (
              <FilterPill 
                label={`Search: "${localFilters.search}"`} 
                onRemove={() => removeFilter('search')}
              />
            )}
            {localFilters.category && (
              <FilterPill 
                label={`Category: ${categories.find(c => c._id === localFilters.category)?.name || localFilters.category}`}
                onRemove={() => removeFilter('category')}
              />
            )}
            {localFilters.brand && (
              <FilterPill 
                label={`Brand: ${localFilters.brand}`}
                onRemove={() => removeFilter('brand')}
              />
            )}
            {localFilters.priceRange && (
              <FilterPill 
                label={`Price: ${priceRanges.find(p => p.value === localFilters.priceRange)?.label}`}
                onRemove={() => removeFilter('priceRange')}
              />
            )}
            {localFilters.tag && (
              <FilterPill 
                label={`Tag: ${localFilters.tag}`}
                onRemove={() => removeFilter('tag')}
              />
            )}
            {localFilters.color && (
              <FilterPill 
                label={`Color: ${localFilters.color}`}
                onRemove={() => removeFilter('color')}
              />
            )}
            {localFilters.season && (
              <FilterPill 
                label={`Season: ${seasonOptions.find(s => s.value === localFilters.season)?.label}`}
                onRemove={() => removeFilter('season')}
              />
            )}
            {localFilters.isFeatured === 'true' && (
              <FilterPill 
                label="Featured" 
                onRemove={() => removeFilter('isFeatured')}
              />
            )}
            {localFilters.isOnSale === 'true' && (
              <FilterPill 
                label="On Sale" 
                onRemove={() => removeFilter('isOnSale')}
              />
            )}
            {localFilters.isLimitedEdition === 'true' && (
              <FilterPill 
                label="Limited Edition" 
                onRemove={() => removeFilter('isLimitedEdition')}
              />
            )}
            <button
              onClick={clearFilters}
              className="flex items-center space-x-1 text-sm text-red-600 hover:text-red-800 px-2 py-1 rounded border border-red-200 hover:bg-red-50"
            >
              <X className="w-3 h-3" />
              <span>Clear All</span>
            </button>
          </div>
        </div>
      )}

      {/* Mobile Filter Header */}
      <div className="lg:hidden border-b border-gray-200">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center justify-between w-full p-4"
        >
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4" />
            <span className="font-medium">Filters & Sort</span>
            {getActiveFilterCount() > 0 && (
              <span className="bg-indigo-600 text-white text-xs px-2 py-1 rounded-full">
                {getActiveFilterCount()}
              </span>
            )}
          </div>
          <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {/* Desktop Filters */}
      <div className="hidden lg:block">
        <FilterContent 
          localFilters={localFilters}
          updateFilter={updateFilter}
          categories={categories}
          availableFilters={availableFilters}
          priceRanges={priceRanges}
          sortOptions={sortOptions}
          seasonOptions={seasonOptions}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          filterTabs={filterTabs}
        />
      </div>

      {/* Mobile Filters */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden overflow-hidden"
          >
            <div className="p-4 border-t border-gray-200">
              <FilterContent 
                localFilters={localFilters}
                updateFilter={updateFilter}
                categories={categories}
                availableFilters={availableFilters}
                priceRanges={priceRanges}
                sortOptions={sortOptions}
                seasonOptions={seasonOptions}
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                filterTabs={filterTabs}
                isMobile={true}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function FilterContent(  { 
  localFilters, 
  updateFilter, 
  categories,
  availableFilters,
  priceRanges,
  sortOptions,
  seasonOptions,
  activeTab,
  setActiveTab,
  filterTabs,
  isMobile = false
}) {
  const [toggleFilter ,setToggleFilter ]=useState(false)
  return (
    <div className={isMobile ? 'space-y-6' : 'p-6 space-y-6'}>
      {/* Filter Tabs - Desktop only */}
     {!isMobile && (
  <div className="flex items-center border-b border-gray-200">
    
    {/* Tabs */}
    <div className="flex space-x-1">
      {filterTabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => setActiveTab(tab.id)}
          className={`flex items-center space-x-2 px-4 py-2 border-b-2 text-sm font-medium transition-colors ${
            activeTab === tab.id
              ? "border-indigo-500 text-indigo-600"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          {tab.icon && <tab.icon className="w-4 h-4" />}
          <span>{tab.label}</span>
        </button>
      ))}
    </div>

    {/* Push toggle to end */}
    <div className="ml-auto flex items-center px-4">
      <span className="mr-2 text-sm text-gray-600">Filter</span>

      {/* Toggle Switch */}
      <button
        onClick={() => setToggleFilter((prev) => !prev)}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
          toggleFilter ? "bg-indigo-600" : "bg-gray-300"
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
            toggleFilter ? "translate-x-6" : "translate-x-1"
          }`}
        />
      </button>
    </div>
  </div>
)}

   

{
  toggleFilter ? <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Search - Always visible */}
        {(activeTab === 'all' || isMobile) && (
          <div className="lg:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Search Products
            </label>
            <input
              type="text"
              value={localFilters.search || ''}
              onChange={(e) => updateFilter('search', e.target.value)}
              placeholder="Search by name, brand, description..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
        )}

        {/* Sort - Always visible */}
        {(activeTab === 'all' || isMobile) && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Sort By
            </label>
            <select
              value={localFilters.sortBy || 'createdAt'}
              onChange={(e) => updateFilter('sortBy', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              {sortOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Categories */}
        {(activeTab === 'all' || activeTab === 'categories' || isMobile) && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category
            </label>
            <select
              value={localFilters.category || ''}
              onChange={(e) => updateFilter('category', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="">All Categories</option>
              {categories.map((category) => (
                <option key={category._id} value={category._id}>
                  {category.name} {category.productCount ? `(${category.productCount})` : ''}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Brand */}
        {(activeTab === 'all' || activeTab === 'attributes' || isMobile) && availableFilters.brands.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Brand
            </label>
            <select
              value={localFilters.brand || ''}
              onChange={(e) => updateFilter('brand', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="">All Brands</option>
              {availableFilters.brands.map((brand) => (
                <option key={brand} value={brand}>
                  {brand}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Price Range */}
        {(activeTab === 'all' || activeTab === 'attributes' || isMobile) && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Price Range
            </label>
            <select
              value={localFilters.priceRange || ''}
              onChange={(e) => updateFilter('priceRange', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="">Any Price</option>
              {priceRanges.map((range) => (
                <option key={range.value} value={range.value}>
                  {range.label}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Season */}
        {(activeTab === 'all' || activeTab === 'attributes' || isMobile) && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Season
            </label>
            <select
              value={localFilters.season || ''}
              onChange={(e) => updateFilter('season', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="">All Seasons</option>
              {seasonOptions.map((season) => (
                <option key={season.value} value={season.value}>
                  {season.label}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Special Features */}
        {(activeTab === 'all' || activeTab === 'features' || isMobile) && (
          <div className="lg:col-span-2 space-y-3">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Special Features
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={localFilters.isFeatured === 'true'}
                  onChange={(e) => updateFilter('isFeatured', e.target.checked ? 'true' : '')}
                  className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
                <Sparkles className="w-4 h-4 text-yellow-500" />
                <span className="text-sm">Featured</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={localFilters.isOnSale === 'true'}
                  onChange={(e) => updateFilter('isOnSale', e.target.checked ? 'true' : '')}
                  className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
                <Zap className="w-4 h-4 text-red-500" />
                <span className="text-sm">On Sale</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={localFilters.isLimitedEdition === 'true'}
                  onChange={(e) => updateFilter('isLimitedEdition', e.target.checked ? 'true' : '')}
                  className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
                <Tag className="w-4 h-4 text-purple-500" />
                <span className="text-sm">Limited Edition</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={localFilters.inStock === 'true'}
                  onChange={(e) => updateFilter('inStock', e.target.checked ? 'true' : '')}
                  className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
                <span className="text-sm">In Stock Only</span>
              </label>
            </div>
          </div>
        )}

        {/* Tags */}
        {(activeTab === 'all' || activeTab === 'attributes' || isMobile) && availableFilters.tags.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tags
            </label>
            <select
              value={localFilters.tag || ''}
              onChange={(e) => updateFilter('tag', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="">All Tags</option>
              {availableFilters.tags.map((tag) => (
                <option key={tag} value={tag}>
                  {tag}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Colors */}
        {(activeTab === 'all' || activeTab === 'attributes' || isMobile) && availableFilters.colors.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Color
            </label>
            <select
              value={localFilters.color || ''}
              onChange={(e) => updateFilter('color', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="">All Colors</option>
              {availableFilters.colors.map((color) => (
                <option key={color} value={color}>
                  {color}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>:
      <div ></div>
}
     
    </div>
  );
}

// Helper component for filter pills
function FilterPill({ label, onRemove }) {
  return (
    <div className="flex items-center space-x-1 bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full text-sm">
      <span>{label}</span>
      <button
        onClick={onRemove}
        className="hover:text-indigo-900 transition-colors"
      >
        <X className="w-3 h-3" />
      </button>
    </div>
  );
}
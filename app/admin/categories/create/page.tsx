// app/admin/categories/create/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useApi } from '../../../hooks/useApi';
import { 
  ArrowLeft, Upload, X, FolderTree, Image as ImageIcon, 
  Check, ChevronRight, Home, Folder, ChevronDown, ChevronUp
} from 'lucide-react';
import { toast } from 'sonner';

type Category = {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  parentCategory?: string | null;
  isActive: boolean;
  productCount?: number;
};

export default function CreateCategoryPage() {
  const router = useRouter();
  const { postData, loading, fetchData } = useApi();
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    parentCategory: '',
    isActive: true,
  });

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  
  // Category selection state
  const [mainCategories, setMainCategories] = useState<Category[]>([]);
  const [categoryPath, setCategoryPath] = useState<Category[]>([]);
  const [currentSubcategories, setCurrentSubcategories] = useState<Category[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [expandedPaths, setExpandedPaths] = useState<Set<string>>(new Set());

  // Fetch main categories (Men/Women) on mount
  useEffect(() => {
    fetchMainCategories();
  }, []);

  const fetchMainCategories = async () => {
    setLoadingCategories(true);
    try {
      // Fetch root categories
      const result = await fetchData('/api/categories');
      if (result?.data) {
        let categories: Category[] = [];
        
        if (Array.isArray(result.data)) {
          categories = result.data;
        } else if (Array.isArray(result.data?.categories)) {
          categories = result.data.categories;
        } else if (Array.isArray(result.data?.data)) {
          categories = result.data.data;
        }
        
        // Filter for main categories (Men/Women or root categories)
        const mainCats = categories.filter((cat: Category) => 
          cat.isActive && 
          (cat.name === 'Men' || cat.name === 'Women' || cat.parentCategory === null)
        );
        
        setMainCategories(mainCats);
        
        // If we don't find Men/Women, show all root categories
        if (mainCats.length === 0) {
          const rootCats = categories.filter((cat: Category) => 
            cat.isActive && !cat.parentCategory
          );
          setMainCategories(rootCats);
        }
      }
    } catch (error) {
      console.error('Failed to fetch categories:', error);
      toast.error('Failed to load categories');
    } finally {
      setLoadingCategories(false);
    }
  };

  const fetchSubcategories = async (categoryId: string) => {
    setLoadingCategories(true);
    try {
      const result = await fetchData(`/api/categories?parent=${categoryId}`);
      if (result?.data) {
        let categories: Category[] = [];
        
        if (Array.isArray(result.data)) {
          categories = result.data;
        } else if (Array.isArray(result.data?.categories)) {
          categories = result.data.categories;
        } else if (Array.isArray(result.data?.data)) {
          categories = result.data.data;
        }
        
        return categories.filter((cat: Category) => cat.isActive);
      }
      return [];
    } catch (error) {
      console.error('Failed to fetch subcategories:', error);
      toast.error('Failed to load subcategories');
      return [];
    } finally {
      setLoadingCategories(false);
    }
  };

  const handleCategorySelect = async (category: Category) => {
    // Add category to path
    const newPath = [...categoryPath, category];
    setCategoryPath(newPath);
    
    // Update form data with selected parent
    setFormData(prev => ({
      ...prev,
      parentCategory: category._id
    }));

    // Fetch subcategories for this category
    const subcategories = await fetchSubcategories(category._id);
    setCurrentSubcategories(subcategories);
    
    // Add to expanded paths
    setExpandedPaths(prev => new Set(prev).add(category._id));
    
    toast.success(`Selected parent: ${category.name}`);
  };

  const handleCategoryBack = async (index: number) => {
    // Go back to specific level
    const newPath = categoryPath.slice(0, index + 1);
    setCategoryPath(newPath);
    
    const currentCategory = newPath[newPath.length - 1];
    setFormData(prev => ({
      ...prev,
      parentCategory: currentCategory._id
    }));

    // Fetch subcategories for the current level
    if (index === 0) {
      // If going back to main categories level
      setCurrentSubcategories([]);
    } else {
      const subcategories = await fetchSubcategories(currentCategory._id);
      setCurrentSubcategories(subcategories);
    }
  };

  const resetCategorySelection = () => {
    setCategoryPath([]);
    setCurrentSubcategories([]);
    setFormData(prev => ({
      ...prev,
      parentCategory: ''
    }));
  };

  const toggleCategoryExpansion = async (category: Category) => {
    if (expandedPaths.has(category._id)) {
      // Collapse
      setExpandedPaths(prev => {
        const next = new Set(prev);
        next.delete(category._id);
        return next;
      });
    } else {
      // Expand - fetch subcategories if needed
      setExpandedPaths(prev => new Set(prev).add(category._id));
      
      // Check if we need to load subcategories
      const subcategories = await fetchSubcategories(category._id);
      // We don't set currentSubcategories here because we're just expanding for browsing
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast.error('Category name is required');
      return;
    }

    const fd = new FormData();
    fd.append('name', formData.name);
    fd.append('description', formData.description);
    fd.append('isActive', String(formData.isActive));
    
    if (formData.parentCategory) {
      fd.append('parentCategory', formData.parentCategory);
    }
    
    if (imageFile) {
      fd.append('image', imageFile);
    }

    const result = await postData('/api/categories', fd);
    if (result) {
      toast.success('Category created successfully');
      router.push('/admin/categories');
    }
  };

  // Get categories to display based on current path
  const getCategoriesToDisplay = () => {
    if (categoryPath.length === 0) {
      return mainCategories;
    }
    
    // If we want to show a browsing tree, we need to recursively fetch
    // For simplicity, we'll show current level subcategories
    return currentSubcategories;
  };

  // Render category browsing tree
  const renderCategoryTree = () => {
    const categories = getCategoriesToDisplay();
    
    if (loadingCategories) {
      return (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-sm text-gray-500">Loading categories...</p>
        </div>
      );
    }

    if (categories.length === 0) {
      return (
        <div className="text-center py-8">
          <p className="text-gray-500">
            {categoryPath.length === 0 
              ? 'No main categories available' 
              : 'No subcategories available'}
          </p>
        </div>
      );
    }

    return (
      <div className="space-y-1">
        {categories.map((category) => {
          const isSelected = formData.parentCategory === category._id;
          const isExpanded = expandedPaths.has(category._id);
          
          return (
            <div key={category._id} className="border-b border-gray-100 last:border-b-0">
              <div
                className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors ${
                  isSelected
                    ? 'bg-blue-50 border border-blue-200'
                    : 'hover:bg-gray-50'
                }`}
                onClick={() => handleCategorySelect(category)}
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className={`p-2 rounded ${
                    categoryPath.length === 0 ? 'bg-blue-100' : 'bg-gray-100'
                  }`}>
                    <Folder className="w-4 h-4 text-gray-600" />
                  </div>
                  
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-900 truncate">
                        {category.name}
                      </span>
                      {category.productCount !== undefined && (
                        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                          {category.productCount} products
                        </span>
                      )}
                    </div>
                    <span className="text-sm text-gray-500 truncate block">
                      /{category.slug}
                    </span>
                  </div>
                  
                  {isSelected && (
                    <Check className="w-4 h-4 text-blue-600 flex-shrink-0" />
                  )}
                </div>
                
                {/* Expand/collapse button */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleCategoryExpansion(category);
                  }}
                  className="p-1 hover:bg-gray-200 rounded transition-colors"
                >
                  {isExpanded ? (
                    <ChevronUp className="w-4 h-4 text-gray-600" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-gray-600" />
                  )}
                </button>
              </div>
              
              {/* Expanded content - could show immediate children here */}
              {isExpanded && (
                <div className="ml-12 mt-2 pl-4 border-l-2 border-gray-200">
                  <div className="text-sm text-gray-500 p-2">
                    Click to select as parent category
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center gap-4 mb-6">
            <button
              onClick={() => router.back()}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <FolderTree className="w-6 h-6" />
                Create New Category
              </h1>
              <p className="text-gray-600 mt-1">
                Add a new category to organize your products
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Basic Information */}
            <div className="lg:col-span-2 space-y-6">
              {/* Basic Information */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">
                  Basic Information
                </h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Category Name *
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      required
                      placeholder="e.g., T-shirts, Jeans, Hoodies"
                      className="w-full text-black px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <p className="text-sm text-gray-500 mt-1">
                      This will be visible to customers
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      rows={3}
                      placeholder="Describe this category..."
                      className="w-full px-4 py-2 border border-gray-300 text-black rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <p className="text-sm text-gray-500 mt-1">
                      Optional description for internal use
                    </p>
                  </div>
                </div>
              </div>

              {/* Category Image */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <ImageIcon className="w-5 h-5" />
                  Category Image
                </h2>
                
                <div className="space-y-4">
                  {imagePreview ? (
                    <div className="relative">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="w-full h-64 object-contain rounded-lg border border-gray-200 bg-gray-50"
                      />
                      <button
                        type="button"
                        onClick={removeImage}
                        className="absolute top-3 right-3 bg-red-500 text-white rounded-full p-2 hover:bg-red-600 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <label className="block cursor-pointer">
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors">
                        <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600">Upload category image</p>
                        <p className="text-sm text-gray-500 mt-2">
                          Supports JPG, PNG, WebP (Recommended: 400×400px)
                        </p>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="hidden text-black"
                        />
                      </div>
                    </label>
                  )}
                </div>
              </div>
            </div>

            {/* Right Column - Parent Category & Settings */}
            <div className="space-y-6">
              {/* Parent Category */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-800">
                    Parent Category
                  </h2>
                  {categoryPath.length > 0 && (
                    <button
                      type="button"
                      onClick={resetCategorySelection}
                      className="text-sm text-blue-600 hover:text-blue-800"
                    >
                      Reset Selection
                    </button>
                  )}
                </div>
                
                <div className="space-y-4">
                  {/* Selected Category Path */}
                  {categoryPath.length > 0 ? (
                    <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
                      <p className="text-sm font-medium text-gray-700 mb-2">Selected Parent</p>
                      <div className="flex items-center gap-2 flex-wrap mb-2">
                        {categoryPath.map((category, index) => (
                          <button
                            key={category._id}
                            type="button"
                            onClick={() => handleCategoryBack(index)}
                            className="inline-flex items-center gap-1 text-sm font-medium text-blue-700 hover:text-blue-900"
                          >
                            {category.name}
                            {index < categoryPath.length - 1 && <ChevronRight className="w-3 h-3" />}
                          </button>
                        ))}
                      </div>
                      <p className="text-xs text-gray-500">
                        Click on any category in the path to go back to that level
                      </p>
                    </div>
                  ) : (
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-900">Root Level</p>
                          <p className="text-sm text-gray-500">This will be a top-level category</p>
                        </div>
                        <Home className="w-5 h-5 text-gray-400" />
                      </div>
                    </div>
                  )}

                  {/* Category Browser */}
                  <div className="border border-gray-300 rounded-lg">
                    {/* Header */}
                    <div className="p-4 border-b border-gray-200 bg-gray-50">
                      <div className="flex items-center gap-2">
                        <Folder className="w-5 h-5 text-gray-500" />
                        <span className="font-medium">
                          {categoryPath.length === 0 ? 'Browse Main Categories' : 
                           `Browse ${categoryPath[categoryPath.length - 1].name} Subcategories`}
                        </span>
                      </div>
                    </div>

                    {/* Categories List */}
                    <div className="max-h-64 overflow-y-auto">
                      {renderCategoryTree()}
                    </div>

                    {/* Footer */}
                    {formData.parentCategory && (
                      <div className="p-3 border-t border-gray-200 bg-green-50">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-green-800">
                              Selected Parent
                            </p>
                            <p className="text-sm text-green-600">
                              {categoryPath.map(cat => cat.name).join(' → ')}
                            </p>
                          </div>
                          <Check className="w-4 h-4 text-green-600" />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Settings */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">
                  Settings
                </h2>
                
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                    <input
                      type="checkbox"
                      id="isActive"
                      checked={formData.isActive}
                      onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                      className="w-4 h-4 rounded focus:ring-blue-500 text-black"
                    />
                    <div>
                      <label htmlFor="isActive" className="text-sm font-medium text-gray-700">
                        Active Category
                      </label>
                      <p className="text-xs text-gray-500 mt-1">
                        Make this category visible to customers
                      </p>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-gray-200">
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? 'Creating...' : 'Create Category'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
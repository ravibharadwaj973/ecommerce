// app/admin/products/create/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useApi } from '../../../hooks/useApi';
import { Upload, X, Plus, ChevronRight, Folder } from 'lucide-react';
import { toast } from 'sonner';

type Category = {
  _id: string;
  name: string;
  slug: string;
  parentCategory?: string | null;
  isActive: boolean;
  productCount?: number;
};

export default function CreateProductPage() {
  const router = useRouter();
  const { postData, loading, fetchData } = useApi();
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    categoryId: '',
    categoryName: '',
    brand: '',
    features: [] as string[],
    tags: [] as string[],
    isPublished: true,
  });

  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [tempFeature, setTempFeature] = useState('');
  const [tempTag, setTempTag] = useState('');
  
  // Category selection state
  const [mainCategories, setMainCategories] = useState<Category[]>([]);
  const [categoryPath, setCategoryPath] = useState<Category[]>([]);
  const [currentSubcategories, setCurrentSubcategories] = useState<Category[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(false);

  // Fetch main categories (Men/Women) on mount - from root categories
  useEffect(() => {
    fetchMainCategories();
  }, []);

  const fetchMainCategories = async () => {
    setLoadingCategories(true);
    try {
      // Fetch only Men and Women categories (root categories)
      const result = await fetchData('/api/categories');
      if (result?.data) {
        // Handle different response structures
        let categories: Category[] = [];
        
        if (Array.isArray(result.data)) {
          categories = result.data;
        } else if (Array.isArray(result.data?.categories)) {
          categories = result.data.categories;
        } else if (Array.isArray(result.data?.data)) {
          categories = result.data.data;
        }
        
        // Filter for only active categories and likely Men/Women (you may need to adjust this filter)
        // If your API returns all categories, we need to identify Men/Women specifically
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
    
    // Update form data with selected category
    setFormData(prev => ({
      ...prev,
      categoryId: category._id,
      categoryName: newPath.map(c => c.name).join(' > ')
    }));

    // Fetch subcategories for this category
    const subcategories = await fetchSubcategories(category._id);
    setCurrentSubcategories(subcategories);
    
    // If no subcategories, this is a leaf category (final selection)
    if (subcategories.length === 0) {
      toast.success(`Selected category: ${category.name}`);
    }
  };

  const handleCategoryBack = async (index: number) => {
    // Go back to specific level
    const newPath = categoryPath.slice(0, index + 1);
    setCategoryPath(newPath);
    
    const currentCategory = newPath[newPath.length - 1];
    setFormData(prev => ({
      ...prev,
      categoryId: currentCategory._id,
      categoryName: newPath.map(c => c.name).join(' > ')
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
      categoryId: '',
      categoryName: ''
    }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const newImages = [...images, ...files];
    setImages(newImages);
    
    // Create previews
    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreviews(prev => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const addFeature = () => {
    if (tempFeature && !formData.features.includes(tempFeature)) {
      setFormData(prev => ({
        ...prev,
        features: [...prev.features, tempFeature],
      }));
      setTempFeature('');
    }
  };

  const addTag = () => {
    if (tempTag && !formData.tags.includes(tempTag)) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tempTag],
      }));
      setTempTag('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.categoryId) {
      toast.error('Please select a category');
      return;
    }

    const fd = new FormData();
    fd.append('name', formData.name);
    fd.append('description', formData.description);
    fd.append('categoryId', formData.categoryId);
    fd.append('brand', formData.brand);
    fd.append('features', JSON.stringify(formData.features));
    fd.append('tags', JSON.stringify(formData.tags));
    fd.append('isPublished', String(formData.isPublished));
    
    images.forEach(img => fd.append('images', img));

    const result = await postData('/api/newproducts', fd);
    if (result) {
      toast.success('Product created successfully!');
      router.push(`/admin/products/${result.data._id}/variants`);
    }
  };

  // Determine which categories to display
  const categoriesToShow = categoryPath.length === 0 ? mainCategories : currentSubcategories;

  return (
    <div>
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-800">
              Create New Product
            </h2>
            <p className="text-gray-600 text-sm mt-1">
              Fill in the details below to add a new product to your catalog
            </p>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">
                Basic Information
              </h3>
              
              <div className='text-black'>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Product Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  required
                  placeholder="Enter product name"
                  className="w-full px-4 py-2 border border-gray-300 text-black rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className='text-black'>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  rows={4}
                  placeholder="Describe your product..."
                  className="w-full px-4 py-2 border border-gray-300 text-black rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className='text-black'>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Brand
                </label>
                <input
                  type="text"
                  value={formData.brand}
                  onChange={(e) => setFormData(prev => ({ ...prev, brand: e.target.value }))}
                  placeholder="Enter brand name"
                  className="w-full px-4 py-2 border border-gray-300 text-black rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Category Selection */}
            <div className="text-black">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  Category *
                </h3>
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

              {/* Selected Category Path */}
              {categoryPath.length > 0 && (
                <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-100">
                  <div className="flex items-center gap-2 flex-wrap mb-2">
                    <span className="text-sm text-gray-600">Selected:</span>
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
              )}

              {/* Category Selection UI */}
              <div className="border border-gray-300 rounded-lg">
                {/* Header */}
                <div className="p-4 border-b border-gray-200 bg-gray-50">
                  <div className="flex items-center gap-2">
                    <Folder className="w-5 h-5 text-gray-500" />
                    <span className="font-medium">
                      {categoryPath.length === 0 ? 'Select Main Category (Men/Women)' : 
                       `Select ${categoryPath[categoryPath.length - 1].name} Subcategory`}
                    </span>
                  </div>
                </div>

                {/* Categories List */}
                <div className="max-h-60 overflow-y-auto">
                  {loadingCategories ? (
                    <div className="p-8 text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                      <p className="mt-2 text-sm text-gray-500">Loading categories...</p>
                    </div>
                  ) : categoriesToShow.length === 0 ? (
                    <div className="p-8 text-center">
                      <p className="text-gray-500">
                        {categoryPath.length === 0 
                          ? 'No main categories available. Please check your API.' 
                          : 'No subcategories available. This is a final category.'}
                      </p>
                      {categoryPath.length > 0 && (
                        <p className="text-sm text-green-600 mt-2">
                          ✓ This is a valid final category for products
                        </p>
                      )}
                    </div>
                  ) : (
                    <div className="divide-y divide-gray-100">
                      {categoriesToShow.map((category) => (
                        <button
                          key={category._id}
                          type="button"
                          onClick={() => handleCategorySelect(category)}
                          className="w-full p-4 text-left hover:bg-blue-50 transition-colors flex items-center justify-between group"
                        >
                          <div className="flex items-center gap-3">
                            <div className={`p-2 rounded ${
                              categoryPath.length === 0 ? 'bg-blue-100' : 'bg-gray-100'
                            }`}>
                              <Folder className="w-4 h-4 text-gray-600" />
                            </div>
                            <div className="text-left">
                              <span className="font-medium text-gray-900 group-hover:text-blue-700 block">
                                {category.name}
                              </span>
                              {category.productCount !== undefined && (
                                <span className="text-xs text-gray-500">
                                  {category.productCount} products
                                </span>
                              )}
                            </div>
                          </div>
                          <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Footer */}
                {formData.categoryId && (
                  <div className="p-3 border-t border-gray-200 bg-green-50">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-green-800">
                          Selected Category
                        </p>
                        <p className="text-sm text-green-600">
                          {formData.categoryName}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={resetCategorySelection}
                        className="text-sm text-red-600 hover:text-red-800"
                      >
                        Change
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Required message */}
              {!formData.categoryId && (
                <p className="mt-2 text-sm text-red-600">
                  Please select a category for the product
                </p>
              )}
            </div>

            {/* Rest of the form remains the same */}
            {/* Images Section */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Product Images
              </h3>
              
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-4">
                {imagePreviews.map((preview, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={preview}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-32 object-cover rounded-lg border border-gray-200"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                
                {/* Upload Button */}
                <label className="border-2 border-dashed border-gray-300 rounded-lg h-32 flex flex-col items-center justify-center cursor-pointer hover:border-blue-400 transition-colors">
                  <Upload className="w-8 h-8 text-gray-400 mb-2" />
                  <span className="text-sm text-gray-600">Upload Images</span>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </label>
              </div>
              
              <p className="text-sm text-gray-500">
                Upload product images. First image will be used as primary.
              </p>
            </div>

            {/* Features Section */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Features
              </h3>
              
              <div className="flex gap-2 mb-3 text-black">
                <input
                  type="text"
                  value={tempFeature}
                  onChange={(e) => setTempFeature(e.target.value)}
                  placeholder="Add a feature"
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button
                  type="button"
                  onClick={addFeature}
                  className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Add
                </button>
              </div>
              
              <div className="flex flex-wrap gap-2">
                {formData.features.map((feature, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center gap-1 bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm"
                  >
                    {feature}
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({
                        ...prev,
                        features: prev.features.filter((_, i) => i !== index),
                      }))}
                      className="hover:text-blue-900"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Tags Section */}
            <div className='text-black'>
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Tags
              </h3>
              
              <div className="flex gap-2 mb-3">
                <input
                  type="text"
                  value={tempTag}
                  onChange={(e) => setTempTag(e.target.value)}
                  placeholder="Add a tag"
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button
                  type="button"
                  onClick={addTag}
                  className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Add
                </button>
              </div>
              
              <div className="flex flex-wrap gap-2">
                {formData.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center gap-1 bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({
                        ...prev,
                        tags: prev.tags.filter((_, i) => i !== index),
                      }))}
                      className="hover:text-gray-900"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Settings */}
            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
              <input
                type="checkbox"
                id="isPublished"
                checked={formData.isPublished}
                onChange={(e) => setFormData(prev => ({ ...prev, isPublished: e.target.checked }))}
                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
              />
              <label htmlFor="isPublished" className="text-sm text-gray-700">
                Publish this product immediately
              </label>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-4 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={() => router.back()}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || !formData.categoryId}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {loading ? 'Creating...' : 'Create Product'}
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
// app/admin/categories/[id]/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useApi } from '../../../hooks/useApi';
import { 
  ArrowLeft, Upload, X, FolderTree, Image as ImageIcon, 
  FileText, Tag, Save, Trash2, Eye, Package, Home, AlertCircle
} from 'lucide-react';
import { toast } from 'sonner';

type Category = {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  image?: {
    url: string;
    publicId?: string;
  };
  parentCategory?: {
    _id: string;
    name: string;
  };
  isActive: boolean;
  productCount?: number;
  children?: Category[];
};

export default function EditCategoryPage() {
  const { id } = useParams();
  const router = useRouter();
  
  const { 
    data: category, 
    loading: categoryLoading, 
    error: categoryError,
    fetchData: fetchCategory,
    putData: updateCategory,
    deleteData: deleteCategory 
  } = useApi<Category>();

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    parentCategory: '',
    isActive: true,
  });

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [categoryTree, setCategoryTree] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Load category and category tree
  useEffect(() => {
    if (id) {
      fetchCategory(`/api/categories/${id}`);
      loadCategoryTree();
    }
  }, [id]);

  // Load category tree (excluding current category and its descendants)
  const loadCategoryTree = async () => {
    try {
      const res = await fetch('/api/categories');
      const json = await res.json();
      if (json.success) {
        setCategoryTree(json.data || []);
      }
    } catch (error) {
      console.error('Failed to load categories:', error);
    }
  };

  // Update form when category data loads
  useEffect(() => {
    if (category) {
      setFormData({
        name: category.name || '',
        description: category.description || '',
        parentCategory: category.parentCategory?._id || '',
        isActive: category.isActive ?? true,
      });
      if (category.image?.url) {
        setImagePreview(category.image.url);
      }
    }
  }, [category]);

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

  const filterCategoryTree = (categories: Category[], excludeId: string): Category[] => {
    return categories.filter(cat => {
      if (cat._id === excludeId) return false;
      // Also filter out descendants
      const isDescendant = checkIfDescendant(cat, excludeId);
      return !isDescendant;
    }).map(cat => ({
      ...cat,
      children: cat.children ? filterCategoryTree(cat.children, excludeId) : []
    }));
  };

  const checkIfDescendant = (category: Category, targetId: string): boolean => {
    if (!category.children) return false;
    for (const child of category.children) {
      if (child._id === targetId) return true;
      if (checkIfDescendant(child, targetId)) return true;
    }
    return false;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // if (!formData.name.trim()) {
      //   toast.error('Category name is required');
      //   setLoading(false);
      //   return;
      // }

      const fd = new FormData();
      fd.append('name', formData.name);
      fd.append('description', formData.description);
      fd.append('isActive', String(formData.isActive));
      
      if (formData.parentCategory) {
        fd.append('parentCategory', formData.parentCategory);
      } else if (category?.parentCategory) {
        // If removing parent category
        fd.append('parentCategory', '');
      }
      
      if (imageFile) {
        fd.append('image', imageFile);
      } else if (!imagePreview && category?.image) {
        // If removing existing image
        fd.append('removeImage', 'true');
      }

      const result = await updateCategory(`/api/categories/${id}`, fd);
      if (result) {
        toast.success('Category updated successfully');
        router.push('/admin/categories');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to update category');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    const result = await deleteCategory(`/api/categories/${id}`);
    if (result) {
      toast.success('Category deleted successfully');
      router.push('/admin/categories');
    }
  };

  const filteredCategoryTree = category ? filterCategoryTree(categoryTree, category._id) : [];

  const renderParentSelector = () => {
    if (!category) return null;

    const options = [
      { value: '', label: 'Root Level (No Parent)', icon: Home }
    ];

    const renderCategoryOption = (cat: Category, depth: number = 0) => {
      const Icon = FolderTree;
      const indent = '  '.repeat(depth);
      
      options.push({
        value: cat._id,
        label: `${indent}${cat.name} (/${cat.slug})`,
        icon: Icon
      });

      if (cat.children) {
        cat.children.forEach(child => renderCategoryOption(child, depth + 1));
      }
    };

    filteredCategoryTree.forEach(cat => renderCategoryOption(cat));

    return (
      <select
        value={formData.parentCategory}
        onChange={(e) => setFormData(prev => ({ ...prev, parentCategory: e.target.value }))}
        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      >
        {options.map(option => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    );
  };

  if (categoryLoading) {
    return (
      <div title="Edit Category">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading category...</p>
        </div>
      </div>
    );
  }

  if (categoryError) {
    return (
      <div title="Edit Category">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <AlertCircle className="w-6 h-6 text-red-600" />
            <div>
              <h3 className="text-lg font-semibold text-red-800">Category Not Found</h3>
              <p className="text-red-700 mt-1">{categoryError}</p>
            </div>
          </div>
          <button
            onClick={() => router.push('/admin/categories')}
            className="mt-4 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
          >
            Back to Categories
          </button>
        </div>
      </div>
    );
  }

  return (
    <div title="Edit Category">
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
                Edit Category
              </h1>
              {category && (
                <div className="flex items-center gap-4 mt-2">
                  <span className="text-sm text-gray-600">
                    Slug: <code className="bg-gray-100 px-2 py-1 rounded">/{category.slug}</code>
                  </span>
                  {typeof category.productCount === 'number' && (
                    <span className="text-sm text-gray-600 flex items-center gap-1">
                      <Package className="w-4 h-4" />
                      {category.productCount} products
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {category && (
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
                      <label className="block text-sm font-medium  mb-2 text-black">
                        Category Name *
                      </label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                       
                        placeholder="Enter category name"
                        className="w-full text-black  px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Description
                      </label>
                      <textarea
                        value={formData.description}
                        onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                        rows={3}
                        placeholder="Category description..."
                        className="w-full px-4py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2  text-black ">
                        Parent Category
                      </label>
                      {renderParentSelector()}
                      <p className="text-sm text-gray-500 mt-2">
                        Select a parent category or leave empty for root level
                      </p>
                    </div>
                  </div>
                </div>

                {/* Category Image */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                      <ImageIcon className="w-5 h-5" />
                      Category Image
                    </h2>
                    {imagePreview && (
                      <button
                        type="button"
                        onClick={removeImage}
                        className="text-sm text-red-600 hover:text-red-800"
                      >
                        Remove Image
                      </button>
                    )}
                  </div>
                  
                  <div className="space-y-4">
                    {imagePreview ? (
                      <div className="relative">
                        <img
                          src={imagePreview}
                          alt="Category preview"
                          className="w-full h-64 object-contain rounded-lg border border-gray-200 bg-gray-50"
                        />
                        <div className="absolute bottom-3 right-3 flex gap-2">
                          <label className="cursor-pointer bg-white border border-gray-300 rounded-lg px-4 py-2 hover:bg-gray-50 transition-colors">
                            <span className="flex items-center gap-2">
                              <Upload className="w-4 h-4" />
                              Change
                            </span>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleImageUpload}
                              className="hidden"
                            />
                          </label>
                        </div>
                      </div>
                    ) : (
                      <label className="block cursor-pointer">
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors">
                          <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                          <p className="text-gray-600">Upload category image</p>
                          <p className="text-sm text-gray-500 mt-2">
                            Click to browse or drag and drop
                          </p>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageUpload}
                            className="hidden"
                          />
                        </div>
                      </label>
                    )}
                  </div>
                </div>
              </div>

              {/* Right Column - Settings & Actions */}
              <div className="space-y-6">
                {/* Category Info */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <h2 className="text-lg font-semibold text-gray-800 mb-4">
                    Category Information
                  </h2>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Slug</span>
                      <span className="font-medium text-gray-900">/{category.slug}</span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Status</span>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        category.isActive
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {category.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    
                    {category.parentCategory && (
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Parent</span>
                        <span className="font-medium text-gray-900">
                          {category.parentCategory.name}
                        </span>
                      </div>
                    )}
                    
                    {category.children && category.children.length > 0 && (
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Subcategories</span>
                        <span className="font-medium text-gray-900">
                          {category.children.length}
                        </span>
                      </div>
                    )}
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
                        className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                      />
                      <div>
                        <label htmlFor="isActive" className="text-sm font-medium text-gray-700">
                          Active Category
                        </label>
                        <p className="text-xs text-gray-500 mt-1">
                          Show this category to customers
                        </p>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-gray-200">
                      <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                      >
                        <Save className="w-4 h-4" />
                        {loading ? 'Saving...' : 'Save Changes'}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Danger Zone */}
                <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                  <h2 className="text-lg font-semibold text-red-800 mb-4">
                    Danger Zone
                  </h2>
                  
                  <div className="space-y-4">
                    <div className="p-4 bg-white rounded-lg border border-red-200">
                      <div className="flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
                        <div>
                          <h4 className="font-medium text-red-800">Delete Category</h4>
                          <p className="text-sm text-red-700 mt-1">
                            This will permanently delete the category and all its subcategories.
                            Products in this category will become uncategorized.
                          </p>
                        </div>
                      </div>
                      
                      <button
                        type="button"
                        onClick={() => setShowDeleteModal(true)}
                        className="mt-4 w-full bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
                      >
                        <Trash2 className="w-4 h-4" />
                        Delete Category
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </form>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-red-100 rounded-lg">
                  <AlertCircle className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Delete Category
                  </h3>
                  <p className="text-gray-600 text-sm">
                    This action cannot be undone
                  </p>
                </div>
              </div>
              
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-800 font-medium mb-2">
                  Are you sure you want to delete "{category?.name}"?
                </p>
                <ul className="text-red-700 text-sm space-y-1">
                  <li>• All subcategories will be deleted</li>
                  <li>• Products will become uncategorized</li>
                  <li>• This action is irreversible</li>
                </ul>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
                >
                  Delete Permanently
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
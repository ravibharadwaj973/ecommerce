// app/admin/categories/page.tsx
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useApi } from '../../hooks/useApi';
import { 
  FolderTree, Plus, Edit, Trash2, Eye, ChevronRight, 
  Image as ImageIcon, Package, ArrowLeft, Search, Filter,
  MoreVertical, FolderOpen, Folder
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
  children?: Category[];
  productCount?: number;
  isActive: boolean;
  level?: number;
  depth?: number;
};

export default function CategoriesPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterActive, setFilterActive] = useState<'all' | 'active' | 'inactive'>('all');
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [breadcrumbs, setBreadcrumbs] = useState<Category[]>([]);
  const [currentParent, setCurrentParent] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState<{ id: string; name: string } | null>(null);

  const { 
    data: categories, 
    loading, 
    error,
    fetchData: fetchCategories,
    deleteData: deleteCategory 
  } = useApi<Category[]>();

  // Fetch categories based on current parent
  useEffect(() => {
    const url = currentParent 
      ? `/api/categories?parent=${currentParent}`
      : '/api/categories';
    
    fetchCategories(url);
  }, [currentParent]);

  // Initialize breadcrumbs when current parent changes
  useEffect(() => {
    if (currentParent && categories) {
      // For now, we'll just show basic breadcrumbs
      // In a real app, you might want to fetch the parent chain
    }
  }, [currentParent, categories]);

  const handleNavigateToCategory = (category: Category) => {
    setCurrentParent(category._id);
    setBreadcrumbs(prev => [...prev, category]);
  };

  const handleNavigateBack = (index: number) => {
    const newBreadcrumbs = breadcrumbs.slice(0, index + 1);
    setBreadcrumbs(newBreadcrumbs);
    setCurrentParent(index === 0 ? null : newBreadcrumbs[index]._id);
  };

  const handleToggleExpand = async (categoryId: string) => {
    if (expandedCategories.has(categoryId)) {
      setExpandedCategories(prev => {
        const next = new Set(prev);
        next.delete(categoryId);
        return next;
      });
    } else {
      setExpandedCategories(prev => new Set(prev).add(categoryId));
      
      // Fetch children if not already loaded
      if (!categories?.find(c => c._id === categoryId)?.children) {
        try {
          const res = await fetch(`/api/categories/children?parent=${categoryId}`);
          const json = await res.json();
          
          if (json.success) {
            // Update the category with children
            const updatedCategories = categories?.map(cat => 
              cat._id === categoryId 
                ? { ...cat, children: json.data }
                : cat
            );
            // Note: This would require a setter for the categories data
          }
        } catch (error) {
          toast.error('Failed to load subcategories');
        }
      }
    }
  };

  const handleDeleteCategory = async (id: string) => {
    const result = await deleteCategory(`/api/categories/${id}`);
    if (result) {
      fetchCategories(currentParent ? `/api/categories?parent=${currentParent}` : '/api/categories');
      setShowDeleteModal(null);
      toast.success('Category deleted successfully');
    }
  };

  const toggleCategoryStatus = async (category: Category) => {
    try {
      const res = await fetch(`/api/categories/${category._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !category.isActive }),
      });

      const json = await res.json();
      if (json.success) {
        fetchCategories(currentParent ? `/api/categories?parent=${currentParent}` : '/api/categories');
        toast.success(`Category ${!category.isActive ? 'activated' : 'deactivated'}`);
      }
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const filteredCategories = categories?.filter(cat => {
    // Search filter
    const matchesSearch = cat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         cat.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         cat.slug.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Active filter
    const matchesActive = 
      filterActive === 'all' ||
      (filterActive === 'active' && cat.isActive) ||
      (filterActive === 'inactive' && !cat.isActive);
    
    return matchesSearch && matchesActive;
  });

  const renderCategoryItem = (category: Category, level: number = 0) => {
    const hasChildren = category.children && category.children.length > 0;
    const isExpanded = expandedCategories.has(category._id);

    return (
      <div key={category._id} className="select-none text-black">
        <div
          className={`flex items-center justify-between p-4 hover:bg-gray-50 border-b border-gray-100 ${
            level > 0 ? `pl-${level * 8}` : ''
          }`}
          style={{ paddingLeft: `${(level * 32) + 16}px` }}
        >
          {/* Left side - Info and expand button */}
          <div className="flex items-center gap-3 flex-1 min-w-0">
            {hasChildren ? (
              <button
                onClick={() => handleToggleExpand(category._id)}
                className="p-1 hover:bg-gray-200 rounded transition-colors"
              >
                <ChevronRight className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
              </button>
            ) : (
              <div className="w-6" /> // Spacer for alignment
            )}
            
            {/* Category Image */}
            <div className="flex-shrink-0">
              {category.image?.url ? (
                <img
                  src={category.image.url}
                  alt={category.name}
                  className="w-10 h-10 rounded-lg object-cover border border-gray-200"
                />
              ) : (
                <div className="w-10 h-10 rounded-lg bg-gray-100 border border-gray-200 flex items-center justify-center">
                  <Folder className="w-5 h-5 text-gray-400" />
                </div>
              )}
            </div>

            {/* Category Info */}
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <h3 className="font-medium text-gray-900 truncate">
                  {category.name}
                </h3>
                <span className={`px-2 py-0.5 text-xs rounded-full ${
                  category.isActive
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                }`}>
                  {category.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
              
              <div className="flex items-center gap-3 text-sm text-gray-500 mt-1">
                {category.slug && (
                  <span className="truncate">/{category.slug}</span>
                )}
                {typeof category.productCount === 'number' && (
                  <div className="flex items-center gap-1">
                    <Package className="w-3 h-3" />
                    <span>{category.productCount} products</span>
                  </div>
                )}
              </div>
              
              {category.description && (
                <p className="text-sm text-gray-600 mt-1 line-clamp-1">
                  {category.description}
                </p>
              )}
            </div>
          </div>

          {/* Right side - Actions */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={() => handleNavigateToCategory(category)}
              className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              title="View subcategories"
            >
              <Eye className="w-4 h-4" />
            </button>
            
            <Link
              href={`/admin/categories/${category._id}`}
              className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
              title="Edit category"
            >
              <Edit className="w-4 h-4" />
            </Link>
            
            <button
              onClick={() => toggleCategoryStatus(category)}
              className={`p-2 rounded-lg transition-colors ${
                category.isActive
                  ? 'text-gray-400 hover:text-yellow-600 hover:bg-yellow-50'
                  : 'text-gray-400 hover:text-green-600 hover:bg-green-50'
              }`}
              title={category.isActive ? 'Deactivate' : 'Activate'}
            >
              {category.isActive ? '●' : '○'}
            </button>
            
            <button
              onClick={() => setShowDeleteModal({ id: category._id, name: category.name })}
              className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              title="Delete category"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Children */}
        {isExpanded && hasChildren && (
          <div>
            {category.children!.map(child => renderCategoryItem(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div title="Categories">
      <div className="space-y-6">
        {/* Header with Actions */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <FolderTree className="w-6 h-6" />
                Categories
              </h1>
              <p className="text-gray-600 mt-1">
                Manage your product categories hierarchy
              </p>
            </div>
            
            <Link
              href="/admin/categories/create"
              className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              New Category
            </Link>
          </div>

          {/* Breadcrumbs */}
          {breadcrumbs.length > 0 && (
            <div className="mb-4">
              <nav className="flex items-center gap-2 text-sm">
                <button
                  onClick={() => {
                    setCurrentParent(null);
                    setBreadcrumbs([]);
                  }}
                  className="text-gray-600 hover:text-gray-900"
                >
                  All Categories
                </button>
                {breadcrumbs.map((crumb, index) => (
                  <div key={crumb._id} className="flex items-center gap-2">
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                    <button
                      onClick={() => handleNavigateBack(index)}
                      className="text-gray-600 hover:text-gray-900"
                    >
                      {crumb.name}
                    </button>
                  </div>
                ))}
              </nav>
            </div>
          )}

          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Search */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search Categories
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by name, slug, or description..."
                  className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                />
              </div>
            </div>

            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <div className="flex gap-2">
                {['all', 'active', 'inactive'].map((status) => (
                  <button
                    key={status}
                    onClick={() => setFilterActive(status as any)}
                    className={`px-4 py-2 rounded-lg transition-colors ${
                      filterActive === status
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

        {/* Categories List */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-3 text-gray-500">Loading categories...</p>
            </div>
          ) : error ? (
            <div className="p-6 text-center">
              <p className="text-red-600">Error: {error}</p>
            </div>
          ) : filteredCategories && filteredCategories.length > 0 ? (
            <div className="divide-y divide-gray-100">
              {/* Back button when viewing subcategories */}
              {currentParent && (
                <button
                  onClick={() => {
                    if (breadcrumbs.length > 0) {
                      handleNavigateBack(breadcrumbs.length - 2);
                    } else {
                      setCurrentParent(null);
                    }
                  }}
                  className="w-full p-4 text-left text-blue-600 hover:bg-blue-50 flex items-center gap-2 border-b border-gray-100"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back to {breadcrumbs.length > 1 ? breadcrumbs[breadcrumbs.length - 2]?.name : 'All Categories'}
                </button>
              )}

              {/* Categories */}
              {filteredCategories.map(category => renderCategoryItem(category))}
            </div>
          ) : (
            <div className="text-center py-12">
              <FolderTree className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-700 mb-2">
                {searchQuery || filterActive !== 'all'
                  ? 'No categories match your filters'
                  : currentParent
                  ? 'No subcategories found'
                  : 'No categories yet'
                }
              </h3>
              <p className="text-gray-500 mb-6">
                {searchQuery || filterActive !== 'all'
                  ? 'Try adjusting your search or filters'
                  : currentParent
                  ? 'Create the first subcategory for this category'
                  : 'Create your first category to organize your products'
                }
              </p>
              <Link
                href="/admin/categories/create"
                className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-5 h-5" />
                Create Category
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-red-100 rounded-lg">
                  <Trash2 className="w-6 h-6 text-red-600" />
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
                <p className="text-red-800">
                  Are you sure you want to delete <strong>"{showDeleteModal.name}"</strong>?
                </p>
                <p className="text-red-700 text-sm mt-2">
                  This will also delete all subcategories and remove this category from associated products.
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteModal(null)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDeleteCategory(showDeleteModal.id)}
                  className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
                >
                  Delete Category
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
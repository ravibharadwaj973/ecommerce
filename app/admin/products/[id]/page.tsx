'use client';
import { useState, useEffect, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../../../context/AuthContext';
import { 
  ArrowLeftIcon, 
  PhotoIcon, 
  XMarkIcon, 
  StarIcon,
  CheckIcon,
  TrashIcon
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
  id: string;
  name: string;
  description: string;
  price: number;
  comparePrice?: number;
  salePrice?: number;
  discountPercent: number;
  category: string | { _id: string; name: string };
  brand?: string;
  stock: number;
  sizes: string[];
  colors: string[];
  features: string[];
  tags: string[];
  images: ProductImage[];
  sku: string;
  isPublished: boolean;
  isFeatured: boolean;
  isActive: boolean;
  isOnSale: boolean;
  saleStartDate?: string;
  saleEndDate?: string;
  rating: {
    average: number;
    count: number;
    distribution: {
      1: number;
      2: number;
      3: number;
      4: number;
      5: number;
    };
  };
  viewCount: number;
  purchaseCount: number;
  wishlistCount: number;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const { user, checkAdminAccess } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [product, setProduct] = useState<Product | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: 0,
    comparePrice: 0,
    salePrice: 0,
    categoryId: '',
    brand: '',
    stock: 0,
    sizes: [] as string[],
    colors: [] as string[],
    features: [] as string[],
    tags: [] as string[],
    isPublished: false,
    isFeatured: false,
    isActive: true,
    isOnSale: false,
    saleStartDate: '',
    saleEndDate: '',
  });

  const [images, setImages] = useState<ProductImage[]>([]);
  const [imagesToDelete, setImagesToDelete] = useState<string[]>([]);
  const [tempSize, setTempSize] = useState('');
  const [tempColor, setTempColor] = useState('');
  const [tempFeature, setTempFeature] = useState('');
  const [tempTag, setTempTag] = useState('');

  useEffect(() => {
    if (!user || !checkAdminAccess()) {
      router.push('/admin');
      return;
    }
    fetchProduct();
    fetchCategories();
  }, [user, params.id]);

  console.log(params.id)
  const fetchProduct = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/products/${params.id}`);
      const data = await response.json();

      if (data.success) {
        const productData = data.data.product;
        setProduct(productData);
        setImages(productData.images || []);
        
        // Set form data
        setFormData({
          name: productData.name,
          description: productData.description,
          price: productData.price,
          comparePrice: productData.comparePrice || 0,
          salePrice: productData.salePrice || 0,
          categoryId: typeof productData.category === 'object' ? productData.category._id : productData.category,
          brand: productData.brand || '',
          stock: productData.stock,
          sizes: productData.sizes || [],
          colors: productData.colors || [],
          features: productData.features || [],
          tags: productData.tags || [],
          isPublished: productData.isPublished,
          isFeatured: productData.isFeatured,
          isActive: productData.isActive,
          isOnSale: productData.isOnSale,
          saleStartDate: productData.saleStartDate ? new Date(productData.saleStartDate).toISOString().slice(0, 16) : '',
          saleEndDate: productData.saleEndDate ? new Date(productData.saleEndDate).toISOString().slice(0, 16) : '',
        });
      } else {
        alert('Product not found');
        router.push('/admin/products');
      }
    } catch (error) {
      console.error('Error fetching product:', error);
      alert('Error fetching product');
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value === '' ? 0 : parseFloat(value),
    }));
  };

  // Image handling functions
  const handleImageUpload = async (files: FileList) => {
    setUploadingImages(true);
    
    try {
      const uploadFormData = new FormData();
      
      Array.from(files).forEach(file => {
        uploadFormData.append('newImages', file);
      });

      const response = await fetch(`/api/products/${params.id}`, {
        method: 'PUT',
        body: uploadFormData,
      });

      const data = await response.json();
      
      if (data.success) {
        // Refresh product data to get updated images
        fetchProduct();
        alert('Images uploaded successfully');
      } else {
        alert('Failed to upload images: ' + data.message);
      }
    } catch (error) {
      console.error('Error uploading images:', error);
      alert('Error uploading images');
    } finally {
      setUploadingImages(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleImageUpload(files);
    }
  };

  const removeImage = (publicId: string) => {
    setImagesToDelete(prev => [...prev, publicId]);
    setImages(prev => prev.filter(img => img.publicId !== publicId));
    
    // If we removed the primary image, set a new primary
    const removedImage = images.find(img => img.publicId === publicId);
    if (removedImage?.isPrimary && images.length > 1) {
      const newPrimary = images.find(img => img.publicId !== publicId);
      if (newPrimary) {
        setPrimaryImage(newPrimary.publicId);
      }
    }
  };

  const setPrimaryImage = (publicId: string) => {
    setImages(prev => 
      prev.map(img => ({
        ...img,
        isPrimary: img.publicId === publicId
      }))
    );
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleImageUpload(files);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  // Array management functions
  const addSize = () => {
    if (tempSize.trim() && !formData.sizes.includes(tempSize.trim())) {
      setFormData(prev => ({
        ...prev,
        sizes: [...prev.sizes, tempSize.trim()],
      }));
      setTempSize('');
    }
  };

  const removeSize = (size: string) => {
    setFormData(prev => ({
      ...prev,
      sizes: prev.sizes.filter(s => s !== size),
    }));
  };

  const addColor = () => {
    if (tempColor.trim() && !formData.colors.includes(tempColor.trim())) {
      setFormData(prev => ({
        ...prev,
        colors: [...prev.colors, tempColor.trim()],
      }));
      setTempColor('');
    }
  };

  const removeColor = (color: string) => {
    setFormData(prev => ({
      ...prev,
      colors: prev.colors.filter(c => c !== color),
    }));
  };

  const addFeature = () => {
    if (tempFeature.trim() && !formData.features.includes(tempFeature.trim())) {
      setFormData(prev => ({
        ...prev,
        features: [...prev.features, tempFeature.trim()],
      }));
      setTempFeature('');
    }
  };

  const removeFeature = (feature: string) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.filter(f => f !== feature),
    }));
  };

  const addTag = () => {
    if (tempTag.trim() && !formData.tags.includes(tempTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tempTag.trim()],
      }));
      setTempTag('');
    }
  };

  const removeTag = (tag: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(t => t !== tag),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const submitFormData = new FormData();
      
      // Add all form fields
      Object.entries(formData).forEach(([key, value]) => {
        if (Array.isArray(value)) {
          submitFormData.append(key, JSON.stringify(value));
        } else if (value !== null && value !== undefined) {
          submitFormData.append(key, value.toString());
        }
      });

      // Add images to delete
      if (imagesToDelete.length > 0) {
        submitFormData.append('imagesToDelete', JSON.stringify(imagesToDelete));
      }

      // Add primary image
      const primaryImage = images.find(img => img.isPrimary);
      if (primaryImage) {
        submitFormData.append('primaryImageId', primaryImage.publicId);
      }

      const response = await fetch(`/api/products/${params.id}`, {
        method: 'PUT',
        body: submitFormData,
      });

      const data = await response.json();

      if (data.success) {
        alert('Product updated successfully');
        router.push('/admin/products');
      } else {
        alert(data.message || 'Error updating product');
      }
    } catch (error) {
      console.error('Error updating product:', error);
      alert('Error updating product');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this product? This action cannot be undone and will delete all product images.')) return;

    try {
      const response = await fetch(`/api/products/${params.id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        alert('Product deleted successfully');
        router.push('/admin/products');
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error('Error deleting product:', error);
      alert('Error deleting product');
    }
  };

  if (!user || !checkAdminAccess()) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-600">Access denied. Admin or vendor role required.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-600">Product not found.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link
            href="/admin/products"
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
          >
            <ArrowLeftIcon className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Edit Product</h1>
            <p className="text-gray-600">SKU: {product.sku} | ID: {product.id}</p>
          </div>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={handleDelete}
            className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            <TrashIcon className="w-4 h-4 mr-2" />
            Delete Product
          </button>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  Product Name *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label htmlFor="categoryId" className="block text-sm font-medium text-gray-700 mb-2">
                  Category *
                </label>
                <select
                  id="categoryId"
                  name="categoryId"
                  required
                  value={formData.categoryId}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select a category</option>
                  {categories.map((category) => (
                    <option key={category._id} value={category._id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="brand" className="block text-sm font-medium text-gray-700 mb-2">
                  Brand
                </label>
                <input
                  type="text"
                  id="brand"
                  name="brand"
                  value={formData.brand}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label htmlFor="stock" className="block text-sm font-medium text-gray-700 mb-2">
                  Stock *
                </label>
                <input
                  type="number"
                  id="stock"
                  name="stock"
                  required
                  min="0"
                  value={formData.stock}
                  onChange={handleNumberChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            <div className="mt-6">
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                Description *
              </label>
              <textarea
                id="description"
                name="description"
                required
                rows={4}
                value={formData.description}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Pricing */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Pricing</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-2">
                  Price *
                </label>
                <input
                  type="number"
                  id="price"
                  name="price"
                  required
                  min="0"
                  step="0.01"
                  value={formData.price}
                  onChange={handleNumberChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label htmlFor="comparePrice" className="block text-sm font-medium text-gray-700 mb-2">
                  Compare Price
                </label>
                <input
                  type="number"
                  id="comparePrice"
                  name="comparePrice"
                  min="0"
                  step="0.01"
                  value={formData.comparePrice}
                  onChange={handleNumberChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <div className="flex-1">
                    <label htmlFor="salePrice" className="block text-sm font-medium text-gray-700 mb-2">
                      Sale Price
                    </label>
                    <input
                      type="number"
                      id="salePrice"
                      name="salePrice"
                      min="0"
                      step="0.01"
                      value={formData.salePrice}
                      onChange={handleNumberChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div className="flex items-center h-10 mt-5">
                    <input
                      type="checkbox"
                      id="isOnSale"
                      name="isOnSale"
                      checked={formData.isOnSale}
                      onChange={handleChange}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <label htmlFor="isOnSale" className="ml-2 text-sm text-gray-700">
                      On Sale
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {formData.isOnSale && (
              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="saleStartDate" className="block text-sm font-medium text-gray-700 mb-2">
                    Sale Start Date
                  </label>
                  <input
                    type="datetime-local"
                    id="saleStartDate"
                    name="saleStartDate"
                    value={formData.saleStartDate}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label htmlFor="saleEndDate" className="block text-sm font-medium text-gray-700 mb-2">
                    Sale End Date
                  </label>
                  <input
                    type="datetime-local"
                    id="saleEndDate"
                    name="saleEndDate"
                    value={formData.saleEndDate}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Image Management */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Product Images</h3>
            
            {/* Upload Area */}
            <div
              className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors cursor-pointer mb-6"
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onClick={() => fileInputRef.current?.click()}
            >
              <PhotoIcon className="mx-auto h-12 w-12 text-gray-400" />
              <div className="mt-4">
                <p className="text-lg font-medium text-gray-900">
                  {uploadingImages ? 'Uploading images...' : 'Add product images'}
                </p>
                <p className="mt-2 text-sm text-gray-600">
                  Drag and drop images here, or click to select files
                </p>
                <p className="mt-1 text-xs text-gray-500">
                  PNG, JPG, WEBP up to 10MB each
                </p>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />
            </div>

            {/* Image Preview Grid */}
            {images.length > 0 && (
              <div className="mt-6">
                <h4 className="text-md font-medium text-gray-900 mb-3">
                  Product Images ({images.length})
                  {imagesToDelete.length > 0 && (
                    <span className="ml-2 text-sm text-red-600">
                      ({imagesToDelete.length} marked for deletion)
                    </span>
                  )}
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {images.map((image) => (
                    <div key={image.publicId} className="relative group">
                      <img
                        src={image.url}
                        alt={image.altText}
                        className="w-full h-32 object-cover rounded-lg border-2 border-gray-200"
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all rounded-lg flex items-center justify-center">
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity space-x-2">
                          {image.isPrimary ? (
                            <span className="inline-flex items-center px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                              <CheckIcon className="w-3 h-3 mr-1" />
                              Primary
                            </span>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setPrimaryImage(image.publicId)}
                              className="px-2 py-1 bg-white text-gray-700 text-xs rounded hover:bg-gray-50"
                            >
                              Set Primary
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => removeImage(image.publicId)}
                            className="px-2 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700"
                          >
                            <XMarkIcon className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                      {image.isPrimary && (
                        <div className="absolute top-2 left-2">
                          <span className="inline-flex items-center px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                            <CheckIcon className="w-3 h-3 mr-1" />
                            Primary
                          </span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Arrays Management */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Sizes */}
            <div>
              <h4 className="text-md font-medium text-gray-900 mb-3">Sizes</h4>
              <div className="flex space-x-2 mb-3">
                <input
                  type="text"
                  value={tempSize}
                  onChange={(e) => setTempSize(e.target.value)}
                  placeholder="Add size"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <button
                  type="button"
                  onClick={addSize}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Add
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.sizes.map((size) => (
                  <span
                    key={size}
                    className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
                  >
                    {size}
                    <button
                      type="button"
                      onClick={() => removeSize(size)}
                      className="ml-2 text-blue-600 hover:text-blue-800"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Colors */}
            <div>
              <h4 className="text-md font-medium text-gray-900 mb-3">Colors</h4>
              <div className="flex space-x-2 mb-3">
                <input
                  type="text"
                  value={tempColor}
                  onChange={(e) => setTempColor(e.target.value)}
                  placeholder="Add color"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <button
                  type="button"
                  onClick={addColor}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Add
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.colors.map((color) => (
                  <span
                    key={color}
                    className="inline-flex items-center px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full"
                  >
                    {color}
                    <button
                      type="button"
                      onClick={() => removeColor(color)}
                      className="ml-2 text-green-600 hover:text-green-800"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Features */}
            <div>
              <h4 className="text-md font-medium text-gray-900 mb-3">Features</h4>
              <div className="flex space-x-2 mb-3">
                <input
                  type="text"
                  value={tempFeature}
                  onChange={(e) => setTempFeature(e.target.value)}
                  placeholder="Add feature"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <button
                  type="button"
                  onClick={addFeature}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Add
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.features.map((feature) => (
                  <span
                    key={feature}
                    className="inline-flex items-center px-3 py-1 bg-purple-100 text-purple-800 text-sm rounded-full"
                  >
                    {feature}
                    <button
                      type="button"
                      onClick={() => removeFeature(feature)}
                      className="ml-2 text-purple-600 hover:text-purple-800"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Tags */}
            <div>
              <h4 className="text-md font-medium text-gray-900 mb-3">Tags</h4>
              <div className="flex space-x-2 mb-3">
                <input
                  type="text"
                  value={tempTag}
                  onChange={(e) => setTempTag(e.target.value)}
                  placeholder="Add tag"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <button
                  type="button"
                  onClick={addTag}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Add
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center px-3 py-1 bg-yellow-100 text-yellow-800 text-sm rounded-full"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="ml-2 text-yellow-600 hover:text-yellow-800"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Publishing Options */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Publishing Options</h3>
            <div className="flex items-center space-x-6">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isPublished"
                  name="isPublished"
                  checked={formData.isPublished}
                  onChange={handleChange}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="isPublished" className="ml-2 text-sm font-medium text-gray-700">
                  Publish product
                </label>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isFeatured"
                  name="isFeatured"
                  checked={formData.isFeatured}
                  onChange={handleChange}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="isFeatured" className="ml-2 text-sm font-medium text-gray-700">
                  <StarIcon className="w-4 h-4 inline mr-1" />
                  Feature this product
                </label>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isActive"
                  name="isActive"
                  checked={formData.isActive}
                  onChange={handleChange}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="isActive" className="ml-2 text-sm font-medium text-gray-700">
                  Active product
                </label>
              </div>
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex space-x-4 pt-6 border-t border-gray-200">
            <button
              type="submit"
              disabled={saving || uploadingImages}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? 'Saving Changes...' : 'Update Product'}
            </button>
            <Link
              href="/admin/products"
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
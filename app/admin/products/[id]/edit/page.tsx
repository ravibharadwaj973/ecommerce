// app/admin/products/[id]/edit/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
 
import { useApi } from "../../../../hooks/useApi";
import CategorySelect from "../../../components/CategorySelect";
import { ArrowLeft, Upload, X, Plus, Tag, Package, Image as ImageIcon } from 'lucide-react';
import { toast } from 'sonner';

type Product = {
  _id: string;
  name: string;
  description: string;
  category: string;
  brand: string;
  images: Array<{
    url: string;
    publicId: string;
    isPrimary: boolean;
    altText: string;
  }>;
  features: string[];
  tags: string[];
  isPublished: boolean;
};

export default function EditProductPage() {
  const { id } = useParams();
  const router = useRouter();
  
  const { 
    data: product, 
    loading: productLoading, 
    error: productError,
    fetchData: fetchProduct,
    patchData: updateProduct 
  } = useApi<Product>();

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    categoryId: "",
    brand: "",
    features: [] as string[],
    tags: [] as string[],
    isPublished: true,
  });

  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [existingImages, setExistingImages] = useState<any[]>([]);
  const [tempFeature, setTempFeature] = useState("");
  const [tempTag, setTempTag] = useState("");
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (id) {
      fetchProduct(`/api/newproducts/${id}`);
    }
  }, [id]);

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || "",
        description: product.description || "",
        categoryId: product.category || "",
        brand: product.brand || "",
        features: product.features || [],
        tags: product.tags || [],
        isPublished: product.isPublished ?? true,
      });
      setExistingImages(product.images || []);
    }
  }, [product]);

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

  const removeNewImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const removeExistingImage = (index: number) => {
    setExistingImages(prev => prev.filter((_, i) => i !== index));
  };

  const setPrimaryImage = (index: number) => {
    setExistingImages(prev =>
      prev.map((img, i) => ({
        ...img,
        isPrimary: i === index,
      }))
    );
  };

  const addFeature = () => {
    if (tempFeature && !formData.features.includes(tempFeature)) {
      setFormData(prev => ({
        ...prev,
        features: [...prev.features, tempFeature],
      }));
      setTempFeature("");
    }
  };

  const removeFeature = (index: number) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index),
    }));
  };

  const addTag = () => {
    if (tempTag && !formData.tags.includes(tempTag)) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tempTag],
      }));
      setTempTag("");
    }
  };

  const removeTag = (index: number) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploading(true);

    try {
      if (!formData.categoryId) {
        toast.error("Please select a category");
        setUploading(false);
        return;
      }

      const fd = new FormData();
      fd.append("name", formData.name);
      fd.append("description", formData.description);
      fd.append("categoryId", formData.categoryId);
      fd.append("brand", formData.brand);
      fd.append("features", JSON.stringify(formData.features));
      fd.append("tags", JSON.stringify(formData.tags));
      fd.append("isPublished", String(formData.isPublished));
      fd.append("existingImages", JSON.stringify(existingImages));

      images.forEach(img => fd.append("images", img));

      const result = await updateProduct(`/api/newproducts/${id}`, fd);
      if (result) {
        toast.success("Product updated successfully");
        router.push(`/admin/products/${id}`);
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to update product");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div title="Edit Product">
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
              <h1 className="text-2xl font-bold text-gray-900">Edit Product</h1>
              <p className="text-gray-600 mt-1">
                Update product details and information
              </p>
            </div>
          </div>
        </div>

        {productLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading product...</p>
          </div>
        ) : productError ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <p className="text-red-800">Error: {productError}</p>
            <button
              onClick={() => router.push('/admin/products')}
              className="mt-4 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
            >
              Back to Products
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column - Form */}
              <div className="lg:col-span-2 space-y-6">
                {/* Basic Information */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <h2 className="text-lg font-semibold text-gray-800 mb-4">
                    Basic Information
                  </h2>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Product Name *
                      </label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                        required
                        placeholder="Enter product name"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Description
                      </label>
                      <textarea
                        value={formData.description}
                        onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                        rows={4}
                        placeholder="Describe your product..."
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Brand
                      </label>
                      <input
                        type="text"
                        value={formData.brand}
                        onChange={(e) => setFormData(prev => ({ ...prev, brand: e.target.value }))}
                        placeholder="Enter brand name"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>

                {/* Category */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <Package className="w-5 h-5" />
                    Category *
                  </h2>
                  <CategorySelect
                    value={formData.categoryId}
                    onChange={(categoryId) => setFormData(prev => ({ ...prev, categoryId }))}
                    label="Select product category"
                    required
                  />
                </div>

                {/* Features */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <h2 className="text-lg font-semibold text-gray-800 mb-4">
                    Features
                  </h2>
                  
                  <div className="space-y-4">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={tempFeature}
                        onChange={(e) => setTempFeature(e.target.value)}
                        placeholder="Add a feature"
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addFeature())}
                      />
                      <button
                        type="button"
                        onClick={addFeature}
                        className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                    
                    {formData.features.length > 0 && (
                      <div className="space-y-2">
                        {formData.features.map((feature, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                          >
                            <span className="text-gray-700">{feature}</span>
                            <button
                              type="button"
                              onClick={() => removeFeature(index)}
                              className="text-gray-400 hover:text-red-600"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Tags */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <Tag className="w-5 h-5" />
                    Tags
                  </h2>
                  
                  <div className="space-y-4">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={tempTag}
                        onChange={(e) => setTempTag(e.target.value)}
                        placeholder="Add a tag"
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                      />
                      <button
                        type="button"
                        onClick={addTag}
                        className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                    
                    {formData.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {formData.tags.map((tag, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center gap-1 bg-blue-100 text-blue-700 px-3 py-1.5 rounded-full text-sm"
                          >
                            {tag}
                            <button
                              type="button"
                              onClick={() => removeTag(index)}
                              className="text-blue-900 hover:text-blue-950"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Right Column - Images & Settings */}
              <div className="space-y-6">
                {/* Images */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <ImageIcon className="w-5 h-5" />
                    Product Images
                  </h2>
                  
                  <div className="space-y-4">
                    {/* Existing Images */}
                    {existingImages.length > 0 && (
                      <div>
                        <h3 className="text-sm font-medium text-gray-700 mb-3">Current Images</h3>
                        <div className="grid grid-cols-2 gap-3 mb-4">
                          {existingImages.map((image, index) => (
                            <div key={index} className="relative group">
                              <img
                                src={image.url}
                                alt={image.altText}
                                className="w-full h-32 object-cover rounded-lg border border-gray-200"
                              />
                              {image.isPrimary && (
                                <span className="absolute top-1 left-1 px-2 py-0.5 bg-blue-600 text-white text-xs rounded">
                                  Primary
                                </span>
                              )}
                              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all rounded-lg flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                                <button
                                  type="button"
                                  onClick={() => setPrimaryImage(index)}
                                  className="p-1.5 bg-white text-blue-600 rounded-full hover:bg-blue-50"
                                  title="Set as primary"
                                >
                                  <Star className="w-4 h-4" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => removeExistingImage(index)}
                                  className="p-1.5 bg-white text-red-600 rounded-full hover:bg-red-50"
                                  title="Remove"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* New Images */}
                    {(imagePreviews.length > 0 || existingImages.length === 0) && (
                      <div>
                        <h3 className="text-sm font-medium text-gray-700 mb-3">
                          {existingImages.length === 0 ? 'Upload Images' : 'Add More Images'}
                        </h3>
                        <div className="grid grid-cols-2 gap-3 mb-4">
                          {imagePreviews.map((preview, index) => (
                            <div key={index} className="relative group">
                              <img
                                src={preview}
                                alt={`Preview ${index + 1}`}
                                className="w-full h-32 object-cover rounded-lg border border-gray-200"
                              />
                              <button
                                type="button"
                                onClick={() => removeNewImage(index)}
                                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          ))}
                          
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
                      </div>
                    )}

                    {/* Upload Button (if no images) */}
                    {imagePreviews.length === 0 && existingImages.length === 0 && (
                      <label className="block">
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-blue-400 transition-colors">
                          <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                          <p className="text-gray-600">Drag & drop images or click to browse</p>
                          <p className="text-sm text-gray-500 mt-2">Supports JPG, PNG, WebP (Max 5MB)</p>
                          <input
                            type="file"
                            multiple
                            accept="image/*"
                            onChange={handleImageUpload}
                            className="hidden"
                          />
                        </div>
                      </label>
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
                        id="isPublished"
                        checked={formData.isPublished}
                        onChange={(e) => setFormData(prev => ({ ...prev, isPublished: e.target.checked }))}
                        className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                      />
                      <div>
                        <label htmlFor="isPublished" className="text-sm font-medium text-gray-700">
                          Publish Product
                        </label>
                        <p className="text-xs text-gray-500 mt-1">
                          Make this product visible to customers
                        </p>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-gray-200">
                      <button
                        type="submit"
                        disabled={uploading}
                        className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {uploading ? 'Updating...' : 'Update Product'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

// Helper component for star icon
const Star = ({ className }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 20 20">
    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
  </svg>
);
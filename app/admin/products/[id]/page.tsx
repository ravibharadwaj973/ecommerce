// app/admin/products/[id]/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
 
import { useApi } from "../../../hooks/useApi";
import { Edit, Plus, Trash2, Package, Eye, Image as ImageIcon, Tag, Layers, DollarSign, Package2 } from 'lucide-react';
import { toast } from 'sonner';
import Image from 'next/image';

type Product = {
  _id: string;
  name: string;
  description: string;
  category?: {
    _id: string;
    name: string;
  };
  brand: string;
  images: Array<{
    url: string;
    isPrimary: boolean;
    altText: string;
  }>;
  features: string[];
  tags: string[];
  isPublished: boolean;
  createdAt: string;
};

type Variant = {
  _id: string;
  sku: string;
  price: number;
  stock: number;
  isActive: boolean;
  attributes: Array<{
    attribute: {
      _id: string;
      name: string;
    };
    value: {
      _id: string;
      value: string;
    };
  }>;
};

export default function ProductDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  
  const { 
    data: product, 
    loading: productLoading, 
    error: productError,
    fetchData: fetchProduct 
  } = useApi<Product>();
  
  const { 
    data: variants, 
    loading: variantsLoading, 
    error: variantsError,
    fetchData: fetchVariants,
    deleteData: deleteVariant 
  } = useApi<Variant[]>();

  const [selectedImage, setSelectedImage] = useState(0);

  useEffect(() => {
    if (id) {
      fetchProduct(`/api/newproducts/${id}`);
      fetchVariants(`/api/newproducts/variants?product=${id}`);
    }
  }, [id]);

  const handleDeleteVariant = async (variantId: string, sku: string) => {
    if (!confirm(`Delete variant "${sku}"?`)) return;

    const result = await deleteVariant(`/api/newproducts/variants/${variantId}`);
    if (result) {
      fetchVariants(`/api/newproducts/variants?product=${id}`);
      toast.success('Variant deleted successfully');
    }
  };

  const togglePublishStatus = async () => {
    if (!product) return;

    try {
      const formData = new FormData();
      formData.append('isPublished', String(!product.isPublished));
      formData.append('name', product.name);
      
      const res = await fetch(`/api/newproducts/${id}`, {
        method: 'PATCH',
        body: formData,
      });

      const data = await res.json();
      if (data.success) {
        fetchProduct(`/api/newproducts/${id}`);
        toast.success(`Product ${!product.isPublished ? 'published' : 'unpublished'} successfully`);
      }
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const getTotalStock = () => {
    if (!variants) return 0;
    return variants.reduce((total, variant) => total + (variant.stock || 0), 0);
  };

  const getPriceRange = () => {
    if (!variants || variants.length === 0) return 'No variants';
    
    const prices = variants.map(v => v.price);
    const min = Math.min(...prices);
    const max = Math.max(...prices);
    
    if (min === max) return `₹${min}`;
    return `₹${min} - ₹${max}`;
  };

  return (
    <div title="Product Details">
      {productLoading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading product details...</p>
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
      ) : product ? (
        <div className="space-y-6">
          {/* Header */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex justify-between items-start">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-2xl font-bold text-gray-900">{product.name}</h1>
                  <span className={`px-3 py-1 text-sm rounded-full ${
                    product.isPublished
                      ? 'bg-green-100 text-green-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {product.isPublished ? 'Published' : 'Draft'}
                  </span>
                </div>
                
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  {product.category && (
                    <div className="flex items-center gap-1">
                      <Package className="w-4 h-4" />
                      <span>{product.category.name}</span>
                    </div>
                  )}
                  {product.brand && (
                    <div className="flex items-center gap-1">
                      <Tag className="w-4 h-4" />
                      <span>{product.brand}</span>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <button
                  onClick={togglePublishStatus}
                  className={`px-4 py-2 rounded-lg text-sm font-medium ${
                    product.isPublished
                      ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                      : 'bg-green-100 text-green-700 hover:bg-green-200'
                  }`}
                >
                  {product.isPublished ? 'Unpublish' : 'Publish'}
                </button>
                
                <button
                  onClick={() => router.push(`/admin/products/${id}/edit`)}
                  className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Edit className="w-4 h-4" />
                  Edit Product
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Product Images & Info */}
            <div className="lg:col-span-2 space-y-6">
              {/* Product Images */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <ImageIcon className="w-5 h-5" />
                  Product Images
                </h2>
                
                {product.images && product.images.length > 0 ? (
                  <div className="space-y-4">
                    {/* Main Image */}
                    <div className="relative h-80 bg-gray-100 rounded-lg overflow-hidden">
                      <img
                        src={product.images[selectedImage].url}
                        alt={product.images[selectedImage].altText || product.name}
                        className="w-full h-full object-contain"
                      />
                      {product.images[selectedImage].isPrimary && (
                        <span className="absolute top-3 left-3 px-2 py-1 bg-blue-600 text-white text-xs rounded">
                          Primary
                        </span>
                      )}
                    </div>
                    
                    {/* Thumbnails */}
                    <div className="flex gap-3 overflow-x-auto pb-2">
                      {product.images.map((image, index) => (
                        <button
                          key={index}
                          onClick={() => setSelectedImage(index)}
                          className={`flex-shrink-0 w-20 h-20 rounded-lg border-2 overflow-hidden ${
                            selectedImage === index
                              ? 'border-blue-500'
                              : 'border-gray-200'
                          }`}
                        >
                          <img
                            src={image.url}
                            alt={image.altText}
                            className="w-full h-full object-cover"
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <ImageIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">No images uploaded</p>
                  </div>
                )}
              </div>

              {/* Description */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">
                  Description
                </h2>
                <p className="text-gray-600 whitespace-pre-wrap">
                  {product.description || 'No description provided.'}
                </p>
              </div>

              {/* Features & Tags */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Features */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <h2 className="text-lg font-semibold text-gray-800 mb-4">
                    Features
                  </h2>
                  {product.features && product.features.length > 0 ? (
                    <ul className="space-y-2">
                      {product.features.map((feature, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                          <span className="text-gray-600">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-gray-500">No features added</p>
                  )}
                </div>

                {/* Tags */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <h2 className="text-lg font-semibold text-gray-800 mb-4">
                    Tags
                  </h2>
                  {product.tags && product.tags.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {product.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center gap-1 bg-gray-100 text-gray-700 px-3 py-1.5 rounded-full text-sm"
                        >
                          <Tag className="w-3 h-3" />
                          {tag}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500">No tags added</p>
                  )}
                </div>
              </div>
            </div>

            {/* Right Column - Stats & Actions */}
            <div className="space-y-6">
              {/* Statistics */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <Package2 className="w-5 h-5" />
                  Product Statistics
                </h2>
                
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Total Variants</span>
                    <span className="font-semibold text-gray-900">
                      {variants?.length || 0}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Total Stock</span>
                    <span className="font-semibold text-gray-900">
                      {getTotalStock()}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Price Range</span>
                    <span className="font-semibold text-gray-900">
                      {getPriceRange()}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Created</span>
                    <span className="font-semibold text-gray-900">
                      {new Date(product.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">
                  Quick Actions
                </h2>
                
                <div className="space-y-3">
                  <button
                    onClick={() => router.push(`/admin/products/${id}/variants`)}
                    className="w-full inline-flex items-center justify-center gap-2 bg-green-600 text-white px-4 py-3 rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <Plus className="w-5 h-5" />
                    Add New Variant
                  </button>
                  
                  <button
                    onClick={() => router.push(`/admin/variants?product=${id}`)}
                    className="w-full inline-flex items-center justify-center gap-2 bg-blue-100 text-blue-700 px-4 py-3 rounded-lg hover:bg-blue-200 transition-colors"
                  >
                    <Eye className="w-5 h-5" />
                    View All Variants
                  </button>
                  
                  <button
                    onClick={() => router.push('/admin/products')}
                    className="w-full inline-flex items-center justify-center gap-2 bg-gray-100 text-gray-700 px-4 py-3 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Back to Products
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Variants Section */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                  <Layers className="w-5 h-5" />
                  Product Variants
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  Manage all variants of this product
                </p>
              </div>
              
              <button
                onClick={() => router.push(`/admin/products/${id}/variants`)}
                className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add Variant
              </button>
            </div>

            {variantsLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-3 text-gray-500">Loading variants...</p>
              </div>
            ) : variantsError ? (
              <div className="text-center py-8">
                <p className="text-red-600">Error: {variantsError}</p>
              </div>
            ) : variants && variants.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {variants.map((variant) => (
                  <div
                    key={variant._id}
                    className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors bg-white"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-medium text-gray-900">{variant.sku}</span>
                          <span className={`px-2 py-0.5 text-xs rounded-full ${
                            variant.isActive
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {variant.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-4 text-sm">
                          <div className="flex items-center gap-1">
                            <DollarSign className="w-4 h-4 text-gray-400" />
                            <span className="font-medium">₹{variant.price}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Package className="w-4 h-4 text-gray-400" />
                            <span>Stock: {variant.stock}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => router.push(`/admin/variants/${variant._id}/edit`)}
                          className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded"
                          title="Edit variant"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteVariant(variant._id, variant.sku)}
                          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"
                          title="Delete variant"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    
                    {/* Attributes */}
                    <div className="pt-3 border-t border-gray-100">
                      <div className="flex flex-wrap gap-2">
                        {variant.attributes.map((attr, idx) => (
                          <span
                            key={idx}
                            className="inline-flex items-center gap-1 bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs"
                          >
                            <span className="font-medium">{attr.attribute.name}:</span>
                            <span>{attr.value.value}</span>
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Layers className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-700 mb-2">
                  No Variants Yet
                </h3>
                <p className="text-gray-500 mb-6">
                  Add variants to start selling this product
                </p>
                <button
                  onClick={() => router.push(`/admin/products/${id}/variants`)}
                  className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Plus className="w-5 h-5" />
                  Create First Variant
                </button>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="text-center py-12">
          <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-700 mb-2">
            Product Not Found
          </h3>
          <p className="text-gray-500 mb-6">
            The product you're looking for doesn't exist or has been deleted.
          </p>
          <button
            onClick={() => router.push('/admin/products')}
            className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Back to Products
          </button>
        </div>
      )}
    </div>
  );
}
// app/products/[id]/page.jsx
"use client";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import {
  ShoppingCart,
  Heart,
  Star,
  Truck,
  Shield,
  ArrowLeft,
  Plus,
  Minus,
  Share2,
  Package,
} from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import ProductReviews from "../../components/ProductReviews";
import AddReview from "../../components/AddReview";
import FeaturedProducts from "../../components/FeaturedProducts";
import { useWishlist } from "../../context/wishlist";
import { useWishlistStore } from "../../store/wishlist.store";

export default function ProductDetailPage() {
  const params = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [size, setSize] = useState("");
  // const [isLiked, setIsLiked] = useState(false);
  const [activeTab, setActiveTab] = useState("description");
  const {  addToWishlist, removeFromWishlist } = useWishlist();
const {  isWishlisted } = useWishlistStore();
  useEffect(() => {
    fetchProduct();
  }, [params.id]);
  // console.log(params.id)

  const fetchProduct = async () => {
    try {
      const response = await fetch(`/api/products/${params.id}`);
      const data = await response.json();

      if (data.success) {
        setProduct(data.data.product);
      } else {
        toast.error("Product not found");
      }
    } catch (error) {
      toast.error("Error loading product");
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async () => {
    try {
      const response = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          itemId: product._id,
          quantity: quantity,
          size,
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success(`Added ${quantity} item(s) to cart!`);
      } else {
        toast.error(data.message || "Failed to add to cart");
      }
    } catch (error) {
      toast.error("Error adding product to cart");
    }
  };
  


  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: product.name,
          text: product.description,
          url: window.location.href,
        });
        toast.success("Product shared successfully!");
      } catch (error) {
        console.log("Error sharing:", error);
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      toast.success("Link copied to clipboard!");
    }
  };

  // Helper function to get image URL - handles both string URLs and image objects
  const getImageUrl = (image) => {
    if (typeof image === "string") return image;
    if (image.url) return image.url;
    if (image.secure_url) return image.secure_url;
    return "/placeholder-image.jpg";
  };

  // Helper function to get image alt text
  const getImageAlt = (image, index) => {
    if (typeof image === "object" && image.altText) return image.altText;
    return `${product.name} ${index + 1}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Product Not Found
          </h2>
          <Link
            href="/products"
            className="text-indigo-600 hover:text-indigo-500"
          >
            Back to Products
          </Link>
        </div>
      </div>
    );
  }
 
console.log(product._id)
const isLiked = isWishlisted(product.id);
// console.log(isLiked)

 const handleLike = () => {
  if (isLiked) {
    removeFromWishlist(product._id);
  } else {
    addToWishlist(product?._id);
  }
};

  const currentPrice =
    product.isOnSale && product.salePrice ? product.salePrice : product.price;
  const isSaleActive = product.isOnSale && product.salePrice;

  // Ensure images is always an array
  const productImages = product.images || [];
  const mainImage = productImages[selectedImage];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-8">
          <Link href="/" className="hover:text-indigo-600 transition-colors">
            Home
          </Link>
          <span>/</span>
          <Link
            href="/products"
            className="hover:text-indigo-600 transition-colors"
          >
            Products
          </Link>
          {product.category && (
            <>
              <span>/</span>
              <Link
                href={`/products/category/${product.category._id}`}
                className="hover:text-indigo-600 transition-colors"
              >
                {product.category.name}
              </Link>
            </>
          )}
          <span>/</span>
          <span className="text-gray-900 font-medium">{product.name}</span>
        </nav>

        {/* Back Button */}
        <div className="mb-6">
          <Link
            href="/products"
            className="inline-flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Products</span>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Product Images */}
          <div className="space-y-4">
            {/* Main Image */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="aspect-square bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm"
            >
              {mainImage ? (
                <img
                  src={getImageUrl(mainImage)}
                  alt={getImageAlt(mainImage, selectedImage)}
                  className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                />
              ) : (
                <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                  <span className="text-gray-500">No Image Available</span>
                </div>
              )}
            </motion.div>

            {/* Thumbnail Images */}
            {productImages.length > 1 && (
              <div className="grid grid-cols-4 gap-4">
                {productImages.map((image, index) => (
                  <motion.button
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    onClick={() => setSelectedImage(index)}
                    className={`aspect-square bg-white rounded-lg border-2 overflow-hidden transition-all duration-200 ${
                      selectedImage === index
                        ? "border-indigo-600 ring-2 ring-indigo-100"
                        : "border-gray-200 hover:border-indigo-400"
                    }`}
                  >
                    <img
                      src={getImageUrl(image)}
                      alt={getImageAlt(image, index)}
                      className="w-full h-full object-cover"
                    />
                  </motion.button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="space-y-6"
          >
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {product.name}
              </h1>

              {/* Brand */}
              {product.brand && (
                <p className="text-lg text-gray-600 mb-3">by {product.brand}</p>
              )}

              {/* Rating */}
              <div className="flex items-center space-x-2 mb-4">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-5 h-5 ${
                        i < Math.floor(product.rating?.average || 0)
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-gray-300"
                      }`}
                    />
                  ))}
                </div>
                <span className="text-gray-600">
                  ({product.rating?.count || 0} reviews)
                </span>
                <span className="text-gray-600">•</span>
                <span
                  className={`font-medium ${
                    product.stock > 0 ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {product.stock > 0
                    ? `${product.stock} in stock`
                    : "Out of Stock"}
                </span>
              </div>

              {/* Price */}
              <div className="flex items-center space-x-3 mb-4">
                <span className="text-3xl font-bold text-gray-900">
                  ${currentPrice}
                </span>
                {isSaleActive && (
                  <>
                    <span className="text-xl text-gray-500 line-through">
                      ${product.price}
                    </span>
                    <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-semibold">
                      Save{" "}
                      {Math.round(
                        ((product.price - currentPrice) / product.price) * 100
                      )}
                      %
                    </span>
                  </>
                )}
              </div>

              {/* SKU */}
              {product.sku && (
                <div className="text-sm text-gray-500 mb-4">
                  SKU: {product.sku}
                </div>
              )}
            </div>

            {/* Color and Size Selection */}
            {(product.colors?.length > 0 || product.sizes?.length > 0) && (
              <div className="space-y-4">
                {/* Colors */}
                {product.colors?.length > 0 && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Color</h4>
                    <div className="flex space-x-2">
                      {product.colors.map((color, index) => (
                        <button
                          key={index}
                          className="w-8 h-8 rounded-full border-2 border-gray-300 hover:border-indigo-600 transition-colors"
                          style={{ backgroundColor: color.toLowerCase() }}
                          title={color}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Sizes */}
                {product.sizes?.length > 0 && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Size</h4>
                    <div className="flex flex-wrap gap-2">
                      {product.sizes.map((sizeOption, index) => (
                        <button
                          onClick={() => setSize(sizeOption)}
                          key={index}
                          className={`px-4 py-2 border rounded-lg transition-colors ${
                            size === sizeOption
                              ? "border-indigo-600 bg-indigo-50 text-indigo-700"
                              : "border-gray-300 hover:border-indigo-600 hover:bg-indigo-50"
                          }`}
                        >
                          {sizeOption}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Quantity and Add to Cart */}
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <span className="font-medium text-gray-900">Quantity:</span>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-12 text-center font-medium text-lg">
                    {quantity}
                  </span>
                  <button
                    onClick={() =>
                      setQuantity(Math.min(product.stock, quantity + 1))
                    }
                    disabled={quantity >= product.stock}
                    className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="flex space-x-4">
                <button
                  onClick={handleAddToCart}
                  disabled={product.stock === 0}
                  className="flex-1 bg-indigo-600 text-white py-4 px-6 rounded-lg font-semibold hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
                >
                  <ShoppingCart className="w-5 h-5" />
                  <span>Add to Cart</span>
                </button>

                <div className="flex space-x-2">
                  <button
                    onClick={handleLike}
                    className="p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <Heart
                      className={`w-5 h-5 transition-colors ${
                        isLiked
                          ? "fill-red-500 text-red-500"
                          : "text-gray-400 hover:text-red-500"
                      }`}
                    />
                  </button>

                  <button
                    onClick={handleShare}
                    className="p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <Share2 className="w-5 h-5 text-gray-400 hover:text-indigo-600" />
                  </button>
                </div>
              </div>
            </div>

            {/* Product Details */}
            <div className="border-t border-gray-200 pt-6 space-y-4">
              <div className="flex items-center space-x-2 text-gray-600">
                <Truck className="w-5 h-5" />
                <span>Free shipping on orders over $50</span>
              </div>
              <div className="flex items-center space-x-2 text-gray-600">
                <Package className="w-5 h-5" />
                <span>Delivery in 2-5 business days</span>
              </div>
              <div className="flex items-center space-x-2 text-gray-600">
                <Shield className="w-5 h-5" />
                <span>30-day return policy</span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Product Tabs */}
        <div className="mt-16">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8">
              {[
                { id: "description", name: "Description" },
                { id: "features", name: "Features" },
                {
                  id: "reviews",
                  name: `Reviews (${product.rating?.count || 0})`,
                },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? "border-indigo-600 text-indigo-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  {tab.name}
                </button>
              ))}
            </nav>
          </div>

          <div className="py-8">
            {activeTab === "description" && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="prose prose-lg max-w-none"
              >
                <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                  {product.description}
                </p>
              </motion.div>
            )}

            {activeTab === "features" &&
              product.features &&
              product.features.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {product.features.map((feature, index) => (
                      <li
                        key={index}
                        className="flex items-center space-x-3 text-gray-700"
                      >
                        <div className="w-2 h-2 bg-indigo-600 rounded-full flex-shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </motion.div>
              )}

            {activeTab === "reviews" && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <ProductReviews productId={params.id} />

                {/* Add Review Button */}
                <div className="mt-8 text-center">
                  <AddReview
                    productId={params.id}
                    onReviewAdded={() => {
                      // Refresh product data to update review count
                      fetchProduct();
                    }}
                  />
                </div>
              </motion.div>
            )}
          </div>
        </div>

        {/* Related Products / Featured Products */}
        <div className="mt-16">
          <FeaturedProducts />
        </div>
      </div>
    </div>
  );
}

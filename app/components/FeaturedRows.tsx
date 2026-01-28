"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Loader2, ShoppingBag, Heart } from "lucide-react";
import { toast } from "sonner";

interface Product {
  _id: string;
  name: string;
  slug: string;
  brand: string;
  images: { url: string; isPrimary: boolean }[];
  isActive: boolean;
}

export default function FeaturedRow({ categoryId, title }: { categoryId: string; title: string }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [wishlistIds, setWishlistIds] = useState<string[]>([]); // Track liked product IDs
  const [loading, setLoading] = useState(true);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch Products and Wishlist in parallel
        const [prodRes, wishRes] = await Promise.all([
          fetch(`/api/newproducts/by-category/${categoryId}`),
          fetch("/api/wishlist")
        ]);

        const prodResult = await prodRes.json();
        const wishResult = await wishRes.json();

        if (prodResult.success) setProducts(prodResult.data);
        if (wishResult.success) {
          // Store only the IDs for quick lookup
          const ids = wishResult.data.items.map((item: any) => item.product?._id);
          setWishlistIds(ids);
        }
      } catch (err) {
        console.error("Fetch error:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [categoryId]);

  const toggleWishlist = async (e: React.MouseEvent, productId: string) => {
  e.preventDefault();
  e.stopPropagation();
  
  setTogglingId(productId);
  try {
    const res = await fetch("/api/wishlist", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId }),
    });
    
    const result = await res.json();
    
    if (result.success) {
      // 1. Show the toast based on whether it was added or removed
      // result.message comes from your backend ('Added to wishlist' or 'Removed from wishlist')
      toast.success(result.message || "Wishlist updated");

      // 2. Update local state immediately
      setWishlistIds(prev => 
        prev.includes(productId) 
          ? prev.filter(id => id !== productId) 
          : [...prev, productId]
      );
    } else {
      // Handle backend errors (like "Product already in wishlist" or "Unauthorized")
      toast.error(result.message || "Failed to update wishlist");
    }
  } catch (err) {
    console.error("Wishlist toggle failed", err);
    toast.error("Something went wrong");
  } finally {
    setTogglingId(null);
  }
};

  if (loading) return (
    <div className="flex items-center gap-4 px-4 py-10 overflow-hidden">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="w-48 h-64 bg-gray-100 animate-pulse rounded-2xl shrink-0" />
      ))}
    </div>
  );

  if (products.length === 0) return null;

  return (
    <div className="py-8">
      <div className="flex justify-between items-center px-4 mb-6">
        <h2 className="text-xl font-black uppercase tracking-tighter text-gray-900 italic">{title}</h2>
        <Link href={`/category/${categoryId}`} className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em] hover:underline">
          View All
        </Link>
      </div>

      <div className="flex overflow-x-auto gap-4 px-4 pb-4 no-scrollbar">
        {products.map((product) => {
          const displayImage = product.images.find(img => img.isPrimary)?.url || product.images[0]?.url;
          const isLiked = wishlistIds.includes(product._id);

          return (
            <Link 
              key={product._id} 
              href={`/products/${product._id}`}
              className="group w-48 md:w-56 shrink-0"
            >
              <div className="relative h-64 md:h-72 w-full overflow-hidden rounded-[2rem] bg-gray-50 border border-gray-100">
                {displayImage && (
                  <Image
                    src={displayImage}
                    alt={product.name}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                )}
                
                {/* Wishlist Heart Button */}
                <button 
                  onClick={(e) => toggleWishlist(e, product._id)}
                  disabled={togglingId === product._id}
                  className="absolute top-3 right-3 p-2.5 bg-white/80 backdrop-blur-md rounded-full shadow-sm hover:bg-white transition-all z-10"
                >
                  <Heart 
                    size={16} 
                    fill={isLiked ? "#ef4444" : "none"} 
                    className={`${isLiked ? "text-red-500" : "text-gray-400"} ${togglingId === product._id ? "animate-ping" : ""}`} 
                  />
                </button>

                <div className="absolute bottom-3 right-3 p-2.5 bg-black rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0 duration-300">
                  <ShoppingBag size={16} className="text-white" />
                </div>
              </div>

              <div className="mt-4 px-1">
                <p className="text-[9px] font-black text-blue-600 uppercase tracking-[0.2em]">
                  {product.brand}
                </p>
                <h3 className="text-sm font-bold text-gray-900 truncate uppercase tracking-tight mt-0.5">
                  {product.name}
                </h3>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
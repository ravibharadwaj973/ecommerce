"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Loader2, ShoppingBag, Heart } from "lucide-react";
import { toast } from "sonner";
import ProductCard from "./ProductCard";

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
        {products.map((product) => (
          <ProductCard
            key={product._id}
            product={product}
            isLiked={wishlistIds.includes(product._id)}
            isToggling={togglingId === product._id}
            onWishlistToggle={toggleWishlist}
          />
        ))}
      </div>
    </div>
  );
}
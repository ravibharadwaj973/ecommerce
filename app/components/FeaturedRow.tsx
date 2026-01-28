"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Loader2, ShoppingBag } from "lucide-react";

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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProducts() {
      try {
        const res = await fetch(`/api/products/by-category/${categoryId}`);
        const result = await res.json();
        if (result.success) {
          setProducts(result.data);
        }
      } catch (err) {
        console.error("Fetch error:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchProducts();
  }, [categoryId]);

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
        <h2 className="text-xl font-black uppercase tracking-tighter text-gray-900">{title}</h2>
        <Link href={`/category/${categoryId}`} className="text-xs font-bold text-blue-600 uppercase tracking-widest hover:underline">
          See All
        </Link>
      </div>

      {/* Horizontal Scroll Area */}
      <div className="flex overflow-x-auto gap-4 px-4 pb-4 no-scrollbar">
        {products.map((product) => {
          // Find the primary image or use the first one available
          const displayImage = product.images.find(img => img.isPrimary)?.url || product.images[0]?.url;

          return (
            <Link 
              key={product._id} 
              href={`/product/${product.slug}`}
              className="group w-48 md:w-56 shrink-0"
            >
              {/* Product Image Container */}
              <div className="relative h-64 md:h-72 w-full overflow-hidden rounded-2xl bg-gray-100">
                {displayImage && (
                  <Image
                    src={displayImage}
                    alt={product.name}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                )}
                <button className="absolute bottom-3 right-3 p-2 bg-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity translate-y-2 group-hover:translate-y-0 duration-300">
                  <ShoppingBag size={18} className="text-black" />
                </button>
              </div>

              {/* Product Info */}
              <div className="mt-3">
                <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">
                  {product.brand}
                </p>
                <h3 className="text-sm font-bold text-gray-900 truncate uppercase tracking-tight">
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
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import ProductCard from "./ProductCard";
import { useWishlist } from "../context/wishlist"; // Import Global Context

interface Product {
  _id: string;
  name: string;
  slug: string;
  brand: string;
  images: { url: string; isPrimary: boolean }[];
  isActive: boolean;
}

export default function FeaturedRow({
  categoryId,
  title,
}: {
  categoryId: string;
  title: string;
}) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // Use Global Wishlist Logic
  const { wishlistIds, isToggling, toggleWishlist } = useWishlist();

  useEffect(() => {
    async function fetchProducts() {
      try {
        const res = await fetch(`/api/newproducts/by-category/${categoryId}`);
        const result = await res.json();
        if (result.success) setProducts(result.data);
      } catch (err) {
        console.error("Fetch error:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchProducts();
  }, [categoryId]);

  if (loading)
    return (
      <div className="flex items-center gap-4 px-4 py-10 overflow-hidden">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="w-48 h-72 bg-gray-50 animate-pulse rounded-[2rem] shrink-0 border border-gray-100"
          />
        ))}
      </div>
    );

  if (products.length === 0) return null;

  return (
    <div className="py-8">
      <div className="flex justify-between items-center px-4 mb-6">
        <h2 className="text-xl font-black uppercase tracking-tighter text-gray-900 italic">
          {title}
        </h2>
        <Link
          href={`/cat/${categoryId}`}
          className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em] hover:underline"
        >
          View All
        </Link>
      </div>

      <div className="flex overflow-x-auto gap-4 px-4 pb-4 no-scrollbar">
        {products.map((product) => (
          <ProductCard key={product._id} product={product} />
        ))}
      </div>
    </div>
  );
}

"use client";

import { useWishlist } from "../context/wishlist";
import { Trash2, ArrowRight, Loader2, Heart } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function WishlistPage() {
  const { wishlistItems, removeItem, isLoadingWishlist } = useWishlist();

  if (isLoadingWishlist) return (
    <div className="h-screen flex items-center justify-center">
      <Loader2 className="animate-spin text-blue-600" />
    </div>
  );

  if (wishlistItems.length === 0) return (
    <div className="h-screen flex flex-col items-center justify-center text-center px-4">
      <Heart size={60} className="text-gray-100 mb-4" strokeWidth={1} />
      <h2 className="text-2xl font-black uppercase italic tracking-tighter">Empty Archive</h2>
      <Link href="/" className="mt-8 bg-black text-white px-10 py-4 rounded-full font-black text-[10px] uppercase tracking-[0.2em]">
        Discover Pieces
      </Link>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <h1 className="text-6xl font-black uppercase tracking-tighter mb-16 italic">
        Favorites<span className="text-blue-600">.</span>
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
        {wishlistItems.map((item) => (
          <div key={item._id} className="group relative">
            <div className="relative aspect-[3/4] rounded-[3rem] overflow-hidden bg-gray-50 border border-gray-100">
              <Image 
                src={item.product?.images?.[0]?.url || "/placeholder.png"} 
                fill 
                className="object-cover group-hover:scale-110 transition-transform duration-1000" 
                alt={item.product?.name || "Product"} 
              />
              <button 
                onClick={() => removeItem(item.product?._id)}
                className="absolute top-6 right-6 p-4 bg-white/90 backdrop-blur-md rounded-full text-gray-400 hover:text-red-500 transition-all shadow-xl z-20"
              >
                <Trash2 size={18} />
              </button>
            </div>

            <div className="mt-6 flex justify-between items-end px-2">
              <div>
                <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-1">{item.product?.brand}</p>
                <h3 className="font-bold text-lg uppercase tracking-tight">{item.product?.name}</h3>
              </div>
              <Link href={`/product/${item.product?._id}`} className="p-4 bg-black text-white rounded-2xl hover:bg-blue-600 transition-colors">
                <ArrowRight size={20} />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
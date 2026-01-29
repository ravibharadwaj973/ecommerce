"use client";

import Image from "next/image";
import Link from "next/link";
import { ShoppingBag, Heart } from "lucide-react";
import { useWishlist } from "../context/wishlist"; // Import Context here

export default function ProductCard({ product }: { product: any }) {
  // Use global wishlist logic inside the card itself
  const { wishlistIds, isToggling, toggleWishlist } = useWishlist();

  const isLiked = wishlistIds.includes(product._id);
  const isTogglingThis = isToggling === product._id;

  const displayImage = product.images?.find((img: any) => img.isPrimary)?.url || product.images?.[0]?.url;

  return (
    <div className="group w-full">
      <div className="relative aspect-[3/4] w-full overflow-hidden rounded-[2rem] bg-gray-50 border border-gray-100 shadow-sm">
        <Link href={`/products/${product._id}`}>
          {displayImage && (
            <Image
              src={displayImage}
              alt={product.name}
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-110"
            />
          )}
        </Link>
        
        {/* Wishlist Button - Handles its own logic now */}
        <button 
          onClick={(e) => toggleWishlist(e, product._id)}
          disabled={isTogglingThis}
          className="absolute top-3 right-3 p-2.5 bg-white/80 backdrop-blur-md rounded-full shadow-sm hover:bg-white transition-all z-10"
        >
          <Heart 
            size={16} 
            fill={isLiked ? "#ef4444" : "none"} 
            className={`${isLiked ? "text-red-500" : "text-gray-400"} ${isTogglingThis ? "animate-pulse" : "transition-transform active:scale-125"}`} 
          />
        </button>

        <div className="absolute bottom-4 right-4 p-3 bg-black rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0 duration-300">
          <ShoppingBag size={18} className="text-white" />
        </div>
      </div>

      <div className="mt-4 px-1">
        <div className="flex justify-between items-start">
           <div className="flex-1 min-w-0">
              <p className="text-[9px] font-black text-blue-600 uppercase tracking-[0.2em] mb-1">
                {product.brand || "ESSENTIALS"}
              </p>
              <h3 className="text-sm font-bold text-gray-900 truncate uppercase tracking-tight">
                {product.name}
              </h3>
           </div>
           <p className="text-sm font-black text-gray-900 italic ml-2">
             ₹{product.price?.toLocaleString()}
           </p>
        </div>
      </div>
    </div>
  );
}
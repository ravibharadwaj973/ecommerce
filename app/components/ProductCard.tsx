"use client";

import Image from "next/image";
import Link from "next/link";
import { ShoppingBag, Heart } from "lucide-react";

interface ProductCardProps {
  product: {
    _id: string;
    name: string;
    brand: string;
    images: { url: string; isPrimary: boolean }[];
  };
  isLiked: boolean;
  isToggling: boolean;
  onWishlistToggle: (e: React.MouseEvent, id: string) => void;
}

export default function ProductCard({ 
  product, 
  isLiked, 
  isToggling, 
  onWishlistToggle 
}: ProductCardProps) {
  const displayImage = product.images.find(img => img.isPrimary)?.url || product.images[0]?.url;

  return (
    <Link 
      href={`/products/${product._id}`}
      className="group w-48 md:w-56 shrink-0"
    >
      <div className="relative h-64 md:h-72 w-full overflow-hidden rounded-[2rem] bg-gray-50 border border-gray-100 shadow-sm transition-shadow hover:shadow-md">
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
          onClick={(e) => onWishlistToggle(e, product._id)}
          disabled={isToggling}
          className="absolute top-3 right-3 p-2.5 bg-white/80 backdrop-blur-md rounded-full shadow-sm hover:bg-white transition-all z-10"
        >
          <Heart 
            size={16} 
            fill={isLiked ? "#ef4444" : "none"} 
            className={`${isLiked ? "text-red-500" : "text-gray-400"} ${isToggling ? "animate-ping" : "transition-transform active:scale-125"}`} 
          />
        </button>

        {/* Shopping Bag Icon */}
        <div className="absolute bottom-3 right-3 p-2.5 bg-black rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0 duration-300">
          <ShoppingBag size={16} className="text-white" />
        </div>
      </div>

      {/* Info Section */}
      <div className="mt-4 px-1 text-center md:text-left">
        <p className="text-[9px] font-black text-blue-600 uppercase tracking-[0.2em] mb-1">
          {product.brand}
        </p>
        <h3 className="text-sm font-bold text-gray-900 truncate uppercase tracking-tight">
          {product.name}
        </h3>
      </div>
    </Link>
  );
}
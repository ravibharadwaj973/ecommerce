"use client";

import { useCart } from "../context/CartContext";
import { ShoppingBag, ArrowRight } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function FloatingCart() {
  const { cart, loading } = useCart();

  // Only show if not loading, cart exists, and has items
  if (loading || !cart || cart.items.length === 0) return null;

  // Get the last added item to show in the box (optional)
  const lastItem = cart.items[cart.items.length - 1];

  return (
    <div className="fixed bottom-30 left-6 z-50 animate-in slide-in-from-right-10 fade-in duration-500">
      <div className="bg-white border  border-gray-100 shadow-[0_20px_50px_rgba(0,0,0,0.1)] rounded-[2rem] p-3 flex items-center gap-4 min-w-[280px] group">
        
        {/* Product Preview Image */}
        <div className="relative h-16 w-10 bg-gray-50 rounded-2xl overflow-hidden border border-gray-50 shrink-0">
          <Image 
            src={lastItem?.variant?.product?.images?.[0]?.url} 
            fill 
            alt="last added" 
            className="object-cover"
          />
        </div>

        {/* Text Details */}
        <div className="flex-1 pr-2">
          <p className="text-[10px] font-black uppercase text-blue-600 tracking-widest leading-none mb-1">
            In Your Bag
          </p>
          <h4 className="text-[12px] font-bold text-gray-900 line-clamp-1 uppercase">
            {cart.totalQuantity} {cart.totalQuantity === 1 ? 'Item' : 'Items'} Selected
          </h4>
          <p className="text-[13px] font-black text-black">
            ${cart.totalPrice.toLocaleString()}
          </p>
        </div>

        {/* View Cart Button */}
        <Link 
          href="/cart" 
          className="bg-black text-white h-14 w-14 rounded-[1.4rem] flex items-center justify-center hover:bg-blue-600 transition-all group-hover:scale-105 active:scale-95"
        >
          <div className="relative">
            <ShoppingBag size={20} />
            <span className="absolute -top-1 -right-1 bg-blue-500 text-[8px] h-4 w-4 rounded-full flex items-center justify-center border-2 border-white">
              {cart.totalQuantity}
            </span>
          </div>
        </Link>
      </div>

      {/* Checkout Shortcut (Optional Tooltip) */}
      <Link href="/checkout" className="mt-2 flex items-center justify-end gap-2 text-gray-400 hover:text-black transition-colors">
        <span className="text-[9px] font-black uppercase tracking-widest">Quick Checkout</span>
        <ArrowRight size={12} />
      </Link>
    </div>
  );
}
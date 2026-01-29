"use client";

import { useCart } from "../context/CartContext"; // Import the hook
import { Trash2, Minus, Plus, Loader2, ShoppingBag } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import CouponSection from "../components/copen";
 // Let's add that coupon box!

export default function CartPage() {
  const { cart, loading, updateQuantity, removeItem } = useCart();

  if (loading) return (
    <div className="h-screen flex items-center justify-center">
      <Loader2 className="animate-spin text-blue-600" size={40} />
    </div>
  );

  if (!cart || cart.items.length === 0) return (
    <div className="h-screen flex flex-col items-center justify-center space-y-4">
      <ShoppingBag size={64} className="text-gray-100" />
      <h2 className="text-xl font-black uppercase italic">Your bag is empty</h2>
      <Link href="/" className="bg-black text-white px-8 py-3 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-blue-600 transition-all">
        Explore Collection
      </Link>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-10 lg:py-20">
      <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter mb-10 italic">
        Cart<span className="text-blue-600">.</span> 
        <span className="text-sm font-bold text-gray-400 ml-4 tracking-widest not-italic">({cart.totalQuantity} ITEMS)</span>
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Items List */}
        <div className="lg:col-span-7 space-y-4">
          {cart.items.map((item: any) => (
            <div key={item.variant?._id} className="flex gap-6 p-4 bg-white border border-gray-100 rounded-[2.5rem] hover:border-blue-100 transition-colors">
              <div className="relative h-40 w-32 bg-gray-50 rounded-[1.8rem] overflow-hidden shrink-0 border border-gray-100">
                <Image src={item.variant?.product?.images?.[0]?.url} fill className="object-cover" alt="product" sizes="150px" />
              </div>

              <div className="flex flex-col justify-between flex-1 py-2">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-black text-lg uppercase tracking-tight text-gray-900">{item.variant?.product?.name}</h4>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Size: {item.variant?.size} | {item.variant?.color}</p>
                  </div>
                  <button onClick={() => removeItem(item.variant?._id)} className="p-2 text-gray-300 hover:text-red-500 transition-all">
                    <Trash2 size={18} />
                  </button>
                </div>

                <div className="flex text-black justify-between items-end">
                  <div className="flex items-center bg-gray-50 rounded-2xl p-1 border border-gray-100">
                    <button onClick={() => updateQuantity(item.variant?._id, item.quantity - 1)} disabled={item.quantity <= 1} className="p-2 hover:bg-white rounded-xl transition-all disabled:opacity-20"><Minus size={14} /></button>
                    <span className="w-8 text-center font-black text-sm">{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.variant?._id, item.quantity + 1)} className="p-2 hover:bg-white rounded-xl transition-all"><Plus size={14} /></button>
                  </div>
                  <p className="font-black text-xl text-black tracking-tighter">₹{item.subtotal.toLocaleString()}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Sidebar Summary */}
        <div className="lg:col-span-5">
          <div className="space-y-6 sticky top-32">
            {/* Coupon Section */}
            <div className="bg-white border border-gray-100 p-8 rounded-[2.5rem]">
               <CouponSection /> 
            </div>

            {/* Price Details */}
            <div className="bg-black text-white p-10 rounded-[3rem] shadow-2xl">
              <h3 className="font-black uppercase tracking-[0.2em] text-[10px] mb-8 text-gray-500">Order Summary</h3>
              
              <div className="space-y-4 border-b border-white/10 pb-8 mb-8">
                <div className="flex justify-between text-xs font-bold uppercase tracking-widest">
                  <span className="text-gray-500">Subtotal</span>
                  <span>₹{cart.totalPrice.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-xs font-bold uppercase tracking-widest">
                  <span className="text-gray-500">Shipping</span>
                  <span className="text-green-400">Calculated at checkout</span>
                </div>
              </div>

              <div className="flex justify-between font-black text-4xl uppercase tracking-tighter mb-10">
                <span>Total</span>
                <span className="text-blue-500">₹{cart.totalPrice.toLocaleString()}</span>
              </div>

              <Link href="/checkout" className="block w-full">
                <button className="w-full bg-blue-600 hover:bg-white hover:text-black text-white py-6 rounded-[1.5rem] font-black uppercase text-[11px] tracking-[0.3em] transition-all shadow-xl shadow-blue-600/20">
                  Secure Checkout
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
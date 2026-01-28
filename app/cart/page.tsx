"use client";
import { useEffect, useState } from "react";
import { Trash2, Minus, Plus, Loader2, ShoppingBag } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function CartPage() {
  const [cart, setCart] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchCart = async () => {
    try {
      const res = await fetch("/api/cart");
      const result = await res.json();
      if (result.success) setCart(result.data);
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (variantId: string, newQty: number) => {
    if (newQty < 1) return;
    try {
      const res = await fetch("/api/cart/update", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ variantId, quantity: newQty }),
      });
      const result = await res.json();
      if (result.success) setCart(result.data);
      else alert(result.message);
    } catch (err) {
      console.error("Update failed", err);
    }
  };

  const removeItem = async (variantId: string) => {
    try {
      const res = await fetch("/api/cart/remove", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ variantId }),
      });
      const result = await res.json();
      if (result.success) setCart(result.data);
    } catch (err) {
      console.error("Remove failed", err);
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  if (loading)
    return (
      <div className="h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-blue-600" size={40} />
      </div>
    );

  if (!cart || cart.items.length === 0)
    return (
      <div className="h-screen flex flex-col items-center justify-center space-y-4">
        <ShoppingBag size={64} className="text-gray-200" />
        <h2 className="text-xl font-black uppercase">Your bag is empty</h2>
        <Link
          href="/"
          className="text-blue-600 font-bold uppercase text-xs underline"
        >
          Start Shopping
        </Link>
      </div>
    );

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <h1 className="text-4xl font-black uppercase tracking-tighter mb-10">
        Your Bag <span className="text-blue-600">({cart.totalQuantity})</span>
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Items List */}
        <div className="lg:col-span-8 space-y-6">
          {cart.items.map((item: any, index: number) => {
            // Generate a safe key: use item._id if available,
            // otherwise variant id, otherwise index.
            const itemKey =
              item._id || item.variant?._id || `cart-item-${index}`;

            return (
              <div
                key={itemKey}
                className="flex gap-6 p-5 bg-white border border-gray-100 rounded-[2rem] shadow-sm"
              >
                {/* Product Image */}
                <div className="relative h-32 w-24 bg-gray-50 rounded-2xl overflow-hidden shrink-0 border border-gray-50">
                  <Image
                    src={item.variant?.product?.images?.[0]?.url }
                    fill
                    className="object-cover"
                    alt="product"
                    sizes="100px"
                  />
                </div>

                {/* Product Details */}
                <div className="flex flex-col justify-between flex-1 py-1">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-black text-lg uppercase tracking-tight text-gray-900 leading-tight">
                        {item.variant?.product?.name || "Product Name"}
                      </h4>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">
                        Brand: {item.variant?.product?.brand || "Premium"}
                      </p>
                    </div>
                    <button
                      onClick={() => removeItem(item.variant?._id)}
                      className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-full transition-all"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>

                  <div className="flex justify-between items-end">
                    {/* Custom Styled Quantity Controls */}
                    <div className="flex items-center bg-gray-50 rounded-xl p-1 border border-gray-100">
                      <button
                        onClick={() =>
                          updateQuantity(item.variant?._id, item.quantity - 1)
                        }
                        disabled={item.quantity <= 1}
                        className="p-2 hover:bg-white rounded-lg transition-all disabled:opacity-20"
                      >
                        <Minus size={16} />
                      </button>

                      <span className="w-10 text-center font-black text-sm">
                        {item.quantity}
                      </span>

                      <button
                        onClick={() =>
                          updateQuantity(item.variant?._id, item.quantity + 1)
                        }
                        className="p-2 hover:bg-white rounded-lg transition-all"
                      >
                        <Plus size={16} />
                      </button>
                    </div>

                    <div className="text-right">
                      <p className="text-[10px] font-bold text-gray-400 uppercase">
                        Subtotal
                      </p>
                      <p className="font-black text-xl text-blue-600 tracking-tighter">
                        ${item.subtotal}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-4">
          <div className="bg-black text-white p-8 rounded-[2.5rem] sticky top-8 shadow-2xl">
            <h3 className="font-black uppercase tracking-widest text-xs mb-8 text-gray-400">
              Order Summary
            </h3>

            <div className="space-y-4 border-b border-white/10 pb-8 mb-8">
              <div className="flex justify-between text-sm font-bold uppercase tracking-tight">
                <span className="text-gray-400">Total Items</span>
                <span>{cart.totalQuantity}</span>
              </div>
              <div className="flex justify-between text-sm font-bold uppercase tracking-tight">
                <span className="text-gray-400">Shipping</span>
                <span className="text-green-400">Free</span>
              </div>
            </div>

            <div className="flex justify-between font-black text-3xl uppercase tracking-tighter mb-10">
              <span>Total</span>
              <span className="text-blue-500">${cart.totalPrice}</span>
            </div>

            <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-5 rounded-2xl font-black uppercase text-xs tracking-[0.2em] transition-all active:scale-95 shadow-xl shadow-blue-600/20">
              Proceed to Checkout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

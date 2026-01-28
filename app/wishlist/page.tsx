"use client";
import { useEffect, useState } from "react";
import { Trash2, ShoppingBag, ArrowRight, Loader2, Heart } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { toast } from "sonner";

export default function WishlistPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchWishlist = async () => {
    try {
      const res = await fetch("/api/wishlist");
      const result = await res.json();
      if (result.success) setItems(result.data.items);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const removeFromWishlist = async (productId: string) => {
    try {
      const res = await fetch("/api/wishlist/clear", {
        method: "DELETE",
        body: JSON.stringify({ productId }),
      });
      const result = await res.json();
      if (result.success){
        toast.success(result.message)
        setItems(result.data.items)
      } ;
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => { fetchWishlist(); }, []);

  if (loading) return <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin text-blue-600" /></div>;

  if (items.length === 0) return (
    <div className="h-screen flex flex-col items-center justify-center text-center px-4">
      <Heart size={60} className="text-gray-200 mb-4" />
      <h2 className="text-2xl font-black uppercase italic">Your wishlist is empty</h2>
      <p className="text-gray-500 text-xs mt-2 mb-8 tracking-widest uppercase">Save items you love here</p>
      <Link href="/" className="bg-black text-white px-8 py-4 rounded-full font-black text-xs uppercase tracking-widest">Shop Now</Link>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <h1 className="text-5xl font-black uppercase tracking-tighter mb-12 italic">
        Favorites <span className="text-red-500">.</span>
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {items.map((item) => (
          <div key={item._id} className="group bg-white border border-gray-100 rounded-[2.5rem] overflow-hidden hover:shadow-2xl transition-all duration-500">
            {/* Image Section */}
            <div className="relative h-[350px] w-full bg-gray-50">
              <Image 
                src={item.product?.images?.[0]?.url || "/placeholder.png"} 
                fill 
                className="object-cover group-hover:scale-105 transition-transform duration-700" 
                alt="product" 
              />
              <button 
                onClick={() => removeFromWishlist(item.product?._id)}
                className="absolute top-4 right-4 p-3 bg-white/80 backdrop-blur-md rounded-full text-gray-400 hover:text-red-500 transition-colors shadow-lg"
              >
                <Trash2 size={18} />
              </button>
            </div>

            {/* Content Section */}
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-black text-lg uppercase leading-tight tracking-tight">
                    {item.product?.name}
                  </h3>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mt-1">
                    {item.product?.brand}
                  </p>
                </div>
              </div>

              <div className="flex gap-2">
                <Link 
                  href={`/product/${item.product?._id}`}
                  className="flex-1 bg-black text-white py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest text-center flex items-center justify-center gap-2 hover:bg-gray-800 transition-all"
                >
                  View Product <ArrowRight size={14} />
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
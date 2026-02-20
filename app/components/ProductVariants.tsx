"use client";

import { useState, useEffect } from "react";
import { Loader2, ShieldCheck, Truck, Heart, Share2, Plus } from "lucide-react";
import Image from "next/image";
import { useWishlist } from "../context/wishlist"; // Corrected casing

interface Variant {
  _id: string;
  price: number;
  stock: number;
  sku: string;
  attributes: {
    attribute: { name: string; slug: string };
    value: { value: string; slug: string };
  }[];
}

interface ProductBasicInfo {
  _id: string; // Added this
  name: string;
  brand: string;
  description: string;
  images: { url: string; isPrimary: boolean }[];
}

export default function ProductVariants({ productId }: { productId: string }) {
  const [variants, setVariants] = useState<Variant[]>([]);
  const [productInfo, setProductInfo] = useState<ProductBasicInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [selectedColor, setSelectedColor] = useState<string>("");
  const [mainImage, setMainImage] = useState<string>("");
  const [isAdding, setIsAdding] = useState(false);

  // Corrected Wishlist Context Usage
  const { wishlistIds, isToggling, toggleWishlist } = useWishlist();
  
  // These must be calculated after productInfo is loaded
  const isLiked = productInfo ? wishlistIds.includes(productInfo._id) : false;
  const isTogglingThis = productInfo ? isToggling === productInfo._id : false;

  useEffect(() => {
    async function initProduct() {
      try {
        
        const res = await fetch(`/api/newproducts/variants?product=${productId}`);
        const result = await res.json();

        if (result.success) {
          setVariants(result.data);
          setProductInfo(result.product);

          const primary = result.product.images.find((img: any) => img.isPrimary)?.url;
          setMainImage(primary || result.product.images[0]?.url);

          if (result.data.length > 0) {
            const firstVariant = result.data[0];
            const colorAttr = firstVariant.attributes.find((a: any) => a.attribute.slug === "color");
            const sizeAttr = firstVariant.attributes.find((a: any) => a.attribute.slug === "size");
            if (colorAttr) setSelectedColor(colorAttr.value.value);
            if (sizeAttr) setSelectedSize(sizeAttr.value.value);
          }
        }
      } catch (err) {
        console.error("Initialization failed", err);
      } finally {
        setLoading(false);
      }
    }
    initProduct();
  }, [productId]);

  const handleAddToCart = async () => {
    if (!activeVariant) return;
    setIsAdding(true);
    try {
      const response = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ variantId: activeVariant._id, quantity: 1 }),
      });
      const result = await response.json();
      if (result.success) {
        alert("Added to cart successfully!");
      } else {
        alert(result.message || "Failed to add to cart");
      }
    } catch (error) {
      console.error("Cart Error:", error);
    } finally {
      setIsAdding(false);
    }
  };

  // Logic to find valid options and the active variant
  const colors = Array.from(new Set(variants.flatMap((v) => v.attributes.filter((a) => a.attribute.slug === "color").map((a) => a.value.value))));
  const sizes = Array.from(new Set(variants.flatMap((v) => v.attributes.filter((a) => a.attribute.slug === "size").map((a) => a.value.value))));

  const activeVariant = variants.find(
    (v) => 
      v.attributes.some((a) => a.value.value === selectedColor) && 
      v.attributes.some((a) => a.value.value === selectedSize)
  );

  if (loading) return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <Loader2 className="animate-spin text-blue-600" size={40} />
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* LEFT SIDE: IMAGES */}
        <div className="lg:col-span-7 space-y-4">
          <div className="relative aspect-[3/4] w-full rounded-[2.5rem] overflow-hidden bg-gray-50 border border-gray-100 shadow-sm">
            {mainImage && (
              <Image src={mainImage} alt={productInfo?.name || "Product"} fill className="object-cover" priority />
            )}
            <button 
              onClick={(e) => productInfo && toggleWishlist(e, productInfo._id)}
              disabled={isTogglingThis}
              className="absolute top-6 right-6 p-4 bg-white/90 backdrop-blur-md rounded-full hover:scale-110 transition-all shadow-xl z-10 disabled:opacity-50"
            >
              <Heart 
                size={22} 
                fill={isLiked ? "#ef4444" : "none"} 
                className={`${isLiked ? "text-red-500" : "text-gray-900"} ${isTogglingThis ? "animate-pulse" : ""}`} 
              />
            </button>
          </div>

          <div className="flex gap-4 overflow-x-auto pb-2 no-scrollbar">
            {productInfo?.images.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setMainImage(img.url)}
                className={`relative h-24 w-20 shrink-0 rounded-2xl overflow-hidden border-2 transition-all ${
                  mainImage === img.url ? "border-blue-600 scale-95 shadow-lg" : "border-transparent opacity-60"
                }`}
              >
                <Image src={img.url} alt="thumbnail" fill className="object-cover" />
              </button>
            ))}
          </div>
        </div>

        {/* RIGHT SIDE: INFO */}
        <div className="lg:col-span-5 flex flex-col pt-4">
          <header className="mb-8">
            <div className="flex justify-between items-center mb-3">
              <span className="text-blue-600 text-[11px] font-black uppercase tracking-[0.4em]">{productInfo?.brand}</span>
              <Share2 size={18} className="text-gray-400 cursor-pointer hover:text-black transition-colors" />
            </div>
            <h1 className="text-5xl font-black uppercase tracking-tighter text-gray-900 leading-none mb-6 italic">{productInfo?.name}</h1>
            <div className="flex items-center gap-4">
              <span className="text-4xl font-black text-gray-900 tracking-tighter">
                ${(activeVariant?.price || variants[0]?.price)?.toLocaleString()}
              </span>
              {activeVariant?.stock && activeVariant.stock > 0 ? (
                 <span className="px-3 py-1 bg-green-50 text-green-600 text-[10px] font-bold uppercase rounded-full tracking-widest">In Stock</span>
              ) : (
                 <span className="px-3 py-1 bg-red-50 text-red-600 text-[10px] font-bold uppercase rounded-full tracking-widest">Sold Out</span>
              )}
            </div>
          </header>

          {/* COLOR SELECTOR */}
          {colors.length > 0 && (
            <div className="mb-8">
              <span className="text-[10px] font-black uppercase text-gray-400 block mb-4 tracking-widest">Color: {selectedColor}</span>
              <div className="flex flex-wrap gap-3">
                {colors.map((c) => (
                  <button
                    key={c}
                    onClick={() => setSelectedColor(c)}
                    className={`px-6 py-3 text-xs font-black uppercase rounded-full border-2 transition-all ${
                      selectedColor === c ? "border-blue-600 bg-blue-600 text-white shadow-lg" : "border-gray-100 bg-white text-gray-600 hover:border-gray-300"
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* SIZE SELECTOR */}
          {sizes.length > 0 && (
            <div className="mb-10">
              <span className="text-[10px] font-black uppercase text-gray-400 block mb-4 tracking-widest">Size</span>
              <div className="flex flex-wrap gap-3">
                {sizes.map((s) => (
                  <button
                    key={s}
                    onClick={() => setSelectedSize(s)}
                    className={`w-14 h-14 flex items-center justify-center text-xs font-black uppercase rounded-2xl border-2 transition-all ${
                      selectedSize === s ? "border-black bg-black text-white shadow-xl" : "border-gray-100 bg-white text-gray-600 hover:border-gray-300"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* BUTTONS */}
          <div className="space-y-4">
            <button
              onClick={handleAddToCart}
              disabled={!activeVariant || activeVariant.stock === 0 || isAdding}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-100 disabled:text-gray-400 text-white py-6 rounded-3xl font-black uppercase tracking-[0.2em] text-xs transition-all shadow-2xl shadow-blue-200 active:scale-95 flex items-center justify-center gap-3"
            >
              {isAdding ? <Loader2 className="animate-spin" size={18} /> : <Plus size={18} />}
              {!activeVariant ? "Select Options" : activeVariant.stock > 0 ? "Add to Bag" : "Out of Stock"}
            </button>

            <div className="grid grid-cols-2 gap-4 mt-8">
              <div className="flex flex-col gap-2 p-5 bg-gray-50 rounded-3xl border border-gray-100">
                <Truck size={20} className="text-blue-600" />
                <span className="text-[10px] font-black text-gray-900 uppercase tracking-widest leading-tight">Express<br/>Shipping</span>
              </div>
              <div className="flex flex-col gap-2 p-5 bg-gray-50 rounded-3xl border border-gray-100">
                <ShieldCheck size={20} className="text-blue-600" />
                <span className="text-[10px] font-black text-gray-900 uppercase tracking-widest leading-tight">Secure<br/>Checkout</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
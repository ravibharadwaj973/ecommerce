"use client";

import { useState, useEffect, use, useMemo } from "react";
import { useSearchParams } from "next/navigation"; // 1. Import this
import ProductCard from "../../components/ProductCard";
import { Loader2, SlidersHorizontal, X } from "lucide-react";

export default function CategoryPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const categoryId = resolvedParams.id;
  const searchParams = useSearchParams(); // 2. Initialize search params
  const initialFilterSlug = searchParams.get("filter"); // 3. Get '?filter=...'

  const [allProducts, setAllProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [subCategories, setSubCategories] = useState<any[]>([]);
  
  const [priceRange, setPriceRange] = useState(10000);
  const [selectedSubs, setSelectedSubs] = useState<string[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [pRes, cRes] = await Promise.all([
          fetch(`/api/variants/by-category/${categoryId}`),
          fetch(`/api/categories?parent=${categoryId}`)
        ]);
        
        const pData = await pRes.json();
        const cData = await cRes.json();

        if (pData.success) setAllProducts(pData.data);
        
        if (cData.success) {
          setSubCategories(cData.data);

          // 4. AUTO-FILTER LOGIC: 
          // Match the URL slug to the sub-category _id
          if (initialFilterSlug) {
            const matchedSub = cData.data.find((sub: any) => sub.slug === initialFilterSlug);
            if (matchedSub) {
              setSelectedSubs([matchedSub._id]);
            }
          }
        }
      } catch (err) {
        console.error("Fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [categoryId, initialFilterSlug]); // Added initialFilterSlug to dependency

  const filteredProducts = useMemo(() => {
    return allProducts.filter((product) => {
      const productPrice = product.variants?.[0]?.price || 0;
      const matchesPrice = productPrice <= priceRange;

      const matchesCategory = 
        selectedSubs.length === 0 || 
        selectedSubs.includes(product.category?._id);

      return matchesPrice && matchesCategory;
    });
  }, [allProducts, priceRange, selectedSubs]);

  const toggleSub = (id: string) => {
    setSelectedSubs(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  return (
    <div className="min-h-screen bg-white">
      {/* MOBILE FILTER OVERLAY */}
      <div className={`fixed inset-0 z-[60] lg:hidden transition-transform duration-300 ${showMobileFilters ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowMobileFilters(false)} />
        <div className="relative w-80 h-full bg-white p-6 shadow-xl">
           <FilterContent 
              subCategories={subCategories} 
              priceRange={priceRange} 
              setPriceRange={setPriceRange} 
              selectedSubs={selectedSubs}
              toggleSub={toggleSub}
              onClose={() => setShowMobileFilters(false)} 
            />
        </div>
      </div>

      <div className="max-w-[1440px] mx-auto px-4 md:px-8 py-8">
        <div className="flex justify-between items-end mb-10">
          <div>
            <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter italic">
              Collection<span className="text-blue-600">.</span>
            </h1>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.3em] mt-2">
              Showing {filteredProducts.length} of {allProducts.length} items
            </p>
          </div>
          <button onClick={() => setShowMobileFilters(true)} className="lg:hidden flex items-center gap-2 px-6 py-3 bg-black text-white rounded-2xl text-[10px] font-black uppercase tracking-widest">
            <SlidersHorizontal size={14} /> Filter
          </button>
        </div>

        <div className="flex gap-12">
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <FilterContent 
              subCategories={subCategories} 
              priceRange={priceRange} 
              setPriceRange={setPriceRange}
              selectedSubs={selectedSubs}
              toggleSub={toggleSub}
            />
          </aside>

          <main className="flex-1">
            {loading ? (
              <div className="h-96 flex items-center justify-center"><Loader2 className="animate-spin text-blue-600" size={32} /></div>
            ) : filteredProducts.length > 0 ? (
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-x-4 gap-y-10 md:gap-x-8">
                {filteredProducts.map((product) => (
                  <ProductCard key={product._id} product={product} />
                ))}
              </div>
            ) : (
              <div className="text-center py-40 bg-gray-50 rounded-[3rem] border border-gray-100">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">No items match your criteria</p>
                <button 
                  onClick={() => {setPriceRange(10000); setSelectedSubs([]);}}
                  className="mt-4 text-blue-600 text-xs font-bold uppercase underline underline-offset-4"
                >
                  Clear all filters
                </button>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}

function FilterContent({ subCategories, priceRange, setPriceRange, selectedSubs, toggleSub, onClose }: any) {
  return (
    <div className="space-y-10 sticky top-32">
      <div className="flex justify-between items-center lg:hidden mb-6">
        <span className="font-black uppercase tracking-widest text-xs">Filters</span>
        <X onClick={onClose} size={20} />
      </div>

      <div>
        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] mb-6 text-gray-900 flex justify-between">
          Sub Categories <span>({selectedSubs.length})</span>
        </h3>
        <div className="space-y-3">
          {subCategories.map((sub: any) => (
            <div 
              key={sub._id} 
              onClick={() => toggleSub(sub._id)}
              className="flex items-center gap-3 group cursor-pointer"
            >
              <div className={`w-4 h-4 rounded border-2 transition-colors flex items-center justify-center ${selectedSubs.includes(sub._id) ? "bg-blue-600 border-blue-600" : "border-gray-200"}`}>
                {selectedSubs.includes(sub._id) && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
              </div>
              <span className={`text-[11px] font-bold uppercase tracking-tight transition-colors ${selectedSubs.includes(sub._id) ? "text-black" : "text-gray-400 group-hover:text-gray-600"}`}>
                {sub.name}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] mb-6 text-gray-900 border-b pb-4">Max Price: ₹{priceRange.toLocaleString()}</h3>
        <input 
          type="range" min="500" max="10000" step="500" 
          value={priceRange} onChange={(e) => setPriceRange(Number(e.target.value))}
          className="w-full h-1 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-black hover:accent-blue-600 transition-all"
        />
      </div>
    </div>
  );
}
"use client";

import { useState, useEffect, use } from "react";
import ProductCard from "../../components/ProductCard";
import { Loader2, SlidersHorizontal, X } from "lucide-react";

export default function CategoryPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const categoryId = resolvedParams.id;

  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  
  // States for sub-categories and filters
  const [subCategories, setSubCategories] = useState<any[]>([]);
  const [priceRange, setPriceRange] = useState(5000);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // 1. Fetch Products (Deep fetch including children)
        const pRes = await fetch(`/api/variants/by-category/${categoryId}`);
        const pData = await pRes.json();
        
        // 2. Fetch Sub-categories for the sidebar
        const cRes = await fetch(`/api/categories?parent=${categoryId}`);
        const cData = await cRes.json();

        if (pData.success) setProducts(pData.data);
        if (cData.success) setSubCategories(cData.data);
      } catch (err) {
        console.error("Fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [categoryId]);

  return (
    <div className="min-h-screen bg-white">
      {/* MOBILE FILTER OVERLAY */}
      <div className={`fixed inset-0 z-50 lg:hidden transition-transform ${showMobileFilters ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={() => setShowMobileFilters(false)} />
        <div className="relative w-80 h-full bg-white p-6 shadow-xl">
           <FilterContent subCategories={subCategories} priceRange={priceRange} setPriceRange={setPriceRange} onClose={() => setShowMobileFilters(false)} />
        </div>
      </div>

      <div className="max-w-[1440px] mx-auto px-4 md:px-8 py-8">
        {/* HEADER */}
        <div className="flex justify-between items-end mb-10">
          <div>
            <h1 className="text-4xl text-black md:text-5xl font-black uppercase tracking-tighter">Collection<span className="text-blue-600">.</span></h1>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.3em] mt-2">{products.length} ITEMS AVAILABLE</p>
          </div>
          <button onClick={() => setShowMobileFilters(true)} className="lg:hidden flex items-center gap-2 px-4 py-2 bg-black text-white rounded-full text-[10px] font-bold uppercase tracking-widest">
            <SlidersHorizontal size={14} /> Filter
          </button>
        </div>

        <div className="flex gap-12">
          {/* DESKTOP SIDEBAR */}
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <FilterContent subCategories={subCategories} priceRange={priceRange} setPriceRange={setPriceRange} />
          </aside>

          {/* MAIN PRODUCT GRID */}
          <main className="flex-1">
            {loading ? (
              <div className="h-96 flex items-center justify-center"><Loader2 className="animate-spin text-blue-600" size={32} /></div>
            ) : products.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-x-4 gap-y-10 md:gap-x-8">
                {products.map((product) => (
                  <ProductCard key={product._id} product={product} />
                ))}
              </div>
            ) : (
              <div className="text-center py-20 border-2 border-dashed rounded-3xl">
                <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">No products found</p>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}

// Sidebar Filter Component
function FilterContent({ subCategories, priceRange, setPriceRange, onClose }: any) {
  return (
    <div className="space-y-10">
      <div className="flex justify-between items-center lg:hidden mb-6">
        <span className="font-black uppercase tracking-widest">Filters</span>
        <X onClick={onClose} size={20} />
      </div>

      {/* Categories Drill-down */}
      <div>
        <h3 className="text-[11px] font-black uppercase tracking-[0.2em] mb-4 text-gray-900 border-b pb-2">Sub Categories</h3>
        <div className="space-y-2">
          {subCategories.map((sub: any) => (
            <label key={sub._id} className="flex items-center gap-3 group cursor-pointer">
              <input type="checkbox" className="w-4 h-4 border-2 border-gray-200 rounded checked:bg-blue-600" />
              <span className="text-xs font-bold text-gray-500 group-hover:text-black transition-colors uppercase tracking-tight">{sub.name}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Price Filter */}
      <div>
        <h3 className="text-[11px] font-black uppercase tracking-[0.2em] mb-4 text-gray-900 border-b pb-2">Price Range</h3>
        <input 
          type="range" min="0" max="10000" step="500" 
          value={priceRange} onChange={(e) => setPriceRange(Number(e.target.value))}
          className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
        />
        <div className="flex justify-between mt-2 font-mono text-[10px] font-bold">
          <span>₹0</span>
          <span>₹{priceRange.toLocaleString()}</span>
        </div>
      </div>
      
      {/* Placeholder for Attributes */}
      <div>
        <h3 className="text-[11px] font-black uppercase tracking-[0.2em] mb-4 text-gray-900 border-b pb-2">Colors</h3>
        <div className="flex flex-wrap gap-2">
           {['#000', '#fff', '#3b5998', '#e2e2e2'].map(color => (
             <button key={color} className="w-6 h-6 rounded-full border border-gray-200" style={{ backgroundColor: color }} />
           ))}
        </div>
      </div>
    </div>
  );
}
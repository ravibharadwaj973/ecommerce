"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Loader2, ArrowRight } from "lucide-react";

const GENDER_IDS = {
  men: "697065d2435cf01bff3cabf2",
  women: "69706692435cf01bff3cac01",
};

export default function CategorySection({ activeGender }: { activeGender: 'men' | 'women' }) {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSub() {
      setLoading(true);
      try {
        const parentId = GENDER_IDS[activeGender];
        const response = await fetch(`/api/categories?parent=${parentId}`);
        const result = await response.json();
        
        // Use result.data because your API returns { success: true, data: [...] }
        if (result.success) {
          setCategories(result.data.filter((c: any) => c.isActive));
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchSub();
  }, [activeGender]);

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-20">
      <Loader2 className="animate-spin text-blue-600 mb-2" size={32} />
      <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Loading Categories</p>
    </div>
  );

  return (
    <section className="py-12 bg-white">
      <div className="container mx-auto px-4">
        <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tighter mb-8">
          Shop {activeGender === 'men' ? "Men's" : "Women's"} <span className="text-blue-600">Categories</span>
        </h2>
        
        {/* grid-cols-2 makes it two-per-row on mobile, md:grid-cols-3 for desktop */}
        <div className="grid grid-cols-2 lg:grid-cols-4 md:grid-cols-3 gap-3 md:gap-6">
          {categories.map((cat) => (
            <Link 
              key={cat._id} 
              href={`/shop/${cat.slug}`} 
              className="group relative h-[200px] md:h-[400px] overflow-hidden rounded-2xl md:rounded-3xl bg-gray-100"
            >
              {/* Image check to prevent 'url of null' crash */}
              {cat.image?.url ? (
                <Image 
                  src={cat.image.url} 
                  alt={cat.name} 
                  fill 
                  className="object-cover transition-transform duration-700 group-hover:scale-110" 
                  sizes="(max-width: 768px) 50vw, 33vw"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-200">
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">{cat.name}</span>
                </div>
              )}

              {/* Dark Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
              
              {/* Text Content */}
              <div className="absolute bottom-3 left-3 md:bottom-6 md:left-6 right-3">
                <h3 className="text-white text-sm md:text-2xl font-black uppercase tracking-tighter leading-tight">
                  {cat.name}
                </h3>
                
                {/* Hidden on small mobile to keep it clean, shown on desktop */}
                <div className="hidden md:flex items-center gap-2 text-blue-400 text-xs font-bold uppercase tracking-widest mt-2">
                  Explore <ArrowRight size={14} />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
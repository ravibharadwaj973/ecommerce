// app/page.tsx
'use client';

import { useEffect, useState } from "react";
import Link from "next/link";
import { 
  ChevronLeft, ChevronRight, ShoppingBag, Tag,
  Image as ImageIcon
} from "lucide-react";

type Category = {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  image?: {
    url?: string;
    publicId?: string;
  };
  parentCategory?: string | null;
  isActive: boolean;
  productCount?: number;
  createdAt?: string;
  updatedAt?: string;
  __v?: number;
  id?: string;
};

const slides = [
  { 
    title: "Summer Collection 2024", 
    subtitle: "Fresh styles for the sunny days ahead",
    image: "https://images.unsplash.com/photo-1445205170230-053b83016050?w=1200&h=500&fit=crop",
    buttonText: "Shop Now",
    color: "bg-gradient-to-r from-blue-500 to-purple-600"
  },
  { 
    title: "Streetwear Essentials", 
    subtitle: "Urban fashion for your everyday style",
    image: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=1200&h=500&fit=crop",
    buttonText: "Explore Collection",
    color: "bg-gradient-to-r from-gray-900 to-black"
  },
  { 
    title: "Limited Edition Drops", 
    subtitle: "Exclusive pieces for fashion enthusiasts",
    image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200&h=500&fit=crop",
    buttonText: "View Drops",
    color: "bg-gradient-to-r from-red-500 to-orange-500"
  },
  { 
    title: "Sustainable Fashion", 
    subtitle: "Eco-friendly clothing for a better tomorrow",
    image: "https://images.unsplash.com/photo-1558769132-cb1c458e4222?w=1200&h=500&fit=crop",
    buttonText: "Learn More",
    color: "bg-gradient-to-r from-green-500 to-teal-600"
  },
  { 
    title: "Winter Warmers", 
    subtitle: "Cozy up with our winter collection",
    image: "https://images.unsplash.com/photo-1544441893-675973e31985?w=1200&h=500&fit=crop",
    buttonText: "Stay Warm",
    color: "bg-gradient-to-r from-blue-800 to-indigo-900"
  }
];

export default function HomePage() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [womenCategories, setWomenCategories] = useState<Category[]>([]);
  const [menCategories, setMenCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  // Handle slider navigation
  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  // Auto slide change
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isAutoPlaying) {
      interval = setInterval(() => {
        nextSlide();
      }, 3000);
    }

    return () => clearInterval(interval);
  }, [isAutoPlaying]);

  // Fetch categories from backend
  useEffect(() => {
    const fetchCategories = async () => {
      setLoading(true);
      try {
        // Fetch Women categories (parentCategory: 69706692435cf01bff3cac01)
        const womenRes = await fetch("/api/categories?parent=69706692435cf01bff3cac01");
        const womenData = await womenRes.json();
        
        // Fetch Men categories (parentCategory: 697065d2435cf01bff3cabf2)
        const menRes = await fetch("/api/categories?parent=697065d2435cf01bff3cabf2");
        const menData = await menRes.json();
        
        // Extract categories from response
        let womenCategoriesData: Category[] = [];
        let menCategoriesData: Category[] = [];
        
        // Handle different possible response structures
        if (Array.isArray(womenData.data?.categories)) {
          womenCategoriesData = womenData.data.categories;
        } else if (Array.isArray(womenData.data)) {
          womenCategoriesData = womenData.data;
        } else if (Array.isArray(womenData)) {
          womenCategoriesData = womenData;
        }
        
        if (Array.isArray(menData.data?.categories)) {
          menCategoriesData = menData.data.categories;
        } else if (Array.isArray(menData.data)) {
          menCategoriesData = menData.data;
        } else if (Array.isArray(menData)) {
          menCategoriesData = menData;
        }
        
        // Filter to only show active categories
        womenCategoriesData = womenCategoriesData.filter(cat => cat.isActive);
        menCategoriesData = menCategoriesData.filter(cat => cat.isActive);
        
        setWomenCategories(womenCategoriesData);
        setMenCategories(menCategoriesData);
        
      } catch (error) {
        console.error("Failed to fetch categories:", error);
        // Fallback to empty arrays if API fails
        setWomenCategories([]);
        setMenCategories([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Slider */}
      <div 
        className="relative h-[400px] md:h-[500px] overflow-hidden"
        onMouseEnter={() => setIsAutoPlaying(false)}
        onMouseLeave={() => setIsAutoPlaying(true)}
      >
        {/* Slides */}
        {slides.map((slide, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-all duration-1000 ease-in-out ${
              index === currentSlide
                ? "opacity-100 translate-x-0"
                : index < currentSlide
                ? "opacity-0 -translate-x-full"
                : "opacity-0 translate-x-full"
            }`}
          >
            {/* Background Image with Overlay */}
            <div className="absolute inset-0">
              <img
                src={slide.image}
                className="w-full h-full object-cover"
                alt={slide.title}
              />
              <div className={`absolute inset-0 ${slide.color} opacity-70`}></div>
            </div>

            {/* Content */}
            <div className="relative h-full flex items-center">
              <div className="container mx-auto px-6 md:px-12">
                <div className="max-w-2xl">
                  <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-full mb-6">
                    <Tag className="w-4 h-4" />
                    <span className="text-sm font-medium">New Arrivals</span>
                  </div>
                  
                  <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 leading-tight">
                    {slide.title}
                  </h1>
                  
                  <p className="text-lg text-white/90 mb-8 max-w-lg">
                    {slide.subtitle}
                  </p>
                  
                  <div className="flex gap-4">
                    <button className="bg-white text-gray-900 px-6 py-3 rounded-full font-semibold hover:bg-gray-100 transition-colors flex items-center gap-2">
                      <ShoppingBag className="w-5 h-5" />
                      {slide.buttonText}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Navigation Arrows */}
        <button
          onClick={prevSlide}
          className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white p-2 rounded-full transition-colors"
          aria-label="Previous slide"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        
        <button
          onClick={nextSlide}
          className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white p-2 rounded-full transition-colors"
          aria-label="Next slide"
        >
          <ChevronRight className="w-5 h-5" />
        </button>

        {/* Slide Indicators */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-3">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-2 h-2 rounded-full transition-all ${
                index === currentSlide
                  ? "bg-white w-6"
                  : "bg-white/50 hover:bg-white/80"
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>

      {/* Categories Section */}
      <section className="py-8 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            {/* Simple heading */}
            <div className="mb-6 text-left">
              <h2 className="text-2xl font-bold text-gray-900">Shop by Category</h2>
              <p className="text-gray-600 text-sm mt-1">Browse our collections</p>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Loading Skeletons */}
                {[1, 2].map((col) => (
                  <div key={col} className="space-y-1">
                    <div className="h-7 bg-gray-200 rounded mb-3 w-24"></div>
                    {[...Array(8)].map((_, i) => (
                      <div key={i} className="h-10 bg-gray-100 rounded animate-pulse"></div>
                    ))}
                  </div>
                ))}
              </div>
            ) : (
   <div className="space-y-8">
  
  {/* Women's Categories Section */}
  <div className="space-y-4">
    <h3 className="text-xl font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">
      Women
    </h3>
    
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
      {womenCategories.length > 0 ? (
        womenCategories.map((category) => (
          <Link
            key={category._id}
            href={`/category/${category.slug || category._id}`}
            className="group bg-white border border-gray-200 rounded-lg p-4 hover:border-blue-300 hover:shadow-sm transition-all duration-200 flex flex-col items-center text-center"
          >
            {/* Category Image - Made larger */}
            <div className="w-24 h-24 md:w-28 md:h-28 rounded-lg overflow-hidden mb-3">
              {category.image?.url ? (
                <img
                  src={category.image.url}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  alt={category.name}
                  loading="lazy"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400">
                  <ImageIcon className="w-10 h-10 md:w-12 md:h-12" />
                </div>
              )}
            </div>
            
            {/* Category Name */}
            <span className="text-sm font-medium text-gray-700 group-hover:text-blue-600 transition-colors line-clamp-2">
              {category.name}
            </span>
          </Link>
        ))
      ) : (
        <div className="col-span-full py-8 text-center text-gray-500">
          No women's categories available
        </div>
      )}
    </div>
  </div>

  {/* Men's Categories Section */}
  <div className="space-y-4">
    <h3 className="text-xl font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">
      Men
    </h3>
    
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
      {menCategories.length > 0 ? (
        menCategories.map((category) => (
          <Link
            key={category._id}
            href={`/category/${category.slug || category._id}`}
            className="group bg-white border border-gray-200 rounded-lg p-4 hover:border-blue-300 hover:shadow-sm transition-all duration-200 flex flex-col items-center text-center"
          >
            {/* Category Image - Made larger */}
            <div className="w-24 h-24 md:w-28 md:h-28 rounded-lg overflow-hidden mb-3">
              {category.image?.url ? (
                <img
                  src={category.image.url}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  alt={category.name}
                  loading="lazy"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400">
                  <ImageIcon className="w-10 h-10 md:w-12 md:h-12" />
                </div>
              )}
            </div>
            
            {/* Category Name */}
            <span className="text-sm font-medium text-gray-700 group-hover:text-blue-600 transition-colors line-clamp-2">
              {category.name}
            </span>
          </Link>
        ))
      ) : (
        <div className="col-span-full py-8 text-center text-gray-500">
          No men's categories available
        </div>
      )}
    </div>
  </div>

</div>
            )}
            
           
          </div>
        </div>
      </section>

      {/* Additional Content Section */}
      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-3">
                Why Shop With Us
              </h2>
              <p className="text-gray-600">
                Quality fashion for everyone
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-4">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">Quality Products</h3>
                <p className="text-sm text-gray-600">
                  Premium materials and craftsmanship
                </p>
              </div>
              
              <div className="text-center p-4">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">Fast Delivery</h3>
                <p className="text-sm text-gray-600">
                  Quick shipping nationwide
                </p>
              </div>
              
              <div className="text-center p-4">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">Secure Payment</h3>
                <p className="text-sm text-gray-600">
                  Safe and encrypted transactions
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="py-8 bg-white border-t border-gray-200">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <p className="text-gray-700 mb-4">
              Ready to find your perfect style?
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link 
                href="/category/women"
                className="px-6 py-2.5 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-sm font-medium"
              >
                Browse Women's Collection
              </Link>
              <Link 
                href="/category/men"
                className="px-6 py-2.5 border border-blue-600 text-blue-600 rounded hover:bg-blue-50 transition-colors text-sm font-medium"
              >
                Browse Men's Collection
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
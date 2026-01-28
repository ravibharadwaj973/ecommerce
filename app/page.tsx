// app/page.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ChevronLeft,
  ChevronRight,
  ShoppingBag,
  Tag,
  Image as ImageIcon,
} from "lucide-react";
import { ShieldCheck, Truck, CreditCard, Sparkles } from "lucide-react";
import Footer from "./components/footer";
import DiscountVoucher from "./components/token";
import HeroSlider from "./components/Heroslider";
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
    image:
      "https://images.unsplash.com/photo-1445205170230-053b83016050?w=1200&h=500&fit=crop",
    buttonText: "Shop Now",
    color: "bg-gradient-to-r from-blue-500 to-purple-600",
  },
  {
    title: "Streetwear Essentials",
    subtitle: "Urban fashion for your everyday style",
    image:
      "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=1200&h=500&fit=crop",
    buttonText: "Explore Collection",
    color: "bg-gradient-to-r from-gray-900 to-black",
  },
  {
    title: "Limited Edition Drops",
    subtitle: "Exclusive pieces for fashion enthusiasts",
    image:
      "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200&h=500&fit=crop",
    buttonText: "View Drops",
    color: "bg-gradient-to-r from-red-500 to-orange-500",
  },
  {
    title: "Sustainable Fashion",
    subtitle: "Eco-friendly clothing for a better tomorrow",
    image:
      "https://images.unsplash.com/photo-1558769132-cb1c458e4222?w=1200&h=500&fit=crop",
    buttonText: "Learn More",
    color: "bg-gradient-to-r from-green-500 to-teal-600",
  },
  {
    title: "Winter Warmers",
    subtitle: "Cozy up with our winter collection",
    image:
      "https://images.unsplash.com/photo-1544441893-675973e31985?w=1200&h=500&fit=crop",
    buttonText: "Stay Warm",
    color: "bg-gradient-to-r from-blue-800 to-indigo-900",
  },
];

export default function HomePage() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  // Handle slider navigation
  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
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

  const [activeGender, setActiveGender] = useState<'men' | 'women'>('men');
  return (
    <div className="min-h-screen bg-gray-50">


      <div className="bg-white py-4 border-b border-gray-100 flex justify-center">
      <div className="bg-white py-4 border-b border-gray-100 flex justify-center">
        <div className="relative bg-gray-100 p-1 rounded-full flex items-center w-64 h-12 shadow-inner">
          <div
            className={`absolute h-10 w-[124px] bg-white rounded-full shadow-md transition-all duration-300 ease-out ${
              activeGender === "men" ? "translate-x-0" : "translate-x-[124px]"
            }`}
          />

          <button
            onClick={() => setActiveGender("men")} // Update activeGender
            className={`relative z-10 flex-1 text-sm font-bold tracking-widest uppercase transition-colors duration-300 ${
              activeGender === "men" ? "text-blue-600" : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Men
          </button>

          <button
            onClick={() => setActiveGender("women")} // Update activeGender
            className={`relative z-10 flex-1 text-sm font-bold tracking-widest uppercase transition-colors duration-300 ${
              activeGender === "women" ? "text-blue-600" : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Women
          </button>
        </div>
      </div>
      </div>
      <HeroSlider activeGender={activeGender} />
<DiscountVoucher/>
      {/* Additional Content Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: <ShieldCheck className="w-8 h-8 text-blue-600" />,
                title: "Premium Quality",
                desc: "Handpicked fabrics and meticulous craftsmanship for every piece.",
              },
              {
                icon: <Truck className="w-8 h-8 text-blue-600" />,
                title: "Express Delivery",
                desc: "Fast, tracked shipping to your doorstep across the nation.",
              },
              {
                icon: <CreditCard className="w-8 h-8 text-blue-600" />,
                title: "Secure Checkout",
                desc: "Multiple safe payment options with 256-bit encryption.",
              },
              {
                icon: <Sparkles className="w-8 h-8 text-blue-600" />,
                title: "Easy Returns",
                desc: "Not the perfect fit? Return or exchange within 14 days.",
              },
            ].map((item, index) => (
              <div
                key={index}
                className="group p-8 rounded-2xl border border-gray-100 hover:border-blue-100 hover:bg-blue-50/30 transition-all duration-300"
              >
                <div className="mb-4 transform group-hover:scale-110 transition-transform duration-300">
                  {item.icon}
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">
                  {item.title}
                </h3>
                <p className="text-gray-500 text-sm leading-relaxed">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

  <Footer/>
    </div>
  );
}

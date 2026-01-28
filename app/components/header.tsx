'use client';

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  Search,
  Heart,
  ShoppingBag,
  Menu,
  X,
  ChevronDown,
  User,
} from "lucide-react";
import { NAVIGATION_DATA } from "./mennav";

const searchPlaceholders = [
  "Search for products...",
  "Looking for something specific?",
  "Find your favorite brands...",
  "Discover new arrivals...",
  "Search by category...",
];

export default function Header() {
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [placeholderIndex, setPlaceholderIndex] = useState(0);

  const headerRef = useRef<HTMLDivElement>(null);

  // Rotate placeholders
  useEffect(() => {
    if (searchQuery.length > 0) return;
    const interval = setInterval(() => {
      setPlaceholderIndex((prev) => (prev + 1) % searchPlaceholders.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [searchQuery]);

  // Click Outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (headerRef.current && !headerRef.current.contains(event.target as Node)) {
        setActiveMenu(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header
      ref={headerRef}
      className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-100"
    >
      {/* Top Bar - Minimalist */}
      <div className="bg-black text-white py-1.5 px-4">
        <div className="container mx-auto flex items-center justify-between text-[11px] font-medium tracking-widest uppercase">
          <p className="hidden sm:block">Free shipping on orders over ₹999</p>
          <div className="flex items-center gap-6 ml-auto">
            <Link href="/track-order" className="hover:text-gray-300 transition-colors">Track</Link>
            <Link href="/auth" className="flex items-center gap-1.5 hover:text-gray-300 transition-colors">
              <User className="w-3.5 h-3.5" /> <span>Login</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <div className="container mx-auto px-4 lg:px-6">
        <div className="flex items-center justify-between gap-8 h-20">
          
          {/* Mobile Menu Toggle */}
          <button
            className="lg:hidden p-2 -ml-2 text-gray-700"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

          {/* Logo */}
          <Link href="/" className="shrink-0 group">
            <div className="flex flex-col">
              <span className="text-2xl font-black text-blue-600 tracking-tighter group-hover:text-black transition-colors">
                CLICKLY
              </span>
              <span className="text-[9px] font-bold text-gray-400 tracking-[0.2em] -mt-1 uppercase">
                Est. 2024
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center self-stretch">
            {NAVIGATION_DATA.map((section) => (
              <div
                key={section.id}
                className="relative h-full flex items-center px-4"
                onMouseEnter={() => setActiveMenu(section.id)}
                onMouseLeave={() => setActiveMenu(null)}
              >
                <button className={`flex items-center gap-1.5 font-bold text-[13px] uppercase tracking-wider transition-all ${activeMenu === section.id ? 'text-blue-600' : 'text-gray-800'}`}>
                  {section.label}
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-300 ${activeMenu === section.id ? 'rotate-180' : ''}`} />
                </button>

                {/* Animated Bottom Border */}
                <div className={`absolute bottom-0 left-0 h-0.5 bg-blue-600 transition-all duration-300 ${activeMenu === section.id ? 'w-full' : 'w-0'}`} />

                {/* Mega Menu Dropdown */}
                {activeMenu === section.id && (
                  <div className="absolute top-[80px] -left-20 w-[650px] bg-white shadow-[0_20px_50px_rgba(0,0,0,0.1)] border border-gray-100 p-8 rounded-b-2xl grid grid-cols-3 gap-10 animate-in fade-in zoom-in-95 duration-200">
                    {section.categories.map((category) => (
                      <div key={category.slug} className="flex flex-col">
                        <Link 
                          href={`/category/${section.id}/${category.slug}`}
                          className="font-black text-[12px] text-black uppercase tracking-widest mb-4 hover:text-blue-600 transition-colors border-b border-gray-50 pb-2"
                        >
                          {category.name}
                        </Link>
                        <ul className="space-y-2.5">
                          {category.subCategories?.map((sub) => (
                            <li key={sub.slug}>
                              <Link
                                href={`/category/${section.id}/${category.slug}/${sub.slug}`}
                                className="text-[13px] text-gray-500 hover:text-blue-600 hover:translate-x-1 transition-all block"
                              >
                                {sub.name}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </nav>

          {/* Search Bar - Visual Polish */}
          <form onSubmit={(e) => e.preventDefault()} className="hidden md:flex flex-1 max-w-[320px] relative group">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={searchPlaceholders[placeholderIndex]}
              className="w-full bg-gray-50 text-sm text-black pl-4 pr-10 py-2.5 rounded-xl border border-transparent focus:bg-white focus:border-blue-200 focus:ring-4 focus:ring-blue-50 transition-all outline-none"
            />
            <button className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-600 transition-colors">
              <Search size={18} />
            </button>
          </form>

          {/* Actions */}
          <div className="flex items-center gap-1 md:gap-3">
           <Link href={'/wishlist'}>
            <button className="p-2.5 hover:bg-gray-50 rounded-full transition-colors relative group">
              <Heart className="w-5 h-5 text-gray-700 group-hover:text-red-500 transition-colors" />
              <span className="absolute top-1.5 right-1.5 bg-red-500 text-[9px] font-bold text-white w-4 h-4 rounded-full flex items-center justify-center ring-2 ring-white">2</span>
            </button>
           </Link>
          <Link href={'/cart'}>
           <button  className="p-2.5 hover:bg-gray-50 rounded-full transition-colors relative group">
              <ShoppingBag className="w-5 h-5 text-gray-700 group-hover:text-blue-600 transition-colors" />
              <span className="absolute top-1.5 right-1.5 bg-blue-600 text-[9px] font-bold text-white w-4 h-4 rounded-full flex items-center justify-center ring-2 ring-white">3</span>
            </button></Link>
          </div>
        </div>
      </div>
    </header>
  );
}
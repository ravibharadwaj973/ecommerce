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
  Crown,
  LogOut,
} from "lucide-react";
import { NAVIGATION_DATA } from "./mennav";
import { useAuth } from "../context/AuthContext";
import { useSubscription } from "../context/SubscriptionContext";

const searchPlaceholders = [
  "Search for products...",
  "Looking for something specific?",
  "Find your favorite brands...",
  "Discover new arrivals...",
];

export default function Header() {
  const { user, logout } = useAuth();
  const { isSubscribed } = useSubscription();
  
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [placeholderIndex, setPlaceholderIndex] = useState(0);

  const headerRef = useRef<HTMLDivElement>(null);

  // Placeholder Rotation
  useEffect(() => {
    if (searchQuery.length > 0) return;
    const interval = setInterval(() => {
      setPlaceholderIndex((prev) => (prev + 1) % searchPlaceholders.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [searchQuery]);

  return (
    <header ref={headerRef} className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-100">
      {/* Top Bar */}
      <div className="bg-black text-white py-1.5 px-4">
        <div className="container mx-auto flex items-center justify-between text-[10px] font-black uppercase tracking-[0.2em]">
          <p className="hidden sm:block">Free shipping for members</p>
          <div className="flex items-center gap-6 ml-auto">
            {/* VIP Status Badge */}
            {isSubscribed && (
              <div className="flex items-center gap-1.5 text-blue-400">
                <Crown size={12} className="fill-blue-400" />
                <span>VIP Member</span>
              </div>
            )}
            
            {!user ? (
              <Link href="/auth" className="flex items-center gap-1.5 hover:text-blue-400 transition-colors">
                <User size={12} /> <span>Join / Login</span>
              </Link>
            ) : (
              <div className="flex items-center gap-4">
                <span className="text-gray-400">Hi, {user.name.split(' ')[0]}</span>
                <button onClick={logout} className="flex items-center gap-1 hover:text-red-400 transition-colors">
                  <LogOut size={12} /> <span>Logout</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Header */}
      <div className="container mx-auto px-4 lg:px-6">
        <div className="flex items-center justify-between gap-8 h-20">
          
          <button className="lg:hidden p-2 -ml-2" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

          {/* Logo */}
          <Link href="/" className="shrink-0 flex items-center gap-2">
            <div className="flex flex-col">
              <span className="text-2xl font-black text-blue-600 tracking-tighter leading-none">CLICKLY</span>
              <span className="text-[8px] font-black text-gray-400 tracking-[0.3em] uppercase">Private Label</span>
            </div>
            {isSubscribed && <Crown size={18} className="text-blue-600 fill-blue-600 ml-1 mb-4" />}
          </Link>

          {/* Desktop Nav */}
        <nav className="hidden lg:flex items-center self-stretch">
  {NAVIGATION_DATA.map((section) => (
    <div
      key={section.id}
      className="relative h-full flex items-center px-4"
      onMouseEnter={() => setActiveMenu(section.id)}
      onMouseLeave={() => setActiveMenu(null)}
    >
      <button className={`flex items-center gap-1 font-black text-[11px] uppercase tracking-widest transition-all ${activeMenu === section.id ? 'text-blue-600' : 'text-gray-900'}`}>
        {section.label}
        <ChevronDown size={12} className={`transition-transform ${activeMenu === section.id ? 'rotate-180' : ''}`} />
      </button>

      {activeMenu === section.id && (
        <div className="absolute top-[80px] -left-10 w-[500px] bg-white shadow-2xl border border-gray-100 p-8 rounded-b-[2rem] grid grid-cols-2 gap-8 animate-in fade-in slide-in-from-top-2 duration-300">
          {section.categories.map((cat) => (
            <div key={cat.slug}>
              {/* Main Category Link: Navigates to the ID page */}
              {/* Note: In a real app, you'd ideally map slugs to IDs in a config file or DB */}
              <Link 
                href={`/cat/${cat.id}`} 
                className="block font-black text-[10px] uppercase tracking-widest mb-3 text-blue-600 border-b border-gray-50 pb-2 hover:text-black transition-colors"
              >
                {cat.name}
              </Link>
              
              <ul className="space-y-2">
                {cat.subCategories?.map((sub) => (
                  <li key={sub.slug}>
                    {/* Sub-Category Link: Pass the slug as a query param 'filter' */}
                    <Link 
                      href={`/cat/${cat.id}?filter=${sub.slug}`} 
                      className="text-xs font-bold text-gray-500 hover:text-black hover:translate-x-1 transition-all block"
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

          {/* Search */}
          <div className="hidden md:flex flex-1 max-w-[280px] relative">
            <input
              type="text"
              placeholder={searchPlaceholders[placeholderIndex]}
              className="w-full bg-gray-50 text-[11px] font-bold uppercase tracking-widest pl-4 pr-10 py-3 rounded-2xl border border-transparent focus:bg-white focus:border-blue-100 transition-all outline-none"
            />
            <Search size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" />
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {!user && (
               <Link href="/auth" className="p-2.5 hover:bg-gray-50 rounded-full">
                 <User className="w-5 h-5 text-gray-800" />
               </Link>
            )}

            <Link href="/wishlist" className="p-2.5 hover:bg-gray-50 rounded-full relative group">
              <Heart className="w-5 h-5 text-gray-800 group-hover:text-red-500 transition-colors" />
            </Link>

            <Link href="/cart" className="p-2.5 hover:bg-gray-50 rounded-full relative group">
              <ShoppingBag className="w-5 h-5 text-gray-800 group-hover:text-blue-600 transition-colors" />
              <span className="absolute top-1.5 right-1.5 bg-blue-600 text-[8px] font-black text-white w-4 h-4 rounded-full flex items-center justify-center ring-2 ring-white">3</span>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
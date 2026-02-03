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

export default function Header() {
  const { user, logout } = useAuth();
  const { isSubscribed } = useSubscription();

  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [mobileActive, setMobileActive] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-100">
      
      {/* TOP BAR (unchanged) */}
      <div className="bg-black text-white py-1.5 px-4">
        <div className="container mx-auto flex justify-between text-[10px] font-black uppercase tracking-[0.2em]">
          <p className="hidden sm:block">Free shipping for members</p>
          <div className="flex items-center gap-6 ml-auto">
            {isSubscribed && (
              <div className="flex items-center gap-1.5 text-blue-400">
                <Crown size={12} className="fill-blue-400" />
                <span>VIP Member</span>
              </div>
            )}
            {!user ? (
              <Link href="/login">Join / Login</Link>
            ) : (
              <button onClick={logout} className="flex items-center gap-1">
                <LogOut size={12} /> Logout
              </button>
            )}
          </div>
        </div>
      </div>

      {/* MAIN HEADER */}
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          
          {/* MOBILE MENU BUTTON */}
          <button
            className="lg:hidden p-2 text-black"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X /> : <Menu />}
          </button>

          {/* LOGO */}
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl font-black text-blue-600">CLICKLY</span>
            {isSubscribed && <Crown size={16} className="text-blue-600 fill-blue-600" />}
          </Link>

          {/* DESKTOP NAV (unchanged) */}
          <nav className="hidden lg:flex gap-6 text-black">
            {NAVIGATION_DATA.map((section) => (
              <div
                key={section.id}
                className="relative"
                onMouseEnter={() => setActiveMenu(section.id)}
                onMouseLeave={() => setActiveMenu(null)}
              >
                <button className="flex items-center gap-1 text-[11px] font-black uppercase">
                  {section.label}
                  <ChevronDown size={12} />
                </button>

                {activeMenu === section.id && (
                  <div className="absolute top-full left-0 w-[500px] bg-white shadow-xl p-6 grid grid-cols-2 gap-6">
                    {section.categories.map((cat) => (
                      <div key={cat.id}>
                        <Link
                          href={`/cat/${cat.id}`}
                          className="block text-xs font-black uppercase text-blue-600 mb-2"
                        >
                          {cat.name}
                        </Link>
                        {cat.subCategories?.map((sub) => (
                          <Link
                            key={sub.slug}
                            href={`/cat/${cat.id}?filter=${sub.slug}`}
                            className="block text-xs text-gray-500 hover:text-black"
                          >
                            {sub.name}
                          </Link>
                        ))}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </nav>

          {/* ACTIONS */}
          <div className="flex items-center gap-2 text-black">
            <Link href="/wishlist"><Heart /></Link>
            <Link href="/cart"><ShoppingBag /></Link>
          </div>
        </div>
      </div>

      {/* MOBILE NAVIGATION */}
      {isMobileMenuOpen && (
        <div className="lg:hidden bg-white border-t border-gray-100 text-black">
          <div className="px-4 py-4 space-y-4">
            {NAVIGATION_DATA.map((section) => (
              <div key={section.id}>
                <button
                  onClick={() =>
                    setMobileActive(
                      mobileActive === section.id ? null : section.id
                    )
                  }
                  className="w-full flex justify-between items-center font-black uppercase text-xs"
                >
                  {section.label}
                  <ChevronDown
                    className={`transition-transform ${
                      mobileActive === section.id ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {mobileActive === section.id && (
                  <div className="mt-2 pl-2 space-y-2">
                    {section.categories.map((cat) => (
                      <div key={cat.id}>
                        <Link
                          href={`/cat/${cat.id}`}
                          className="block text-xs font-bold text-blue-600"
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          {cat.name}
                        </Link>
                        {cat.subCategories?.map((sub) => (
                          <Link
                            key={sub.slug}
                            href={`/cat/${cat.id}?filter=${sub.slug}`}
                            className="block text-xs text-gray-500 pl-3"
                            onClick={() => setIsMobileMenuOpen(false)}
                          >
                            {sub.name}
                          </Link>
                        ))}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}

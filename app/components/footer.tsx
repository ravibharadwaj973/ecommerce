'use client';

import Link from 'next/link';
import { 
  Facebook, 
  Instagram, 
  Twitter, 
  Youtube, 
  Mail, 
  Phone, 
  MapPin, 
  ArrowRight 
} from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-50 border-t border-gray-200">
      {/* 1. Newsletter Section */}
      <div className="border-b border-gray-200">
        <div className="container mx-auto px-4 py-12">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="max-w-md">
              <h3 className="text-xl font-bold text-gray-900 mb-2">Join the Clickly Club</h3>
              <p className="text-gray-500 text-sm">Subscribe to receive updates, access to exclusive deals, and more.</p>
            </div>
            <form className="flex w-full md:w-auto max-w-md gap-2">
              <input 
                type="email" 
                placeholder="Enter your email" 
                className="flex-1 px-4 py-3 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-sm"
              />
              <button className="bg-black text-white px-6 py-3 rounded-full hover:bg-blue-600 transition-colors flex items-center gap-2 text-sm font-bold uppercase tracking-widest">
                Join <ArrowRight size={16} />
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* 2. Main Footer Links */}
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-12">
          
          {/* Brand Column */}
          <div className="col-span-2 lg:col-span-2">
            <Link href="/" className="inline-block mb-6">
              <span className="text-2xl font-black text-blue-600 tracking-tighter">CLICKLY</span>
            </Link>
            <p className="text-gray-500 text-sm leading-relaxed max-w-xs mb-6">
              Elevating your everyday style with premium quality apparel. Designed for the modern individual who values both comfort and aesthetics.
            </p>
            <div className="flex gap-4">
              <Link href="#" className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-600 hover:text-blue-600 hover:border-blue-600 transition-all">
                <Instagram size={18} />
              </Link>
              <Link href="#" className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-600 hover:text-blue-600 hover:border-blue-600 transition-all">
                <Facebook size={18} />
              </Link>
              <Link href="#" className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-600 hover:text-blue-600 hover:border-blue-600 transition-all">
                <Twitter size={18} />
              </Link>
            </div>
          </div>

          {/* Shop Column */}
          <div>
            <h4 className="text-xs font-black uppercase tracking-[0.2em] text-gray-900 mb-6">Shop</h4>
            <ul className="space-y-4">
              <li><Link href="/category/men" className="text-sm text-gray-500 hover:text-blue-600 transition-colors">Men's Collection</Link></li>
              <li><Link href="/category/women" className="text-sm text-gray-500 hover:text-blue-600 transition-colors">Women's Collection</Link></li>
              <li><Link href="/new-arrivals" className="text-sm text-gray-500 hover:text-blue-600 transition-colors">New Arrivals</Link></li>
              <li><Link href="/sale" className="text-sm text-red-500 hover:text-red-600 transition-colors font-medium">Clearance Sale</Link></li>
            </ul>
          </div>

          {/* Support Column */}
          <div>
            <h4 className="text-xs font-black uppercase tracking-[0.2em] text-gray-900 mb-6">Support</h4>
            <ul className="space-y-4">
              <li><Link href="/track-order" className="text-sm text-gray-500 hover:text-blue-600 transition-colors">Track Order</Link></li>
              <li><Link href="/shipping" className="text-sm text-gray-500 hover:text-blue-600 transition-colors">Shipping Policy</Link></li>
              <li><Link href="/returns" className="text-sm text-gray-500 hover:text-blue-600 transition-colors">Returns & Exchanges</Link></li>
              <li><Link href="/faq" className="text-sm text-gray-500 hover:text-blue-600 transition-colors">FAQs</Link></li>
            </ul>
          </div>

          {/* Contact Column */}
          <div>
            <h4 className="text-xs font-black uppercase tracking-[0.2em] text-gray-900 mb-6">Contact</h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3 text-sm text-gray-500">
                <MapPin size={18} className="shrink-0 text-blue-600" />
                <span>123 Fashion Street, New Delhi, India</span>
              </li>
              <li className="flex items-center gap-3 text-sm text-gray-500">
                <Phone size={18} className="shrink-0 text-blue-600" />
                <span>+91 98765 43210</span>
              </li>
              <li className="flex items-center gap-3 text-sm text-gray-500">
                <Mail size={18} className="shrink-0 text-blue-600" />
                <span>hello@clickly.com</span>
              </li>
            </ul>
          </div>

        </div>
      </div>

      {/* 3. Bottom Bar */}
      <div className="border-t border-gray-200 py-8 bg-white">
        <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-gray-400">
            © {currentYear} CLICKLY India. All Rights Reserved.
          </p>
          <div className="flex gap-6">
            <Link href="/terms" className="text-[10px] uppercase tracking-widest text-gray-400 hover:text-black">Terms</Link>
            <Link href="/privacy" className="text-[10px] uppercase tracking-widest text-gray-400 hover:text-black">Privacy</Link>
            <Link href="/cookies" className="text-[10px] uppercase tracking-widest text-gray-400 hover:text-black">Cookies</Link>
          </div>
          {/* Payment Icons Placeholder */}
          <div className="flex items-center gap-2 grayscale opacity-50">
            <div className="h-6 w-10 bg-gray-200 rounded"></div>
            <div className="h-6 w-10 bg-gray-200 rounded"></div>
            <div className="h-6 w-10 bg-gray-200 rounded"></div>
            <div className="h-6 w-10 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    </footer>
  );
}
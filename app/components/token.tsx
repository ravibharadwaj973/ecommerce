'use client';

import { useState } from 'react';
import { Ticket, Copy, CheckCircle2 } from 'lucide-react';

export default function DiscountStrip() {
  const [copied, setCopied] = useState(false);
  const promoCode = 'CLICKLY10';

  const handleCopy = () => {
    navigator.clipboard.writeText(promoCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section className="w-full bg-gray-100 py-4">
      <div className="container mx-auto px-3">
        <div className="relative bg-white shadow-md max-w-6xl mx-auto overflow-hidden">
          
          {/* Jagged edges – desktop only */}
          <div
            className="hidden md:block absolute left-0 top-0 h-full w-4 bg-gray-100"
            style={{
              clipPath:
                'polygon(100% 0%, 0% 15%, 100% 30%, 0% 45%, 100% 60%, 0% 75%, 100% 90%, 0% 100%)',
            }}
          />
          <div
            className="hidden md:block absolute right-0 top-0 h-full w-4 bg-gray-100"
            style={{
              clipPath:
                'polygon(0% 0%, 100% 15%, 0% 30%, 100% 45%, 0% 60%, 100% 75%, 0% 90%, 100% 100%)',
            }}
          />

          {/* Content */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 px-4 py-3 md:px-8">
            
            {/* Label */}
            <div className="flex items-center gap-2 justify-center md:justify-start">
              <Ticket className="w-4 h-4 text-blue-600 shrink-0" />
              <span className="text-[10px] font-black uppercase tracking-widest text-gray-800">
                Member Exclusive
              </span>
            </div>

            {/* Message */}
            <div className="flex flex-col sm:flex-row items-center gap-2 text-center sm:text-left">
              <span className="text-xs sm:text-sm font-bold uppercase text-gray-900">
                Get <span className="text-blue-600 text-base sm:text-lg">10% Off</span> Your First Order
              </span>

              <span className="hidden sm:block h-4 w-px border-l border-dashed border-gray-400 mx-2" />

              <span className="text-[11px] font-mono font-bold text-gray-500 tracking-widest uppercase">
                Code: {promoCode}
              </span>
            </div>

            {/* Button */}
            <button
              onClick={handleCopy}
              className="flex items-center justify-center gap-1 text-[10px] font-bold uppercase tracking-widest transition active:scale-95"
            >
              {copied ? (
                <span className="flex items-center gap-1 text-green-600">
                  <CheckCircle2 size={14} /> Copied
                </span>
              ) : (
                <span className="flex items-center gap-1 text-blue-600 hover:text-black">
                  <Copy size={14} /> Copy Code
                </span>
              )}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

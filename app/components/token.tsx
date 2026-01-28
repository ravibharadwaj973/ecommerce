'use client';

import { useState } from 'react';
import { Ticket, Copy, CheckCircle2 } from 'lucide-react';

export default function DiscountStrip() {
  const [copied, setCopied] = useState(false);
  const promoCode = "CLICKLY10";

  const handleCopy = () => {
    navigator.clipboard.writeText(promoCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section className="w-full bg-gray-100 py-6 overflow-hidden">
      <div className="container mx-auto px-4">
        {/* The Paper Strip */}
        <div className="relative flex items-center bg-white shadow-md h-12 w-full max-w-6xl mx-auto">
          
          {/* Left Jagged Edge */}
          <div 
            className="absolute left-0 top-0 h-full w-4 bg-gray-100"
            style={{ 
              clipPath: "polygon(100% 0%, 0% 15%, 100% 30%, 0% 45%, 100% 60%, 0% 75%, 100% 90%, 0% 100%)" 
            }}
          />

          {/* Main Content Area */}
          <div className="flex-1 flex items-center justify-between px-10">
            
            {/* Left Label */}
            <div className="flex items-center gap-3">
              <Ticket className="w-4 h-4 text-blue-600" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-800">
                Member Exclusive
              </span>
            </div>

            {/* Middle Message */}
            <div className="flex items-center gap-4">
              <span className="text-sm font-bold text-gray-900 uppercase tracking-tighter">
                Get <span className="text-blue-600 text-lg">10% Off</span> Your First Order
              </span>
              <div className="h-6 w-[1px] bg-gray-200 border-l border-dashed border-gray-400 mx-2" />
              <span className="text-xs font-mono font-bold text-gray-500 tracking-widest uppercase">
                Code: {promoCode}
              </span>
            </div>

            {/* Action Button */}
            <button 
              onClick={handleCopy}
              className="flex items-center gap-2 transition-all active:scale-95"
            >
              {copied ? (
                <span className="flex items-center gap-1 text-[10px] font-bold text-green-600 uppercase tracking-widest">
                  <CheckCircle2 size={14} /> Copied
                </span>
              ) : (
                <span className="flex items-center gap-1 text-[10px] font-bold text-blue-600 hover:text-black uppercase tracking-widest">
                  <Copy size={14} /> Copy Strip
                </span>
              )}
            </button>
          </div>

          {/* Right Jagged Edge */}
          <div 
            className="absolute right-0 top-0 h-full w-4 bg-gray-100"
            style={{ 
              clipPath: "polygon(0% 0%, 100% 15%, 0% 30%, 100% 45%, 0% 60%, 100% 75%, 0% 90%, 100% 100%)" 
            }}
          />
        </div>
      </div>
    </section>
  );
}
"use client";

import { useState } from "react";
import { Ticket, X, CheckCircle2, Loader2 } from "lucide-react";

export default function CouponSection() {
  const [coupon, setCoupon] = useState("");
  const [isApplied, setIsApplied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleApply = async () => {
    if (!coupon) return;
    
    setLoading(true);
    setError("");
    
    // Simulate API Call
    setTimeout(() => {
      if (coupon.toUpperCase() === "CLICKLY20") {
        setIsApplied(true);
        setLoading(false);
      } else {
        setError("Invalid or expired code");
        setLoading(false);
      }
    }, 800);
  };

  const removeCoupon = () => {
    setIsApplied(false);
    setCoupon("");
    setError("");
  };

  return (
    <div className="w-full max-w-sm">
      <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-4">
        Promotional Code
      </h3>

      {!isApplied ? (
        <div className="relative group">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-600 transition-colors">
            <Ticket size={18} />
          </div>
          
          <input
            type="text"
            value={coupon}
            onChange={(e) => setCoupon(e.target.value)}
            placeholder="ENTER CODE"
            className={`w-full bg-gray-50 border-2 ${error ? 'border-red-100' : 'border-transparent'} focus:border-blue-600 focus:bg-white text-xs font-black tracking-widest uppercase pl-12 pr-24 py-4 rounded-2xl transition-all outline-none`}
          />

          <button
            onClick={handleApply}
            disabled={loading || !coupon}
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-black text-white px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-600 disabled:bg-gray-200 disabled:cursor-not-allowed transition-all"
          >
            {loading ? <Loader2 size={14} className="animate-spin" /> : "Apply"}
          </button>
          
          {error && (
            <p className="text-[9px] font-bold text-red-500 mt-2 ml-2 uppercase tracking-wider">
              {error}
            </p>
          )}
        </div>
      ) : (
        /* APPLIED STATE */
        <div className="flex items-center justify-between bg-blue-50 border border-blue-100 p-4 rounded-2xl animate-in zoom-in-95 duration-200">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 p-1.5 rounded-lg">
              <CheckCircle2 size={16} className="text-white" />
            </div>
            <div>
              <p className="text-[11px] font-black text-blue-600 uppercase tracking-widest">
                {coupon.toUpperCase()}
              </p>
              <p className="text-[9px] font-bold text-blue-400 uppercase tracking-tighter">
                20% DISCOUNT APPLIED
              </p>
            </div>
          </div>
          <button 
            onClick={removeCoupon}
            className="p-2 hover:bg-blue-100 rounded-full text-blue-400 transition-colors"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* Suggested Codes Hint */}
      {!isApplied && (
        <p className="text-[9px] font-bold text-gray-400 mt-3 ml-1 uppercase tracking-tighter">
          Try <span className="text-blue-600 cursor-pointer" onClick={() => setCoupon("CLICKLY20")}>CLICKLY20</span> for 20% off
        </p>
      )}
    </div>
  );
}
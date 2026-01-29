"use client";

import { useEffect, useState } from "react";
import { Check, Loader2, Crown, ShieldCheck, Zap, Star } from "lucide-react";
import { useSubscription } from "../context/SubscriptionContext";
import { toast } from "sonner";

export default function SubscriptionPage() {
  const { refreshSubscription, isSubscribed } = useSubscription();
  const [plans, setPlans] = useState<any[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      const res = await fetch("/api/subcription/config");
      const data = await res.json();
      if (data.success) {
        setPlans(data.data);
        // Default select the middle plan or the first one
        if (data.data.length > 0) setSelectedPlan(data.data[1] || data.data[0]);
      }
    } catch (err) {
      toast.error("Failed to load plans");
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async () => {
    if (!selectedPlan) return;
    setProcessing(true);

    try {
      const res = await fetch("/api/subscription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          planId: selectedPlan._id,
          paymentId: "demo_" + Math.random().toString(36).slice(2), 
        }),
      });

      const data = await res.json();

      if (data.success) {
        toast.success("Welcome to the inner circle!");
        await refreshSubscription(); // Updates global state
      } else {
        toast.error(data.message);
      }
    } catch (err) {
      toast.error("Subscription failed. Please try again.");
    } finally {
      setProcessing(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white">
      <Loader2 className="animate-spin text-black mb-4" size={32} />
      <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400">Curating Plans</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-white text-black py-20 px-4">
      <div className="max-w-5xl mx-auto">
        
        {/* Header Section */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center p-3 bg-black rounded-full mb-6">
            <Crown className="text-white" size={24} />
          </div>
          <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tighter italic leading-none">
            The Membership<span className="text-blue-600">.</span>
          </h1>
          <p className="mt-6 text-gray-500 text-xs uppercase tracking-[0.2em] font-medium">
            Unlock exclusive access, early drops, and zero shipping fees.
          </p>
        </div>

        {isSubscribed && (
          <div className="mb-12 p-4 border-2 border-green-500 rounded-2xl bg-green-50 text-center">
            <p className="text-xs font-black uppercase text-green-700 tracking-widest">
              You already have an active membership
            </p>
          </div>
        )}

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          {plans.map((plan) => {
            const isSelected = selectedPlan?._id === plan._id;
            return (
              <div
                key={plan._id}
                onClick={() => setSelectedPlan(plan)}
                className={`relative cursor-pointer rounded-[2.5rem] p-8 transition-all duration-500 border-2 flex flex-col ${
                  isSelected 
                  ? "border-black bg-black text-white shadow-2xl scale-105 z-10" 
                  : "border-gray-100 bg-gray-50 text-black hover:border-gray-300"
                }`}
              >
                <div className="flex justify-between items-start mb-8">
                  <h3 className="text-lg font-black uppercase tracking-tighter italic">{plan.name}</h3>
                  {isSelected && <Star size={18} className="text-blue-500 fill-blue-500" />}
                </div>

                <div className="mb-8">
                  <span className="text-5xl font-black tracking-tighter">₹{plan.price}</span>
                  <span className={`text-[10px] uppercase tracking-widest ml-2 ${isSelected ? "text-gray-400" : "text-gray-500"}`}>
                    / {plan.durationInDays} Days
                  </span>
                </div>

                <ul className="space-y-4 mb-10 flex-1">
                  {[
                    "Zero Shipping Fees",
                    "Early Access to Drops",
                    "VIP Customer Support",
                    "Member-only Pricing"
                  ].map((feat, i) => (
                    <li key={i} className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-widest">
                      <Check size={14} className={isSelected ? "text-blue-400" : "text-blue-600"} />
                      {feat}
                    </li>
                  ))}
                </ul>

                <div className={`mt-auto text-center py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest border ${
                  isSelected ? "border-white/20 bg-white/10" : "border-black/5 bg-black/5"
                }`}>
                  {isSelected ? "Selected Tier" : "Select Tier"}
                </div>
              </div>
            );
          })}
        </div>

        {/* Summary & Checkout */}
        {selectedPlan && (
          <div className="max-w-2xl mx-auto">
            <div className="bg-gray-50 rounded-[3rem] p-10 border border-gray-100 shadow-sm">
              <div className="flex justify-between items-center mb-8 pb-8 border-b border-gray-200">
                <div>
                  <h2 className="text-2xl font-black uppercase tracking-tighter italic">Order Summary</h2>
                  <p className="text-[10px] text-gray-500 uppercase tracking-widest mt-1">One-time payment</p>
                </div>
                <div className="text-right">
                  <p className="text-3xl font-black tracking-tighter">₹{selectedPlan.price}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                <div className="flex items-center gap-4 p-4 bg-white rounded-2xl">
                  <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><Zap size={18} /></div>
                  <span className="text-[9px] font-black uppercase tracking-widest">Instant Activation</span>
                </div>
                <div className="flex items-center gap-4 p-4 bg-white rounded-2xl">
                  <div className="p-2 bg-green-50 text-green-600 rounded-lg"><ShieldCheck size={18} /></div>
                  <span className="text-[9px] font-black uppercase tracking-widest">Secure Encryption</span>
                </div>
              </div>

              <button
                onClick={handlePayment}
                disabled={processing}
                className="w-full bg-black text-white py-6 rounded-3xl font-black uppercase tracking-[0.3em] text-xs transition-all hover:bg-blue-600 hover:shadow-xl hover:shadow-blue-200 active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3"
              >
                {processing ? (
                  <>
                    <Loader2 className="animate-spin" size={18} />
                    Validating...
                  </>
                ) : (
                  "Complete Membership"
                )}
              </button>
              
              <p className="mt-6 text-center text-[9px] text-gray-400 font-bold uppercase tracking-[0.2em]">
                By subscribing, you agree to our terms of service and private policy.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
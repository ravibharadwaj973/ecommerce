"use client";

import { useState, useEffect } from "react";
import {
  ChevronRight,
  Lock,
  MapPin,
  CreditCard,
  ShoppingBag,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import CouponSection from "../components/copen";

export default function CheckoutPage() {
  const [loading, setLoading] = useState(true);
  const [addresses, setAddresses] = useState<any[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<string>("cod");
  const [cartItems, setCartItems] = useState<any[]>([]); // Assuming items come from your cart state/API

  // Totals
  const subtotal = cartItems.reduce(
    (acc, item) => acc + item.product.price * item.quantity,
    0,
  );
  const shipping = subtotal > 5000 ? 0 : 250;
  const total = subtotal + shipping;

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // 1. Fetch Cart 2. Fetch Addresses
      const [addrRes] = await Promise.all([fetch("/api/addresses")]);
      const addrData = await addrRes.json();

      if (addrData.success) {
        setAddresses(addrData.data);
        const defaultAddr = addrData.data.find((a: any) => a.isDefault);
        if (defaultAddr) setSelectedAddress(defaultAddr._id);
      }

      // Load cart items from localStorage or API for now
      const savedCart = JSON.parse(localStorage.getItem("cart") || "[]");
      setCartItems(savedCart);
    } catch (err) {
      toast.error("Failed to load checkout data");
    } finally {
      setLoading(false);
    }
  };

  const handlePlaceOrder = async () => {
    if (!selectedAddress)
      return toast.error("Please select a shipping address");

    toast.loading("Processing your luxury order...");
    // Future: Integrate Stripe/Razorpay logic here
  };

  if (loading)
    return (
      <div className="h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-blue-600" />
      </div>
    );

  return (
    <div className="bg-white min-h-screen text-black">
      <div className="max-w-7xl mx-auto px-4 py-12 grid grid-cols-1 lg:grid-cols-12 gap-16">
        {/* LEFT COLUMN: STEPS */}
        <div className="lg:col-span-7 space-y-12">
          <div>
            <h1 className="text-5xl font-black uppercase tracking-tighter italic mb-2">
              Checkout<span className="text-blue-600">.</span>
            </h1>
            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-400">
              <Link href="/cart" className="hover:text-black transition-colors">
                Bag
              </Link>
              <ChevronRight size={12} />
              <span className="text-black">Information</span>
              <ChevronRight size={12} />
              <span>Payment</span>
            </div>
          </div>

          {/* 1. SHIPPING ADDRESS */}
          <section>
            <div className="flex items-center gap-3 mb-6">
              <div className="h-8 w-8 bg-black text-white rounded-full flex items-center justify-center text-xs font-bold">
                1
              </div>
              <h2 className="text-xl font-black uppercase tracking-tight italic">
                Shipping Destination
              </h2>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {addresses.map((addr) => (
                <div
                  key={addr._id}
                  onClick={() => setSelectedAddress(addr._id)}
                  className={`p-6 border-2 rounded-[2rem] transition-all cursor-pointer flex justify-between items-center ${
                    selectedAddress === addr._id
                      ? "border-blue-600 bg-blue-50/30"
                      : "border-gray-100 hover:border-gray-300"
                  }`}
                >
                  <div>
                    <p className="font-black text-xs uppercase tracking-widest mb-1 text-blue-600">
                      {addr.label}
                    </p>
                    <p className="font-bold text-gray-900">{addr.fullName}</p>
                    <p className="text-xs text-gray-500">
                      {addr.addressLine1}, {addr.city}
                    </p>
                  </div>
                  {selectedAddress === addr._id && (
                    <div className="h-4 w-4 bg-blue-600 rounded-full border-4 border-white shadow-sm"></div>
                  )}
                </div>
              ))}
              <Link
                href="/profile"
                className="flex items-center justify-center p-6 border-2 border-dashed border-gray-200 rounded-[2rem] text-gray-400 font-bold text-xs uppercase hover:bg-gray-50 transition-all"
              >
                + Manage Addresses in Profile
              </Link>
            </div>
          </section>

          {/* 2. PAYMENT METHOD (Placeholder UI) */}
          <section
            className={`${!selectedAddress ? "opacity-40 pointer-events-none" : "opacity-100"} transition-all duration-500 `}
          >
            <div className="flex items-center gap-3 mb-6">
              <div
                className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors  ${selectedAddress ? "bg-black text-white" : "bg-gray-200 text-gray-500"}`}
              >
                2
              </div>
              <h2 className="text-xl  font-black uppercase tracking-tight italic">
                Payment Method
              </h2>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {/* STRIPE / CREDIT CARD */}
              <label
                className={`relative flex items-center justify-between p-6 border-2 rounded-[2rem] cursor-pointer transition-all ${paymentMethod === "stripe" ? "border-blue-600 bg-blue-50/30" : "border-gray-100 hover:border-gray-200"}`}
              >
                <input
                  type="radio"
                  name="payment"
                  className="hidden"
                  value="stripe"
                  onChange={(e) => setPaymentMethod(e.target.value)}
                />
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 bg-white rounded-xl flex items-center justify-center shadow-sm">
                    <CreditCard size={20} className="text-gray-900" />
                  </div>
                  <div>
                    <p className="font-black text-xs uppercase tracking-widest">
                      Credit / Debit Card
                    </p>
                    <p className="text-[9px] font-bold text-gray-400 uppercase tracking-tight">
                      Secure payment via Stripe
                    </p>
                  </div>
                </div>
                {paymentMethod === "stripe" && (
                  <div className="h-3 w-3 bg-blue-600 rounded-full"></div>
                )}
              </label>

              {/* UPI / DIGITAL PAYMENTS */}
              <label
                className={`relative flex items-center justify-between p-6 border-2 rounded-[2rem] cursor-pointer transition-all ${paymentMethod === "upi" ? "border-blue-600 bg-blue-50/30" : "border-gray-100 hover:border-gray-200"}`}
              >
                <input
                  type="radio"
                  name="payment"
                  className="hidden"
                  value="upi"
                  onChange={(e) => setPaymentMethod(e.target.value)}
                />
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 bg-white rounded-xl flex items-center justify-center shadow-sm font-black text-[10px]">
                    UPI
                  </div>
                  <div>
                    <p className="font-black text-xs uppercase tracking-widest">
                      Instant UPI Payment
                    </p>
                    <p className="text-[9px] font-bold text-gray-400 uppercase tracking-tight">
                      Google Pay, PhonePe, Paytm
                    </p>
                  </div>
                </div>
                {paymentMethod === "upi" && (
                  <div className="h-3 w-3 bg-blue-600 rounded-full"></div>
                )}
              </label>

              {/* CASH ON DELIVERY */}
              <label
                className={`relative flex items-center justify-between p-6 border-2 rounded-[2rem] cursor-pointer transition-all ${paymentMethod === "cod" ? "border-blue-600 bg-blue-50/30" : "border-gray-100 hover:border-gray-200"}`}
              >
                <input
                  type="radio"
                  name="payment"
                  className="hidden"
                  value="cod"
                  onChange={(e) => setPaymentMethod(e.target.value)}
                />
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 bg-white rounded-xl flex items-center justify-center shadow-sm">
                    <ShoppingBag size={20} className="text-gray-900" />
                  </div>
                  <div>
                    <p className="font-black text-xs uppercase tracking-widest">
                      Cash on Delivery
                    </p>
                    <p className="text-[9px] font-bold text-gray-400 uppercase tracking-tight">
                      Pay when your package arrives
                    </p>
                  </div>
                </div>
                {paymentMethod === "cod" && (
                  <div className="h-3 w-3 bg-blue-600 rounded-full"></div>
                )}
              </label>
            </div>
          </section>
        </div>

        {/* RIGHT COLUMN: SUMMARY */}
          
        <div className="lg:col-span-5">
          <CouponSection/>
          <div className="bg-gray-50 rounded-[3rem] p-10 sticky top-12 border border-gray-100">
            <h3 className="text-2xl font-black uppercase tracking-tight italic mb-8">
              Order Summary
            </h3>

            <div className="space-y-6 mb-8 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
              {cartItems.map((item, idx) => (
                <div key={idx} className="flex gap-4">
                  <div className="h-20 w-16 bg-white rounded-2xl overflow-hidden border border-gray-100 flex-shrink-0">
                    <img
                      src={item.product.images[0]}
                      className="h-full w-full object-cover"
                      alt=""
                    />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-[10px] font-black uppercase tracking-tight leading-tight">
                      {item.product.name}
                    </h4>
                    <p className="text-[10px] text-gray-400 font-bold mt-1 uppercase">
                      Qty: {item.quantity}
                    </p>
                    <p className="text-sm font-black mt-1">
                      ₹{item.product.price.toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-4 border-t border-gray-200 pt-8 mb-8">
              <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-gray-400">
                <span>Subtotal</span>
                <span className="text-black">₹{subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-gray-400">
                <span>Shipping</span>
                <span className="text-black">
                  {shipping === 0 ? "FREE" : `$${shipping}`}
                </span>
              </div>
              <div className="flex justify-between items-end pt-4 border-t border-gray-200">
                <span className="text-sm font-black uppercase italic">
                  Total Amount
                </span>
                <span className="text-3xl font-black tracking-tighter italic">
                  ${total.toLocaleString()}
                </span>
              </div>
            </div>

            <button
              onClick={handlePlaceOrder}
              disabled={!selectedAddress}
              className="w-full bg-black text-white py-6 rounded-[2rem] font-black uppercase text-xs tracking-[0.3em] hover:bg-blue-600 transition-all flex items-center justify-center gap-3 disabled:bg-gray-300 disabled:cursor-not-allowed group"
            >
              <Lock size={16} className="group-hover:animate-pulse" />
              Complete Order
            </button>

            <p className="text-center text-[8px] font-bold text-gray-400 uppercase tracking-widest mt-6 flex items-center justify-center gap-2">
              Secure 256-bit SSL Encrypted Checkout
            </p>
          </div>
        
        </div>
      </div>
    </div>
  );
}

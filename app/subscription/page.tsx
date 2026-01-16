"use client";

import { useEffect, useState } from "react";

export default function SubscriptionPage() {
  const [plans, setPlans] = useState<any[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    const res = await fetch("/api/subcription/config");
    const data = await res.json();
    if (data.success) setPlans(data.data);
    setLoading(false);
  };

  const handlePayment = async () => {
    if (!selectedPlan) return;

    try {
      setProcessing(true);

      const res = await fetch("/api/subcription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          planId: selectedPlan._id,
          paymentId: "demo_payment_id", // replace with Razorpay later
        }),
      });

      const data = await res.json();

      if (data.success) {
        alert("Subscription activated successfully");
      } else {
        alert(data.message);
      }
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        Loading plans...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-14">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-semibold text-gray-800">
            Choose a Subscription
          </h1>
          <p className="mt-2 text-gray-500">
            Select a plan and complete payment to continue
          </p>
        </div>

        {/* Plans */}
        <div className="mt-12 grid gap-8 md:grid-cols-3">
          {plans.map((plan) => {
            const isSelected = selectedPlan?._id === plan._id;

            return (
              <div
                key={plan._id}
                onClick={() => setSelectedPlan(plan)}
                className={`cursor-pointer rounded-2xl border p-8 transition
                  ${
                    isSelected
                      ? "border-indigo-600 ring-2 ring-indigo-600 bg-white"
                      : "border-gray-200 bg-white hover:shadow-md"
                  }`}
              >
                <h3 className="text-xl font-semibold text-gray-800">
                  {plan.name}
                </h3>

                <div className="mt-4">
                  <span className="text-4xl font-bold text-indigo-600">
                    ₹{plan.price}
                  </span>
                  <span className="text-sm text-gray-500">
                    {" "}
                    / {plan.durationInDays} days
                  </span>
                </div>

                <ul className="mt-6 space-y-2 text-sm text-gray-600">
                  <li>✔ Premium access</li>
                  <li>✔ Exclusive offers</li>
                  <li>✔ Priority support</li>
                </ul>

                {isSelected && (
                  <div className="mt-6 text-sm font-medium text-indigo-600">
                    Selected
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* PAYMENT SECTION */}
        {selectedPlan && (
          <div className="mt-14 max-w-xl mx-auto rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
            <h2 className="text-xl font-semibold text-gray-800">
              Payment Summary
            </h2>

            <div className="mt-4 flex justify-between text-sm text-gray-600">
              <span>Plan</span>
              <span>{selectedPlan.name}</span>
            </div>

            <div className="mt-2 flex justify-between text-sm text-gray-600">
              <span>Duration</span>
              <span>{selectedPlan.durationInDays} days</span>
            </div>

            <div className="mt-4 flex justify-between text-lg font-semibold text-gray-800">
              <span>Total</span>
              <span>₹{selectedPlan.price}</span>
            </div>

            <button
              onClick={handlePayment}
              disabled={processing}
              className="mt-6 w-full rounded-xl bg-indigo-600 py-3 text-white font-medium hover:bg-indigo-700 transition disabled:opacity-60"
            >
              {processing ? "Processing Payment..." : "Pay & Subscribe"}
            </button>

            <p className="mt-3 text-xs text-gray-500 text-center">
              Secure payment • No auto-renewal
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

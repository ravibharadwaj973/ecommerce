"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

interface SubscriptionContextType {
  subscription: any | null;
  isSubscribed: boolean;
  isLoading: boolean;
  refreshSubscription: () => Promise<void>;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

export function SubscriptionProvider({ children }: { children: React.ReactNode }) {
  const [subscription, setSubscription] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchSubscription = async () => {
    try {
      const res = await fetch("/api/subscription"); // Your GET route
      const result = await res.json();
      if (result.success && result.data) {
        setSubscription(result.data);
      } else {
        setSubscription(null);
      }
    } catch (err) {
      setSubscription(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscription();
  }, []);

  return (
    <SubscriptionContext.Provider 
      value={{ 
        subscription, 
        isSubscribed: !!subscription && subscription.isActive, 
        isLoading,
        refreshSubscription: fetchSubscription 
      }}
    >
      {children}
    </SubscriptionContext.Provider>
  );
}

export const useSubscription = () => {
  const context = useContext(SubscriptionContext);
  if (!context) throw new Error("useSubscription must be used within Provider");
  return context;
};
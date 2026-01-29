import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "./context/AuthContext";
import Chatbot from "./components/Chatbot";
import { Toaster } from "sonner";
import { CartProvider } from "./context/CartContext";

import { WishlistProvider } from "./context/wishlist";
import Header from "./components/header";
import { SubscriptionProvider } from "./context/SubscriptionContext";
import FloatingCart from "./components/FloatingCart";
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});


export const metadata: Metadata = {
  title: {
    default: "CLICKLY | Premium Streetwear & Modern Essentials",
    template: "%s | CLICKLY", // This allows sub-pages to look like: "Cart | CLICKLY"
  },
  description: "Explore the latest in high-end streetwear. Shop our curated collection of oversized t-shirts, cargo pants, and urban essentials designed for the modern fit.",
  keywords: ["Streetwear", "Oversized T-shirts", "Cargo Pants India", "Modern Fashion", "CLICKLY Clothing", "Premium Apparel"],
  authors: [{ name: "CLICKLY Team" }],
  creator: "CLICKLY",
  publisher: "CLICKLY",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  // Social Media / Open Graph (For when you share the link on WhatsApp/Instagram)
  openGraph: {
    title: "CLICKLY | Premium Streetwear",
    description: "Upgrade your wardrobe with modern urban essentials.",
    url: "https://your-domain.com",
    siteName: "CLICKLY",
    images: [
      {
        url: "/images/clicky.png", 
        width: 1200,
        height: 630,
        alt: "CLICKLY Streetwear Collection",
      },
    ],
    locale: "en_IN",
    type: "website",
  },
  // Twitter / X Card
  twitter: {
    card: "summary_large_image",
    title: "CLICKLY | Modern Streetwear",
    description: "Shop the new drop. Oversized fits, premium fabrics.",
    images: ["/og-image.jpg"],
  },
  // Favicons
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AuthProvider>
          <WishlistProvider>
            <SubscriptionProvider>
        <Header />
              <CartProvider>
                
                  {children}
                  <Chatbot />
                  <FloatingCart />
                  <Toaster
                    position="top-right"
                    expand={true}
                    richColors
                    closeButton
                    duration={5000}
                    theme="light" // or "dark", "system"
                    visibleToasts={5}
                    offset={16}
                    gap={12}
                  
                    toastOptions={{
                      style: {
                        background: "#fff",
                        color: "#000",
                        border: "1px solid #e5e7eb",
                        borderRadius: "8px",
                        fontSize: "14px",
                        fontWeight: "500",
                      },
                      className: "custom-toast",
                    }}
                  />
               
              </CartProvider>
            </SubscriptionProvider>
          </WishlistProvider>
        </AuthProvider>
      </body>
    </html>
  );
}

// app/vendor/layout.jsx
'use client';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import VendorSidebar from '../../components/vendor/VendorSidebar';
import VendorHeader from '../../components/vendor/VendorHeader';

export default function VendorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading, checkVendorAccess } = useAuth();
  const router = useRouter();
  const [vendorProfile, setVendorProfile] = useState(null);

  useEffect(() => {
    if (!loading && !user) {
      // // Check if user has vendor access
      if (!checkVendorAccess()) {
        router.push('/vendor/nonlogin/register');
        return;
      }

      // Fetch vendor profile for additional checks
      fetchVendorProfile();
    }
  }, [user, loading, router, checkVendorAccess]);

  const fetchVendorProfile = async () => {
    try {
      const response = await fetch('/api/vendors/me');
      const data = await response.json();
      
      if (data.success) {
        setVendorProfile(data.data.vendor);
        
        // If vendor is not verified, you might want to show a banner
        if (data.data.vendor.verificationStatus === 'pending') {
          // Optionally show verification pending message
        }
      }
    } catch (error) {
      console.error('Error fetching vendor profile:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user || !checkVendorAccess()) {
    return null;
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <VendorSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <VendorHeader vendorProfile={vendorProfile} />
        <main className="flex-1 overflow-x-hidden overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
// app/vendor/dashboard/page.jsx
'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  ChartBarIcon,
  ShoppingBagIcon,
  CurrencyDollarIcon,
  UserGroupIcon,
  DocumentTextIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

export default function VendorDashboard() {
  const router = useRouter();
  const [vendor, setVendor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    totalEarnings: 0,
    pendingOrders: 0
  });

  useEffect(() => {
    fetchVendorProfile();
    fetchVendorStats();
  }, []);

const fetchVendorProfile = async () => {
  try {
    const response = await fetch('/api/vendor/me', {
      credentials: 'include',
    });

    

    const data = await response.json();

    if (data.success) {
      setVendor(data.data.vendor);
    } else {
      router.push('/vendor/register');
    }
  } catch (error) {
    alert(error)
    console.error('Error fetching vendor profile:', error);
    router.push('/auth/login');
  } finally {
    setLoading(false);
  }
};


  const fetchVendorStats = async () => {
    try {
      // You'll need to create this API endpoint
      const response = await fetch('/api/vendor/stats');
      const data = await response.json();
      
      if (data.success) {
        setStats(data.data.stats);
      }
    } catch (error) {
      console.error('Error fetching vendor stats:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!vendor) {
    return null;
  }

  const statCards = [
    {
      name: 'Total Products',
      value: stats.totalProducts,
      icon: ShoppingBagIcon,
      color: 'bg-blue-500'
    },
    {
      name: 'Total Orders',
      value: stats.totalOrders,
      icon: UserGroupIcon,
      color: 'bg-green-500'
    },
    {
      name: 'Total Earnings',
      value: `$${stats.totalEarnings}`,
      icon: CurrencyDollarIcon,
      color: 'bg-yellow-500'
    },
    {
      name: 'Pending Orders',
      value: stats.pendingOrders,
      icon: DocumentTextIcon,
      color: 'bg-red-500'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {vendor.storeName}
              </h1>
              <p className="text-gray-600">{vendor.storeDescription}</p>
            </div>
            <div className="flex items-center space-x-4">
              {vendor.verificationStatus === 'pending' && (
                <div className="flex items-center text-orange-600 bg-orange-50 px-3 py-1 rounded-full">
                  <ExclamationTriangleIcon className="w-4 h-4 mr-1" />
                  <span className="text-sm">Verification Pending</span>
                </div>
              )}
              {vendor.verificationStatus === 'approved' && (
                <div className="flex items-center text-green-600 bg-green-50 px-3 py-1 rounded-full">
                  <span className="text-sm">Verified Vendor</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {statCards.map((item) => (
            <div key={item.name} className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <item.icon className="h-6 w-6 text-gray-400" aria-hidden="true" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">{item.name}</dt>
                      <dd>
                        <div className="text-lg font-medium text-gray-900">{item.value}</div>
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {/* Add Product Card */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <ShoppingBagIcon className="h-8 w-8 text-indigo-600" />
                </div>
                <div className="ml-5">
                  <h3 className="text-lg font-medium text-gray-900">Add New Product</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    List a new product in your store
                  </p>
                </div>
              </div>
              <div className="mt-6">
                <button
                  onClick={() => router.push('/vendor/products/new')}
                  className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 transition-colors"
                >
                  Add Product
                </button>
              </div>
            </div>
          </div>

          {/* View Products Card */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <ChartBarIcon className="h-8 w-8 text-green-600" />
                </div>
                <div className="ml-5">
                  <h3 className="text-lg font-medium text-gray-900">Manage Products</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    View and edit your products
                  </p>
                </div>
              </div>
              <div className="mt-6">
                <button
                  onClick={() => router.push('/vendor/products')}
                  className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition-colors"
                >
                  View Products
                </button>
              </div>
            </div>
          </div>

          {/* Upload Documents Card */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <DocumentTextIcon className="h-8 w-8 text-orange-600" />
                </div>
                <div className="ml-5">
                  <h3 className="text-lg font-medium text-gray-900">Upload Documents</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Submit verification documents
                  </p>
                </div>
              </div>
              <div className="mt-6">
                <button
                  onClick={() => router.push('/vendor/documents')}
                  className="w-full bg-orange-600 text-white py-2 px-4 rounded-md hover:bg-orange-700 transition-colors"
                >
                  Upload Documents
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="mt-8 bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Recent Activity</h3>
          </div>
          <div className="p-6">
            <p className="text-gray-500 text-center py-8">
              No recent activity to display
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
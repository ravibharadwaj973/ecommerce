// app/dashboard/page.jsx
'use client';
import { useAuth } from '../context/AuthContext';
import ProtectedRoute from '../components/ProductCard';
import Link from 'next/link';

export default function DashboardPage() {
  const { user, logout } = useAuth();

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <nav className="bg-white shadow">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex items-center">
                <h1 className="text-xl font-semibold">Dashboard</h1>
              </div>
              <div className="flex items-center space-x-4">
                <span className="text-gray-700">Welcome, {user?.name}</span>
                <button
                  onClick={logout}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </nav>

        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <div className="border-4 border-dashed border-gray-200 rounded-lg p-8">
              <h2 className="text-2xl font-bold mb-4">Dashboard Content</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white p-6 rounded-lg shadow">
                  <h3 className="text-lg font-semibold mb-2">Account Type</h3>
                  <p className="text-gray-600 capitalize">{user?.role}</p>
                </div>
                
                <div className="bg-white p-6 rounded-lg shadow">
                  <h3 className="text-lg font-semibold mb-2">Email</h3>
                  <p className="text-gray-600">{user?.email}</p>
                </div>
                
                <div className="bg-white p-6 rounded-lg shadow">
                  <h3 className="text-lg font-semibold mb-2">Member Since</h3>
                  <p className="text-gray-600">
                    {new Date(user?.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {user?.role === 'admin' && (
                <div className="bg-yellow-50 border border-yellow-200 rounded p-4">
                  <h4 className="font-semibold text-yellow-800">Admin Access</h4>
                  <p className="text-yellow-700">
                    You have administrator privileges.
                  </p>
                  <Link 
                    href="/admin" 
                    className="inline-block mt-2 text-yellow-800 hover:text-yellow-900 font-medium"
                  >
                    Go to Admin Panel →
                  </Link>
                </div>
              )}

              {user?.role === 'vendor' && (
                <div className="bg-blue-50 border border-blue-200 rounded p-4">
                  <h4 className="font-semibold text-blue-800">Vendor Access</h4>
                  <p className="text-blue-700">
                    You can manage your products and orders.
                  </p>
                  <Link 
                    href="/vendor" 
                    className="inline-block mt-2 text-blue-800 hover:text-blue-900 font-medium"
                  >
                    Vendor Dashboard →
                  </Link>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
'use client';
import { motion } from 'framer-motion';
import { Package, Clock, CheckCircle, Truck, X } from 'lucide-react';

export default function OrdersLayout({ 
  children, 
  activeTab, 
  onTabChange,
  orders,
  loading 
}) {
  const tabs = [
    { 
      id: 'all', 
      name: 'All Orders', 
      icon: Package, 
      count: orders?.length || 0 
    },
    { 
      id: 'upcoming', 
      name: 'Upcoming', 
      icon: Clock, 
      count: orders?.filter(order => 
        ['pending', 'confirmed', 'shipped'].includes(order.status)
      ).length || 0 
    },
    { 
      id: 'delivered', 
      name: 'Delivered', 
      icon: CheckCircle, 
      count: orders?.filter(order => 
        order.status === 'delivered'
      ).length || 0 
    },
    { 
      id: 'cancelled', 
      name: 'Cancelled', 
      icon: X, 
      count: orders?.filter(order => 
        order.status === 'cancelled'
      ).length || 0 
    },
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'confirmed': return 'bg-blue-100 text-blue-800';
      case 'shipped': return 'bg-purple-100 text-purple-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return Clock;
      case 'confirmed': return Clock;
      case 'shipped': return Truck;
      case 'delivered': return CheckCircle;
      case 'cancelled': return X;
      default: return Package;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Orders</h1>
          <p className="text-gray-600">Track and manage your orders</p>
        </div>

        {/* Enhanced Tabs */}
        <div className="bg-white rounded-lg border border-gray-200 p-1 mb-6 flex overflow-x-auto">
          {tabs.map((tab) => {
            const TabIcon = tab.icon;
            const isActive = activeTab === tab.id;
            
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`flex items-center space-x-2 px-4 py-3 rounded-md font-medium transition-all flex-shrink-0 ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <TabIcon className="w-4 h-4" />
                <span>{tab.name}</span>
                {tab.count > 0 && (
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    isActive ? 'bg-white text-indigo-600' : 'bg-gray-100 text-gray-600'
                  }`}>
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          key={activeTab}
        >
          {children}
        </motion.div>

        {/* Status Legend */}
        <div className="mt-8 bg-white rounded-lg border border-gray-200 p-4">
          <h3 className="font-semibold text-gray-900 mb-3">Order Status Guide</h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'].map((status) => {
              const StatusIcon = getStatusIcon(status);
              return (
                <div key={status} className="flex items-center space-x-2">
                  <div className={`w-3 h-3 rounded-full ${getStatusColor(status).split(' ')[0]}`} />
                  <StatusIcon className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-600 capitalize">{status}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
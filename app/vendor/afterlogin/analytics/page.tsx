'use client';
import { useEffect, useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { 
  CurrencyDollarIcon,
  ShoppingCartIcon,
  EyeIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';

interface VendorAnalytics {
  overview: {
    totalRevenue: number;
    totalOrders: number;
    totalProducts: number;
    conversionRate: number;
  };
  revenueTrend: Array<{
    _id: string;
    revenue: number;
    orders: number;
  }>;
  topProducts: Array<{
    name: string;
    totalSold: number;
    totalRevenue: number;
  }>;
  ordersByStatus: Array<{
    status: string;
    count: number;
  }>;
}

export default function VendorAnalytics() {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState<VendorAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('30');

  useEffect(() => {
    if (user) {
      fetchVendorAnalytics();
    }
  }, [user, timeRange]);

  const fetchVendorAnalytics = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/vendor/analytics?days=${timeRange}`);
      const data = await response.json();

      if (data.success) {
        setAnalytics(data.data);
      }
    } catch (error) {
      console.error('Error fetching vendor analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const statCards = [
    {
      title: 'Total Revenue',
      value: analytics?.overview.totalRevenue ? formatCurrency(analytics.overview.totalRevenue) : '$0',
      icon: CurrencyDollarIcon,
      color: 'bg-green-500',
      description: `From ${analytics?.overview.totalOrders || 0} orders`
    },
    {
      title: 'Total Orders',
      value: analytics?.overview.totalOrders || 0,
      icon: ShoppingCartIcon,
      color: 'bg-blue-500',
      description: 'Completed orders'
    },
    {
      title: 'Products Sold',
      value: analytics?.overview.totalProducts || 0,
      icon: EyeIcon,
      color: 'bg-purple-500',
      description: 'Total items sold'
    },
    {
      title: 'Conversion Rate',
      value: analytics?.overview.conversionRate ? `${(analytics.overview.conversionRate * 100).toFixed(1)}%` : '0%',
      icon: ChartBarIcon,
      color: 'bg-orange-500',
      description: 'Order conversion'
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Sales Analytics</h1>
        <select
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="7">Last 7 days</option>
          <option value="30">Last 30 days</option>
          <option value="90">Last 90 days</option>
        </select>
      </div>

      {/* Overview Cards */}
      {!loading && analytics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statCards.map((card, index) => (
            <div
              key={index}
              className="bg-white p-6 rounded-lg shadow-sm border border-gray-200"
            >
              <div className="flex items-center">
                <div className={`p-3 rounded-lg ${card.color}`}>
                  <card.icon className="w-6 h-6 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">{card.title}</p>
                  <p className="text-2xl font-bold text-gray-900">{card.value}</p>
                  <p className="text-sm text-gray-500">{card.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Charts and Data */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Trend */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue Trend</h3>
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : analytics && analytics.revenueTrend.length > 0 ? (
            <div className="h-64">
              <div className="flex items-end justify-between h-48 space-x-1">
                {analytics.revenueTrend.slice(-10).map((day, index) => (
                  <div key={day._id} className="flex flex-col items-center flex-1">
                    <div
                      className="w-full bg-blue-500 rounded-t transition-all duration-300"
                      style={{ 
                        height: `${(day.revenue / Math.max(...analytics.revenueTrend.map(d => d.revenue))) * 100}%` 
                      }}
                    ></div>
                    <span className="text-xs text-gray-500 mt-2">
                      {new Date(day._id).getDate()}/{new Date(day._id).getMonth() + 1}
                    </span>
                  </div>
                ))}
              </div>
              <div className="mt-4 text-center text-sm text-gray-600">
                Daily Revenue (Last 10 days)
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-64 text-gray-500">
              No revenue data available
            </div>
          )}
        </div>

        {/* Top Products */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Products</h3>
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : analytics && analytics.topProducts.length > 0 ? (
            <div className="space-y-4">
              {analytics.topProducts.map((product, index) => (
                <div key={index} className="flex justify-between items-center p-3 border border-gray-200 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{product.name}</p>
                    <p className="text-sm text-gray-600">{product.totalSold} sold</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">
                      {formatCurrency(product.totalRevenue)}
                    </p>
                    <p className="text-sm text-gray-600">Revenue</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center h-64 text-gray-500">
              No product data available
            </div>
          )}
        </div>

        {/* Orders by Status */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 lg:col-span-2">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Orders by Status</h3>
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : analytics && analytics.ordersByStatus.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {analytics.ordersByStatus.map((status) => (
                <div key={status.status} className="text-center p-4 border border-gray-200 rounded-lg">
                  <p className="text-2xl font-bold text-gray-900">{status.count}</p>
                  <p className="text-sm text-gray-600 capitalize">{status.status}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center h-32 text-gray-500">
              No order status data available
            </div>
          )}
        </div>
      </div>

      {loading && (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      )}
    </div>
  );
}
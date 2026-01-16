'use client';
import { useEffect, useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { CustomerLTV, CustomerMetrics } from '@/types/sales';

export default function CustomerAnalytics() {
  const { user, checkAdminAccess } = useAuth();
  const [customerData, setCustomerData] = useState<{
    acquisitionTrends: any[];
    customerLTV: CustomerLTV[];
    metrics: CustomerMetrics;
    newVsReturning: any[];
    period: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('90');

  useEffect(() => {
    if (user && checkAdminAccess()) {
      fetchCustomerData();
    }
  }, [user, timeRange]);

  const fetchCustomerData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/sales/customers?days=${timeRange}`);
      const data = await response.json();

      if (data.success) {
        setCustomerData(data.data);
      }
    } catch (error) {
      console.error('Error fetching customer data:', error);
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

  if (!user || !checkAdminAccess()) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-600">Access denied. Admin role required.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Customer Analytics</h1>
        <select
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="30">Last 30 days</option>
          <option value="90">Last 90 days</option>
          <option value="365">Last year</option>
        </select>
      </div>

      {/* Customer Metrics */}
      {!loading && customerData && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <p className="text-sm font-medium text-gray-600">Total Customers</p>
            <p className="text-2xl font-bold text-gray-900">{customerData.metrics.totalCustomers}</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <p className="text-sm font-medium text-gray-600">Repeat Customers</p>
            <p className="text-2xl font-bold text-gray-900">{customerData.metrics.repeatCustomers}</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <p className="text-sm font-medium text-gray-600">Repeat Rate</p>
            <p className="text-2xl font-bold text-gray-900">{customerData.metrics.repeatCustomerRate}%</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <p className="text-sm font-medium text-gray-600">Avg Orders/Customer</p>
            <p className="text-2xl font-bold text-gray-900">{customerData.metrics.averageOrdersPerCustomer}</p>
          </div>
        </div>
      )}

      {/* Customer LTV Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Top Customers by Lifetime Value</h3>
        </div>
        
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : customerData && customerData.customerLTV.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total Spent
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Orders
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Avg Order Value
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer Since
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {customerData.customerLTV.map((customer) => (
                  <tr key={customer.customerId}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{customer.name}</div>
                        <div className="text-sm text-gray-500">{customer.email}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                      {formatCurrency(customer.totalSpent)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {customer.orderCount}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatCurrency(customer.averageOrderValue)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(customer.customerSince).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="flex items-center justify-center h-32 text-gray-500">
            No customer data available
          </div>
        )}
      </div>

      {/* New vs Returning Customers */}
      {!loading && customerData && customerData.newVsReturning && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Customer Types</h3>
            <div className="space-y-4">
              {customerData.newVsReturning.map((type) => (
                <div key={type._id} className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-700 capitalize">
                    {type._id} Customers
                  </span>
                  <span className="text-lg font-bold text-gray-900">{type.count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Customer Acquisition Trend */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Customer Acquisition</h3>
            <div className="h-48">
              <div className="flex items-end justify-between h-32 space-x-1">
                {customerData.acquisitionTrends.slice(-10).map((day, index) => (
                  <div key={day._id} className="flex flex-col items-center flex-1">
                    <div
                      className="w-full bg-green-500 rounded-t transition-all duration-300"
                      style={{ 
                        height: `${(day.newCustomers / Math.max(...customerData.acquisitionTrends.map(d => d.newCustomers))) * 80}%` 
                      }}
                    ></div>
                    <span className="text-xs text-gray-500 mt-2">
                      {new Date(day._id).getDate()}/{new Date(day._id).getMonth() + 1}
                    </span>
                  </div>
                ))}
              </div>
              <div className="mt-4 text-center text-sm text-gray-600">
                New Customers (Last 10 days)
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
'use client';
import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import OrdersLayout from '../components/orders/OrdersLayout';
import OrderCard from '../components/orders/OrderCard';
import OrdersFilter from '../components/orders/OrdersFilter';
import EmptyOrders from '../components/orders/EmptyOrders';

export default function MyOrdersPage() {
  const { user } = useAuth();
  const { cart, loading: cartLoading } = useCart();
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Get active tab from URL or default to 'all'
  const activeTab = searchParams.get('tab') || 'all';
  const statusFilter = searchParams.get('status') || '';
  const searchQuery = searchParams.get('search') || '';

  // Fetch orders from API
  const fetchOrders = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const queryParams = new URLSearchParams();
      
      // Add filters from URL
      if (statusFilter) queryParams.set('status', statusFilter);
      if (searchQuery) queryParams.set('search', searchQuery);

      const response = await fetch(`/api/order/my-orders?${queryParams}`);
      const data = await response.json();

      if (data.success) {
        setOrders(data.data.orders);
        applyTabFilter(data.data.orders, activeTab);
      } else {
        console.error('Failed to fetch orders:', data.message);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  // Apply tab filtering
  const applyTabFilter = (ordersList, tab) => {
    let filtered = ordersList;

    switch (tab) {
      case 'upcoming':
        filtered = filtered.filter(order => 
          ['pending', 'confirmed', 'shipped'].includes(order.status)
        );
        break;
      case 'delivered':
        filtered = filtered.filter(order => order.status === 'delivered');
        break;
      case 'cancelled':
        filtered = filtered.filter(order => order.status === 'cancelled');
        break;
      case 'all':
      default:
        // No additional filtering
        break;
    }

    setFilteredOrders(filtered);
  };

  // Handle tab changes
  const handleTabChange = (tab) => {
    const newSearchParams = new URLSearchParams(searchParams);
    newSearchParams.set('tab', tab);
    
    // Remove status filter when changing tabs (optional)
    if (tab !== 'all') {
      newSearchParams.delete('status');
    }
    
    router.replace(`/my-orders?${newSearchParams.toString()}`);
  };

  // Handle filter changes
  const handleFilterChange = (newFilters) => {
    const newSearchParams = new URLSearchParams(searchParams);
    
    // Update search params with new filters
    Object.entries(newFilters).forEach(([key, value]) => {
      if (value) {
        newSearchParams.set(key, value);
      } else {
        newSearchParams.delete(key);
      }
    });
    
    router.replace(`/my-orders?${newSearchParams.toString()}`);
  };

  // Handle order updates (after cancellation, etc.)
  const handleOrderUpdate = () => {
    fetchOrders(); // Refresh orders
  };

  // Initial data fetch
  useEffect(() => {
    if (user) {
      fetchOrders();
    }
  }, [user]);

  // Update filtered orders when URL params change
  useEffect(() => {
    if (orders.length > 0) {
      applyTabFilter(orders, activeTab);
    }
  }, [activeTab, orders]);

  // Redirect if not authenticated
  useEffect(() => {
    if (!user && !cartLoading) {
      router.push('/login');
    }
  }, [user, cartLoading, router]);

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Please Login</h2>
          <p className="text-gray-600 mb-6">You need to be logged in to view your orders</p>
          <button
            onClick={() => router.push('/login')}
            className="bg-indigo-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-indigo-700 transition-colors"
          >
            Sign In
          </button>
        </div>
      </div>
    );
  }

  return (
    <OrdersLayout
      activeTab={activeTab}
      onTabChange={handleTabChange}
      orders={orders}
      loading={loading}
    >
      {/* Enhanced Filters */}
      <OrdersFilter 
        onFilterChange={handleFilterChange}
        loading={loading}
        initialFilters={{
          status: statusFilter,
          search: searchQuery
        }}
      />

      {/* Orders Summary Stats */}
      {!loading && orders.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg border border-gray-200 p-4 text-center">
            <div className="text-2xl font-bold text-gray-900">{orders.length}</div>
            <div className="text-sm text-gray-600">Total Orders</div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">
              {orders.filter(o => ['pending', 'confirmed', 'shipped'].includes(o.status)).length}
            </div>
            <div className="text-sm text-gray-600">Active</div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4 text-center">
            <div className="text-2xl font-bold text-green-600">
              {orders.filter(o => o.status === 'delivered').length}
            </div>
            <div className="text-sm text-gray-600">Delivered</div>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4 text-center">
            <div className="text-2xl font-bold text-red-600">
              {orders.filter(o => o.status === 'cancelled').length}
            </div>
            <div className="text-sm text-gray-600">Cancelled</div>
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg border border-gray-200 p-6 animate-pulse">
              <div className="flex space-x-4">
                <div className="w-16 h-16 bg-gray-200 rounded"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Orders List */}
      {!loading && filteredOrders.length > 0 && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-900">
              {activeTab === 'all' ? 'All Orders' : 
               activeTab === 'upcoming' ? 'Upcoming Orders' :
               activeTab === 'delivered' ? 'Delivered Orders' : 'Cancelled Orders'}
              <span className="text-gray-500 ml-2">({filteredOrders.length})</span>
            </h3>
            
            {/* Sort Options */}
            <select 
              onChange={(e) => {
                const newSearchParams = new URLSearchParams(searchParams);
                newSearchParams.set('sort', e.target.value);
                router.replace(`/my-orders?${newSearchParams.toString()}`);
              }}
              value={searchParams.get('sort') || 'newest'}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="price-high">Price: High to Low</option>
              <option value="price-low">Price: Low to High</option>
            </select>
          </div>

          {filteredOrders.map((order) => (
            <OrderCard 
              key={order._id} 
              order={order} 
              onOrderUpdate={handleOrderUpdate}
            />
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && filteredOrders.length === 0 && (
        <EmptyOrders activeTab={activeTab} />
      )}

      {/* Load More Button */}
      {!loading && filteredOrders.length >= 10 && (
        <div className="text-center mt-8">
          <button
            onClick={() => {
              // Implement pagination
              const newSearchParams = new URLSearchParams(searchParams);
              const currentPage = parseInt(searchParams.get('page')) || 1;
              newSearchParams.set('page', (currentPage + 1).toString());
              router.replace(`/my-orders?${newSearchParams.toString()}`);
            }}
            className="bg-white border border-gray-300 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
          >
            Load More Orders
          </button>
        </div>
      )}
    </OrdersLayout>
  );
}